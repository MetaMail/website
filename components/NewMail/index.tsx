import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import CryptoJS from 'crypto-js';
import type ReactQuillType from 'react-quill';
import { toast } from 'react-toastify';

import { IPersonItem, MetaMailTypeEn, EditorFormats, EditorModules } from 'lib/constants';
import { useMailDetailStore, useNewMailStore } from 'lib/zustand-store';
import { userSessionStorage, mailSessionStorage } from 'lib/utils';
import { mailHttp, userHttp } from 'lib/http';
import {
    getPrivateKey,
    decryptMailKey,
    concatAddress,
    createEncryptedMailKey,
    encryptMailContent,
    decryptMailContent,
} from 'lib/encrypt';
import { sendEmailInfoSignInstance } from 'lib/sign';
import { useInterval } from 'hooks';
import { PostfixOfAddress } from 'lib/base';
import DynamicReactQuill from './components/DynamicReactQuill';
import FileUploader from './components/FileUploader';
import NameSelector from './components/NameSelector';
import EmailRecipientInput from './components/EmailRecipientInput';
import Icon from 'components/Icon';

import { cancel, extend } from 'assets/icons';
import sendMailIcon from 'assets/sendMail.svg';
import 'react-quill/dist/quill.snow.css';

import styles from './index.module.scss';

/**整体收发流程（加密邮件）
 * 1. 创建草稿时，本地生成randomBits，用自己的公钥加密后发给后端
 * 2. 发送邮件时，如果是加密邮件，要把收件人的公钥拿到，然后用每个人的公钥加密原始的randomBits，同时用原始的randomBits对称加密邮件内容
 * 3. 解密邮件时，用自己的私钥先解出原始的randomBits，然后用randomBits对称解密邮件内容
 */

/**
 * 1. 用途是加密邮件内容（对称加密）
 * 2. 如果是新建邮件，selectedDraft中会带有原始的randomBits（这样就不用在新建邮件时去签名解密了），如果是从草稿中加载，需要先通过私钥解一下randomBits
 */
let randomBits: string = '';

let selectedDraftKey: string = ''; // 当前选中的草稿的randomBits的公钥加密结果
let autoSaveMail = true;

