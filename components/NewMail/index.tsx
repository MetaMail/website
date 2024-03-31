import React, { useEffect, useRef, useState, useContext } from 'react';
import CryptoJS from 'crypto-js';
import { toast } from 'react-toastify';
import { throttle } from 'lodash';
import Image from 'next/image';
import MailBoxContext from 'context/mail';
import { IUpdateMailContentParams, MetaMailTypeEn, FilterTypeEn } from 'lib/constants';
import { useNewMailStore, useMailListStore, useThemeStore, useIsInputShow, useMailDetailStore } from 'lib/zustand-store';
import { userLocalStorage, mailLocalStorage, dispatchEvent, fileType, originFileName } from 'lib/utils';
import { mailHttp } from 'lib/http';
import { createEncryptedMailKey, encryptMailContent, decryptMailContent, concatAddress } from 'lib/encrypt';
import { sendEmailInfoSignInstance } from 'lib/sign';
import { useInterval } from 'hooks';
import { PostfixOfAddress } from 'lib/base';
import FileUploader from './components/FileUploader';
import NameSelector, { MailFromType } from './components/NameSelector';
import EmailRecipientInput from './components/EmailRecipientInput';
import Icon from 'components/Icon';
import LoadingRing from 'components/LoadingRing';
import { ShinkIcon, ExtendIcon, AttachIcon, MailMore, ShowTrimContent } from '../../components/svg/index'
import { trashCan, extend, cancel, cancelDark, extendDark, shrinkDark, shrink, showTrimContent } from 'assets/icons';
import sendMailIcon from 'assets/sendMail.svg';

import styles from './index.module.scss';
import Tinymce from 'components/Tinymce';
import moment from 'moment';

/**整体收发流程（加密邮件）
 * 1. 创建草稿时，本地生成randomBits，用自己的公钥加密后发给后端
 * 2. 发送邮件时，如果是加密邮件，要把收件人的公钥拿到，然后用每个人的公钥加密原始的randomBits，同时用原始的randomBits对称加密邮件内容
 * 3. 解密邮件时，用自己的私钥先解出原始的randomBits，然后用randomBits对称解密邮件内容
 */

/**
 * 1. 用途是加密邮件内容（对称加密）
 * 2. 如果是新建邮件，selectedDraft中会带有原始的randomBits（这样就不用在新建邮件时去签名解密了），如果是从草稿中加载，需要先通过私钥解一下randomBits
 */
let randomBits: string = '';
let autoSaveMail = true;
let mailChanged = false;
let initHtml = '';

