
import Icon from '@components/Icon';
import Image from 'next/image';
import tempMailSenderIcon from '@assets/tempMailSenderIcon.svg';
import replyBtn from '@assets/replyButton.svg';
import ifLock from '@assets/ifLock.svg';
import {
  extend,
  cancel,
  sent,
  trash,
  read,
  starred,
  temp1,
  spam,
  back,
  mailMore,
  markFavorite,
  markUnread
} from 'assets/icons';
import {
  IMailContentItem,
  MetaMailTypeEn,
  ReadStatusTypeEn,
} from 'constants/interfaces';
import { useState, useEffect, useRef, ReactElement } from 'react';
import {
  getMailDetailByID,
} from '@services/home';
import DOMPurify from 'dompurify';
import moment from 'moment';
import { useRouter } from 'next/router';
import parse from 'html-react-parser';
import { getUserInfo, getShowName, clearUserInfo } from '@utils/storage/user';
import Layout from '@components/Layouts';
import useStore from '@utils/storage/zustand';
import { handleChangeReadStatus, handleDelete, handleSpam, handleStar } from '@utils/mail';
import { deleteStorage, getStorage, updateStorage } from '@utils/storage';
import { reverse } from 'dns';
import { clearMailListInfo } from '@utils/storage/mail';
// allowed URI schemes
var allowlist = ['http', 'https', 'ftp'];
// build fitting regex
var regex = RegExp('^(' + allowlist.join('|') + '):', 'gim');

/*DOMPurify.addHook('afterSanitizeAttributes', function (node) {
  // set all elements owning target to target=_blank

  if (node.hasAttribute('href')) {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
    const originLink = (node as any).href;

    let realLink;
    if (originLink && originLink.includes('/home/')) {
      const realLink = (node as any).href.split('/home/')[1];
    } else {
      const protocolName = originLink?.match(
        /(http|https):\/\/([\w.]+\/?)\S*/
//        ,
//      )?.[1];
//      if (originLink) realLink = originLink.replace(protocolName + '://', '');
//    }

//    (node as any).href = `/notification/?link=${realLink}`;
//  }
//});*/

