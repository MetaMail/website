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
import { getThirdLetter } from 'utils';
import { useRouter } from 'next/router';

interface IMailItemProps {
  mail?: MailListItemType;
  onSelect?: () => void;
  loading?: boolean
}

// eslint-disable-next-line react/display-name
const DetailMailItem = ({ mail, onSelect }: IMailItemProps) => {
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
      router.push('/mailDetail');
    }
    // console.log('点击查看详情', mail)
  }, 1000);
  const renderDigest = (maiType: MailListItemType) => {
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
      {/* // 查看详情时候的邮件列表 */}
      <div
        onClick={handleClick}
        className={`detailDtatus text-base-content  items-start box-border px-17 py-9 flex group cursor-pointer transition-colors duration-75 hover:bg-base-200 dark:hover:bg-[#F3F7FF] dark:hover:bg-opacity-10 dark:bg-opacity-10 ${selectedMail && mail.message_id === selectedMail.message_id ? `bg-[#F3F7FF]` : ''
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
            {mail.meta_type === MetaMailTypeEn.Encrypted && <span title="Encrypted email" className='mr-4'>{mail.meta_type === MetaMailTypeEn.Encrypted && <Lock />}</span>}
          </p>
          <p className={`omit text-[13px]  dark:text-[#A7A1A1]  text-lightMailDetailRead  leading-[17px]`}>{renderDigest(mail)}</p>
        </div>
      </div >

    </>
  );
}
export default DetailMailItem;