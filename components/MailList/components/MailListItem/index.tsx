import { useContext } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { toast } from 'react-toastify';
import { throttle } from 'lodash';

import {
  MarkTypeEn,
  MetaMailTypeEn,
  IMailContentItem,
  ReadStatusTypeEn,
  FilterTypeEn,
  MailListItemType,
} from 'lib/constants';
import { mailHttp, IMailChangeOptions } from 'lib/http';
import { transformTime, getShowAddress, dispatchEvent } from 'lib/utils';
import { useMailListStore, useMailDetailStore, useNewMailStore } from 'lib/zustand-store';
import MailBoxContext from 'context/mail';
import Icon from 'components/Icon';
import Dot from 'components/Dot';
import { favorite, markFavorite, trash, markUnread, read, checkboxSvg, checkboxedSvg } from 'assets/icons';

interface IMailItemProps {
  mail: MailListItemType;
  onSelect: () => void;
}

export default function MailListItem({ mail, onSelect }: IMailItemProps) {
  const { getMailStat } = useContext(MailBoxContext);
  const JazziconGrid = dynamic(() => import('components/JazziconAvatar'), { ssr: false });
  const { filterType, list, setList } = useMailListStore();
  const { selectedMail, setSelectedMail } = useMailDetailStore();
  const { selectedDraft, setSelectedDraft } = useNewMailStore();

  const getIsReadTextClass = (mail: IMailContentItem) => {
    return mail.read == ReadStatusTypeEn.Read ? 'text-[#00000066]' : 'font-semibold';
  };

  const getMailFrom = (mail: IMailContentItem): string => {
    if (mail.mail_from?.name && mail.mail_from.name.length > 0) {
      return mail.mail_from.name;
    } else return getShowAddress(mail.mail_from.address)
  };

  const handleChangeMailStatus = async (options: IMailChangeOptions) => {
    try {
      await mailHttp.changeMailStatus([{ message_id: mail.message_id, mailbox: mail.mailbox }], options);
      // 更新列表
      const newList = list.map(item => {
        if (item.message_id === mail.message_id) {
          return {
            ...item,
            ...options,
          };
        }
        return item;
      });
      setList([...newList]);

      if (options.mark === MarkTypeEn.Trash || options.read !== undefined) {
        getMailStat();
      }
    } catch (error) {
      console.error(error);
      toast.error('Operation failed, please try again later.');
    }
  };

  const handleStar = async (mark: MarkTypeEn) => {
    await handleChangeMailStatus({ mark });
  };
  // 批量删除邮件
  const handleTrash = async () => {
    await handleChangeMailStatus({
      mark: MarkTypeEn.Trash,
    });
    // 从列表中移除
    const newList = list.filter(item => item.message_id !== mail.message_id);
    setList([...newList]);
  };


  const handleClick = throttle(async () => {
    if (mail.message_id === selectedMail?.message_id || mail.message_id === selectedDraft?.message_id) return;
    if (mail.read == ReadStatusTypeEn.Unread) {
      // 异步 不阻塞详情页渲染
      handleChangeMailStatus({ read: ReadStatusTypeEn.Read });
    }
    if (filterType === FilterTypeEn.Draft) {
      if (!selectedDraft) {
        setSelectedDraft(mail);
      } else {
        dispatchEvent('another-draft-selected', {
          done: (result: boolean) => {
            result && setSelectedDraft(mail);
          },
        });
      }
    } else {
      setSelectedMail(mail);
    }
  }, 1000);
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
          className={` py-6 flex flex-row px-12 items-center group h-30 cursor-pointer hover:dark:bg-base-300 hover:dark:bg-opacity-10  ${mail.selected ? `bg-base-300  bg-opacity-50` : 'hover:bg-[#EDF3FF] bg-opacity-50'
            }`}>
          <div className="flex flex-row gap-12">
            <input
              type="checkbox"
              title="Select"
              className={`checkbox bg-no-repeat bg-cover checkbox-sm w-14 h-14 rounded-2 border-0 ${mail.selected ? 'checked:bg-transparent' : ''}`}
              style={{ backgroundImage: `url(${mail.selected ? checkboxedSvg.src : checkboxSvg.src})` }}
              checked={mail.selected}
              onClick={e => {
                e.stopPropagation();
              }}
              onChange={onSelect}
            />

            <Icon
              url={mail.mark === MarkTypeEn.Starred ? markFavorite : favorite}
              className="w-14 h-14"
              title={mail.mark === MarkTypeEn.Starred ? 'UnStar' : 'Star'}
              onClick={async e => {
                e.stopPropagation();
                await handleStar(
                  mail.mark === MarkTypeEn.Starred ? MarkTypeEn.Normal : MarkTypeEn.Starred
                );
              }}
            />
          </div>
          {/* <div className=""> */}
          {/* 来自谁 */}
          <span className={`w-[113px] ml-28  omit text-base-content ${getIsReadTextClass(mail)}`} title={getMailFrom(mail)}>{getMailFrom(mail)}
          </span>
          {/* </div> */}
          {/* 邮件list-item */}
          <div className="flex-1 w-0 ml-28 omit">
            <Dot size={7} color={mail.meta_type === MetaMailTypeEn.Encrypted ? '#006AD4' : 'transparent'} />
            {/* ReadStatusTypeEn.Read 已读 */}
            <span className={`ml-8 ${getIsReadTextClass(mail)}`}>{mail.subject || '( no subject )'}</span>
            <span className="pt-4 pl-2 pr-7 ">{'-'}</span>
            <span className={`min-w-0 flex-1 ${mail.read === ReadStatusTypeEn.Unread ? 'text-base-content opacity-90' : 'text-[#70707099] '}`}>{renderDigest(mail)}</span>
          </div>
          <div className="w-100 text-right text-[14px]">
            <div className="group-hover:hidden text-base-content opacity-70">{transformTime(mail.mail_date)}</div>
            <div className="hidden group-hover:flex items-center justify-end">
              <div
                onClick={async e => {
                  e.stopPropagation();
                  await handleTrash();
                }}
                title="Trash">
                <Image src={trash} alt="" />
              </div>
              <div
                onClick={async e => {
                  e.stopPropagation();
                  await handleChangeMailStatus({
                    read:
                      mail.read === ReadStatusTypeEn.Read
                        ? ReadStatusTypeEn.Unread
                        : ReadStatusTypeEn.Read,
                  });
                }}
                title={mail.read === ReadStatusTypeEn.Read ? 'Read' : 'Unread'}
                className="ml-12">
                <Image
                  src={mail.read === ReadStatusTypeEn.Read ? markUnread : read}
                  alt=""
                  className="scale-125"
                />
              </div>
            </div>
          </div>
        </div >
      ) : (
        // 查看详情时候的邮件列表
        <div
          onClick={handleClick}
          className={`text-base-content  items-start box-border px-17 py-9 flex group cursor-pointer hover:bg-base-200 dark:hover:bg-[#F3F7FF] dark:hover:bg-opacity-10 dark:bg-opacity-10 ${mail.message_id === selectedMail.message_id ? `bg-[#F3F7FF]` : ''
            }`}>
          <div className='pt-5'>
            {/* 头像 */}
            <JazziconGrid size={34} addr={mail.mail_from.address || ''} />
          </div>
          <div className="flex-1 pl-15 w-0 " >
            <p className="flex justify-between items-center">
              {/* 邮件地址 */}
              <span
                className={` flex-1  w-0  omit mr-4 font-['PoppinsBold']  leading-[20px] ${getIsReadTextClass(mail)}`}
                title={getMailFrom(mail)}>
                {getMailFrom(mail)}
              </span>
              {/* 邮件日期 */}
              <span className={`max-w-[80px] text-[12px] text-right text-[#7F7F7F] dark:text-base-content`}>{transformTime(mail.mail_date)}</span>
            </p>
            <p className="flex justify-between items-center text-[14px] ">
              {/* 邮件主体 */}
              <span className={`omit mr-4 flex-1 w-0  dark:text-base-content ${mail.read == ReadStatusTypeEn.Read ? 'text-[#33333366] ' : 'text-base-content'}`}>
                {mail.subject || '( no subject )'}
              </span>
              <Dot color={mail.meta_type === MetaMailTypeEn.Encrypted ? '#006AD4' : 'transparent'} />
            </p>
            <p className={`omit text-[14px]  dark:text-[#A7A1A1]  text-[#70707099] `}>{renderDigest(mail)}</p>
          </div>
        </div >
      )
      }
    </>
  );
}
