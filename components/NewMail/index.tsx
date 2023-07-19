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

export default function NewMail() {
    const { selectedDraft, setSelectedDraft } = useNewMailStore();

    const [isExtend, setIsExtend] = useState(false);
    const [subject, setSubject] = useState<string>('');
    const [receivers, setReceivers] = useState<IPersonItem[]>([]);
    const [content, setContent] = useState<string>('');
    const [attList, setAttList] = useState<any[]>([]);
    const [editable, setEditable] = useState<boolean>();
    const draftID = selectedDraft?.message_id;
    const type: MetaMailTypeEn = Number(selectedDraft?.meta_type);
    const myKeyRef = useRef<string>();
    const dateRef = useRef<string>();
    const allowSaveRef = useRef(true);
    const currRandomBitsRef = useRef<string>();
    const reactQuillRef = useRef<ReactQuillType>();

    const getQuill = () => {
        if (typeof reactQuillRef?.current?.getEditor !== 'function') return;
        return reactQuillRef.current.makeUnprivilegedEditor(reactQuillRef.current.getEditor());
    };

    const handleSetAttachmentList = (attachment: any) => {
        setAttList([...attList, attachment]);
    };

    const addReceiver = (address: string) => {
        const newReceiver = {
            address: address,
            name: address.split('@')[0],
        };
        setReceivers([...receivers, newReceiver]);
    };

    const removeReceiver = (email: string) => {
        setReceivers(receivers.filter(receiver => receiver.address !== email));
    };

    const handleChangeContent = (content: string) => {
        setContent(content);
        const quill = getQuill();
        if (!quill || !quill?.getHTML || !quill?.getText) {
            return toast.error('Failed to get message content');
        }
        //let html = quill?.getHTML(),
        //  text = quill?.getText();
    };

    const checkEncryptable = (receivers: IPersonItem[]) => {
        return true;
    };

    const handleSend = async (keys: string[], signature?: string) => {
        try {
            const { message_id } = await mailHttp.sendMail(draftID, {
                date: dateRef.current,
                signature: signature,
                keys,
            });
            if (message_id) {
                toast.success('Your email has been sent successfully.');
                setSelectedDraft(null);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to send mail.');
        }
    };

    const handleClickSend = async () => {
        if (!draftID) return;
        if (receivers?.length < 1) {
            return toast.error("Can't send mail without receivers.");
        }
        allowSaveRef.current = false;
        try {
            const saveResult = await handleSave();
            if (!saveResult) return;
            const { address, ensName, showName, publicKey } = userSessionStorage.getUserInfo();
            if (!address || !showName) {
                console.warn('No address or name of current user, please check.');
                return;
            }
            const { html, text, metaType } = saveResult;

            let keys: string[] = [];
            if (metaType === MetaMailTypeEn.Encrypted) {
                // TODO: 最好用户填一个收件人的时候，就获取这个收件人的public_key，如果没有pk，就标出来
                let publicKeys: string[] = [publicKey];
                for (var i = 0; i < receivers.length; i++) {
                    const receiverItem = receivers[i];
                    const encryptionData = await userHttp.getEncryptionKey(receiverItem.address.split('@')[0]);
                    const receiverPublicKey = encryptionData.encryption_public_key;
                    if (!receiverPublicKey || receiverPublicKey.length == 0) {
                        throw new Error(
                            'Can not find public key of getEncryptionKey(receiverItem.address), Please consider sending plain mail.'
                        );
                    }
                    publicKeys.push(receiverPublicKey);
                }
                console.log(publicKeys, '--');
                const mySalt = userSessionStorage.getUserInfo()?.salt;
                console.log(mySalt);
                if (!currRandomBitsRef.current) {
                    console.log('error: no currrandombitsref.current');
                } else
                    keys = await Promise.all(
                        publicKeys.map(publicKey => createEncryptedMailKey(currRandomBitsRef.current, publicKey))
                    );
            }

            const orderedAtt = attList;
            if (orderedAtt.length) {
                orderedAtt.sort((a, b) => a.attachment_id.localeCompare(b.attachment_id));
            }
            dateRef.current = new Date().toISOString();

            const signature = await sendEmailInfoSignInstance.doSign({
                from_address: showName + PostfixOfAddress,
                from_name: ensName || '',
                to_address: receivers.map(receiver => receiver.address),
                to_name: receivers.map(receiver => receiver.name || ''),
                date: dateRef.current,
                subject: subject,
                text_hash: CryptoJS.SHA256(text).toString(),
                html_hash: CryptoJS.SHA256(html).toString(),
                attachments_hash: orderedAtt.map(att => att.sha256),
                keys: keys,
            });

            await handleSend(keys, signature);
        } catch (error) {
            console.error(error);
            // notification.error({
            // message: 'Failed Send',
            // description: '' + error,
            // });
        }
    };

    const handleSave = async () => {
        if (!currRandomBitsRef.current) handleDecrypted();
        if (!draftID || !editable) return;

        const oldHtml = mailSessionStorage.getQuillHtml();
        const oldText = mailSessionStorage.getQuillText();
        const quill = getQuill();
        if (!quill || !quill?.getHTML || !quill?.getText) {
            toast.error('Failed to get message content');
            return;
        }
        let html = quill?.getHTML(),
            text = quill?.getText();
        if (oldHtml == html && oldText == text) return { html, text };
        if (type === MetaMailTypeEn.Encrypted) {
            if (!currRandomBitsRef.current) {
                console.log('error: no currrandombitsref.current');
            } else {
                html = encryptMailContent(html, currRandomBitsRef.current);
                text = encryptMailContent(text, currRandomBitsRef.current);
            }
        }
        console.log(receivers);
        const metaType = checkEncryptable(receivers) ? MetaMailTypeEn.Encrypted : MetaMailTypeEn.Signed;
        const { ensName, showName } = userSessionStorage.getUserInfo();
        const { message_id, mail_date } =
            (await mailHttp.updateMail(draftID, {
                meta_type: metaType,
                subject: subject,
                mail_to: receivers,
                part_html: html,
                part_text: text,
                mail_from: {
                    address: showName + PostfixOfAddress,
                    name: ensName ?? '',
                },
            })) ?? {};

        if (message_id !== draftID) {
            console.warn('DANGER: wrong updating source');
        }
        mailSessionStorage.setQuillHtml(html);
        mailSessionStorage.setQuillText(text);
        console.log('save');
        dateRef.current = mail_date;
        return { html, text, metaType };
    };

    const handleDecrypted = async () => {
        if (!myKeyRef.current) return;
        const { privateKey, salt } = userSessionStorage.getUserInfo();
        const decryptPrivateKey = await getPrivateKey(privateKey, salt);
        const randomBits = await decryptMailKey(myKeyRef.current, decryptPrivateKey);
        if (!randomBits) {
            console.log('error: no randombits');
            return;
        }
        currRandomBitsRef.current = randomBits;
        const decryptedContent = decryptMailContent(content, currRandomBitsRef.current);
        setContent(decryptedContent);
        setEditable(true);
        console.log('setEditable(true);');
    };

    useEffect(() => {
        setEditable(selectedDraft.meta_type !== MetaMailTypeEn.Encrypted || !!currRandomBitsRef.current);
        if (selectedDraft.meta_header?.keys) myKeyRef.current = selectedDraft.meta_header?.keys?.[0];
    }, [selectedDraft]);

    useInterval(() => {
        if (!allowSaveRef.current) return;
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
                    <span className="pl-7 font-black text-xl">New Message</span>
                </div>
                <div className="flex gap-10 self-start">
                    <Icon url={extend} className="w-20 h-auto self-center" onClick={() => setIsExtend(!isExtend)} />
                    <Icon
                        url={cancel}
                        className="w-20 scale-[120%] h-auto self-center"
                        onClick={() => {
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
                        receivers={receivers}
                        onAddReceiver={addReceiver}
                        onRemoveReceiver={removeReceiver}
                    />
                </div>
                <div className="flex h-40 items-center">
                    <span className="w-78">Subject</span>
                    <input
                        type="text"
                        placeholder=""
                        className="flex pl-0 h-40 input max-w-xs text-[#878787] focus:outline-none"
                        value={subject}
                        onChange={e => {
                            e.preventDefault();
                            setSubject(e.target.value);
                        }}
                    />
                </div>
            </div>
            {editable ? (
                <DynamicReactQuill
                    forwardedRef={reactQuillRef}
                    className="flex-1 flex flex-col-reverse overflow-hidden mt-20"
                    theme="snow"
                    placeholder={''}
                    modules={EditorModules}
                    formats={EditorFormats}
                    value={content}
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
                    {/*<Image alt={'addAttach'} src={addAttach}/>
        <input type="file" className="file-input w-full max-w-xs text-transparent" />*/}
                    <FileUploader
                        draftID={draftID}
                        metaType={type}
                        onAttachment={handleSetAttachmentList}
                        showList={attList}
                        currRandomBits={currRandomBitsRef.current}
                    />
                </button>
            </div>
        </div>
    );
}
