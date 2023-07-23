import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import DOMPurify from 'dompurify';
import moment from 'moment';
import parse from 'html-react-parser';

import { IMailContentItem, MetaMailTypeEn, ReadStatusTypeEn, MarkTypeEn } from 'lib/constants';
import { mailHttp } from 'lib/http';
import { userSessionStorage, mailSessionStorage } from 'lib/utils';
import { useMailDetailStore } from 'lib/zustand-store';
import { getPrivateKey, decryptMailContent, decryptMailKey } from 'lib/encrypt';
import Icon from 'components/Icon';
import { MailListItemType } from 'components/MailList/components/MailListItem';
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

    return (
        <div className="flex">
            <div className={`transition-all h-[100%] ${isExtend ? 'w-[calc(100vw-225px)]' : ''}`}>
                <div className="w-full h-full bg-white flex flex-col font-poppins">
                    <div className="h-[86%] w-0 border absolute top-54" />
                    <header className="flex flex-col justify-between h-100 w-full px-16">
                        <div className="py-11 flex justify-between w-full">
                            <div className="h-14 flex gap-10">
                                {mailDetailTopActions.map((item, index) => {
                                    return (
                                        <Icon
                                            url={item.src}
                                            key={index}
                                            className="w-13 h-auto self-center"
                                            onClick={item.handler}
                                        />
                                    );
                                })}
                            </div>
                            <div className="flex gap-10">
                                <Icon
                                    url={extend}
                                    className="w-13 h-auto self-center "
                                    onClick={() => setIsExtend(!isExtend)}
                                />
                                <Icon
                                    url={cancel}
                                    onClick={() => setSelectedMail(null)}
                                    className="w-13 scale-[120%] h-auto self-center"
                                />
                            </div>
                        </div>
                        <div className="flex justify-between pr-21">
                            <div className="flex gap-11">
                                <Image
                                    src={tempMailSenderIcon}
                                    className="self-center w-40 h-auto"
                                    alt={'tempMailSenderIcon'}
                                />
                                <div className="self-end">
                                    <div className="text-[#0075EA] text-md">
                                        {mailDetail?.mail_from?.name ?? mailDetail?.mail_from?.address}
                                    </div>
                                    <div className="flex text-xs gap-3 w-220">
                                        to:
                                        <Image src={ifLock} className="self-center " alt={'ifLock'} />
                                        <div className="flex-1 omit">{mailDetail?.mail_to[0]?.address}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    {loading ? (
                        <div className="flex justify-center align-center m-auto radial-progress animate-spin text-[#006AD4]" />
                    ) : readable ? (
                        <>
                            <h1 className="p-16 pl-[4%] w-[70%] h-48 omit text-2xl font-bold pb-0 mb-24">
                                {mailDetail?.subject}
                            </h1>
                            <h2 className="flex-1 overflow-auto ml-19">
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

                    <button className="m-22 mb-9 w-105 h-36 ">
                        <Image src={replyBtn} alt={'reply'} />
                    </button>
                </div>
            </div>
        </div>
    );
}
