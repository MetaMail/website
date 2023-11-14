import React, { useEffect, useRef, useState, useContext } from 'react';
import CryptoJS from 'crypto-js';
import type ReactQuillType from 'react-quill';
import { toast } from 'react-toastify';
import { throttle, toUpper } from 'lodash';
import Image from 'next/image';
import MailBoxContext from 'context/mail';
import { IUpdateMailContentParams, MetaMailTypeEn, EditorFormats, EditorModules, FilterTypeEn } from 'lib/constants';
import { useNewMailStore, useMailListStore, useThemeStore } from 'lib/zustand-store';
import { userLocalStorage, mailLocalStorage, percentTransform, dispatchEvent, fileType } from 'lib/utils';
import { mailHttp } from 'lib/http';
import { createEncryptedMailKey, encryptMailContent, decryptMailContent, concatAddress } from 'lib/encrypt';
import { sendEmailInfoSignInstance } from 'lib/sign';
import { useInterval } from 'hooks';
import { PostfixOfAddress } from 'lib/base';
import DynamicReactQuill from './components/DynamicReactQuill';
import FileUploader from './components/FileUploader';
import NameSelector, { MailFromType } from './components/NameSelector';
import EmailRecipientInput from './components/EmailRecipientInput';
import Icon from 'components/Icon';
import LoadingRing from 'components/LoadingRing';

import { trashCan, extend, cancel, cancelDark, extendDark } from 'assets/icons';
import sendMailIcon from 'assets/sendMail.svg';
import 'react-quill/dist/quill.snow.css';

