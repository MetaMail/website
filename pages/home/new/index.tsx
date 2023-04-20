import { cancel, extend } from '@assets/icons';
import Icon from '@components/Icon';
import Layout from '@components/Layouts';
import sendMailIcon from '@assets/sendMail.svg';
import addAttach from '@assets/addAttach.svg';
import { EditorFormats, EditorModules } from './constants';
import React, { ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import CryptoJS from 'crypto-js';
import useStore from '@utils/storage/zustand';
import BaseLine from '@components/BaseLine';
//import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { IMailContentItem, IPersonItem, MetaMailTypeEn } from '@constants/interfaces';
import { getUserInfo, getWalletAddress, saveUserInfo, setRandomBits } from '@utils/storage/user';
import dynamic from 'next/dynamic';
import { getMailDetailByID } from '@services/home';
import { clearMailContent, getMailContent } from '@utils/storage/mail';
import { createDraft, sendMail, updateMail } from '@services/mail';
import { getPersonalSign } from '@utils/crypto/signature';
import { handleGetReceiversInfos, metaPack } from './utils';
import { useRouter } from 'next/router';
import { pkEncrypt } from '@utils/crypto/crypt';
import useInterval from '@utils/hooks';
import { PostfixOfAddress } from '@utils/request';
import QuillWrapper from '@components/QuillWrapper';
export default function NewMail(props: { randomBits: any; }) {
    const [isExtend, setIsExtend] = useState(false);
    const isOnCompose = useStore((state: any) => state.isOnCompose)
    const setIsOnCompose = useStore((state:any) => state.setIsOnCompose)
    const {randomBits} = props;
    const [subject, setSubject] = useState<string>('');
    const router = useRouter()
    const [receivers, setReceivers] = useState<IPersonItem[]>([]);
  
    const [content, setContent] = useState<string>('');
    const [temp,settemp] = useState<string>('');
    const [attList, setAttList] = useState<any[]>([]);
    const [loaded, setLoaded] = useState<boolean>(false);
    const [editable, setEditable] = useState<boolean>();

    const detailFromNew = useStore((state:any) => state.detailFromNew);
    const setDetailFromNew = useStore((state:any) => state.setDetailFromNew)
    const draftID = detailFromNew?.message_id;
    //const draftID = query?.id;    
    const type: MetaMailTypeEn = Number(detailFromNew?.meta_type);
    const myKeyRef = useRef<string>();
    //const currRandomBitsRef = useRef<string>(randomBits);
    const dateRef = useRef<string>();
    const allowSaveRef = useRef(true);
    const currRandomBitsRef = useRef<string>(randomBits);
    const reactQuillRef = useRef<any>();
    /*const getQuill = () => {
      if (typeof reactQuillRef?.current?.getEditor !== 'function') return;
  
      return reactQuillRef.current.makeUnprivilegedEditor(
        reactQuillRef.current.getEditor(),
      );
    };*/
    const handleChangeContent = (content: any) => {
        setContent(content);
        const quill = reactQuillRef.current.getQuill();
        if (!quill) {
          console.log('Failed to get Quill instance.');
          return;
        }
        if (!quill || !quill?.getHTML || !quill?.getText) {
          //notification.error({
          //  message: 'ERROR',
          //  description: 'Failed to get message content',
          //});
    
          return;
        }
        
        //let html = quill?.getHTML(),
        //  text = quill?.getText();
          
        console.log('set');
      };

      useEffect(() => {  
        handleLoad();
        return () => {
          clearMailContent();
        };
      }, [detailFromNew]);
      useInterval(() => {
        if (!allowSaveRef.current || isOnCompose===false) return;
        try {
          //handleSave();
        } catch (err) {
          console.log('failed to auto save mail');
        }
      }, 2000);

      const handleSend = async (
        keys: string[],
        packedResult: string,
        signature?: string,
      ) => {
        try {

          const { data } = await sendMail(draftID, {
            date: dateRef.current,
            signature: signature,
            keys,
            data: packedResult,
          });
    
          if (data) {
            // notification.success({
              // message: 'Sent',
              // description: 'Your email has been sent successfully.',
            // });
    
            router.push('/home');
          }
        } catch (error) {
          console.log(error);
          // notification.error({
            // message: 'Failed Send',
            // description: 'Looks like we have a network problem.',
          // });
        }
      };
    
      const handleClickSend = async () => {
        if (!draftID) return;
        console.log(receivers?.length)
        if (receivers?.length < 1) {
          // notification.error({
            // message: 'No Receipt',
            // description: 'At lease 1 receipt',
          // });
          /////////测试
          console.log('receivers?.length < 1');
          return;
          //setReceivers([{address:temp??''}]);

        }
        allowSaveRef.current = false;
        try {
          handleSave().then(async (obj) => {
            if (!obj) {
              return;
            }
            const { address, ensName, showName, publicKey } = getUserInfo();
            console.log(address)
            console.log(showName)
            if (!address || !showName) {
              console.warn('No address or name of current user, please check.');
              return;
            }
            console.log(receivers)
            console.log('here1')
            const { html, text } = obj;
    
            let keys: string[] = [];
            if (type === MetaMailTypeEn.Encrypted) {
              // TODO: 最好用户填一个收件人的时候，就获取这个收件人的public_key，如果没有pk，就标出来
              let pks: string[] = [publicKey!];
              const receiverInfos = await handleGetReceiversInfos(receivers);
              for (var i = 0; i < receivers.length; i++) {
                const receiverItem = receivers[i];
                const receiverPrefix = receiverItem.address.split('@')[0];
                let rpk = receiverInfos?.[receiverPrefix]?.public_key?.public_key;
                if (!rpk) {
                  // notification.error({
                    // message: 'Failed Send',
                    // description:
                      // 'Can not find public key of ' +
                      // receiverItem.address +
                      // '. Please consider sending plain mail.',
                  // });
                  return;
                }
                pks.push(rpk);
              }
              console.log(pks, '--');
              keys = pks.map((pk) => pkEncrypt(pk, currRandomBitsRef.current));
            }
    
            const orderedAtt = attList;
            orderedAtt.sort((a, b) =>
              a.attachment_id.localeCompare(b.attachment_id),
            );
            dateRef.current = new Date().toISOString()
            let packData = {
              from: showName,
              to: receivers,
              date: dateRef.current,
              subject,
              text_hash: CryptoJS.SHA256(text).toString(),
              html_hash: CryptoJS.SHA256(html).toString(),
              attachments_hash: orderedAtt.map((att) => att.sha256),
              name: ensName,
              keys: keys,
            };
            console.log(packData)
            metaPack(packData).then(async (res) => {
              const { packedResult } = res ?? {};
              getPersonalSign(getWalletAddress(), packedResult).then(
                async (signature) => {
                  if (signature === false) {
                    // notification.error({
                      // message: 'Not Your Sign, Not your Mail',
                      // description:
                        // "Please make sure that you have login MetaMask. It's totally free, no gas fee",
                    // });
                    // Modal.confirm({
                    //   title: 'Failed to sign this mail',
                    //   content: 'Would you like to send without signature?',
                    //   okText: 'Yes, Send it',
                    //   onOk: () => {
                    //     handleSend(keys, packedResult);
                    //     // handleSend(packedResult, date);
                    //   },
                    //   cancelText: 'No, I will try send it later',
                    // });
                  } else {
                    handleSend(keys, packedResult, signature);
                    // handleSend(packedResult, date, signature);
                  }
                },
              );
            });
          });
        } catch (error) {
          console.error('handleclicksenderror')
          // notification.error({
            // message: 'Failed Send',
            // description: '' + error,
          // });
        }
      };
      





      const handleSave = async () => {
        console.log(draftID);
        console.log(editable);
        if (!draftID) return;
        //setEditable(true) ////测试用
        //console.log(editable);
        if (!editable) return;
        const oldHtml = sessionStorage.getItem('html');
        const oldText = sessionStorage.getItem('text');
        const quill = reactQuillRef.current.getQuill();
        console.log(oldText);
        console.log(quill?.getHTML())
        console.log(quill?.getText())
        if (!quill || !quill?.getHTML || !quill?.getText) {
          // notification.error({
            // message: 'ERROR',
            // description: 'Failed to get message content',
          // });
          console.log('no')
          return;
        }
    
        let html = quill?.getHTML(),
          text = quill?.getText();
          console.log(text)
          console.log(html)
        if (oldHtml == html && oldText == text) return { html, text }; //一样
        // 加密邮件
        //if (type === MetaMailTypeEn.Encrypted) {
        if(false){
          html = CryptoJS.AES.encrypt(html, currRandomBitsRef.current).toString();
          text = CryptoJS.AES.encrypt(text, currRandomBitsRef.current).toString();
        }
        console.log(receivers)
        const { ensName, showName} = getUserInfo();
        const { data } =
          (await updateMail(draftID, {
            subject: subject,
            mail_to: receivers,
            part_html: html,
            part_text: text,
            mail_from: {
              address: showName + PostfixOfAddress,
              name: ensName ?? '',
            },
          })) ?? {};
    
        if (data?.message_id !== draftID) {
          console.warn('DANGER: wrong updating source');
        }
        sessionStorage.setItem('html', html);
        sessionStorage.setItem('text', text);
        console.log('save');
        dateRef.current = data?.mail_date;
        return { html, text };
      };
      const handleLoad = async (id?:string) => {
        try {
          //if (!query?.id && query.id.length === 0) {
          //  throw new Error();
          //}
          const { data } = await getMailDetailByID(window.btoa(id ?? detailFromNew.message_id ?? ''));
          const mail = data as IMailContentItem;
          if (mail) {
            //const { subject, mail_to, part_html } = getMailContent();
            console.log(mail);
            setSubject(mail?.subject);
            setReceivers(mail?.mail_to);
            settemp(mail?.mail_to[0]?.address??'');
            setContent(mail?.part_html ?? mail?.part_text);
            setAttList(mail?.attachments);
            
            if (type === MetaMailTypeEn.Encrypted && !currRandomBitsRef.current) {
              setEditable(false);
            } else {
              setEditable(true);
            }
    
            if (mail?.meta_header?.keys)
              myKeyRef.current = mail?.meta_header?.keys?.[0];
            if (sessionStorage.getItem('reply')) {
              const { subject, mail_to, part_html } = getMailContent();
              subject && setSubject(subject);
              mail_to && setReceivers(mail_to);
              part_html && setContent(part_html);
              sessionStorage.removeItem('reply');
            }
            setLoaded(true);
          }
        } catch {
          //notification.error({
          //  message: 'Network Error',
          //  description: 'Can not fetch detail info of this email for now.',
          //});
        }
      };
    
    


    return(
    <div className={isOnCompose?'visible':'invisible'}>
    <div className={isExtend?'flex flex-col font-poppins bg-white p-18 h-full transition-all w-[calc(100vw-200px)] absolute bottom-0 right-0 border border-[#EFEFEF] rounded-10':'flex flex-col font-poppins bg-white p-18 h-502 w-[45vw] absolute bottom-0 right-0 border border-[#EFEFEF] rounded-10 transition-all'}>
        <header className='flex justify-between'>        
            <div className='flex flex-row'>
                <div className='w-6 h-24 bg-[#006AD4] rounded-4'/>
                <span className='pl-7 font-black text-xl'>New Message</span>
            </div>
            <div className='flex gap-10 self-start'>
                <Icon
                    url={extend}
                    checkedUrl={extend}
                    className='w-13 h-auto self-center '
                    onClick={()=>setIsExtend(!isExtend)}/> 
                <Icon
                    url={cancel}
                    className='w-13 scale-[120%] h-auto self-center'
                    onClick={()=>{
                      setIsOnCompose(false);
                      handleSave();
                      setDetailFromNew(undefined);
                    }}
                    /> 
            </div>
        </header>
        <div className='text-sm text-[#878787]'>
        <input type="text" placeholder="From:" className="flex pl-0 mt-14 h-21 input w-full max-w-xs text-sm text-[#878787] focus:outline-none" />
        <BaseLine/>
        <input type="text" placeholder="To: " className="flex pl-0 mt-14 h-21 input w-full max-w-xs text-sm text-[#878787] focus:outline-none" 
                value={temp}            
                  onChange={(e) => {
                    e.preventDefault();
                    settemp(e.target.value);
                    setReceivers([{address:temp??'',name:''}])  
                  }}
        />
        <BaseLine/>
        <input type="text" placeholder="Subject" className="flex pl-0 mt-14 h-21 input w-full max-w-xs text-sm text-[#878787] focus:outline-none" 
                value={subject}
                onChange={(e) => {
                  e.preventDefault();
                  setSubject(e.target.value);
                }}
        />
        <BaseLine/>
        </div>

        <QuillWrapper
              ref={(el) => {
                    el ? (reactQuillRef.current = el) : void 0;
                  }}
              className='flex-1 flex flex-col-reverse overflow-hidden'
              theme="snow"
              placeholder={''}
              modules={EditorModules}
              formats={EditorFormats}
              value={content}
              onChange={(value:any) => {
                handleChangeContent(value);
              }}
            />
        <div className='pt-17 flex gap-13'>
            <button onClick={handleClickSend}>
                <Image alt={'sendMail'} src={sendMailIcon}/>
            </button>
            <button>
                <Image alt={'addAttach'} src={addAttach}/>
            </button>
        </div>
    </div>
    </div>
    )
}

NewMail.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;