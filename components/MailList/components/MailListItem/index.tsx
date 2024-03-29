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
  MailBoxTypeEn,
} from 'lib/constants';
import { mailHttp, IMailChangeOptions } from 'lib/http';
import { transformTime, getShowAddress, dispatchEvent } from 'lib/utils';
import { useMailListStore, useMailDetailStore, useNewMailStore, useThemeStore } from 'lib/zustand-store';
import MailBoxContext from 'context/mail';
import Icon from 'components/Icon';
import { Lock } from 'components/svg/index'
import { favorite, markFavorite, trash, markUnread, read, checkboxSvg, checkboxedSvg, checkboxDark, favoriteDark } from 'assets/icons';
import Avatar from 'components/Avatar';
import { PostfixOfAddress } from 'lib/base';

interface IMailItemProps {
  mail: MailListItemType;
  onSelect: () => void;
  loading: boolean
}

export default function MailListItem({ mail, onSelect, loading }: IMailItemProps) {
  const { isDark } = useThemeStore()
  const { getMailStat } = useContext(MailBoxContext);
  const JazziconGrid = dynamic(() => import('components/JazziconAvatar'), { ssr: false });
  const { filterType, list, setList } = useMailListStore();
  const { selectedMail, setSelectedMail } = useMailDetailStore();
  const { selectedDraft, setSelectedDraft } = useNewMailStore();

  const getIsReadTextClass = (mail: IMailContentItem) => {
    return mail.read == ReadStatusTypeEn.Read ? 'text-lightMailAddressRead dark:text-DarkMailAddressRead' : "text-lightMailAddressUnRead font-poppinsSemiBold dark:text-[#fff]";
  };

  // 有name展示name,没有就展示address
  {/* sent 的时候显示收件人，也就是 mail_to */ }
  {/* inbox 的时候显示发件人，也就是 mail_From */ }
  const getMailFrom = (mail: IMailContentItem): string => {
    if (mail.mail_from?.name && mail.mail_from.name.length > 0) {
      return mail.mail_from.name;
    } else return getShowAddress(mail.mail_from.address)
  };
  // 收藏/取消收藏 已读/未读操作的时候会执行
  const handleChangeMailStatus = async (options: IMailChangeOptions) => {

    try {
      await mailHttp.changeMailStatus([{ message_id: mail.message_id, mailbox: mail.mailbox }], options);
      // 当列表长度=1，操作去掉收藏，把收藏列表清空掉
      if (list.length === 1 && options.mark === MarkTypeEn.Normal) {
        setList([])
        return;
      }
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
      toast.error('Operation failed, please try again later.', {
        position: 'top-center',
        autoClose: 2000
      });
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

  // 查看邮件详情
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
  const renderMailTo = (mail: MailListItemType) => {
    return mail.mail_to.map((item, index) => {
      if (item?.name && item.name.length > 0) {
        return item.name;
      } else return getShowAddress(item.address)
    })
  }
  const getFirstLetter = (str: string) => {
    if (str && str.length) {
      return str[0]
    } else return ''
  }
  const renderAvator = () => {
    if (mail.mail_from.address.endsWith(PostfixOfAddress)) {
      // 我们的用户
      return (
        <div className='flex items-center justify-center  flex-shrink-0 w-38 h-38'>
          <span className='text-[#3264D9] inline-block h-38 text-[16px] font-bold leading-[40px] font-800  absolute z-[1] opacity-100'>
            {mail.mail_from.name ? getFirstLetter(mail.mail_from.name) : mail.mail_from.address ? getFirstLetter(mail.mail_from?.address) : ''}
          </span>
          <JazziconGrid size={38} addr={mail.mail_from.address || ''} className='opacity-30' />
        </div>
      )
    } else {
      // 别的用户
      return <Avatar size={38} addr={mail.mail_from.name || mail.mail_from.address || ''} />
    }
  }

  return (
    <>
      {!selectedMail ? (
        <div
          onClick={handleClick}
          className={` listStatus overflow-y-visible py-6 flex flex-row px-16 items-center group h-36 cursor-pointe  ${mail.selected ? `bg-base-300  bg-opacity-50 dark:bg-[rgba(243,247,255,.1)]` : 'hover:bg-[#EDF3FF] bg-opacity-50 hover:dark:bg-opacity-10  '
            }`}>
          <div className="flex flex-row gap-12">
            <input
              type="checkbox"
              title="Select"
              className={`checkbox bg-no-repeat bg-cover checkbox-sm w-18 h-18 rounded-2 border-0 ${mail.selected ? 'checked:bg-transparent' : ''}`}
              style={{ backgroundImage: `url(${mail.selected ? checkboxedSvg.src : isDark ? checkboxDark.src : checkboxSvg.src})` }}
              checked={mail.selected}
              onClick={e => {
                e.stopPropagation();
              }}
              onChange={onSelect}
            />

            <Icon
              url={mail.mark === MarkTypeEn.Starred ? markFavorite : isDark ? favoriteDark : favorite}
              className="w-18 h-18"
              title={mail.mark === MarkTypeEn.Starred ? 'UnStar' : 'Star'}
              onClick={async e => {
                e.stopPropagation();
                await handleStar(
                  mail.mark === MarkTypeEn.Starred ? MarkTypeEn.Normal : MarkTypeEn.Starred
                );
              }}
            />
          </div>
          {/* 展开时候的邮件名*/}
          {/* 来自谁 */}
          {/* inbox展示from;send展示同 */}
          {
            mail.mailbox === MailBoxTypeEn.Send ? (
              <div title={renderMailTo(mail).join(';')}>
                <span className={`w-[160px] max-w-[160px] ml-32  omit  text-left ${getIsReadTextClass(mail)}`} >{renderMailTo(mail).join(';')}
                </span>
              </div>

            ) : (
              // Inbox
              <div title={getMailFrom(mail)}>
                <span className={`w-[160px]  max-w-[160px]  ml-32  omit ${getIsReadTextClass(mail)} ${mail.read == ReadStatusTypeEn.Read ? '!font-[400]' : ''}`} >
                  {getMailFrom(mail)}
                </span>
              </div>
            )
          }
          {/* 邮件list-item */}
          <div className="flex-1 flex items-center w-0 ml-32 omit  dark:text-base-content">
            {/* 加密邮件的小锁 */}
            {mail.meta_type === MetaMailTypeEn.Encrypted && <span title="Encrypted email" className='mr-4'>{mail.meta_type === MetaMailTypeEn.Encrypted && <Lock fill={mail.read == ReadStatusTypeEn.Unread ? isDark ? '#fff' : '#333333' : '#b2b2b2'} />}</span>}
            {/* ReadStatusTypeEn.Read 已读 */}
            <span className={`leading-[initial]  ${mail.read == ReadStatusTypeEn.Unread ? "font-poppinsSemiBold dark:text-[#fff] text-lightMailTitleUnRead" : 'text-lightMailTitleRead dark:text-DarkMailTitleRead'}`}>{mail.subject || '(no subject)'}</span>

            <span className={`min-w-0 flex-1 leading-[18px] text-ellipsis overflow-hidden dark:text-[#A7A1A1]  ${mail.read === ReadStatusTypeEn.Unread ? 'text-lightMailDetailUnRead  ' : 'text-lightMailDetailRead '}`}><span className=" px-7 leading-[initial] ">{'-'}</span>{renderDigest(mail)}</span>
          </div>
          <div className="w-100 text-right text-[14px]">
            <div className="group-hover:hidden  text-lightMailDate dark:text-DarkMailDate">{transformTime(mail.mail_date)}</div>
            <div className="hidden group-hover:flex items-center justify-end">
              <div
                onClick={async e => {
                  e.stopPropagation();
                  await handleTrash();
                }}
                title="Trash">
                <Image src={trash} alt="" className='w-18 h-18' />
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
                title={mail.read === ReadStatusTypeEn.Read ? 'Unread' : 'Read'}
                className="ml-12">
                <Image
                  src={mail.read === ReadStatusTypeEn.Read ? markUnread : read}
                  alt=""
                  className="w-18 h-18"
                />
              </div>
            </div>
          </div>
        </div >
      ) : (
        // 查看详情时候的邮件列表
        <div
          onClick={handleClick}
          className={`detailDtatus text-base-content  items-start box-border px-17 py-9 flex group cursor-pointer transition-colors duration-75 hover:bg-base-200 dark:hover:bg-[#F3F7FF] dark:hover:bg-opacity-10 dark:bg-opacity-10 ${mail.message_id === selectedMail.message_id ? `bg-[#F3F7FF]` : ''
            }`}>
          <div className='pt-5'>
            {/* 头像 */}
            {renderAvator()}
          </div>
          <div className="flex-1 pl-15 w-0 " >
            <p className="flex justify-between items-center">
              {/* 点击了邮件详情 */}
              {/* 邮件地址 */}
              {
                mail.mailbox === MailBoxTypeEn.Send ? (<span
                  className={`text-[14px] mailFrom flex-1  w-0  omit mr-15 leading-[20px]   ${mail.read == ReadStatusTypeEn.Read ? 'text-lightMailAddressRead dark:dark:text-DarkMailAddressRead' : "text-lightMailAddressUnRead dark:text-DarkMailAddressUnRead font-poppinsSemiBold"}`}
                  title={renderMailTo(mail).join(';')}>
                  {renderMailTo(mail).join(';')}
                </span>) : (
                  <span
                    className={`text-[14px] mailFrom flex-1  w-0  omit mr-15 leading-[20px]   ${mail.read == ReadStatusTypeEn.Read ? 'text-lightMailAddressRead dark:dark:text-DarkMailAddressRead' : "text-lightMailAddressUnRead dark:text-DarkMailAddressUnRead font-poppinsSemiBold"}`}
                    title={getMailFrom(mail)}>
                    {getMailFrom(mail)}
                  </span>
                )
              }

              {/* 邮件日期 */}
              <span className={`max-w-[80px] text-[14px] text-right text-lightMailDate dark:text-DarkMailDate`}>{transformTime(mail.mail_date)}</span>
            </p>
            <p className="flex justify-between items-center text-[14px] ">
              {/* 邮件主体 */}
              <span className={`omit mr-4 flex-1 w-0 text-[14px]  ${mail.read == ReadStatusTypeEn.Read ? 'text-lightMailTitleRead dark:text-DarkMailTitleRead' : "text-base-content font-poppinsSemiBold dark:text-DarkMailTitleUnRead"}`}>
                {mail.subject || '(no subject)'}
              </span>
              {mail.meta_type === MetaMailTypeEn.Encrypted && <span title="Encrypted email" className='mr-4'>{mail.meta_type === MetaMailTypeEn.Encrypted && <Lock fill={mail.read == ReadStatusTypeEn.Read ? '#adadad' : '#333'} />}</span>}
            </p>
            <p className={`omit text-[13px]  dark:text-[#A7A1A1]  text-lightMailDetailRead  leading-[17px]`}>{renderDigest(mail)}</p>
          </div>
        </div >
      )
      }
    </>
  );
}
