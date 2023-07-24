import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import DOMPurify from 'dompurify';
import moment from 'moment';
import parse from 'html-react-parser';
import { toast } from 'react-toastify';

import { IMailContentItem, MetaMailTypeEn, ReadStatusTypeEn, MarkTypeEn } from 'lib/constants';
import { mailHttp } from 'lib/http';
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

export default function MailDetail() {
    const router = useRouter();
    const { selectedMail, setSelectedMail } = useMailDetailStore();

    const [mailDetail, setMailDetail] = useState<IMailContentItem>();
    const [isExtend, setIsExtend] = useState(false);
    const [readable, setReadable] = useState(true);
    const [loading, setLoading] = useState(false);
    const [isRead, setIsRead] = useState(true);
    const [mailInfo, setMailInfo] = useState([
        {
            message_id: selectedMail.message_id,
            mailbox: selectedMail.mailbox,
        },
    ]);
    const [mark, setMark] = useState(selectedMail.mark === 1);
    const randomBitsRef = useRef('');
    const mailDetailTopActions = [
        {
            src: back,
            handler: () => {
                setSelectedMail(null);
            },
        },
        {
            src: trash,
            handler: async () => {
                mailSessionStorage.clearMailListInfo();
                await mailHttp.changeMailStatus(mailInfo, {
                    mark: MarkTypeEn.Trash,
                });
                router.back();
            },
        },
        {
            src: spam,
            handler: async () => {
                mailSessionStorage.clearMailListInfo();
                await mailHttp.changeMailStatus(mailInfo, {
                    mark: MarkTypeEn.Spam,
                });
                router.back();
            },
        },
        {
            src: read,
            checkedSrc: markUnread,
            handler: async () => {
                mailSessionStorage.clearMailListInfo();
                await mailHttp.changeMailStatus(mailInfo, {
                    read: isRead ? ReadStatusTypeEn.Unread : ReadStatusTypeEn.Read,
                });
                setIsRead(!isRead);
            },
            onselect: isRead,
        },
        {
            src: starred,
            checkedSrc: markFavorite,
            handler: async () => {
                mailSessionStorage.clearMailListInfo();
                await mailHttp.changeMailStatus(mailInfo, {
                    mark: mark ? MarkTypeEn.Normal : MarkTypeEn.Starred,
                });
                setMark(!mark);
            },
            onselect: mark,
        },
    ];

    const threeMail = [
        {
            src: starred,
            checkedSrc: markFavorite,
            handler: async () => {
                mailSessionStorage.clearMailListInfo();
                await mailHttp.changeMailStatus(mailInfo, {
                    mark: mark ? MarkTypeEn.Normal : MarkTypeEn.Starred,
                });
                setMark(!mark);
            },
            onselect: mark,
        },
        {
            src: sent,
            handler: () => {
                //handleStar(mailInfo);
            },
        },
        {
            src: mailMore,
            handler: () => {
                //handleStar(mailInfo);
            },
        },
    ];

    const handleDecrypted = async () => {
        let keys = mailDetail?.meta_header?.keys;
        const { address, ensName } = userSessionStorage.getUserInfo();
        if (keys && keys?.length > 0 && address) {
            const addrList = [
                mailDetail?.mail_from.address,
                ...(mailDetail?.mail_to.map(item => item.address) || []),
                ...(mailDetail?.mail_cc.map(item => item.address) || []),
                ...(mailDetail?.mail_bcc.map(item => item.address) || []),
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
            const randomBits = await decryptMailKey(key, decryptPrivateKey);
            if (!randomBits) {
                console.log('error: no randombits');
                return;
            }
            randomBitsRef.current = randomBits;
            const res = { ...mailDetail };
            if (res?.part_html) {
                res.part_html = decryptMailContent(res.part_html, randomBits);
            }
            if (res?.part_text) {
                res.part_text = decryptMailContent(res.part_html, randomBits);
            }
            setReadable(true);
            setMailDetail(res);
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

    const handleLoad = async () => {
        try {
            setLoading(true);
            const mail = await mailHttp.getMailDetailByID(window.btoa(selectedMail.message_id));
            setSelectedMail({
                ...selectedMail,
                attachments: mail.attachments,
                part_html: mail.part_html,
                part_text: mail.part_text,
                download: mail.download,
            });
        } catch (error) {
            console.error(error);
            toast.error("Can't get mail detail, please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleLoad();
    }, [selectedMail.message_id]);

    return (
        <div className="flex-1">
            <div className={`transition-all h-[100%] ${isExtend ? 'w-[calc(100vw-225px)]' : ''}`}>
                <div className="w-full h-full bg-white flex flex-col font-poppins p-20">
                    <header className="flex flex-col justify-between w-full mb-20">
                        <div className="flex justify-between w-full">
                            <div className="flex gap-10">
                                {mailDetailTopActions.map((item, index) => {
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
                        <h1 className="omit text-2xl font-bold my-20">
                            {mailDetail?.subject || 'I want to creat a metamail'}
                        </h1>
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
                                    {moment(mailDetail?.mail_date).format('ddd, MMM DD, Y LT')}
                                </div>
                                <div className="flex gap-10 justify-end">
                                    {threeMail.map((item, index) => {
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
                                {mailDetail?.part_html
                                    ? parse(DOMPurify.sanitize(mailDetail?.part_html))
                                    : mailDetail?.part_text}
                            </h2>
                            {mailDetail?.attachments && mailDetail.attachments.length > 0 && (
                                <div className="flex">
                                    {mailDetail?.attachments?.map((item, idx) => (
                                        <AttachmentItem
                                            idx={idx}
                                            key={idx}
                                            url={item?.download?.url}
                                            name={item?.filename}
                                            randomBits={randomBitsRef.current}
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
