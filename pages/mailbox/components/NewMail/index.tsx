import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import CryptoJS from 'crypto-js';
import type ReactQuillType from 'react-quill';

import { IPersonItem, MetaMailTypeEn, EditorFormats, EditorModules } from 'lib/constants';
import { useMailDetailStore, useNewMailStore } from 'lib/zustand-store';
import { userSessionStorage, mailSessionStorage } from 'lib/session-storage';
import { mailHttp, userHttp } from 'lib/http';
import { getPersonalSign, metaPack, getPrivateKey } from 'lib/utils';
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

export default function NewMail() {
    const { detailFromNew, setDetailFromNew } = useMailDetailStore();
    const { isWriting, setIsWriting } = useNewMailStore();

    const [isExtend, setIsExtend] = useState(false);
    const [subject, setSubject] = useState<string>('');
    const [receivers, setReceivers] = useState<IPersonItem[]>([]);
    const [content, setContent] = useState<string>('');
    const [temp, setTemp] = useState<string>('');
    const [attList, setAttList] = useState<any[]>([]);
    const [loaded, setLoaded] = useState<boolean>(false);
    const [editable, setEditable] = useState<boolean>();
    const draftID = detailFromNew?.message_id;
    const type: MetaMailTypeEn = Number(detailFromNew?.meta_type);
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

    const handleChangeContent = (content: any) => {
        setContent(content);
        const quill = getQuill();

        if (!quill || !quill?.getHTML || !quill?.getText) {
            //notification.error({
            //  message: 'ERROR',
            //  description: 'Failed to get message content',
            //});

            return;
        }

        //let html = quill?.getHTML(),
        //  text = quill?.getText();

        console.log('set');
    };

    useEffect(() => {
        handleLoad();
        return () => {
            mailSessionStorage.clearMailContent();
        };
    }, [detailFromNew]);
    useInterval(() => {
        if (!allowSaveRef.current || isWriting === false) return;
        try {
            //handleSave();
        } catch (err) {
            console.log('failed to auto save mail');
        }
    }, 2000);

    const handleSend = async (keys: string[], packedResult: string, signature?: string) => {
        try {
            const { message_id } = await mailHttp.sendMail(draftID, {
                date: dateRef.current,
                signature: signature,
                keys,
                data: packedResult,
            });

            if (message_id) {
                // notification.success({
                // message: 'Sent',
                // description: 'Your email has been sent successfully.',
                // });

                //router.push('/home');
                setIsWriting(false);
            }
        } catch (error) {
            console.log(error);
            // notification.error({
            // message: 'Failed Send',
            // description: 'Looks like we have a network problem.',
            // });
        }
    };

    const handleClickSend = async () => {
        if (!draftID) return;

        if (receivers?.length < 1) {
            // TODO: notification.error({
            // message: 'No Receipt',
            // description: 'At lease 1 receipt',
            // });

            return;
        }
        allowSaveRef.current = false;
        try {
            handleSave().then(async obj => {
                if (!obj) {
                    return;
                }
                const { address, ensName, showName, publicKey } = userSessionStorage.getUserInfo();
                if (!address || !showName) {
                    console.warn('No address or name of current user, please check.');
                    return;
                }
                const { html, text } = obj;

                let keys: string[] = [];
                if (type === MetaMailTypeEn.Encrypted) {
                    // TODO: 最好用户填一个收件人的时候，就获取这个收件人的public_key，如果没有pk，就标出来
                    let pks: string[] = [publicKey!];
                    for (var i = 0; i < receivers.length; i++) {
                        const receiverItem = receivers[i];
                        const encryptionData = await userHttp.getEncryptionKey(receiverItem.address.split('@')[0]);
                        const receriverPublicKey = encryptionData.message_encryption_public_key;
                        if (!receriverPublicKey || receriverPublicKey.length == 0) {
                            throw new Error(
                                'Can not find public key of getEncryptionKey(receiverItem.address), Please consider sending plain mail.'
                            );
                        }
                        pks.push(receriverPublicKey);
                    }
                    console.log(pks, '--');
                    const mySalt = userSessionStorage.getSaltFromLocal();
                    console.log(mySalt);
                    if (!currRandomBitsRef.current) {
                        console.log('error: no currrandombitsref.current');
                    } else keys = pks.map(pk => CryptoJS.AES.encrypt(currRandomBitsRef.current!, pk).toString());
                }

                const orderedAtt = attList;
                orderedAtt.sort((a, b) => a.attachment_id.localeCompare(b.attachment_id));
                dateRef.current = new Date().toISOString();
                let packData = {
                    from: showName,
                    to: receivers,
                    date: dateRef.current,
                    subject,
                    text_hash: CryptoJS.SHA256(text).toString(),
                    html_hash: CryptoJS.SHA256(html).toString(),
                    attachments_hash: orderedAtt.map(att => att.sha256),
                    name: ensName,
                    keys: keys,
                };
                console.log(packData);
                metaPack(packData).then(async res => {
                    const { packedResult } = res ?? {};
                    getPersonalSign(userSessionStorage.getWalletAddress(), packedResult).then(async signature => {
                        if (signature === false) {
                            // notification.error({
                            // message: 'Not Your Sign, Not your Mail',
                            // description:
                            // "Please make sure that you have login MetaMask. It's totally free, no gas fee",
                            // });
                            // Modal.confirm({
                            //   title: 'Failed to sign this mail',
                            //   content: 'Would you like to send without signature?',
                            //   okText: 'Yes, Send it',
                            //   onOk: () => {
                            //     handleSend(keys, packedResult);
                            //     // handleSend(packedResult, date);
                            //   },
                            //   cancelText: 'No, I will try send it later',
                            // });
                        } else {
                            handleSend(keys, packedResult, signature);
                            // handleSend(packedResult, date, signature);
                        }
                    });
                });
            });
        } catch (error) {
            console.error('handleclicksenderror');
            // notification.error({
            // message: 'Failed Send',
            // description: '' + error,
            // });
        }
    };

    const handleSave = async () => {
        if (!currRandomBitsRef.current) handleDecrypted();
        console.log(draftID);
        console.log(editable);
        if (!draftID) return;
        //setEditable(true) ////测试用
        //console.log(editable);
        if (!editable) return;
        const oldHtml = sessionStorage.getItem('html');
        const oldText = sessionStorage.getItem('text');
        const quill = getQuill();
        console.log(oldText);
        console.log(quill?.getHTML());
        console.log(quill?.getText());
        if (!quill || !quill?.getHTML || !quill?.getText) {
            // notification.error({
            // message: 'ERROR',
            // description: 'Failed to get message content',
            // });
            console.log('no');
            return;
        }

        let html = quill?.getHTML(),
            text = quill?.getText();
        console.log(text);
        console.log(html);
        if (oldHtml == html && oldText == text) return { html, text }; //一样
        // 加密邮件
        if (type === MetaMailTypeEn.Encrypted) {
            if (!currRandomBitsRef.current) {
                console.log('error: no currrandombitsref.current');
            } else {
                html = CryptoJS.AES.encrypt(html, currRandomBitsRef.current).toString();
                text = CryptoJS.AES.encrypt(text, currRandomBitsRef.current).toString();
            }
        }
        console.log(receivers);
        const { ensName, showName } = userSessionStorage.getUserInfo();
        const { message_id, mail_date } =
            (await mailHttp.updateMail(draftID, {
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
        sessionStorage.setItem('html', html);
        sessionStorage.setItem('text', text);
        console.log('save');
        dateRef.current = mail_date;
        return { html, text };
    };
    const handleLoad = async (id?: string) => {
        try {
            //if (!query?.id && query.id.length === 0) {
            //  throw new Error();
            //}
            const mail = await mailHttp.getMailDetailByID(window.btoa(id ?? detailFromNew?.message_id ?? ''));

            if (mail) {
                //const { subject, mail_to, part_html } = getMailContent();
                console.log(mail);
                setSubject(mail?.subject);
                setReceivers(mail?.mail_to);
                setTemp(mail?.mail_to[0]?.address ?? '');
                setContent(mail?.part_html ?? mail?.part_text);
                setAttList(mail?.attachments);

                if (type === MetaMailTypeEn.Encrypted && !currRandomBitsRef.current) {
                    setEditable(false);
                } else {
                    setEditable(true);
                }

                if (mail?.meta_header?.keys) myKeyRef.current = mail?.meta_header?.keys?.[0];
                if (sessionStorage.getItem('reply')) {
                    const { subject, mail_to, part_html } = mailSessionStorage.getMailContent();
                    subject && setSubject(subject);
                    mail_to && setReceivers(mail_to);
                    part_html && setContent(part_html);
                    sessionStorage.removeItem('reply');
                }
                setLoaded(true);
            }
        } catch {
            //notification.error({
            //  message: 'Network Error',
            //  description: 'Can not fetch detail info of this email for now.',
            //});
        }
    };

    const handleDecrypted = async () => {
        if (!myKeyRef.current) return;
        // @ts-ignore
        const privateKey = await getPrivateKey();
        let randomBits = CryptoJS.AES.decrypt(myKeyRef.current, privateKey).toString(CryptoJS.enc.Utf8);
        if (!randomBits) {
            console.log('error: no randombits');
            return;
        }
        currRandomBitsRef.current = randomBits;
        const decryptedContent = CryptoJS.AES.decrypt(content, currRandomBitsRef.current).toString(CryptoJS.enc.Utf8);
        setContent(decryptedContent);
        setEditable(true);
        console.log('setEditable(true);');
    };

    return (
        <div className={isWriting ? 'visible' : 'invisible'}>
            <div
                className={`flex flex-col font-poppins bg-white p-18 transition-all absolute bottom-0 right-0 border border-[#EFEFEF] rounded-10 ${
                    isExtend ? 'h-full w-[calc(100vw-200px)]' : 'h-502 w-[45vw]'
                }`}>
                <header className="flex justify-between">
                    <div className="flex flex-row">
                        <div className="w-6 h-24 bg-[#006AD4] rounded-4" />
                        <span className="pl-7 font-black text-xl">New Message</span>
                    </div>
                    <div className="flex gap-10 self-start">
                        <Icon
                            url={extend}
                            checkedUrl={extend}
                            className="w-13 h-auto self-center "
                            onClick={() => setIsExtend(!isExtend)}
                        />
                        <Icon
                            url={cancel}
                            className="w-13 scale-[120%] h-auto self-center"
                            onClick={() => {
                                setIsWriting(false);
                                handleSave();
                                setDetailFromNew(null);
                            }}
                        />
                    </div>
                </header>
                <div className="text-sm text-[#878787]">
                    <h1 className="flex mt-20 h-21 ">
                        From
                        <NameSelector />
                    </h1>
                    <div className="divider"></div>
                    <h1 className="flex">
                        <div className="flex self-end ">To</div>

                        <EmailRecipientInput
                            receivers={receivers}
                            onAddReceiver={addReceiver}
                            onRemoveReceiver={removeReceiver}
                        />
                    </h1>
                    <div className="divider"></div>
                    <h1 className="flex">
                        <div className="flex self-end ">Subject</div>
                        <input
                            type="text"
                            placeholder=""
                            className="flex pl-6 mt-14 h-21 input w-full max-w-xs text-sm text-[#878787] focus:outline-none"
                            value={subject}
                            onChange={e => {
                                e.preventDefault();
                                setSubject(e.target.value);
                            }}
                        />
                    </h1>
                    <div className="divider"></div>
                </div>
                {editable ? (
                    <DynamicReactQuill
                        forwardedRef={reactQuillRef}
                        className="flex-1 flex flex-col-reverse overflow-hidden"
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
                            metatype={type}
                            onAttachment={handleSetAttachmentList}
                            showList={attList}
                        />
                    </button>
                </div>
            </div>
        </div>
    );
}
