import moment from 'moment';
import Image from 'next/image';

import { IPersonItem, MarkTypeEn, MetaMailTypeEn } from 'lib/constants';
import Icon from 'components/Icon';
import { checkbox, favorite, markFavorite, selected, white, trash, markUnread } from 'assets/icons';
interface IMailItemProps {
    subject: string;
    from: IPersonItem;
    date: string;
    isRead: boolean;
    select?: boolean;
    mark?: MarkTypeEn;
    metaType?: MetaMailTypeEn;
    abstract?: string;
    onClick: () => void;
    onSelect: (isSelected: boolean) => void;
    onFavorite: (isSelected: boolean) => void;
    onDelete: () => void;
    onUnread: () => void;
}

export default function MailListItem({
    subject,
    from,
    date,
    isRead,
    onClick,
    onSelect,
    onFavorite,
    select,
    mark,
    metaType,
    abstract,
    onDelete,
    onUnread,
}: IMailItemProps) {
    return (
        <div className="flex flex-row pt-1 pb-5 px-18 justify-between text-sm hover:bg-[#DAE7FF] hover:shadow-sm group">
            <div className="flex flex-row gap-9">
                <div className="pt-7">
                    <Icon
                        url={checkbox}
                        checkedUrl={selected}
                        onClick={onSelect}
                        select={select}
                        tip={'select'}
                        className="w-13"
                    />
                </div>
                <div className="pt-7">
                    <Icon
                        url={favorite}
                        checkedUrl={markFavorite}
                        onClick={onFavorite}
                        className="w-13"
                        select={mark === MarkTypeEn.Starred}
                        tip={'star'}
                    />
                </div>
                {/*<Icon    显示加密状态
              url={white}
              checkedUrl={encrypt}
              onClick={onFavorite}
              //select={metaType === MetaMailTypeEn.Encrypted}
              select={isRead === false}
    tip={'star'}/>*/}
            </div>
            <span className="pt-4 text-[#333333] omit w-105 pl-25" onClick={onClick}>
                <span className={isRead ? 'text-black text-opacity-60' : ''}>
                    {from?.name && from.name.length > 0 ? from.name : from.address}
                </span>
            </span>
            <div
                className={
                    isRead
                        ? 'bg-opacity-0 flex self-center w-4 h-4 rounded-full bg-[#006AD4] mx-7 mt-4'
                        : 'flex self-center w-4 h-4 rounded-full bg-[#006AD4] mx-7 mt-4'
                }
            />
            <span className="pt-4 text-[#333333] omit w-120 " onClick={onClick}>
                <span className={isRead ? 'text-black text-opacity-60' : ''}>{subject}</span>
            </span>
            {/*<div className='h-14 w-1 rounded-1 bg-[#333333] align-center'/>*/}
            <span className="pt-4 pl-2 pr-7 text-[#333333] omit" onClick={onClick}>
                {'-'}
            </span>
            <div className="pt-4 text-[#999999] omit min-w-0 flex-1" onClick={onClick}>
                {abstract}
            </div>
            <div className="flex flex-row text-[#999999] pl-45 pt-4 group-hover:hidden">
                {moment(date).format('MMM ')}
                <div className="flex justify-center w-20">{moment(date).format('D ')}</div>
            </div>
            <div className="hidden flex-row group-hover:flex ">
                <div onClick={onDelete} className="self-center">
                    <Image src={trash} alt="delete mail" />
                </div>
                <div onClick={onUnread} className="self-center mx-8">
                    <Image src={markUnread} alt="markUnread mail" className="scale-125" />
                </div>
            </div>
        </div>
    );
}
