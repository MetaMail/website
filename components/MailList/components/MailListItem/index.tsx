import moment from 'moment';
import Image from 'next/image';
import { toast } from 'react-toastify';

import {
    IPersonItem,
    MarkTypeEn,
    MetaMailTypeEn,
    IMailContentItem,
    ReadStatusTypeEn,
    FilterTypeEn,
} from 'lib/constants';
import { mailHttp, IMailChangeParams, IMailChangeOptions } from 'lib/http';
import { userSessionStorage, mailSessionStorage } from 'lib/utils';
import { useMailListStore, useMailDetailStore, useNewMailStore, useUtilsStore } from 'lib/zustand-store';
import Icon from 'components/Icon';
import Dot from 'components/Dot';
import { checkbox, favorite, markFavorite, selected, white, trash, markUnread } from 'assets/icons';
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
    const { filterType } = useMailListStore();
    const { setDetailFromList, setDetailFromNew, setIsMailDetail, detailFromNew } = useMailDetailStore();
    const { setIsWriting } = useNewMailStore();

    const getIsRead = (mail: IMailContentItem) => {
        return mail.read == ReadStatusTypeEn.read;
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

    const handleStar = async () => {
        await handleChangeMailStatus({
            mark: MarkTypeEn.Starred,
        });
    };

    const handleDelete = async () => {
        await handleChangeMailStatus({
            mark: MarkTypeEn.Deleted,
        });
    };

    const handleUnread = async () => {
        await handleChangeMailStatus({
            read: ReadStatusTypeEn.unread,
        });
    };

    const handleClick = async () => {
        if (mail.read == ReadStatusTypeEn.unread) {
            await handleChangeMailStatus({ read: ReadStatusTypeEn.read });
        }
        if (filterType === FilterTypeEn.Draft) {
            setDetailFromNew(mail);
            setIsWriting(true);
        } else {
            setDetailFromList(mail);
            setIsMailDetail(true);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`text-[14px] flex flex-row px-20 items-center group h-36 cursor-pointer ${styles.mailListItem} ${
                mail.selected ? `bg-[#DAE7FF] ${styles.selectedItem}` : ''
            }`}>
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
                        await handleStar();
                    }}
                />
            </div>
            <div className="text-[#333333] font-bold w-140 ml-14 omit">
                <span className={`${getIsRead(mail) ? 'text-black text-opacity-60' : ''}`} title={getMailFrom(mail)}>
                    {getMailFrom(mail)}
                </span>
            </div>
            <div className="text-[#333333] flex-1 w-0 ml-14 omit">
                <Dot color={mail.meta_type === MetaMailTypeEn.Encrypted ? '#006AD4' : 'transparent'} />
                <span className={`ml-8 ${getIsRead(mail) ? 'text-black text-opacity-60' : ''}`}>
                    {mail.subject || '( no subject )'}
                </span>
                <span className="pt-4 pl-2 pr-7 text-[#333333]">{'-'}</span>
                <span className="pt-4 text-[#999999] min-w-0 flex-1">{mail.digest || '( no abstract )'}</span>
            </div>
            <div className="w-100 text-right">
                <div className="text-[#999999] group-hover:hidden">{moment(mail.mail_date).format('MMM D')}</div>
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
    );
}