export default function NewMail() {
  const { checkEncryptable, setShowLoading, getRandomBits } = useContext(MailBoxContext);
  const { selectedDraft, setSelectedDraft, isSendSuccess, setIsSendSuccess } = useNewMailStore();
  const { filterType } = useMailListStore();

  const [isExtend, setIsExtend] = useState(false);
  const [isShowFileUpload, setIsShowFileUpload] = useState(false);
  const [initValue, setInitValue] = useState(selectedDraft.mail_from.name.startsWith('0x') ? MailFromType.address : MailFromType.ensName);
  const [loading, setLoading] = useState(false);
  const dateRef = useRef<string>();
  const subjectRef = useRef<HTMLInputElement>();
  const { isDark } = useThemeStore();
  const { isInputShow, setIsInputShow } = useIsInputShow();
  // const [editorMethods, setEditorMethods] = useState<EditorMethods | null>(null);
  const [replyContent, setReplyContent] = useState<string>(''); // 回复引用的html
  const TinymceRef = useRef(null) // 编辑器


  //  设置编辑器内容
  const setContentInEditor = (html: string) => {
    if (TinymceRef.current) {
      TinymceRef.current.setContent(html);
    }
  };

  //  获取编辑器内容
  const getContentFromEditor = () => {
    if (TinymceRef.current) {
      const content = TinymceRef.current.getContent();
      return content;
    }
  };
  // 获取html里的text
  function getPlainTextFromHTML(htmlContent: string) {
    const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
    return doc.body.textContent || "";
  }
  // 控制富文本编辑器icon要不要变颜色
  const [iconKey, setIconKey] = useState(0);
  useEffect(() => {
    setIconKey(iconKey + 1)
  }, [isDark]);

  const { selectedMail } = useMailDetailStore();
  // 把输入的正确的收件人加入待发送列表；
  const addReceiver = (address: string) => {
    const newReceiver = {
      address: address,
      name: address.split('@')[0],
    };
    const newReceivers = [...selectedDraft.mail_to, newReceiver];
    setSelectedDraft({ ...selectedDraft, mail_to: newReceivers });
    mailChanged = true;
  };
  const handleDynamicFocus = () => {
    setIsInputShow(false)
  }
  const removeReceiver = (email: string) => {
    setSelectedDraft({
      ...selectedDraft,
      mail_to: selectedDraft.mail_to.filter(receiver => receiver.address !== email),
    });
    mailChanged = true;
  };

  const postSignature = async (
    encrypted_encryption_keys: string[],
    encryption_public_keys: string[],
    signature: string,
    mail_decryption_key: string
  ) => {
    // 发送邮件/mails/send
    console.log('@selectedDraft.message_id', selectedDraft)
    const { message_id } = await mailHttp.sendMail({
      mail_id: window.btoa(selectedDraft.message_id),
      date: dateRef.current,
      signature: signature,
      encrypted_encryption_keys,
      mail_decryption_key,
      encryption_public_keys,
    });
    return message_id;
  };
  // 获取收件人的publicKey
  const getMailKeys = async () => {
    const { address, publicKey } = userLocalStorage.getUserInfo();
    const { encryptable, publicKeys } = await checkEncryptable(selectedDraft.mail_to);
    let encrypted_encryption_keys: string[] = [];
    let encryption_public_keys: string[] = [];
    if (encryptable) {
      // TODO: 最好用户填一个收件人的时候，就获取这个收件人的public_key，如果没有pk，就标出来
      const receiversInfo: { publicKey: string; address: string }[] = [
        { publicKey, address: address + PostfixOfAddress },
      ];
      for (var i = 0; i < selectedDraft.mail_to.length; i++) {
        const receiverItem = selectedDraft.mail_to[i];
        receiversInfo.push({
          publicKey: publicKeys[i],
          address: receiverItem.address,
        });
      }
      const result = await Promise.all(
        receiversInfo.map(item => createEncryptedMailKey(item.publicKey, item.address, randomBits))
      );

      encrypted_encryption_keys = result.map(item => item.encrypted_encryption_key);
      encryption_public_keys = receiversInfo.map(item => item.publicKey);
    }
    return {
      encrypted_encryption_keys,
      encryption_public_keys,
    };
  };
  // 点击发送邮件
  const handleClickSend = async () => {
    if (selectedDraft.mail_to?.length < 1) {
      return toast.error("Can't send mail without receivers.", {
        position: 'top-center',
        autoClose: 2000
      });
    }
    autoSaveMail = false;
    const id = toast.loading('Sending mail...', { position: 'top-center', });
    try {
      const { html, text } = await handleSave();
      const { encrypted_encryption_keys, encryption_public_keys } = await getMailKeys();
      if (selectedDraft.attachments?.length) {
        selectedDraft.attachments.sort((a, b) => a.attachment_id.localeCompare(b.attachment_id));
      }
      dateRef.current = new Date().toISOString();

      // 如果不是加密邮件 那么签名之前需要把正文内容解密出来，再签名
      let pureHtml = html;
      let pureText = text;
      if (!encrypted_encryption_keys.length) {
        pureHtml = decryptMailContent(html || '', randomBits);
        pureText = decryptMailContent(text || '', randomBits);
      }

      const signature = await sendEmailInfoSignInstance.doSign({
        from: concatAddress(selectedDraft.mail_from),
        to: selectedDraft.mail_to.map(to => concatAddress(to)),
        cc: selectedDraft.mail_cc.map(cc => concatAddress(cc)),
        date: dateRef.current,
        subject: subjectRef.current.value,
        text_hash: CryptoJS.SHA256(pureText).toString(),
        html_hash: CryptoJS.SHA256(pureHtml).toString(),
        attachment_hashes: selectedDraft.attachments.map(att => encrypted_encryption_keys.length ? att.encrypted_sha256 : att.plain_sha256),
        encrypted_encryption_key_hashes: encrypted_encryption_keys ? encrypted_encryption_keys.map(key => CryptoJS.SHA256(key).toString()) : [],
        encryption_public_key_hashes: encryption_public_keys ? encryption_public_keys.map(key => CryptoJS.SHA256(key).toString()) : [],
      });

      // 如果是非加密邮件，则需要将randomBits传给后端，后端发送邮件之前会先解出原始正文
      // 如果是加密邮件，则不需要传randomBits
      const messageId = await postSignature(
        encrypted_encryption_keys,
        encryption_public_keys,
        signature,
        !encrypted_encryption_keys.length ? randomBits : ''
      );
      if (messageId) {
        // 发送成功
        setIsSendSuccess(true)
        toast.success('Your email has been sent successfully.', {
          position: 'top-center',
          autoClose: 2000
        });
        setSelectedDraft(null);
      } else {
        throw new Error('No message id returned.');
      }
    } catch (error) {
      console.error(error);

    } finally {
      toast.done(id);
    }
  };

  const filterMailContent = (content: string) => {
    if (content === '\n') {
      return '';
    }
    if (content === '<p><br></p>') {
      return '';
    }
    return content || '';
  };

  const getMailChanged = () => {
    const tinyEditorHtml = filterMailContent(getContentFromEditor());
    const tinyEditorChanged = tinyEditorHtml !== initHtml;

    return mailChanged || tinyEditorChanged;
  };

  const handleSave = async () => {
    console.log('handleSave', getMailChanged())
    // save 的时候都是加密模式
    if (!getMailChanged())
      return {
        html: mailLocalStorage.getTinyEditorHtml(),
        text: mailLocalStorage.getTinyEditorText(),
      };

    let html = filterMailContent(getContentFromEditor()),
      text = filterMailContent(getPlainTextFromHTML(getContentFromEditor()));

    html = encryptMailContent(html, randomBits);
    text = encryptMailContent(text, randomBits);
    const json: IUpdateMailContentParams = {
      subject: subjectRef.current.value,
      mail_to: selectedDraft.mail_to,
      part_html: html,
      part_text: text,
      mail_from: selectedDraft.mail_from,
      meta_type: MetaMailTypeEn.Encrypted,
      mark: selectedDraft.mark,
      mailbox: selectedDraft.mailbox,
      read: selectedDraft.read,
      meta_header: selectedDraft.meta_header
    };
    const fromLocalDraft = !selectedDraft.message_id;// true:新建全新的草稿；false是从草稿列表中读的草稿
    console.log('fromLocalDraft', fromLocalDraft)
    !fromLocalDraft && (json.mail_id = window.btoa(selectedDraft.message_id));
    fromLocalDraft && (json.meta_header = selectedDraft.meta_header);
    if (!!selectedDraft.in_reply_to) json.in_reply_to = selectedDraft.in_reply_to;
    // 新建邮件/更新邮件先调这个接口
    const { mail_date, message_id } = await mailHttp.updateMail(json);
    console.log('执行', mail_date, message_id);
    selectedDraft.message_id = message_id;
    selectedDraft.mail_date = mail_date;
    fromLocalDraft && setSelectedDraft({ ...selectedDraft });
    mailLocalStorage.setTinyEditorHtml(html);
    mailLocalStorage.setTinyEditorText(text);
    dateRef.current = mail_date;
    filterType === FilterTypeEn.Draft && dispatchEvent('refresh-list', { showLoading: false });
    return { html, text };
  };

  const handleLoad = async () => {
    console.log('handleLoad')
    console.log('selectedDraft',selectedDraft)
    // load 的时候都是加密模式
    try {
      setLoading(true);

      if (!selectedDraft.message_id) {
        // 新建全新邮件
        // create a temp randomBits
        const { publicKey, address } = userLocalStorage.getUserInfo();
        const { encrypted_encryption_key, randomBits: tempRandomBits } = await createEncryptedMailKey(
          publicKey,
          address
        );
        randomBits = tempRandomBits;
        selectedDraft.meta_header = {
          encrypted_encryption_keys: [encrypted_encryption_key],
          encryption_public_keys: [publicKey],
        };
       
        return;
      }
   
 

      randomBits = await getRandomBits('draft');
      let _selectedDraft = selectedDraft;
      if (!selectedDraft.hasOwnProperty('part_html')) {
        const mail = await mailHttp.getMailDetailByID(window.btoa(selectedDraft.message_id));
        _selectedDraft = { ...selectedDraft, ...mail };
      }

      const part_html = decryptMailContent(_selectedDraft.part_html || '', randomBits);
      const part_text = decryptMailContent(_selectedDraft.part_text || '', randomBits);
      _selectedDraft = { ..._selectedDraft, part_html, part_text };

      setSelectedDraft(_selectedDraft);
      initHtml = part_html;

      setContentInEditor(part_html);
    } catch (error: any) {
      console.error(error);
      setSelectedDraft(null)
      if (error?.code === 'ACTION_REJECTED' || error?.code === 4001) return;
      toast.error("Can't get draft detail, please try again later.", {
        position: 'top-center',
        autoClose: 2000
      });


    } finally {
      setLoading(false);
    }
  };

  const handleChangeMailFrom = (from: MailFromType) => {
    setInitValue(from);
    const { address, ensName } = userLocalStorage.getUserInfo();
    // 这里的name优先ens;
    const mail_from = {
      address: (from === MailFromType.address ? address : ensName) + PostfixOfAddress,
      name: ensName || address,
    };
    setSelectedDraft({
      ...selectedDraft,
      mail_from,
    });
    mailChanged = true;
  };

  const removeAttachment = async (index: number) => {
    const attachment_id = selectedDraft.attachments[index].attachment_id;
    if (attachment_id) {
      // uploaded, do delete by attachment_id
      await mailHttp.deleteAttachment({
        mail_id: window.btoa(selectedDraft.message_id),
        attachment_id: selectedDraft.attachments[index].attachment_id,
      });
    } else {
      // uploading, do cancel
      selectedDraft.attachments[index].cancelableUpload.cancel();
    }

    const newAttachments = [...selectedDraft.attachments];
    newAttachments.splice(index, 1);
    setSelectedDraft({ ...selectedDraft, attachments: newAttachments });
    mailChanged = true;
  };

  useEffect(() => {
    dateRef.current = selectedDraft.mail_date;
    subjectRef.current.value = selectedDraft.subject;
    setContentInEditor(selectedDraft.part_html || '');

    handleLoad();

    const onAnotherDraftSelected: (e: Event) => Promise<void> = async event => {
      setShowLoading(true);
      const e = event as CustomEvent;
      try {
        await handleSave();
        e.detail.done(true);
      } catch (error) {
        console.error(error);
        e.detail.done(false);
      } finally {
        setShowLoading(false);
      }
    };

    window.addEventListener('another-draft-selected', onAnotherDraftSelected);

    return () => {
      randomBits = '';
      autoSaveMail = true;
      mailChanged = false;
      initHtml = '';
      window.removeEventListener('another-draft-selected', onAnotherDraftSelected);
    };
  }, [selectedDraft.local_id]);

  useInterval(() => {
    if (!autoSaveMail) return;
    try {
      //handleSave();
    } catch (err) {
      console.log('failed to auto save mail');
    }
  }, 30000);

  function fileTypeSvg(type?: any) {
    try {
      return <Image src={require(`assets/file/${type}.svg`)} alt={type} width={20} height={24} />;
    } catch (err) {
      return <Image src={require(`assets/file/DEFAULT.svg`)} alt={type} width={20} height={24} />;
    }
  }
  // 引用邮件
  const handleShowTrimContent = () => {
    // console.log(selectedDraft)
    const replyContent = `${getContentFromEditor()}
    <br><br>
    <p>
    <span>${moment(selectedMail?.mail_date).format('ddd, MMM DD, Y LT')}</span>&nbsp;&nbsp;
    <span>${selectedMail?.mail_from.name}</span>&nbsp;&nbsp;
    <span><${selectedMail?.mail_from.address}></span>wrote:
    </p>
    <div style="border-left:1px solid rgb(204,204,204);padding-left:10px;"><br><br>${selectedDraft.origin_part_html}</div>`
    setContentInEditor(replyContent)
    setReplyContent(replyContent)
  }

  return (
    <div
      className={`z-30 ${selectedDraft ? 'fadeInAnimation' : 'fadeInAnimation'} dark:bg-[#191919] flex flex-col font-poppins bg-base-100 p-18  transition-all absolute bottom-0  rounded-22 ${isExtend ? 'h-full w-full right-0' : `h-502 2xl:h-700 w-[60vw] max-w-[1200px] right-20 ${styles.newMailWrap}`
        } `}>
      <header className="flex justify-between">
        <div className="flex items-center">
          {/* <div className="w-6 h-24 bg-primary rounded-4" /> */}
          <span className=" text-[22px] font-poppins font-extrabold text-[#000] dark:text-[#fff]">New Message</span>
        </div>
        <div className="flex gap-10 self-start">
          {/* 放大/缩小 */}
          {
            <div onClick={() => setIsExtend(!isExtend)}>{
              isExtend ? (
                <Icon url={isDark ? shrinkDark : shrink}
                  className="w-14 h-auto self-center" />
              ) : (
                <Icon url={isDark ? extendDark : extend}
                  className="w-14 h-auto self-center" />
              )
            }
            </div>
          }
          {/* 关闭 */}
          <Icon
            url={isDark ? cancelDark : cancel}
            className="w-14 h-auto self-center"
            onClick={async () => {
              if (!getMailChanged()) return setSelectedDraft(null);
              setShowLoading(true);
              try {
                await handleSave();
              } finally {
                setShowLoading(false);
                setSelectedDraft(null);
              }
            }}
          />
        </div>
      </header>
      <div className="text-[#464646] mt-20">
        <div className="flex py-3 items-start">
          <span className="w-65 inline-block h-[35px] leading-[35px] text-[14px]  shrink-0 text-[#4F4F4F] dark:text-[#fff] ">To</span>
          {/* To 收件人输入框*/}
          <EmailRecipientInput
            receivers={selectedDraft.mail_to}
            onAddReceiver={addReceiver}
            onRemoveReceiver={removeReceiver}
            isDark={isDark}
          />
        </div>
        <div className="flex py-3 items-center">
          <span className="w-65  text-[14px]  shrink-0 text-[#4F4F4F] dark:text-[#fff]">From</span>
          {/* From 发件人输入框 */}
          <NameSelector
            initValue={initValue}
            onChange={handleChangeMailFrom}
          />
        </div>
        <div className="flex py-3 items-center pr-[10px]">
          <span className="w-65  text-[14px]  shrink-0 text-[#4F4F4F] dark:text-[#fff]">Title</span>
          <input
            type="text"
            placeholder=""
            className="flex box-border h-37 leading-[39px]  pl-[10px] py-4 flex-1 bg-lightGrayBg dark:bg-[#B9B9B90A] rounded-[8px] text-lightMailContent dark:text-DarkMailContent focus:outline-none "
            defaultValue={selectedDraft.subject}
            ref={subjectRef}
            onChange={throttle(() => {
              mailChanged = true;
            }, 1000)}
            onFocus={() => setIsInputShow(false)}
          />
        </div>
      </div>

      {<LoadingRing loading={loading} />}
      {
        <>
          {/*Tinymce 富文本编辑器 */}
          <Tinymce ref={TinymceRef} />
          {isExtend && isShowFileUpload && (
            <FileUploader
              randomBits={randomBits}
              onChange={() => (mailChanged = true)}
              onCheckDraft={async () => {
                mailChanged = true;
                if (!selectedDraft.message_id) {
                  await handleSave();
                }
              }}
              isExtend={isExtend}
            />
          )}
          {/* 上传成功得文件列表 */}
          <ul className={`flex gap-10 ${isExtend?'flex-wrap':'flex-nowrap overflow-x-scroll'}`}>
            {selectedDraft.attachments?.map((attr, index) => (
              <li key={index} className="flex text-[#878787] ">
                <div
                  className="gap-[8px] box-border text-[14px]  px-12 py-12 bg-[#F4F4F4] dark:bg-[#F4F4F41A] dark:border dark:border-solid dark:border-gray-300 dark:border-opacity-4 rounded-4 cursor-pointer flex items-center"
                  title={attr.filename}>
                  {fileTypeSvg(fileType(attr.filename).toLocaleUpperCase())}
                  <p className=' flex leading-[20px] justify-start items-center'><span className="max-w-[150px] truncate">{originFileName(attr.filename)}</span><span>.{fileType(attr.filename)}</span></p>
                  <div className='w-16 flex justify-start items-center'>
                    {!attr.attachment_id && (
                      <div className={`flex  items-center ${!attr.attachment_id ? 'animate-[fadeIn_150ms_ease-in-out_forwards]' : 'animate-[fadeOut_150ms_ease-in-out_forwards]'}}`}>
                        <span className="loading loading-spinner loading-xs text-[#31A608]"></span>
                      </div>
                    )}

                    {/* TODO:正在上传不能删除 */}
                    <button className={` ${attr.attachment_id ? 'animate-[fadeIn_150ms_ease-in-out_forwards]' : 'animate-[fadeOut_150ms_ease-in-out_forwards]'}`} onClick={() => removeAttachment(index)}>
                      <Icon url={trashCan} title="trashCan" className="w-13 h-13 pb-3" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      }

      <div className="flex items-center gap-13 mt-8">
        {/* show trimed content */}
        {/* <ShowTrimContent fill={isDark?'#333':'#fff'}/> */}

        {selectedDraft.in_reply_to && !replyContent && <Icon url={showTrimContent} onClick={handleShowTrimContent} className="h-18" title='Show trimmed content' />}
        <button
          disabled={selectedDraft.mail_to.length <= 0}
          onClick={handleClickSend}
          className="flex justify-center items-center bg-primary text-white px-14 py-8  rounded-[6px] text-[14px]">
          <Icon url={sendMailIcon} className="h-18" />
          <span className="ml-8 h-[18px] leading-[22px]">Send</span>
        </button>
        {/* 展开状态的上传附件按钮 */}
        {/* {isExtend && (
          <div onClick={() => setIsShowFileUpload(!isShowFileUpload)}> <AttachIcon fill={isDark ? '#fff' : 'black'} /></div>
        )} */}
        {/* 上传文件按钮   &&*/}
        {(
          // 拖拽上传文件区域
          <FileUploader
            randomBits={randomBits}
            onChange={() => (mailChanged = true)}
            onCheckDraft={async () => {
              mailChanged = true;
              if (!selectedDraft.message_id) {
                await handleSave();
              }
            }}
            isExtend={isExtend}
          />
        )}
      </div>
    </div>
  );
}
