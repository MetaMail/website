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
import { transformTime, getShowAddress } from 'lib/utils';
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
    return mail.read == ReadStatusTypeEn.Read ? 'font-normal' : 'font-bold';
  };

  const getMailFrom = (mail: IMailContentItem): string => {
    return mail.mail_from?.name && mail.mail_from.name.length > 0 ? mail.mail_from.name : mail.mail_from.address;
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
        const draftChangedEvent = new CustomEvent('draft-changed', {
          detail: {
            done: (result: boolean) => {
              result && setSelectedDraft(mail);
            },
          },
        });
        window.dispatchEvent(draftChangedEvent);
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
          className={`text-[14px] flex flex-row px-20 items-center group h-36 cursor-pointer hover:bg-base-200 ${mail.selected ? `bg-base-300 hover:bg-base-200 bg-opacity-50` : ''
            }`}>
          <div className="flex flex-row gap-14">
            <input
              type="checkbox"
              title="Select"
              className={`checkbox checkbox-sm w-12 h-12 rounded-2 border-0 ${mail.selected ? 'checked:bg-transparent' : ''}`}
              style={{ backgroundImage: `url(${mail.selected ? checkboxedSvg.src : checkboxSvg.src})` }}
              checked={mail.selected}
              onClick={e => {
                e.stopPropagation();
              }}
              onChange={onSelect}
            />

            <Icon
              url={mail.mark === MarkTypeEn.Starred ? markFavorite : favorite}
              className="w-12 h-12"
              title={mail.mark === MarkTypeEn.Starred ? 'UnStar' : 'Star'}
              onClick={async e => {
                e.stopPropagation();
                await handleStar(
                  mail.mark === MarkTypeEn.Starred ? MarkTypeEn.Normal : MarkTypeEn.Starred
                );
              }}
            />
          </div>
          <div className="font-bold w-140 ml-14 omit text-base-content">
            <span className={`${getIsReadTextClass(mail)}`} title={getMailFrom(mail)}>
              {getShowAddress(getMailFrom(mail))}
            </span>
          </div>
          <div className="flex-1 w-0 ml-14 omit">
            <Dot color={mail.meta_type === MetaMailTypeEn.Encrypted ? '#006AD4' : 'transparent'} />
            <span className={`ml-8 ${getIsReadTextClass(mail)}`}>{mail.subject || '( no subject )'}</span>
            <span className="pt-4 pl-2 pr-7">{'-'}</span>
            <span className="pt-4 min-w-0 flex-1">{renderDigest(mail)}</span>
          </div>
          <div className="w-100 text-right">
            <div className="group-hover:hidden">{transformTime(mail.mail_date)}</div>
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
                title={mail.read === ReadStatusTypeEn.Read ? 'Unread' : 'Read'}
                className="ml-12">
                <Image
                  src={mail.read === ReadStatusTypeEn.Read ? markUnread : read}
                  alt=""
                  className="scale-125"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={handleClick}
          className={`w-300 px-15 py-10 text-[14px] flex group cursor-pointer hover:bg-base-200 ${mail.message_id === selectedMail.message_id ? `bg-base-300 hover:bg-base-300` : ''
            }`}>
          <JazziconGrid size={40} addr={mail.mail_from.address || ''} />
          <div className="flex-1 px-10 w-0">
            <p className="flex justify-between items-center">
              <span
                className={`flex-1 w-0 text-lg omit mr-4 ${getIsReadTextClass(mail)}`}
                title={getMailFrom(mail)}>
                {getShowAddress(getMailFrom(mail))}
              </span>
              <span className="max-w-[80] text-right text-sm">{transformTime(mail.mail_date)}</span>
            </p>
            <p className="flex justify-between items-center">
              <span className={`${getIsReadTextClass(mail)} omit mr-4 flex-1 w-0`}>
                {mail.subject || '( no subject )'}
              </span>
              <Dot color={mail.meta_type === MetaMailTypeEn.Encrypted ? '#006AD4' : 'transparent'} />
            </p>
            <p className="omit">{renderDigest(mail)}</p>
          </div>
        </div>
      )}
    </>
  );
}