function Mail(props: any) {
  const router = useRouter()
  const [mail, setMail] = useState<IMailContentItem>();
  const [isExtend, setIsExtend] = useState(false);
  //const { address, ensName } = getUserInfo();
  const [readable, setReadable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isRead, setIsRead] = useState(true);
  const randomBitsRef = useRef('');
  const queryRef = useRef(0);
  const filterType = useStore((state:any) => state.filter)
  const isMailDetail = useStore((state:any) => state.isMailDetail)

  const detailFromList = useStore((state:any) => state.detailFromList);
  const setIsMailDetail = useStore((state:any) => state.setIsMailDetail) 
  console.log(detailFromList);
  const [mailInfo, setMailInfo] = useState([
    {
      message_id: detailFromList.message_id,
      mailbox: detailFromList.mailbox
    },
  ]);
  const [mark,setMark] = useState(detailFromList?.mark===1?true:false);
  const sixMail = [
    {
      src: back,
      handler: ()=>{
        setIsMailDetail(false);
      }
    },
    {
      src: trash,
      handler: ()=>{
      clearMailListInfo();
        handleDelete(mailInfo);
        router.back();
      } 
    },  {
      src: temp1,
      handler: ()=>{
  
      } 
    },  {
      src: spam,
      handler: ()=>{
        clearMailListInfo();
        handleSpam(mailInfo);
        router.back();
      }
    },  {
      src: read,
      checkedSrc: markUnread,
      handler: ()=>{
        clearMailListInfo();
        handleChangeReadStatus(mailInfo,isRead?ReadStatusTypeEn.unread:ReadStatusTypeEn.read);
        setIsRead(!isRead);
      },
      onselect: isRead,
    },  
    {
      src: starred,
      checkedSrc: markFavorite,
      handler: ()=>{
        clearMailListInfo();
        handleStar(mailInfo, mark);
        setMark(!mark);
      },
      onselect: mark,
    },]

  const threeMail = [
    {
      src: starred,
      checkedSrc: markFavorite,
      handler: ()=>{
        clearMailListInfo();
        handleStar(mailInfo, mark);
        setMark(!mark);
      },
      onselect: mark,
    },
    {
      src: sent,
      handler: ()=>{
        //handleStar(mailInfo);
      },
    },
    {
      src: mailMore,
      handler: ()=>{
        //handleStar(mailInfo);
      }
    },]

  const changeInnerHTML = (data:IMailContentItem)=>{
    if (data.part_html) {
      var el = document.createElement('html');
      el.innerHTML = data.part_html;
      {
        data?.attachments?.map(
          (item: {
            filename: string;
            download: {
              expire_at: string;
              url: string;
            };
          }) => {
            //imgReplace = document.getElementById(item.filename);
            el.querySelectorAll('img').forEach(function (element) {
              if (element.alt == item.filename) {
                element.src = item.download.url;
                data.part_html = el.innerHTML;
              }
            });
          },
        );
      }
    }
  }

  const handleLoad = async () => {
    setMail(undefined);
    console.log('sssssssssssssss');
    let ifIndex = false;
    try {
      //if (!router.query?.id && router?.query?.id?.length === 0 ) {
      //  throw new Error();
      //}
      //const mailDetail = getStorage('mailDetailStorage')?.mailDetails;
      //console.log(mailDetail);
      //mailDetail.map(async (item: IMailContentItem)=>{ ////search
      //  if (String(item?.message_id??'') === String(router.query.id)){
      //    changeInnerHTML(item);
      //    setMail(item);
      //    ifIndex = true;
      //  }
      //  })
      if(!loading) setLoading(true);
      if (!ifIndex){ //如果没找到，(逻辑上不会找不到，可能是手动输入query或者是fetch的时候error了)
      const { data } = await getMailDetailByID(window.btoa(detailFromList.message_id ?? ''));
      changeInnerHTML(data);
      setMail(data);
    }
    } catch (e) {
      console.log(e);
      console.log('mailError');
      //notification.error({
      //  message: 'Network Error',
      //  description: 'Can not fetch detail info of this email for now.',
      //});
      setMail(undefined);
    }
    finally{
      setLoading(false);
    }
  };


  useEffect(() => {
    setMailInfo([
      {
      message_id: detailFromList.message_id,
      mailbox: detailFromList.mailbox
      }
    ])
    setMark(detailFromList?.mark===1?true:false);
    if (router.query?.type === MetaMailTypeEn.Encrypted + '') {
      setReadable(false);
    }
    // handleMarkRead();
    if (getUserInfo()?.address) {
      if (isMailDetail) handleLoad();
    }
    else {
      clearUserInfo();
      router.push('/');
    }
  }, [detailFromList]);

  const handleClickDownload = () => {
    //const downloadLink=document.createElement('a');
    mail &&
      mail.download &&
      mail.download.url &&
      window.open(mail?.download?.url);
    //downloadLink.href=mail?.download?.url;
    //downloadLink.click();
  };
        return(
        <div className={isMailDetail?'flex':'hidden'}>
        <div className={isExtend?'w-[calc(100vw-225px)] transition-all h-[100%]':'w-[38vw] transition-all h-[100%]'}>
        <div className='w-full h-full bg-white flex flex-col font-poppins'>
          <div className='h-[86%] w-0 border absolute top-54'/>
          <header className='flex flex-col justify-between h-100 w-full px-16'>
            <div className='py-11 flex justify-between w-full'>
                <div className='h-14 flex gap-10'>
                    {sixMail.map((item,index) => {
                    return (
                        <Icon
                        url={item.src}
                        key={index}
                        checkedUrl={item?.checkedSrc}
                        select={item?.onselect}
                        className='w-13 h-auto self-center'
                        onClick={item.handler}
                        /> 
                    );})}  
                </div>
                <div className='flex gap-10'>
                <Icon
                  url={extend}
                  checkedUrl={extend}
                  className='w-13 h-auto self-center '
                  onClick={()=>setIsExtend(!isExtend)}/> 
                <Icon
                  url={cancel}
                  onClick={()=>setIsMailDetail(false)}
                  className='w-13 scale-[120%] h-auto self-center'/> 
                </div>
            </div>
            <div className='flex justify-between pr-21'>
              <div className='flex gap-11'>
                <Image
                    src={tempMailSenderIcon}
                    className='self-center w-40 h-auto' alt={'tempMailSenderIcon'}/> 
                <div className='self-end'>
                  <div className='text-[#0075EA] text-md'>{mail?.mail_from?.name ?? mail?.mail_from?.address}</div>
                  <div className='flex text-xs gap-3 w-220'>to:
                    <Image
                      src={ifLock}
                      className='self-center ' alt={'ifLock'}/>
                    <div className='flex-1 omit'>{mail?.mail_to[0]?.address}</div>
                  </div>
                </div>
              </div>
              <div className='flex flex-col self-end gap-6 stroke-current text-[#707070]'>
                <div className='text-xs'>{moment(mail?.mail_date).format("ddd, MMM DD, Y LT") }</div>
                <div className='flex gap-10 justify-end'>
                {threeMail.map((item,index) => {
                    return (
                        <Icon
                        url={item.src}
                        checkedUrl={item?.checkedSrc}
                        select={item?.onselect}
                        key={index}
                        onClick={item.handler}
                        className='w-13 h-auto self-center'
                        /> 
                    );})} 
                </div>
              </div>
            </div>
          </header>
          <h1 className='p-16 pl-[4%] w-[70%] h-48 omit text-2xl font-bold pb-0 mb-24'>{mail?.subject}</h1>
          {loading?<div className='flex justify-center align-center m-auto radial-progress animate-spin text-[#006AD4]'/>:
          <h2 className='flex-1 overflow-auto ml-19'>{mail?.part_html
            ? parse(DOMPurify.sanitize(mail?.part_html))
            : mail?.part_text}
          </h2>}
          {mail?.attachments && mail.attachments.length > 0 && (
              <div className='flex'>
                {mail?.attachments?.map((item, idx) => (
                  <button className='m-22 mb-0 w-168 h-37 bg-[#F3F7FF] rounded-6' key={idx}/>
                  ))}
              </div>
            )}
          <button className='m-22 mb-9 w-105 h-36 '>
            <Image src={replyBtn} alt={'reply'}/> 
          </button>
        </div>
        </div>
        </div>
        )
}

Mail.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;
export default Mail;

