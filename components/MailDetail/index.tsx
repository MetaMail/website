import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import DOMPurify from 'dompurify';
import moment from 'moment';
import parse from 'html-react-parser';
import { toast } from 'react-toastify';

import { IMailContentItem, MetaMailTypeEn, ReadStatusTypeEn, MarkTypeEn } from 'lib/constants';
import { mailHttp, IMailChangeOptions } from 'lib/http';
import { userSessionStorage, mailSessionStorage } from 'lib/utils';
import { useMailDetailStore } from 'lib/zustand-store';
import { getPrivateKey, decryptMailContent, decryptMailKey } from 'lib/encrypt';
import Icon from 'components/Icon';
import AttachmentItem from './components/AttachmentItem';

import tempMailSenderIcon from 'assets/tempMailSenderIcon.svg';
import replyBtn from 'assets/replyButton.svg';
import ifLock from 'assets/ifLock.svg';
import {
    extend,
    cancel,
    sent,
    trash,
    read,
    starred,
    spam,
    back,
    mailMore,
    markFavorite,
    markUnread,
} from 'assets/icons';

let randomBits: string = '';

export default function MailDetail() {
    const { selectedMail, setSelectedMail } = useMailDetailStore();

    const [isExtend, setIsExtend] = useState(false);
    const [readable, setReadable] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLoad = async (showLoading = true) => {
        try {
            showLoading && setLoading(true);
            const mail = await mailHttp.getMailDetailByID(window.btoa(selectedMail.message_id));
            setSelectedMail({ ...selectedMail, ...mail });
            setReadable(mail.meta_type !== MetaMailTypeEn.Encrypted || !!randomBits);
        } catch (error) {
            console.error(error);
            showLoading && toast.error("Can't get mail detail, please try again later.");
        } finally {
            showLoading && setLoading(false);
        }
    };

    const handleMailActionsClick = async (httpParams: IMailChangeOptions) => {
        try {
            await mailHttp.changeMailStatus(
                [
                    {
                        message_id: selectedMail.message_id,
                        mailbox: selectedMail.mailbox,
                    },
                ],
                httpParams
            );
            await handleLoad(false);
        } catch (error) {
            console.error(error);
            toast.error('Operation failed, please try again later.');
        }
    };

    const topIcons = [
        {
            src: back,
            handler: () => {
                setSelectedMail(null);
            },
        },
        {
            src: trash,
            handler: async () => {
                await handleMailActionsClick({ mark: MarkTypeEn.Trash });
            },
        },
        {
            src: spam,
            handler: async () => {
                await handleMailActionsClick({ mark: MarkTypeEn.Spam });
            },
        },
        {
            src: selectedMail.read === ReadStatusTypeEn.Read ? read : markUnread,
            handler: async () => {
                await handleMailActionsClick({
                    read: selectedMail.read === ReadStatusTypeEn.Read ? ReadStatusTypeEn.Unread : ReadStatusTypeEn.Read,
                });
            },
        },
        {
            src: selectedMail.mark === MarkTypeEn.Starred ? starred : markFavorite,
            handler: async () => {
                await handleMailActionsClick({
                    mark: selectedMail.mark === MarkTypeEn.Starred ? MarkTypeEn.Normal : MarkTypeEn.Starred,
                });
            },
        },
    ];

    const rightIcons = [
        {
            src: selectedMail.mark === MarkTypeEn.Starred ? starred : markFavorite,
            handler: async () => {
                await handleMailActionsClick({
                    mark: selectedMail.mark === MarkTypeEn.Starred ? MarkTypeEn.Normal : MarkTypeEn.Starred,
                });
            },
        },
        {
            src: sent,
            handler: () => {},
        },
        {
            src: mailMore,
            handler: () => {},
        },
    ];

    const handleDecrypted = async () => {
        let keys = selectedMail?.meta_header?.keys;
        const { address, ensName } = userSessionStorage.getUserInfo();
        if (keys && keys?.length > 0 && address) {
            const addrList = [
                selectedMail?.mail_from.address,
                ...(selectedMail?.mail_to.map(item => item.address) || []),
                ...(selectedMail?.mail_cc.map(item => item.address) || []),
                ...(selectedMail?.mail_bcc.map(item => item.address) || []),
            ];
            const idx = addrList.findIndex(addr => {
                const prefix = addr?.split('@')[0].toLocaleLowerCase();
                return prefix === address || prefix === ensName;
            });
            if (idx < 0 || idx > keys.length - 1) {
                console.log('not find index from address list');
                return;
            }
            const key = keys[idx];

            const { privateKey, salt } = userSessionStorage.getUserInfo();
            const decryptPrivateKey = await getPrivateKey(privateKey, salt);
            randomBits = await decryptMailKey(key, decryptPrivateKey);
            if (!randomBits) {
                return toast.error('No randomBits.');
            }

            const _mail = { ...selectedMail };
            if (_mail?.part_html) {
                _mail.part_html = decryptMailContent(_mail.part_html, randomBits);
            }
            if (_mail?.part_text) {
                _mail.part_text = decryptMailContent(_mail.part_html, randomBits);
            }
            setReadable(true);
            setSelectedMail(_mail);
        } else {
            console.warn(`please check your keys ${keys} and address ${address}`);
        }
    };

    const changeInnerHTML = (data: IMailContentItem) => {
        if (data.part_html) {
            var el = document.createElement('html');
            el.innerHTML = data.part_html;
            {
                data?.attachments?.map(
                    (item: {
                        filename: string;
                        download: {
                            expire_at: string;
                            url: string;
                        };
                    }) => {
                        //imgReplace = document.getElementById(item.filename);
                        el.querySelectorAll('img').forEach(function (element) {
                            if (element.alt == item.filename) {
                                element.src = item.download.url;
                                data.part_html = el.innerHTML;
                            }
                        });
                    }
                );
            }
        }
    };

    const getMailFrom = (mail: IMailContentItem): string => {
        return mail.mail_from?.name && mail.mail_from.name.length > 0 ? mail.mail_from.name : mail.mail_from.address;
    };

    useEffect(() => {
        handleLoad();
        return () => {
            randomBits = '';
        };
    }, [selectedMail.message_id]);

    return (
        <div className="flex-1">
            <div className={`transition-all h-[100%] ${isExtend ? 'absolute top-0 left-0 w-full' : ''}`}>
                <div className="w-full h-full bg-white flex flex-col font-poppins p-20">
                    <header className="flex flex-col justify-between w-full mb-20">
                        <div className="flex justify-between w-full">
                            <div className="flex gap-10">
                                {topIcons.map((item, index) => {
                                    return (
                                        <Icon
                                            url={item.src}
                                            key={index}
                                            className="w-20 h-20 self-center"
                                            onClick={item.handler}
                                        />
                                    );
                                })}
                            </div>
                            <div className="flex gap-10">
                                <Icon
                                    url={extend}
                                    className="w-20 h-20 self-center "
                                    onClick={() => setIsExtend(!isExtend)}
                                />
                                <Icon
                                    url={cancel}
                                    onClick={() => setSelectedMail(null)}
                                    className="w-20 h-20 scale-[120%] self-center"
                                />
                            </div>
                        </div>
                        <h1 className="omit text-2xl font-bold my-20">{selectedMail?.subject || '( no subject )'}</h1>
                        <div className="flex justify-between">
                            <div className="flex gap-11">
                                <Image src={tempMailSenderIcon} className="w-40 h-auto" alt={'tempMailSenderIcon'} />
                                <div className="">
                                    <div className="text-[#0075EA]">{getMailFrom(selectedMail)}</div>
                                    <div className="flex gap-3">
                                        to:
                                        <Image src={ifLock} className="self-center " alt={'ifLock'} />
                                        <div className="flex-1 omit">{selectedMail?.mail_to[0]?.address}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-6 stroke-current text-[#707070] max-w-[160]">
                                <div className="text-xs">
                                    {moment(selectedMail?.mail_date).format('ddd, MMM DD, Y LT')}
                                </div>
                                <div className="flex gap-10 justify-end">
                                    {rightIcons.map((item, index) => {
                                        return (
                                            <Icon
                                                key={index}
                                                url={item.src}
                                                onClick={item.handler}
                                                className="w-20 h-20 self-center"
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </header>

                    {loading ? (
                        <div className="flex items-center justify-center pt-200">
                            <span className="loading loading-infinity loading-lg bg-[#006AD4]"></span>
                        </div>
                    ) : readable ? (
                        <>
                            <h2 className="flex-1 overflow-auto">
                                {selectedMail?.part_html
                                    ? parse(DOMPurify.sanitize(selectedMail?.part_html))
                                    : selectedMail?.part_text}
                            </h2>
                            {selectedMail?.attachments && selectedMail.attachments.length > 0 && (
                                <div className="flex">
                                    {selectedMail?.attachments?.map((item, idx) => (
                                        <AttachmentItem
                                            idx={idx}
                                            key={idx}
                                            url={item?.download?.url}
                                            name={item?.filename}
                                            randomBits={randomBits}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <button className="flex-1" onClick={handleDecrypted}>
                            Decrypt
                        </button>
                    )}

                    <button className="w-105 h-36 ">
                        <Image src={replyBtn} alt={'reply'} />
                    </button>
                </div>
            </div>
        </div>
    );
}