export default function NewMail() {
    const { selectedDraft, setSelectedDraft } = useNewMailStore();

    const [isExtend, setIsExtend] = useState(false);
    const [editable, setEditable] = useState<boolean>();
    const [loading, setLoading] = useState(false);
    const dateRef = useRef<string>();
    const reactQuillRef = useRef<ReactQuillType>();

    const getQuill = () => {
        if (typeof reactQuillRef?.current?.getEditor !== 'function') return;
        return reactQuillRef.current.makeUnprivilegedEditor(reactQuillRef.current.getEditor());
    };

    const handleSetAttachmentList = (attachment: any) => {
        const newAttachment = [...selectedDraft.attachments, attachment];
        setSelectedDraft({ ...selectedDraft, attachments: newAttachment });
    };

    const addReceiver = (address: string) => {
        const newReceiver = {
            address: address,
            name: address.split('@')[0],
        };
        const newReceivers = [...selectedDraft.mail_to, newReceiver];
        setSelectedDraft({ ...selectedDraft, mail_to: newReceivers });
    };

    const removeReceiver = (email: string) => {
        setSelectedDraft({
            ...selectedDraft,
            mail_to: selectedDraft.mail_to.filter(receiver => receiver.address !== email),
        });
    };

    const handleChangeContent = (content: string) => {
        setSelectedDraft({ ...selectedDraft, part_html: content });
        const quill = getQuill();
        if (!quill || !quill?.getHTML || !quill?.getText) {
            return toast.error('Failed to get message content');
        }
        //let html = quill?.getHTML(),
        //  text = quill?.getText();
    };

    const checkEncryptable = async (receivers: IPersonItem[]) => {
        const getSinglePublicKey = async (receiver: IPersonItem) => {
            try {
                const encryptionData = await userHttp.getEncryptionKey(receiver.address.split('@')[0]);
                return encryptionData.encryption_public_key;
            } catch (error) {
                console.error('Failed to get public key of receiver: ', receiver.address);
                console.error(error);
                return '';
            }
        };
        const publicKeys = await Promise.all(receivers.map(receiver => getSinglePublicKey(receiver)));
        return {
            encryptable: publicKeys.every(key => key?.length),
            publicKeys,
        };
    };

    const postSignature = async (keys: string[], signature?: string) => {
        const { message_id } = await mailHttp.sendMail({
            mail_id: window.btoa(selectedDraft.message_id),
            date: dateRef.current,
            signature: signature,
            keys,
        });
        return message_id;
    };

    const handleClickSend = async () => {
        if (selectedDraft.mail_to?.length < 1) {
            return toast.error("Can't send mail without receivers.");
        }
        autoSaveMail = false;
        try {
            const { html, text, metaType, publicKeys } = await handleSave();
            const { address, ensName, showName, publicKey } = userSessionStorage.getUserInfo();
            let keys: string[] = [];
            if (metaType === MetaMailTypeEn.Encrypted) {
                // TODO: 最好用户填一个收件人的时候，就获取这个收件人的public_key，如果没有pk，就标出来
                const receiversInfo: { publicKey: string; address: string }[] = [{ publicKey, address }];
                for (var i = 0; i < selectedDraft.mail_to.length; i++) {
                    const receiverItem = selectedDraft.mail_to[i];
                    receiversInfo.push({
                        publicKey: publicKeys[i],
                        address: receiverItem.address,
                    });
                }
                const result = await Promise.all(
                    receiversInfo.map(item => createEncryptedMailKey(item.publicKey, item.address))
                );
                keys = result.map(item => item.key);
            }

            if (selectedDraft.attachments?.length) {
                selectedDraft.attachments.sort((a, b) => a.attachment_id.localeCompare(b.attachment_id));
            }
            dateRef.current = new Date().toISOString();

            const signature = await sendEmailInfoSignInstance.doSign({
                from_address: showName + PostfixOfAddress,
                from_name: ensName || address,
                to_address: selectedDraft.mail_to.map(to => to.address),
                to_name: selectedDraft.mail_to.map(to => to.name),
                cc_address: selectedDraft.mail_cc.map(cc => cc.address),
                cc_name: selectedDraft.mail_cc.map(cc => cc.name),
                date: dateRef.current,
                subject: selectedDraft.subject,
                text_hash: CryptoJS.SHA256(text).toString(),
                html_hash: CryptoJS.SHA256(html).toString(),
                attachments_hash: selectedDraft.attachments.map(att => att.sha256),
                keys: keys,
            });

            const messageId = await postSignature(keys, signature);
            if (messageId) {
                toast.success('Your email has been sent successfully.');
                setSelectedDraft(null);
            } else {
                throw new Error('No message id returned.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to send mail.');
        }
    };

    const handleSave = async () => {
        // TODO 判断是否有改动
        if (!editable) return;
        if (selectedDraft.meta_type === MetaMailTypeEn.Encrypted && !randomBits) handleDecrypted();

        const quill = getQuill();
        if (!quill || !quill?.getHTML || !quill?.getText) {
            throw new Error('Failed to get message content');
        }
        let html = quill?.getHTML(),
            text = quill?.getText();

        if (selectedDraft.meta_type === MetaMailTypeEn.Encrypted) {
            html = encryptMailContent(html, randomBits);
            text = encryptMailContent(text, randomBits);
        }
        const { encryptable, publicKeys } = await checkEncryptable(selectedDraft.mail_to);
        const metaType = encryptable ? MetaMailTypeEn.Encrypted : MetaMailTypeEn.Signed;
        const { address, ensName, showName } = userSessionStorage.getUserInfo();
        const { message_id, mail_date } =
            (await mailHttp.updateMail({
                mail_id: window.btoa(selectedDraft.message_id),
                meta_type: metaType,
                subject: selectedDraft.subject,
                mail_to: selectedDraft.mail_to,
                part_html: html,
                part_text: text,
                mail_from: {
                    address: showName + PostfixOfAddress,
                    name: ensName ?? address,
                },
            })) ?? {};

        mailSessionStorage.setQuillHtml(html);
        mailSessionStorage.setQuillText(text);
        dateRef.current = mail_date;
        return { html, text, metaType, publicKeys };
    };

    const handleDecrypted = async () => {
        if (!selectedDraftKey) return;
        const { privateKey, salt } = userSessionStorage.getUserInfo();
        const decryptPrivateKey = await getPrivateKey(privateKey, salt);
        randomBits = await decryptMailKey(selectedDraftKey, decryptPrivateKey);
        if (!randomBits) {
            return toast.error('No randomBits.');
        }
        const decryptedContent = decryptMailContent(selectedDraft.part_html || '', randomBits);
        setSelectedDraft({ ...selectedDraft, part_html: decryptedContent });
        setEditable(true);
    };

    const handleLoad = async () => {
        try {
            setLoading(true);
            const mail = await mailHttp.getMailDetailByID(window.btoa(selectedDraft.message_id));
            setSelectedDraft({
                ...selectedDraft,
                attachments: mail.attachments,
                part_html: mail.part_html,
                part_text: mail.part_text,
                download: mail.download,
            });
            setEditable(selectedDraft.meta_type !== MetaMailTypeEn.Encrypted || !!randomBits);
            selectedDraftKey = selectedDraft.meta_header?.keys?.[0];
            randomBits = selectedDraft.randomBits;
        } catch (error) {
            console.error(error);
            toast.error("Can't get draft detail, please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleLoad();
        return () => {
            randomBits = '';
            selectedDraftKey = '';
            autoSaveMail = true;
        };
    }, [selectedDraft.message_id]);

    useInterval(() => {
        if (!autoSaveMail) return;
        try {
            //handleSave();
        } catch (err) {
            console.log('failed to auto save mail');
        }
    }, 30000);

    return (
        <div
            className={`flex flex-col font-poppins bg-white p-18 transition-all absolute bottom-0 right-0 rounded-10 ${
                isExtend ? 'h-full w-full' : 'h-502 w-[45vw]'
            } ${styles.newMailWrap}`}>
            <header className="flex justify-between">
                <div className="flex items-center">
                    <div className="w-6 h-24 bg-[#006AD4] rounded-4" />
                    <span className="pl-7 font-black text-xl">New Mail</span>
                </div>
                <div className="flex gap-10 self-start">
                    <Icon url={extend} className="w-20 h-auto self-center" onClick={() => setIsExtend(!isExtend)} />
                    <Icon
                        url={cancel}
                        className="w-20 scale-[120%] h-auto self-center"
                        onClick={async () => {
                            handleSave();
                            setSelectedDraft(null);
                        }}
                    />
                </div>
            </header>
            <div className="text-[#878787] mt-20">
                <div className="flex h-40 items-center">
                    <span className="w-78">From</span>
                    <NameSelector />
                </div>
                <div className="flex h-40 items-center">
                    <span className="w-78">To</span>
                    <EmailRecipientInput
                        receivers={selectedDraft.mail_to}
                        onAddReceiver={addReceiver}
                        onRemoveReceiver={removeReceiver}
                    />
                </div>
                <div className="flex h-40 items-center">
                    <span className="w-78">Subject</span>
                    <input
                        type="text"
                        placeholder=""
                        className="flex pl-0 h-40 input flex-1 text-[#878787] focus:outline-none"
                        value={selectedDraft.subject}
                        onChange={e => {
                            // TODO 所有的输入做节流
                            e.preventDefault();
                            setSelectedDraft({ ...selectedDraft, subject: e.target.value });
                        }}
                    />
                </div>
            </div>
            {loading ? (
                <div className="flex items-center justify-center pt-200">
                    <span className="loading loading-infinity loading-lg bg-[#006AD4]"></span>
                </div>
            ) : editable ? (
                <DynamicReactQuill
                    forwardedRef={reactQuillRef}
                    className="flex-1 flex flex-col-reverse overflow-hidden mt-20"
                    theme="snow"
                    placeholder={''}
                    modules={EditorModules}
                    formats={EditorFormats}
                    value={selectedDraft.part_html}
                    onChange={handleChangeContent}
                />
            ) : (
                <button className="flex-1" onClick={handleDecrypted}>
                    Decrypt
                </button>
            )}
            <div className="pt-17 flex gap-13">
                <button onClick={handleClickSend}>
                    <Image alt={'sendMail'} src={sendMailIcon} />
                </button>
                <button>
                    <FileUploader
                        draftID={selectedDraft.message_id}
                        metaType={selectedDraft.meta_type}
                        onAttachment={handleSetAttachmentList}
                        showList={selectedDraft.attachments ?? []}
                        currRandomBits={randomBits}
                    />
                </button>
            </div>
        </div>
    );
}
