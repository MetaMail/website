import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import DOMPurify from 'dompurify';
import moment from 'moment';
import parse from 'html-react-parser';

import { IMailContentItem, MetaMailTypeEn, ReadStatusTypeEn, MarkTypeEn } from 'lib/constants';
import { mailHttp } from 'lib/http';
import { userSessionStorage, mailSessionStorage } from 'lib/session-storage';
import { useMailDetailStore } from 'lib/zustand-store';
import { getPrivateKey, decryptMailContent, decryptMailKey } from 'lib/encrypt';
import Icon from 'components/Icon';

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
    temp1,
    spam,
    back,
    mailMore,
    markFavorite,
    markUnread,
} from 'assets/icons';

export default function MailDetail() {
    const router = useRouter();
    const { isMailDetail, detailFromList, setIsMailDetail } = useMailDetailStore();

    const [mailDetail, setMailDetail] = useState<IMailContentItem>();
    const [isExtend, setIsExtend] = useState(false);
    const [readable, setReadable] = useState(true);
    const [loading, setLoading] = useState(false);
    const [isRead, setIsRead] = useState(true);
    const [mailInfo, setMailInfo] = useState([
        {
            message_id: detailFromList.message_id,
            mailbox: detailFromList.mailbox,
        },
    ]);
    const [mark, setMark] = useState(detailFromList.mark === 1);

    const mailDetailTopActions = [
        {
            src: back,
            handler: () => {
                setIsMailDetail(false);
            },
        },
        {
            src: trash,
            handler: async () => {
                mailSessionStorage.clearMailListInfo();
                await mailHttp.changeMailStatus(mailInfo, MarkTypeEn.Trash, undefined);
                router.back();
            },
        },
        {
            src: temp1,
            handler: () => {},
        },
        {
            src: spam,
            handler: async () => {
                mailSessionStorage.clearMailListInfo();
                await mailHttp.changeMailStatus(mailInfo, MarkTypeEn.Spam, undefined);
                router.back();
            },
        },
        {
            src: read,
            checkedSrc: markUnread,
            handler: async () => {
                mailSessionStorage.clearMailListInfo();
                await mailHttp.changeMailStatus(
                    mailInfo,
                    undefined,
                    isRead ? ReadStatusTypeEn.unread : ReadStatusTypeEn.read
                );
                setIsRead(!isRead);
            },
            onselect: isRead,
        },
        {
            src: starred,
            checkedSrc: markFavorite,
            handler: async () => {
                mailSessionStorage.clearMailListInfo();
                await mailHttp.changeMailStatus(mailInfo, mark ? MarkTypeEn.Normal : MarkTypeEn.Starred, undefined);
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
                await mailHttp.changeMailStatus(mailInfo, mark ? MarkTypeEn.Normal : MarkTypeEn.Starred, undefined);
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

            const encryptedPrivateKey = userSessionStorage.getPrivateKeyFromLocal();
            const salt = userSessionStorage.getSaltFromLocal();
            const privateKey = await getPrivateKey(userSessionStorage.getWalletAddress(), encryptedPrivateKey, salt);
            const randomBits = await decryptMailKey(key, privateKey);
            if (!randomBits) {
                console.log('error: no randombits');
                return;
            }
            //TODO: attachments randomBitsRef.current = randomBits;
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

    const handleLoad = async () => {
        setMailDetail(null);
        //let ifIndex = false;
        try {
            //TODO:实现邮件数据预先加载
            //if (!router.query?.id && router?.query?.id?.length === 0 ) {
            //  throw new Error();
            //}
            //const mailDetail = getStorage('mailDetailStorage')?.mailDetails;
            //console.log(mailDetail);
            //mailDetail.map(async (item: IMailContentItem)=>{ ////search
            //  if (String(item?.message_id??'') === String(router.query.id)){
            //    changeInnerHTML(item);
            //    setMail(item);
            //    ifIndex = true;
            //  }
            //  })
            if (!loading) setLoading(true);
            //if (!ifIndex){ //如果没找到，(逻辑上不会找不到，可能是手动输入query或者是fetch的时候error了)
            const mail = await mailHttp.getMailDetailByID(window.btoa(detailFromList.message_id ?? ''));
            changeInnerHTML(mail);
            setMailDetail(mail);
            //}
        } catch (e) {
            console.log(e);
            console.log('mailError');
            //notification.error({
            //  message: 'Network Error',
            //  description: 'Can not fetch detail info of this email for now.',
            //});
            setMailDetail(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setMailInfo([
            {
                message_id: detailFromList.message_id,
                mailbox: detailFromList.mailbox,
            },
        ]);
        setMark(detailFromList.mark === 1 ? true : false);
        if (detailFromList.meta_type === MetaMailTypeEn.Encrypted) {
            setReadable(false);
        }
        // handleMarkRead();
        if (userSessionStorage.getUserInfo()?.address) {
            if (isMailDetail) handleLoad();
        } else {
            userSessionStorage.clearUserInfo();
            router.push('/');
        }
    }, [detailFromList]);

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
                                            checkedUrl={item?.checkedSrc}
                                            select={item?.onselect}
                                            className="w-13 h-auto self-center"
                                            onClick={item.handler}
                                        />
                                    );
                                })}
                            </div>
                            <div className="flex gap-10">
                                <Icon
                                    url={extend}
                                    checkedUrl={extend}
                                    className="w-13 h-auto self-center "
                                    onClick={() => setIsExtend(!isExtend)}
                                />
                                <Icon
                                    url={cancel}
                                    onClick={() => setIsMailDetail(false)}
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
                            <div className="flex flex-col self-end gap-6 stroke-current text-[#707070]">
                                <div className="text-xs">
                                    {moment(mailDetail?.mail_date).format('ddd, MMM DD, Y LT')}
                                </div>
                                <div className="flex gap-10 justify-end">
                                    {threeMail.map((item, index) => {
                                        return (
                                            <Icon
                                                url={item.src}
                                                checkedUrl={item?.checkedSrc}
                                                select={item?.onselect}
                                                key={index}
                                                onClick={item.handler}
                                                className="w-13 h-auto self-center"
                                            />
                                        );
                                    })}
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
                                        <button className="m-22 mb-0 w-168 h-37 bg-[#F3F7FF] rounded-6" key={idx} />
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
