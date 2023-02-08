import encrypt from '@assets/encrypt.svg';
import moment from 'moment';
import Icon from '@components/Icon';
import {
    IPersonItem,
    MarkTypeEn,
    MetaMailTypeEn,
  } from 'constants/interfaces';
import { checkbox, starred, markFavorite, selected, white } from 'assets/icons';
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
  }: IMailItemProps) {
    console.log('render');
    return (
      <div className = {isRead ? '' : 'font-bold'}>
        <div className='h-35 flex flex-row py-6 px-18 justify-between text-xs hover:bg-[#DAE7FF]'>
          <div className='flex flex-row gap-9'>
            <div className='pt-6'>
              <Icon
              url={checkbox}
              checkedUrl={selected}
              onClick={onSelect}
              select={select}
              tip={'select'}
              /></div>
            <div className='pt-4'>
              <Icon
              url={starred}
              checkedUrl={markFavorite}
              onClick={onFavorite}
              select={mark === MarkTypeEn.Starred}
              tip={'star'}/></div>
              {/*<Icon    显示加密状态
              url={white}
              checkedUrl={encrypt}
              onClick={onFavorite}
              //select={metaType === MetaMailTypeEn.Encrypted}
              select={isRead === false}
    tip={'star'}/>*/}</div>
            <span className='pt-4 text-[#333333] omit w-110 pl-30' onClick={onClick} >
            {from?.name && from.name.length > 0 ? from.name : from.address}
            </span>
            <span className='pt-4 text-[#333333] omit w-120 pl-30' onClick={onClick} >{subject}</span>
            {/*<div className='h-14 w-1 rounded-1 bg-[#333333] align-center'/>*/}
            <span className='pt-4 pl-2 pr-7 text-[#333333] omit' onClick={onClick}>{"-"}</span>
            <div className='pt-4 text-[#999999] omit min-w-0 flex-1' onClick={onClick} >{abstract}</div>
            <div className='pt-4 text-[#999999] pl-45'>
            {moment(date).format("MMM ") }
            </div>
            <div className='pt-4 text-[#999999] flex justify-center w-20'>
            {moment(date).format("D ") }
            </div>
          </div>
        </div>
      );
    }