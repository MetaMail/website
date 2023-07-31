import Image from 'next/image';
import dynamic from 'next/dynamic';
import { toast } from 'react-toastify';

import { MarkTypeEn, MetaMailTypeEn, IMailContentItem, ReadStatusTypeEn, FilterTypeEn } from 'lib/constants';
import { mailHttp, IMailChangeOptions } from 'lib/http';
import { transformTime } from 'lib/utils';
import { useMailListStore, useMailDetailStore, useNewMailStore } from 'lib/zustand-store';
import Icon from 'components/Icon';
import Dot from 'components/Dot';
import { favorite, markFavorite, trash, markUnread } from 'assets/icons';
import styles from './index.module.scss';

export type MailListItemType = IMailContentItem & {
    selected: boolean;
};

interface IMailItemProps {
    mail: MailListItemType;
    onSelect: () => void;
    onRefresh: () => Promise<void>;
}

export default function MailListItem({ mail, onSelect, onRefresh }: IMailItemProps) {
    const JazziconGrid = dynamic(() => import('components/JazziconAvatar'), { ssr: false });
    const { filterType } = useMailListStore();
    const { selectedMail, setSelectedMail } = useMailDetailStore();
    const { setSelectedDraft } = useNewMailStore();

    const getIsReadTextClass = (mail: IMailContentItem) => {
        return mail.read == ReadStatusTypeEn.Read ? 'text-black text-opacity-60' : '';
    };

    const getMailFrom = (mail: IMailContentItem): string => {
        return mail.mail_from?.name && mail.mail_from.name.length > 0 ? mail.mail_from.name : mail.mail_from.address;
    };

    const handleChangeMailStatus = async (options: IMailChangeOptions) => {
        try {
            await mailHttp.changeMailStatus([{ message_id: mail.message_id, mailbox: mail.mailbox }], options);
        } catch (error) {
            console.error(error);
            toast.error('Operation failed, please try again later.');
        } finally {
            onRefresh();
        }
    };

    const handleStar = async (mark: MarkTypeEn) => {
        await handleChangeMailStatus({ mark });
    };

    const handleDelete = async () => {
        await handleChangeMailStatus({
            mark: MarkTypeEn.Deleted,
        });
    };

    const handleUnread = async () => {
        await handleChangeMailStatus({
            read: ReadStatusTypeEn.Unread,
        });
    };

    const handleClick = async () => {
        if (mail.read == ReadStatusTypeEn.Unread) {
            await handleChangeMailStatus({ read: ReadStatusTypeEn.Read });
        }
        if (filterType === FilterTypeEn.Draft) {
            setSelectedDraft(mail);
        } else {
            setSelectedMail(mail);
        }
    };

    const renderDigest = (mail: MailListItemType) => {
        if (!mail.digest) {
            return '( no abstract )';
        }
        if (mail.meta_type === MetaMailTypeEn.Encrypted) {
            return '***';
        }
        return mail.digest;
    };

    return (
        <>
            {!selectedMail ? (
                <div
                    onClick={handleClick}
                    className={`text-[14px] flex flex-row px-20 items-center group h-36 cursor-pointer ${
                        styles.mailListItem
                    } ${mail.selected ? `bg-[#DAE7FF] ${styles.selectedItem}` : ''}`}>
                    <div className="flex flex-row gap-14">
                        <input
                            type="checkbox"
                            className="checkbox checkbox-sm"
                            checked={mail.selected}
                            onClick={e => {
                                e.stopPropagation();
                            }}
                            onChange={onSelect}
                        />

                        <Icon
                            url={mail.mark === MarkTypeEn.Starred ? markFavorite : favorite}
                            className="w-20 h-20"
                            title={'star'}
                            onClick={async e => {
                                e.stopPropagation();
                                await handleStar(
                                    mail.mark === MarkTypeEn.Starred ? MarkTypeEn.Normal : MarkTypeEn.Starred
                                );
                            }}
                        />
                    </div>
                    <div className="text-[#333333] font-bold w-140 ml-14 omit">
                        <span className={`${getIsReadTextClass(mail)}`} title={getMailFrom(mail)}>
                            {getMailFrom(mail)}
                        </span>
                    </div>
                    <div className="text-[#333333] flex-1 w-0 ml-14 omit">
                        <Dot color={mail.meta_type === MetaMailTypeEn.Encrypted ? '#006AD4' : 'transparent'} />
                        <span className={`ml-8 ${getIsReadTextClass(mail)}`}>{mail.subject || '( no subject )'}</span>
                        <span className="pt-4 pl-2 pr-7 text-[#333333]">{'-'}</span>
                        <span className="pt-4 text-[#999999] min-w-0 flex-1">{renderDigest(mail)}</span>
                    </div>
                    <div className="w-100 text-right">
                        <div className="text-[#999999] group-hover:hidden">{transformTime(mail.mail_date)}</div>
                        <div className="hidden group-hover:flex items-center justify-end">
                            <div
                                onClick={async e => {
                                    e.stopPropagation();
                                    await handleDelete();
                                }}
                                title="delete mail">
                                <Image src={trash} alt="delete mail" />
                            </div>
                            <div
                                onClick={async e => {
                                    e.stopPropagation();
                                    await handleUnread();
                                }}
                                title="mark unread mail"
                                className="ml-12">
                                <Image src={markUnread} alt="markUnread mail" className="scale-125" />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div
                    onClick={handleClick}
                    className={`w-300 px-15 py-10 text-[14px] flex group cursor-pointer ${styles.mailListItem} ${
                        mail.message_id === selectedMail.message_id ? `bg-[#DAE7FF] ${styles.selectedItem}` : ''
                    }`}>
                    <JazziconGrid size={40} addr={mail.mail_from.address || ''} />
                    <div className="flex-1 px-10 w-0">
                        <p className="flex justify-between items-center text-[#333333]">
                            <span
                                className={`flex-1 w-0 text-lg omit mr-4 ${getIsReadTextClass(mail)}`}
                                title={getMailFrom(mail)}>
                                {getMailFrom(mail)}
                            </span>
                            <span className="max-w-[80] text-right text-sm">{transformTime(mail.mail_date)}</span>
                        </p>
                        <p className="text-[#333333] flex justify-between items-center">
                            <span className={`${getIsReadTextClass(mail)} omit mr-4 flex-1 w-0`}>
                                {mail.subject || '( no subject )'}
                            </span>
                            <Dot color={mail.meta_type === MetaMailTypeEn.Encrypted ? '#006AD4' : 'transparent'} />
                        </p>
                        <p className="omit text-[#333333]">{renderDigest(mail)}</p>
                    </div>
                </div>
            )}
        </>
    );
}
