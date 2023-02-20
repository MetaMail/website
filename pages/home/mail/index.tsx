//import { notification, message, PageHeader, Button } from 'antd';
import Icon from '@components/Icon';
//import { createMail } from '@utils';
import Image from 'next/image';
import tempMailSenderIcon from '@assets/tempMailSenderIcon.svg';
import replyBtn from '@assets/replyButton.svg';
import ifLock from '@assets/ifLock.svg';
//import tempAttach from '@assets/Group 48169.svg';
import {
  extend,
  cancel,
  checkbox,
  //markFavorite,
  selected,
  //favorite,
  sent,
  trash,
  read,
  //leftArrow,
  //rightArrow,
  starred,
  //markUnread,
  temp1,
  spam,
  //filter,
  //update,
  //cancelSelected,
  //add,
  back,
  mailMore
} from 'assets/icons';
import {
  IMailContentItem,
  MetaMailTypeEn,
  //MailBoxTypeEn,
  //FilterTypeEn,
} from 'constants/interfaces';
//import parse from 'html-react-parser';
import { useState, useEffect, useRef, ReactElement } from 'react';
import {
  changeMailStatus,
  getMailDetailByID,
  getMailList,
  IMailChangeParams,
} from '@services/home';
//import AttachmentItem from './AttachmentItem';
import CryptoJS from 'crypto-js';
//import locked from '@assets/locked.svg';
import DOMPurify from 'dompurify';
import moment from 'moment';
import { useRouter } from 'next/router';
import parse from 'html-react-parser';
import { getUserInfo, getShowName } from '@utils/storage/user';
import Layout from '@components/Layouts';
//import SenderCard from './SenderCard';
const sixSource = [back,trash,temp1,spam,read,starred,]
const threeMail = [starred,sent,mailMore]
//import { setMailContent } from '@utils/storage/mail';
//import { useLocation } from 'react-router-dom';
//import { useHistory } from 'react-router-dom';
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

function Mail(props:any) {
    const router = useRouter()
    const [mail, setMail] = useState<IMailContentItem>();
    const [isExtend, setIsExtend] = useState(false);
    //const { address, ensName } = getUserInfo();
    const [readable, setReadable] = useState(true);
    const randomBitsRef = useRef('');
    const queryRef = useRef(0);
    const [isHidden, setIsHidden] = useState(true);
  const handleOpenReplyMail = async () => {
    //createMail(MetaMailTypeEn.Signed).catch(() => {
    //  notification.error({
    //    message: 'Network Error',
    //    description: 'Can NOT create a new e-mail for now.',
    //  });
    //});
  };
  const handleLoad = async () => {
    try {
      if (!router.query?.id && router?.query?.id?.length === 0) {
        throw new Error();
      }
      const { data } = await getMailDetailByID(window.btoa(router.query.id instanceof Array? router.query.id[0] : router.query.id ?? ''));
      if (data.part_html) {
        var el = document.createElement('html');
        el.innerHTML = data.part_html;
        //console.log(el.innerHTML);
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
                //console.log(element.alt);
                //console.log(element.src);
                if (element.alt == item.filename) {
                  element.src = item.download.url;
                  //console.log(el.innerHTML);
                  data.part_html = el.innerHTML;
                }
              });
            },
          );
          //console.log(el.innerHTML);
        }
      }
      setMail(data);
    } catch (e) {
      console.log(e);
      //notification.error({
      //  message: 'Network Error',
      //  description: 'Can not fetch detail info of this email for now.',
      //});
      setMail(undefined);
    }
  };


  useEffect(() => {
    if (router.query?.type === MetaMailTypeEn.Encrypted + '') {
      setReadable(false);
    }
    // handleMarkRead();
    handleLoad();
  }, [router.query]);

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
        <div className={isExtend?'w-[calc(100vw-200px)] absolute right-0 h-ful transition-all':'absolute right-0 w-496 transition-all h-full'}>
        <div className='w-full h-screen bg-white flex flex-col font-poppins'>
          <div className='h-[90%] w-0 border absolute top-34'/>
          <header className='flex flex-col justify-between h-100 w-full px-16'>
            <div className='py-11 flex justify-between w-full'>
                <div className='h-14 flex gap-10'>
                    {sixSource.map((item,index) => {
                    return (
                        <Icon
                        url={item}
                        key={index}
                        className='w-13 h-auto self-center'
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
                        url={item}
                        key={index}
                        className='w-13 h-auto self-center'
                        /> 
                    );})} 
                </div>
              </div>
            </div>
          </header>
          <h1 className='p-16 pl-[4%] w-[70%] h-48 omit text-2xl font-bold pb-0 mb-24'>{mail?.subject}</h1>
          <h2 className='flex-1 overflow-auto ml-19'>{mail?.part_html
                ? parse(DOMPurify.sanitize(mail?.part_html))
                : mail?.part_text}</h2>
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
        )
}

const mapStateToProps = (state: any) => {
  return state.user ?? {};
};
Mail.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

//export default connect(mapStateToProps)(Mail);
export default Mail;

