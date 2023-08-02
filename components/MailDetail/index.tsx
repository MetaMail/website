import { useState, useEffect, useContext } from 'react';
import dynamic from 'next/dynamic';
import DOMPurify from 'dompurify';
import moment from 'moment';
import parse from 'html-react-parser';
import { toast } from 'react-toastify';

import MailBoxContext from 'context/mail';
import { IMailContentItem, MetaMailTypeEn, ReadStatusTypeEn, MarkTypeEn } from 'lib/constants';
import { mailHttp, IMailChangeOptions } from 'lib/http';
import { userSessionStorage } from 'lib/utils';
import { useMailDetailStore, useNewMailStore } from 'lib/zustand-store';
import { decryptMailContent, decryptMailKey } from 'lib/encrypt';
import Icon from 'components/Icon';
import AttachmentItem from './components/AttachmentItem';

import sendMailIcon from 'assets/sendMail.svg';
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
    const JazziconGrid = dynamic(() => import('components/JazziconAvatar'), { ssr: false });
    const { createDraft, checkEncryptable } = useContext(MailBoxContext);
    const { selectedMail, setSelectedMail, isDetailExtend, setIsDetailExtend } = useMailDetailStore();
    const { setSelectedDraft } = useNewMailStore();

    const [loading, setLoading] = useState(false);

    const ensureRandomBitsExist = async () => {
        if (!randomBits) {
            const keys = selectedMail?.meta_header?.keys;
            const { address, ensName } = userSessionStorage.getUserInfo();
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
            if (!key) throw new Error("Can't decrypt mail without randomBits key.");
            const { purePrivateKey } = userSessionStorage.getUserInfo();
            randomBits = await decryptMailKey(key, purePrivateKey);
            if (!randomBits) {
                throw new Error('No randomBits.');
            }
        }
    };

    const handleLoad = async (showLoading = true) => {
        try {
            showLoading && setLoading(true);
            const mail = await mailHttp.getMailDetailByID(window.btoa(selectedMail.message_id));
            const _mail = { ...selectedMail, ...mail };
            if (selectedMail.meta_type === MetaMailTypeEn.Encrypted) {
                await ensureRandomBitsExist();
                if (_mail?.part_html) {
                    _mail.part_html = decryptMailContent(_mail.part_html, randomBits);
                }
                if (_mail?.part_text) {
                    _mail.part_text = decryptMailContent(_mail.part_text, randomBits);
                }
            }

            setSelectedMail(_mail);
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
            src: selectedMail.read === ReadStatusTypeEn.Read ? markUnread : read,
            handler: async () => {
                await handleMailActionsClick({
                    read: selectedMail.read === ReadStatusTypeEn.Read ? ReadStatusTypeEn.Unread : ReadStatusTypeEn.Read,
                });
            },
        },
        {
            src: selectedMail.mark === MarkTypeEn.Starred ? markFavorite : starred,
            handler: async () => {
                await handleMailActionsClick({
                    mark: selectedMail.mark === MarkTypeEn.Starred ? MarkTypeEn.Normal : MarkTypeEn.Starred,
                });
            },
        },
    ];

    const rightIcons = [
        {
            src: selectedMail.mark === MarkTypeEn.Starred ? markFavorite : starred,
            handler: async () => {
                await handleMailActionsClick({
                    mark: selectedMail.mark === MarkTypeEn.Starred ? MarkTypeEn.Normal : MarkTypeEn.Starred,
                });
            },
        },
        {
            src: sent,
            handler: () => {
                handleReply();
            },
        },
        {
            src: mailMore,
            handler: () => {},
        },
    ];

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

    const handleReply = async () => {
        const { address } = userSessionStorage.getUserInfo();
        const { message_id, randomBits } = await createDraft();
        const { encryptable } = await checkEncryptable([selectedMail.mail_from]);
        await mailHttp.updateMail({
            mail_id: window.btoa(message_id),
            mail_to: [selectedMail.mail_from],
            mail_from: selectedMail.mail_to.find(item => item.address === address),
            meta_type: encryptable ? MetaMailTypeEn.Encrypted : MetaMailTypeEn.Signed,
        });
        const mail = await mailHttp.getMailDetailByID(window.btoa(message_id));
        setSelectedDraft({ ...mail, randomBits });
    };

    useEffect(() => {
        handleLoad();
        return () => {
            randomBits = '';
        };
    }, [selectedMail.message_id]);

    return (
        <div
            className={`flex-1 rounded-10 flex flex-col font-poppins p-20 transition-all h-[100%] bg-[#fff] ${
                isDetailExtend ? 'w-full' : ''
            }`}>
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
                            onClick={() => setIsDetailExtend(!isDetailExtend)}
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
                        <JazziconGrid size={40} addr={selectedMail.mail_from.address || ''} />
                        <div className="">
                            <div className="text-[#0075EA]">{getMailFrom(selectedMail)}</div>
                            <div className="flex gap-3">
                                to:
                                <div className="flex-1 omit ml-4">{selectedMail?.mail_to[0]?.address}</div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-6 stroke-current text-[#707070] max-w-[160]">
                        <div className="text-xs">{moment(selectedMail?.mail_date).format('ddd, MMM DD, Y LT')}</div>
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
                <div className="flex-1 flex items-center justify-center">
                    <span className="loading loading-ring loading-lg bg-[#006AD4]"></span>
                </div>
            ) : (
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
            )}

            <button
                className="flex justify-center items-center bg-[#006AD4] text-white px-14 py-8 rounded-[8px] self-start"
                onClick={handleReply}>
                <Icon url={sendMailIcon} />
                <span className="ml-6">Reply</span>
            </button>
        </div>
    );
}