import styles from './index.module.scss';

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
  const { selectedDraft, setSelectedDraft } = useNewMailStore();
  const { filterType } = useMailListStore();

  const [isExtend, setIsExtend] = useState(false);
  const [loading, setLoading] = useState(false);
  const dateRef = useRef<string>();
  const reactQuillRef = useRef<ReactQuillType>();
  const subjectRef = useRef<HTMLInputElement>();
  const { isDark } = useThemeStore()
  const getQuill = () => {
    if (typeof reactQuillRef?.current?.getEditor !== 'function') return;
    return reactQuillRef.current.makeUnprivilegedEditor(reactQuillRef.current.getEditor());
  };
  // 把输入的正确的收件人加入待发送列表；
  const addReceiver = (address: string) => {
    const newReceiver = {
      address: address,
      name: address.split('@')[0],
    };
    // 要做去重
    console.log('selectedDraft', selectedDraft, address)
    const newReceivers = [...selectedDraft.mail_to, newReceiver];
    setSelectedDraft({ ...selectedDraft, mail_to: newReceivers });
    mailChanged = true;
  };

  const removeReceiver = (email: string) => {
    setSelectedDraft({
      ...selectedDraft,
      mail_to: selectedDraft.mail_to.filter(receiver => receiver.address !== email),
    });
    mailChanged = true;
  };

  const postSignature = async (keys: string[], signature: string, mail_decryption_key: string) => {
    const { message_id } = await mailHttp.sendMail({
      mail_id: window.btoa(selectedDraft.message_id),
      date: dateRef.current,
      signature: signature,
      keys,
      mail_decryption_key,
    });
    return message_id;
  };

  const getMailKeys = async () => {
    const { address, publicKey } = userLocalStorage.getUserInfo();
    const { encryptable, publicKeys } = await checkEncryptable(selectedDraft.mail_to);
    let keys: string[] = [];
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

      keys = result.map(item => item.key);
    }
    return keys;
  };

  const handleClickSend = async () => {
    if (selectedDraft.mail_to?.length < 1) {
      return toast.error("Can't send mail without receivers.");
    }
    autoSaveMail = false;
    const id = toast.loading('Sending mail...');
    try {
      const { html, text } = await handleSave();
      const keys = await getMailKeys();
      if (selectedDraft.attachments?.length) {
        selectedDraft.attachments.sort((a, b) => a.attachment_id.localeCompare(b.attachment_id));
      }
      dateRef.current = new Date().toISOString();

      // 如果不是加密邮件 那么签名之前需要把正文内容解密出来，再签名
      let pureHtml = html,
        pureText = text;
      if (!keys.length) {
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
        attachments_hash: selectedDraft.attachments.map(att =>
          keys.length ? att.encrypted_sha256 : att.plain_sha256
        ),
        keys: keys,
      });

      // 如果是非加密邮件，则需要将randomBits传给后端，后端发送邮件之前会先解出原始正文
      // 如果是加密邮件，则不需要传randomBits
      const messageId = await postSignature(keys, signature, !keys.length ? randomBits : '');
      if (messageId) {
        toast.success('Your email has been sent successfully.');
        setSelectedDraft(null);
      } else {
        throw new Error('No message id returned.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to send mail.');
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
    const quillHtml = filterMailContent(getQuill()?.getHTML());
    const quillChanged = quillHtml !== initHtml;

    return mailChanged || quillChanged;
  };

  const handleSave = async () => {
    // save 的时候都是加密模式
    if (!getMailChanged())
      return {
        html: mailLocalStorage.getQuillHtml(),
        text: mailLocalStorage.getQuillText(),
      };

    const quill = getQuill();
    if (!quill || !quill?.getHTML || !quill?.getText) {
      throw new Error('Failed to get message content');
    }
    let html = filterMailContent(quill?.getHTML()),
      text = filterMailContent(quill?.getText());

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
    };
    const fromLocalDraft = !selectedDraft.message_id;
    !fromLocalDraft && (json.mail_id = window.btoa(selectedDraft.message_id));
    fromLocalDraft && (json.meta_header = selectedDraft.meta_header);
    const { mail_date, message_id } = await mailHttp.updateMail(json);
    selectedDraft.message_id = message_id;
    selectedDraft.mail_date = mail_date;
    fromLocalDraft && setSelectedDraft({ ...selectedDraft });
    mailLocalStorage.setQuillHtml(html);
    mailLocalStorage.setQuillText(text);
    dateRef.current = mail_date;
    filterType === FilterTypeEn.Draft && dispatchEvent('refresh-list', { showLoading: false });
    return { html, text };
  };

  const setContentsToQuill = (html: string) => {
    const editor = reactQuillRef.current?.getEditor();
    if (editor) {
      editor.setContents(editor.clipboard.convert(html));
    }
  };

  const handleLoad = async () => {
    // load 的时候都是加密模式
    try {
      setLoading(true);

      if (!selectedDraft.message_id) {
        // create a temp randomBits
        const { publicKey, address } = userLocalStorage.getUserInfo();
        const { key, randomBits: tempRandomBits } = await createEncryptedMailKey(publicKey, address);
        randomBits = tempRandomBits;
        selectedDraft.meta_header = { keys: [key] };
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

      setContentsToQuill(part_html);
    } catch (error) {
      console.error(error);
      toast.error("Can't get draft detail, please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeMailFrom = (from: MailFromType) => {
    const { address, ensName } = userLocalStorage.getUserInfo();
    const mail_from = {
      address: (MailFromType.address ? address : ensName) + PostfixOfAddress,
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
    setContentsToQuill(selectedDraft.part_html || '');

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
      return <Image src={require(`assets/file/${type}.svg`)} alt={type} width={20} height={24} />
    } catch (err) {
      return <Image src={require(`assets/file/DEFAULT.svg`)} alt={type} width={20} height={24} />
    }
  }

  return (
    <div
      className={`dark:bg-[#2D2E2F] flex flex-col font-poppins bg-base-100 p-18 transition-all absolute bottom-0  rounded-22 ${isExtend ? 'h-full w-full right-0' : `h-502 w-[60vw] right-20 ${styles.newMailWrap}`
        } `}>
      <header className="flex justify-between">
        <div className="flex items-center">
          {/* <div className="w-6 h-24 bg-primary rounded-4" /> */}
          <span className=" text-[22px] font-['PoppinsBold'] text-[#000] dark:text-[#fff]">New Message</span>
        </div>
        <div className="flex gap-10 self-start">
          {/* 放大 */}
          <Icon url={isDark ? extendDark : extend} className="w-14 h-auto self-center" onClick={() => setIsExtend(!isExtend)} />
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
        <div className="flex py-3 items-center">
          <span className="w-65  text-[14px]  shrink-0 text-[#3E3E3E66] dark:text-[#fff] ">To</span>
          {/* To 收件人输入框*/}
          <EmailRecipientInput
            receivers={selectedDraft.mail_to}
            onAddReceiver={addReceiver}
            onRemoveReceiver={removeReceiver}
            isDark={isDark}
          />
        </div>
        <div className="flex py-3 items-center">
          <span className="w-65  text-[14px]  shrink-0 text-[#3E3E3E66] dark:text-[#fff]">From</span>
          {/* From 发件人输入框 */}
          <NameSelector
            initValue={
              selectedDraft.mail_from.name.startsWith('0x') ? MailFromType.address : MailFromType.ensName
            }
            onChange={handleChangeMailFrom}
          />
        </div>
        <div className="flex py-3 items-center">
          <span className="w-65  text-[14px]  shrink-0 text-[#3E3E3E66] dark:text-[#fff]">Subject</span>
          <input
            type="text"
            placeholder=""
            className="flex h-25 pl-0 py-5 flex-1 text-[#000000] dark:text-[#fff] focus:outline-none dark:bg-[unset]"
            defaultValue={selectedDraft.subject}
            ref={subjectRef}
            onChange={throttle(() => {
              mailChanged = true;
            }, 1000)}
          />
        </div>
      </div>

      {loading && <LoadingRing />}
      {
        <>
          {/* DynamicReactQuill 富文本编辑器 */}
          <DynamicReactQuill
            forwardedRef={reactQuillRef}
            className={`flex-1 py-16 flex flex-col-reverse text-[#464646] dark:text-[#fff] overflow-hidden mt-9  leading-[21px] ${isDark ? 'dark' : ''}`}
            theme={'snow'}
            placeholder={''}
            modules={EditorModules}
            formats={EditorFormats}
          />
          {isExtend && <FileUploader
            randomBits={randomBits}
            onChange={() => (mailChanged = true)}
            onCheckDraft={async () => {
              mailChanged = true;
              if (!selectedDraft.message_id) {
                await handleSave();
              }
            }}
            isExtend={isExtend}
          />}
          {/* 上传成功得文件列表 */}
          <ul className="flex gap-10">
            {selectedDraft.attachments?.map((attr, index) => (

              <li key={index} className="flex text-[#878787]">
                <div
                  className="text-[14px] px-12 py-12 bg-[#F4F4F466] dark:bg-[#DCDCDC26] rounded-4 cursor-pointer flex items-center gap-8"
                  title={attr.filename}>
                  {fileTypeSvg(fileType(attr.filename).toLocaleUpperCase())}
                  <span>{attr.filename}</span>
                  <span className="">
                    {attr.uploadProcess && !attr.attachment_id
                      ? (<div className='flex items-center'><progress className="progress progress-success w-56" value={percentTransform(attr.uploadProcess)} max="100"></progress><span color='text-[#1F2937]'>{percentTransform(attr.uploadProcess) + '%'}</span></div>)
                      : ''}
                  </span>

                  <button onClick={() => removeAttachment(index)}>
                    <Icon url={trashCan} title="trashCan" className="w-16 h-16" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      }


      <div className="flex items-center gap-13 mt-20">
        <button
          disabled={selectedDraft.mail_to.length <= 0}
          onClick={handleClickSend}
          className="flex justify-center items-center bg-primary text-white px-14 py-8  rounded-[6px] text-[14px]">
          <Icon url={sendMailIcon} className='h-18' />
          <span className="ml-8">Send</span>
        </button>

        {/* 上传文件按钮   &&*/}
        {!isExtend && <FileUploader
          randomBits={randomBits}
          onChange={() => (mailChanged = true)}
          onCheckDraft={async () => {
            mailChanged = true;
            if (!selectedDraft.message_id) {
              await handleSave();
            }
          }}
          isExtend={isExtend}
        />}
      </div>
    </div>
  );
}