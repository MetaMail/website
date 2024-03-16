import { useState, useEffect, useContext } from 'react';
import dynamic from 'next/dynamic';
import DOMPurify from 'dompurify';
import moment from 'moment';
import parse from 'html-react-parser';
import { toast } from 'react-toastify';
import ReactDOM from 'react-dom';
import MailBoxContext from 'context/mail';
import { IMailContentItem, MetaMailTypeEn, ReadStatusTypeEn, MarkTypeEn, IPersonItem } from 'lib/constants';
import { mailHttp, IMailChangeOptions } from 'lib/http';
import { useMailDetailStore, useMailListStore, useThemeStore } from 'lib/zustand-store';
import { decryptMailContent } from 'lib/encrypt';
import Icon from 'components/Icon';
import AttachmentItem from './components/AttachmentItem';
import LoadingRing from 'components/LoadingRing';
import Modal from '../Common/Modal';
import {
  spam,
  extend,
  cancel,
  trash,
  read,
  back,
  mailMore,
  darkMailMore,
  markFavorite,
  markUnread,
  starred,
  sent,
  shrink,
  replyMail
} from 'assets/icons';
import { useRouter } from 'next/router';
import Avatar from 'components/Avatar';
import { PostfixOfAddress } from 'lib/base';

let randomBits: string = '';
let currentMailId: string = '';

