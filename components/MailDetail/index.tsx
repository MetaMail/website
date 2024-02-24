import { useState, useEffect, useContext } from 'react';
import dynamic from 'next/dynamic';
import DOMPurify from 'dompurify';
import moment from 'moment';
import parse from 'html-react-parser';
import { toast } from 'react-toastify';

import MailBoxContext from 'context/mail';
import { IMailContentItem, MetaMailTypeEn, ReadStatusTypeEn, MarkTypeEn, IPersonItem } from 'lib/constants';
import { mailHttp, IMailChangeOptions } from 'lib/http';
import { useMailDetailStore, useMailListStore } from 'lib/zustand-store';
import { decryptMailContent } from 'lib/encrypt';
import Icon from 'components/Icon';
import AttachmentItem from './components/AttachmentItem';
import LoadingRing from 'components/LoadingRing';

import {
  spam,
  extend,
  cancel,
  trash,
  read,
  back,
  mailMore,
  markFavorite,
  markUnread,
  starred,
  sent
} from 'assets/icons';

let randomBits: string = '';
let currentMailId: string = '';

export default function MailDetail() {
  const JazziconGrid = dynamic(() => import('components/JazziconAvatar'), { ssr: false });
  const { createDraft, getMailStat, getRandomBits } = useContext(MailBoxContext);
  const { selectedMail, setSelectedMail, isDetailExtend, setIsDetailExtend } = useMailDetailStore();
  const { list, setList } = useMailListStore();

  const [loading, setLoading] = useState(false);

  const handleLoad = async (showLoading = true) => {
    try {
      showLoading && setLoading(true);
      const mail = await mailHttp.getMailDetailByID(window.btoa(selectedMail.message_id));
      const _mail = {
        ...selectedMail,
        ...mail,
        mailbox: selectedMail.mailbox,
        mark: selectedMail.mark,
        read: selectedMail.read,
      };
      if (selectedMail.meta_type === MetaMailTypeEn.Encrypted) {
        if (currentMailId !== _mail.message_id) return;
        randomBits = await getRandomBits('detail');
        console.log('解密出来', _mail)
        if (_mail?.part_html) {
          _mail.part_html = decryptMailContent(_mail.part_html, randomBits);

        }
        if (_mail?.part_text) {
          _mail.part_text = decryptMailContent(_mail.part_text, randomBits);
        }
      }
      // 防止loading的过程中，用户切换了邮件。比如用户先选择了A邮件然后快速选择B邮件，则A邮件走到这里来以后又会把当前邮件切换成A邮件
      // B邮件走到这里来以后又会把当前邮件切换成B邮件，形成死循环
      if (currentMailId !== _mail.message_id) return;
      setSelectedMail(_mail);
    } catch (error) {
      console.error(error);
      showLoading && toast.error("Can't get mail detail, please try again later.", {
        autoClose: 2000
      });
    } finally {
      showLoading && setLoading(false);
    }
  };

  const handleMailActionsClick = async (httpParams: IMailChangeOptions) => {
    try {
      await mailHttp.changeMailStatus(
        [
          {
            message_id: selectedMail.message_id,
            mailbox: selectedMail.mailbox,
          },
        ],
        httpParams
      );
      if (httpParams?.mark === MarkTypeEn.Trash || httpParams?.mark === MarkTypeEn.Spam) {
        // 更新邮件统计
        if (httpParams?.mark === MarkTypeEn.Spam) {
          getMailStat();
        }
        // 从列表中移除
        const id = selectedMail.message_id;
        const idx = list.findIndex(item => item.message_id === id);
        if (idx > -1) {
          list.splice(idx, 1);
          setList([...list]);
        }
        setSelectedMail(null);
        setIsDetailExtend(false);
        return;
      }
      // 同步详情中的状态
      setSelectedMail({
        ...selectedMail,
        ...httpParams,
      });

      // 同步列表中的状态
      const idx = list.findIndex(item => item.message_id === selectedMail.message_id);
      if (idx > -1) {
        Object.assign(list[idx], httpParams);
        setList([...list]);
      }
    } catch (error) {
      console.error(error);
      toast.error('Operation failed, please try again later.', {
        autoClose: 2000
      });
    }
  };

  const handleStar = async () => {
    const markValue = selectedMail.mark === MarkTypeEn.Starred ? MarkTypeEn.Normal : MarkTypeEn.Starred;
    await handleMailActionsClick({
      mark: markValue,
    });
  };

  const topIcons = [
    {
      src: back,
      title: 'Back',
      handler: () => {
        setSelectedMail(null);
        setIsDetailExtend(false);
      },
    },
    {
      src: trash,
      title: 'Trash',
      handler: async () => {
        await handleMailActionsClick({ mark: MarkTypeEn.Trash });
      },
    },
    {
      src: spam,
      title: 'Spam',
      handler: async () => {
        await handleMailActionsClick({ mark: MarkTypeEn.Spam });
      },
    },
    {
      src: selectedMail.read === ReadStatusTypeEn.Read ? markUnread : read,
      title: selectedMail.read === ReadStatusTypeEn.Read ? 'Unread' : 'Read',
      handler: async () => {
        const readValue =
          selectedMail.read === ReadStatusTypeEn.Read ? ReadStatusTypeEn.Unread : ReadStatusTypeEn.Read;
        await handleMailActionsClick({
          read: readValue,
        });
      },
    },
    {
      src: selectedMail.mark === MarkTypeEn.Starred ? markFavorite : starred,
      title: selectedMail.mark === MarkTypeEn.Starred ? 'UnStar' : 'Star',
      handler: handleStar,
    },
  ];

  const rightIcons = [
    {
      src: selectedMail.mark === MarkTypeEn.Starred ? markFavorite : starred,
      title: selectedMail.mark === MarkTypeEn.Starred ? 'UnStar' : 'Star',
      handler: handleStar,
    },
    {
      src: sent,
      title: 'Reply',
      handler: () => {
        handleReply();
      },
    },
    {
      src: mailMore,
      title: 'More',
      handler: () => { },
    },
  ];

  const changeInnerHTML = (data: IMailContentItem) => {
    if (data.part_html) {
      var el = document.createElement('html');
      el.innerHTML = data.part_html;
      {
        data?.attachments?.map(item => {
          //imgReplace = document.getElementById(item.filename);
          el.querySelectorAll('img').forEach(function (element) {
            if (element.alt == item.filename) {
              element.src = item.download.url;
              data.part_html = el.innerHTML;
            }
          });
        });
      }
    }
  };

  const getMailFrom = (mail: IMailContentItem): string => {
    return mail.mail_from?.name && mail.mail_from.name.length > 0 ? mail.mail_from.name : mail.mail_from.address;
  };

  const handleReply = () => {
    // console.log(selectedMail)
    createDraft([selectedMail.mail_from], selectedMail.message_id);
  };
  const handleHighlineLink = (link: string) => {
    // 匹配字符串中的所有 <a> 标签
    const regex = /<a\s+([^>]*)>/gi;

    // 使用 replace 方法替换匹配的 <a> 标签，并添加 style 属性
    const result = link.replace(regex, function (match, attributes) {
      // 如果标签中没有 style 属性，则在标签的末尾添加 style='color:blue'
      return match.replace('>', `style='color: #06c;text-decoration:underline'>`);

    });

    return result;
  }

  useEffect(() => {
    currentMailId = selectedMail.message_id;
    handleLoad();
    return () => {
      randomBits = '';
      currentMailId = '';
    };
  }, [selectedMail.message_id]);
  const renderTo = (list: IPersonItem[]) => {
    return list.map((i: IPersonItem) => {
      return (<span>{i.address ? i.address : i.name}；</span>)
    })
  }
  return (
    // 邮件详情
    <div
      className={`absolute right-0 justify-between w-[calc(100%-333px)]  flex-1 rounded-10 flex flex-col pt-28 font-['Poppins'] p-16  h-[100%] bg-base-100 ${isDetailExtend ? 'w-full h-full' : ''
        }`}>
      <div>
        <header className="flex flex-col justify-between w-full mb-22">
          <div className="flex justify-between w-full">
            <div className="flex gap-10">
              {topIcons.map((item, index) => {
                return (
                  <Icon
                    url={item.src}
                    title={item.title}
                    key={index}
                    className="w-16 h-16 self-center"
                    onClick={item.handler}
                  />
                );
              })}
            </div>
            <div className="flex gap-10">
              <Icon
                url={extend}
                className="w-16 h-16 self-center "
                onClick={() => setIsDetailExtend(!isDetailExtend)}
              />
              <Icon
                url={cancel}
                onClick={() => {
                  setSelectedMail(null);
                  setIsDetailExtend(false);
                }}
                className="w-16 h-16 self-center"
              />
            </div>
          </div>
          {/* 邮件详情 */}
          <h1 className="omit  font-bold my-20 max-w-4xl text-[22px] mt-15 mb-21 text-[#202224] dark:text-base-content">{selectedMail?.subject || '( no subject )'}</h1>
          <div className="flex justify-between">
            <div className="flex gap-20 items-center">
              <JazziconGrid size={37} addr={selectedMail.mail_from.address || ''} />
              <div className="">
                <div className="text-[#0075EA] font-medium">{getMailFrom(selectedMail)}</div>
                <div className="flex gap-3">
                  to:
                  <div className="flex-1 omit ml-4">
                    {/* {selectedMail?.mail_to[0]?.address} */}
                    {renderTo(selectedMail?.mail_to)}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-6 stroke-current text-[#707070] max-w-[160]">
              <div className="text-[14px]">{moment(selectedMail?.mail_date).format('ddd, MMM DD, Y LT')}</div>
              <div className="flex gap-10 justify-end">
                {rightIcons.map((item, index) => {
                  return (
                    <Icon
                      key={index}
                      url={item.src}
                      title={item.title}
                      onClick={item.handler}
                      className="w-16 h-16 self-center"
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </header>
        <div className='relative'>
          {loading && <LoadingRing />}
          {
            <>
              <h2 className="flex-1 overflow-auto  text-[#040404] dark:text-[#7F7F7F]">
                {selectedMail?.part_html ? parse(handleHighlineLink(DOMPurify.sanitize(selectedMail?.part_html, { ADD_ATTR: ['target'] }))) : selectedMail?.part_text}
              </h2>

            </>
          }
        </div>
      </div>


      <div>
        {selectedMail?.attachments && selectedMail.attachments.length > 0 && (
          <div className="flex">
            {/* 文件s */}
            {selectedMail?.attachments?.map((item, idx) => (
              <AttachmentItem
                idx={idx}
                key={idx}
                url={item?.download?.url}
                name={item?.filename}
                randomBits={randomBits}
              />
            ))}
          </div>
        )}
        {/* 回复按钮 */}
        <button
          className="flex justify-center items-center bg-primary text-white px-18 py-6 rounded-[7px] self-start  leading-[24px]"
          onClick={handleReply}>
          {/* <Icon url={sendMailIcon} /> */}
          <span className="">Reply</span>
        </button>
      </div>
    </div>
  );
}