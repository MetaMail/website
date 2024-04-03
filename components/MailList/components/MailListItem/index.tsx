import React, { useContext } from 'react';
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
import { useRouter } from 'next/router';

interface IMailItemProps {
  mail: MailListItemType;
  onSelect: () => void;
  loading: boolean
}

// eslint-disable-next-line react/display-name
const MailListItem = React.memo(({ mail, onSelect }: IMailItemProps) => {
  const { isDark } = useThemeStore()
  const { getMailStat } = useContext(MailBoxContext);
  const JazziconGrid = dynamic(() => import('components/JazziconAvatar'), { ssr: false });
  const { filterType, list, setList } = useMailListStore();
  const { selectedMail, setSelectedMail } = useMailDetailStore();
  const { selectedDraft, setSelectedDraft } = useNewMailStore();
  const router = useRouter()
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
    if (filterType === FilterTypeEn.Draft) {//点击草稿->新建邮件
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
      // 查看邮件详情
      setSelectedMail(mail);
    }
    // console.log('点击查看详情', mail)
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
    return mail.mail_to.map((item, _index) => {
      if (item?.name && item.name.length > 0) {
        return item.name;
      } else return getShowAddress(item.address)
    })
  }
  const renderAvator = () => {
    if (mail.mail_from.address.endsWith(PostfixOfAddress)) {
      // 我们的用户
      return (

        <JazziconGrid size={38} addr={mail.mail_from.address || ''} />

      )
    } else {
      // 别的用户
      return <Avatar size={38} addr={mail.mail_from.name || mail.mail_from.address || ''} />
    }
  }

  return (
    <>

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
          {mail.meta_type === MetaMailTypeEn.Encrypted && <span title="Encrypted email" className='mr-4'>{mail.meta_type === MetaMailTypeEn.Encrypted && <Lock />}</span>}
          {/* ReadStatusTypeEn.Read 已读 */}
          <p className={` h-16 leading-[20px] ${mail.read == ReadStatusTypeEn.Unread ? "font-poppinsSemiBold dark:text-[#fff] text-lightMailTitleUnRead" : 'text-lightMailTitleRead dark:text-DarkMailTitleRead'}`}>{mail.subject || '(no subject)'}</p>

          <span className={`min-w-0 flex-1 leading-[18px] text-ellipsis overflow-hidden dark:text-[#A7A1A1]  ${mail.read === ReadStatusTypeEn.Unread ? 'text-lightMailDetailUnRead  ' : 'text-lightMailDetailRead '}`}>
            <span className=" px-7 inline-block h-[14px] leading-[18px] ">{'-'}</span>
            <span>{renderDigest(mail)}</span>
          </span>
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
              className="ml-8">
              <Image
                src={mail.read === ReadStatusTypeEn.Read ? markUnread : read}
                alt=""
                className="w-18 h-18"
              />
            </div>
          </div>
        </div>
      </div >



    </>
  );
})
export default MailListItem;