export default function MailDetail() {
  const { isDark } = useThemeStore()
  const JazziconGrid = dynamic(() => import('components/JazziconAvatar'), { ssr: false });
  const { createDraft, getMailStat, getRandomBits } = useContext(MailBoxContext);
  const { selectedMail, setSelectedMail, isDetailExtend, setIsDetailExtend } = useMailDetailStore();
  const { list, setList } = useMailListStore();
  const [isMoreExtend, setIsMoreExtend] = useState(false);
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
        position: 'top-center',
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
        position: 'top-center',
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
      src: replyMail,
      title: 'Reply',
      handler: () => {
        handleReply();
      },
    },
  ];
  const handleDownload = () => {
    selectedMail.download?.url && window.open(selectedMail.download.url)
  }

  const changeInnerHTML = (data: IMailContentItem) => {
    if (data.part_html) {
      var el = document.createElement('html');
      el.innerHTML = data.part_html;
      {
        data?.attachments?.map(item => {
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
    return mail.mail_from?.name && mail.mail_from.name.length > 0 ? `${mail.mail_from.name} <${mail.mail_from.address}>` : mail.mail_from.address;
  };

  const handleReply = () => {
    // console.log(selectedMail)
    createDraft([selectedMail.mail_from], selectedMail.message_id, selectedMail.subject);
  };
  const handleHighlineLink = (link: string) => {
    // 匹配字符串中的所有 <a> 标签
    const regex = /<a\s+([^>]*)>/gi;

    // 使用 replace 方法替换匹配的 <a> 标签，并添加 style 属性
    const result = link.replace(regex, function (match, attributes) {
      // 如果标签中没有 style 属性，则在标签的末尾添加 style='color:blue'
      return match.replace('>', `style='color: #06c;text-decoration:underline'>`);

    });
    return addTargetAttribute(result);
  }
  function addTargetAttribute(htmlString: string) {
    const regex = /<a([^>]*)>/g;
    const result = htmlString.replace(regex, (match, p1) => {
      if (!p1.includes('target=')) {
        return `<a${p1} target="_blank">`;
      } else {
        return match;
      }
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
      return (<span key={i.address}>{i.address ? i.address : i.name}；</span>)
    })
  }
  const [isOpen, setIsOpen] = useState(false);
  const [link, setLink] = useState('');
  const openModal = () => setIsOpen(true);

  const closeModal = () => {
    setIsOpen(false);
    setLink('')
  };

  const handleConfirm = () => {
    setIsOpen(false);
    window.open(link);
  };
  useEffect(() => {
    // 获取所有包含 <a> 标签的元素
    const anchorElements: HTMLElement | null = document.querySelector('#mailHtml');
    const links: NodeListOf<HTMLAnchorElement> = anchorElements.querySelectorAll('a');

    // 为每个 <a> 标签添加点击事件处理函数
    links.forEach(link => {
      // console.log(anchorElement);
      link.addEventListener('click', handleClick);
    });

    // 移除事件监听器以避免内存泄漏
    return () => {
      links.forEach(link => {
        link.removeEventListener('click', handleClick);
      });
    };
  }, [selectedMail]);

  const handleClick = (event: any) => {
    event.preventDefault();
    const targetHref = event.currentTarget.getAttribute('href');
    console.log(targetHref);
    // openModal()
    console.log('event', event)
    console.log('href', targetHref)
    if (targetHref && !targetHref.startsWith(window.location.origin)) {
      setLink(targetHref)
      openModal()
    }
  };
  const renderAvator = () => {
    if (selectedMail.mail_from.address.endsWith(PostfixOfAddress)) {
      // 我们的用户
      return <JazziconGrid size={38} addr={selectedMail.mail_from.address || ''} />
    } else {
      // 别的用户
      return <Avatar size={38} addr={selectedMail.mail_from.name || selectedMail.mail_from.address || ''} />
    }
  }
  return (
    // 邮件详情
    <>
      <div
        className={`absolute right-0 justify-between  h-full overflow-y-scroll flex-1 rounded-10 flex flex-col pb-16 font-poppins px-16  bg-base-100 ${isDetailExtend ? 'w-full ' : 'w-[calc(100%-333px)]'}`}>
        <div className='relative h-full overflow-y-scroll'>
          <header className="flex flex-col justify-between w-full  sticky bg-base-100 top-0 z-10 pt-14">
            <div className="flex justify-between w-full pb-[10px]">
              <div className="flex gap-10">
                {topIcons.map((item, index) => {
                  return (
                    <Icon
                      url={item.src}
                      title={item.title}
                      key={index}
                      className="w-18 h-18 self-center"
                      onClick={item.handler}
                    />
                  );
                })}
              </div>
              <div className="flex gap-10">
                <Icon
                  url={isDetailExtend ? shrink : extend}
                  className="w-18 h-18 self-center "
                  onClick={() => setIsDetailExtend(!isDetailExtend)}
                />
                <Icon
                  url={cancel}
                  onClick={() => {
                    setSelectedMail(null);
                    setIsDetailExtend(false);
                  }}
                  className="w-18 h-18 self-center"
                />
              </div>
            </div>
            {/* 邮件详情 */}
            <h1 className="omit font-poppinsSemiBold my-20 max-w-4xl text-[22px] mt-15 mb-21 text-[#202224] dark:text-base-content">{selectedMail?.subject || '(no subject)'}</h1>
            <div className="flex justify-between py-10">
              <div className="flex gap-20 items-start">
                {/* 头像 */}
                <div className='shrink-0'> {renderAvator()}</div>
                <div className="">
                  <div className="text-[#0075EA] font-medium">{getMailFrom(selectedMail)}</div>
                  <div className="flex gap-3">
                    to:
                    <div className="flex-1  ml-4 break-all">
                      {/* {selectedMail?.mail_to[0]?.address} */}
                      {renderTo(selectedMail?.mail_to)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-6 stroke-current text-[#b2b2b2] max-w-[160]">
                <div className="text-[14px]">{moment(selectedMail?.mail_date).format('ddd, MMM DD, Y LT')}</div>
                <div className="flex gap-10 justify-end">
                  {/* 收藏，转发，更多 */}
                  {rightIcons.map((item, index) => {
                    return (
                      <Icon
                        key={index}
                        url={item.src}
                        title={item.title}
                        onClick={item.handler}
                        className="w-18 h-18 self-center"
                      />
                    );
                  })}
                  <div className={`dropdown dropdown-bottom }`}>
                    {/* 筛选漏斗icon */}
                    <label tabIndex={0} className="cursor-pointer flex items-center">
                      <Icon
                        url={isDark ? darkMailMore : mailMore}
                        title={'More'}
                        onClick={() => setIsMoreExtend(!isMoreExtend)}
                        className="w-18 h-18 self-center"
                      />
                    </label>

                    <ul
                      tabIndex={0}
                      className="dropdown-content dark:text-[#fff] right-0 z-[1] menu p-2 shadow bg-base-100  rounded-5 w-150">
                      <li
                        onClick={() => {
                          handleDownload()
                        }}
                        title='download emil'>
                        <a className='text-[#333] dark:text-[#fff]' >Download eml</a>
                      </li>

                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </header>
          <div className='relative flex justify-center text-left'>
            {<LoadingRing loading={loading} />}
            {
              <div className='max-w-[800px]'>
                <div className={`${loading ? `fadeOutAnima` : 'fadeInAnima'} flex-1 overflow-auto  text-lightMailContent dark:text-DarkMailContent`}>
                  <div id="mailHtml" className='listContainer pl-[57px] pr-[5px] box-border'>
                    {selectedMail?.part_html ? parse(handleHighlineLink(DOMPurify.sanitize(selectedMail?.part_html, { ADD_ATTR: ['target'] }))) : selectedMail?.part_text}
                  </div>
                </div>
              </div>
            }
          </div>
        </div>


        <div className=''>
          {selectedMail?.attachments && selectedMail.attachments.length > 0 && (
            <div className="flex gap-10 absolute pl-57 bottom-56 w-[100%] box-border py-10 bg-base-100 flex-wrap">
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
          <div className='absolute pl-57 bottom-0 w-full py-10 bg-base-100'>
            <div className=''>
              {/* 回复按钮 */}
              <button
                className=" flex justify-center items-center bg-primary text-white px-18 py-6 rounded-[7px] self-start  leading-[24px]"
                onClick={handleReply}>
                {/* <Icon url={sendMailIcon} /> */}
                <span className="">Reply</span>
              </button>
            </div>
          </div>
        </div>

      </div>
      <Modal
        title="Warning!"
        isOpen={isOpen}
        onClose={closeModal}
        onConfirm={handleConfirm}
      >
        <p className='text-[#666]'><span className='text-[#999] '>You are about to leave our site to：</span><span className='underline'>{`${link}`}</span></p>
      </Modal>

    </>

  );
}