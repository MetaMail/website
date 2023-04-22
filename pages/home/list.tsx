import MailListItem from '@components/MailItem';
import { useState, useEffect } from 'react';
import Icon from '@components/Icon';
import { useRouter } from 'next/router'
import useStore from '@utils/storage/zustand';

import {
  FilterTypeEn,
  getMailBoxType,
  IMailContentItem,
  IMailItem,
  MailBoxTypeEn,
  MarkTypeEn,
  MetaMailTypeEn,
  ReadStatusTypeEn,
} from 'constants/interfaces';
import { changeMailStatus, getMailDetailByID, getMailList, IMailChangeParams } from 'services/home';
import {
  checkbox,
  //markFavorite,
  selected,
  //favorite,
  trash,
  read,
  //leftArrow,
  //rightArrow,
  starred,
  markUnread,
  temp1,
  spam,
  filter,
  update,
  cancelSelected,
} from 'assets/icons';
import { getUserInfo, setRandomBits } from 'utils/storage/user';
import { handleChangeReadStatus, handleDelete, handleSpam, handleStar } from '@utils/mail';
import { clearStorage, deleteStorage, getStorage, updateStorage } from '@utils/storage';
//import Link from 'next/link';
import Mail from './mail';
import { clearMailListInfo, getMailListInfo } from '@utils/storage/mail';
function MailList() {
  //const state = useStore()
  const setFilter = useStore((state: any) => state.setFilter)
  const setIsAlert = useStore((state:any) => state.setIsAlert)
  const pageIdx = useStore((state:any) => state.page)
  const filterType = useStore((state:any) => state.filter)
  const addPage = useStore((state:any) => state.addPage)
  const subPage = useStore((state:any) => state.subPage)
  const setUnreadCount = useStore((state:any) => state.setUnreadCount)
  const setDetailFromList = useStore((state:any) => state.setDetailFromList)
  const setDetailFromNew = useStore((state:any) => state.setDetailFromNew)
  //const isMailDetail = useStore((state:any) => state.isMailDetail)
  const setIsOnCompose = useStore((state:any) => state.setIsOnCompose)
  const setIsMailDetail = useStore((state:any) => state.setIsMailDetail)
  const detailFromNew = useStore((state:any) => state.detailFromNew)
  const router = useRouter()
  const [loading, setLoading] = useState(false);
  let mailDetail: IMailContentItem[] = [];
  const [list, setList] = useState<IMailItem[]>([]);
  const [pageNum, setPageNum] = useState(0);
  ///////const [inboxType, setInboxType] = useState(Number(mailBox));
  const [selectList, setSelectList] = useState<IMailItem[]>([]);
  const [isAll, setIsAll] = useState(false);
  const [isFilterHidden, setIsFilterHidden] = useState(true);
  const removeAll = useStore((state:any) => state.removeAll)
  const sixList = [
    { src: trash,
      handler: async ()=>{
        await handleDelete(getMails());
        await fetchMailList(false);
      }},
    { src: starred,
      handler: async ()=>{
        await handleStar(getMails());
        await fetchMailList(false);
      }},  
    { src: spam,
      handler: async ()=>{
        await handleSpam(getMails());
        await fetchMailList(false);
      }},  
    { src: temp1,
      handler: ()=>{
      }},  
    { src: read,
      handler: async ()=>{
        await handleChangeReadStatus(getMails(),ReadStatusTypeEn.read);
        await fetchMailList(false);
      }}, 
    { src: markUnread,
      handler: async ()=>{
        await handleChangeReadStatus(getMails(),ReadStatusTypeEn.unread);
        await fetchMailList(false);
      }},]
      const fourFilter = [
        { content: 'All',
          filter: FilterTypeEn.Inbox,
          },
        { content: 'Read',
          filter: FilterTypeEn.Read,
          },
        { content: 'Unread',
          filter: FilterTypeEn.Unread,
          },
        { content: 'Encrypted',
          filter: FilterTypeEn.Encrypted,
          },]
  const getMails = () => {
    const res: IMailChangeParams[] = [];
    selectList?.forEach((item) => {
      res.push({
        message_id: item.message_id,
        mailbox: item.mailbox,
      });
    });
    return res;
  };

  const fetchMailList = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    try {
      const mailListStorage = getMailListInfo();
      console.log(mailListStorage);
      const isMailListStorageExist = mailListStorage?.data?.page_index === pageIdx && mailListStorage?.filter === filterType;
      if (isMailListStorageExist && showLoading) { //showLoading=true的时候相同的邮件列表已经改变了，需要重新取
        console.log('mailliststoragecunle');
        setList(mailListStorage?.data?.mails ?? []);   //用缓存更新状态组件
        setPageNum(mailListStorage?.data?.page_num);
        setUnreadCount(mailListStorage.data?.unread ?? 0);
      } else { ////////不是缓存 重新取
        clearMailListInfo();
        console.log('meiyoulisthuancun');
        const { data } = await getMailList({
          filter: filterType,
          page_index: pageIdx,
        });
        console.log(data);
        console.log(data?.mails);
        setList(data?.mails ?? []);
        setPageNum(data?.page_num);
        setUnreadCount(data.unread ?? 0);
        const mailListStorage = { //设置邮件列表缓存
          data: data,
          filter: filterType,
        }
        updateStorage('MailListInfo',mailListStorage);
      }
    } catch(e) {
      //setIsAlert(true);
      //notification.error({
      //  message: 'Network Error',
      //  description: 'Can not fetch mail list for now.',
      //});
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };
  /*
  const getMailDetail = ()=>{
      const mailDetailStorage = getStorage('mailDetailStorage');
      console.log('zzzzzzz');
      console.log(mailDetailStorage)
      const isMailDetailStorageExist = mailDetailStorage?.page_index===pageIdx && mailDetailStorage?.filter===filterType && mailDetailStorage?.mailDetails[list.length-1]?.message_id;
      if (isMailDetailStorageExist){
        console.log('detailhuancunle');
        mailDetail = mailDetailStorage?.mailDetails;
        console.log(mailDetailStorage);
      }
      else{
        deleteStorage('mailDetailStorage');
        try{
        mailDetail = [];
        list.map(async (item)=>{
          const { data } = (await getMailDetailByID(window.btoa(item.message_id)))??{};
          console.log(data);
          mailDetail.push(data);
          console.log(mailDetail);
          })
        }catch(e){
          console.log(e);
          console.log("ListError");
          //setIsAlert(true);

        }
      }
  }
  */

  useEffect(() => {
    if (getUserInfo()?.address) fetchMailList(true);
    //getMailDetail();  预加载feature abort
  }, [pageIdx, filterType]);
  useEffect(() => {
    if (getUserInfo()?.address) fetchMailList(false);
    //getMailDetail();  预加载feature abort
  }, [detailFromNew]);

  
  const handleChangeSelectList = (item: IMailItem, isSelect?: boolean) => {
    if (isSelect) {
      const nextList = selectList.slice();
      nextList.push(item);
      setSelectList(nextList);
    } else {
      const nextList = selectList.filter(
        (i) => i.message_id !== item.message_id && i.mailbox !== item.mailbox,
      );
      setSelectList(nextList);
    }
  };

  const handleChangeMailStatus = async (
    inputMails?: IMailChangeParams[],
    mark?: MarkTypeEn,
    read?: ReadStatusTypeEn,
  ) => {
    const mails = inputMails ?? getMails();
    try {
      await changeMailStatus(mails, mark, read);
    } catch(e) {
      //setIsAlert(true);
      //notification.error({
      //  message: 'Failed',
      //  description: 'Sorry, network problem.',
      //});
    } finally {
      fetchMailList(false);
    }
  };

  const handleClickMail = async (
    //id: string,
    //type: MetaMailTypeEn,
    //mailbox: MailBoxTypeEn,
    //read: number,
    item: IMailItem,
  ) => {
    /*
    const mailDetailStorage = {
      mailDetails: mailDetail,
      page_index: pageIdx,
      filter: filterType,
    }
    console.log('mailDetailStorage');
    console.log(mailDetailStorage);
    updateStorage('MailListInfo',mailDetailStorage);
    */
    //const pathname =
    //  filterType === FilterTypeEn.Draft ? '/home/new' : '/home/mail';
    setRandomBits(undefined); // clear random bits
    if (!read) {
      const mails = [{ message_id: item?.message_id, mailbox: Number(item.mailbox) }];
      await changeMailStatus(mails, undefined, ReadStatusTypeEn.read);
    }
    fetchMailList(false);
    if (filterType === FilterTypeEn.Draft){
      setDetailFromNew(item);
      setIsOnCompose(true);
    }else{
      setDetailFromList(item);
      setIsMailDetail(true);
    } 
    /*router.push({
    pathname,
    query: {
        id,
        type: type + '',
    },
    }); */
  };
  return (
      <div className='flex flex-col flex-1 min-w-0'>
        <div className='flex flex-row w-full justify-between p-13 py-7'>
          <div className='flex flex-row space-x-12 pt-4'>
          <Icon      ///////////最初设计稿的提示
            url={checkbox}
            checkedUrl={cancelSelected}
            onClick={(res: boolean) => {
                setSelectList(res ? list?.map((item) => item) : []);
                setIsAll(res);
            }}
            select={isAll}/>     
            <Icon      ///////////最初设计稿的提示
            url={update}
            onClick={()=>
              { removeAll();
                clearMailListInfo();
                //deleteStorage('mailDetailStorage');
                fetchMailList(true);}}
            />
            <div className="dropdown inline-relative">
            <Icon      ///////////最初设计稿的提示
            url={filter}
            onClick={()=>setIsFilterHidden(!isFilterHidden)}/>
                <ul className={isFilterHidden?'hidden':'flex z-[2] menu absolute mt-6 shadow bg-base-100 rounded-5 '}>
                {fourFilter.map((item,index) => {
                  return (
                    <li onClick={()=>{
                      setIsFilterHidden(!isFilterHidden);
                      setFilter(Number(item.filter));                      
                    }}
                    key={index}><a className='px-12 py-4 text-xs modal-bg'>{item.content}</a></li>
                  );})}
                </ul>
              </div>
            <div className='h-14 flex gap-10'>
            {selectList.length ?
                sixList.map((item,index) => {
            return (
                <Icon
                url={item.src}
                key={index}
                onClick={item.handler}
                className='w-13 h-auto self-center'
                /> 
            );})
              :null}  
              </div>          
          </div>              

          <div className='flex flex-row justify-end space-x-20 text-xl text-[#7F7F7F]'>
            <button
                disabled={pageIdx===1}
                className='w-24 disabled:opacity-40'
                onClick={() => {if (pageIdx > 1) subPage();}}>{"<"}</button>
          {/*<span className='text-sm pt-3'>{pageIdx ?? '-'} /{pageNum ?? '-'}</span>//////显示邮件的数量*/}
            <button
                className='w-24 disabled:opacity-40'
                disabled={pageIdx===pageNum}
                onClick={() => {if (pageIdx < pageNum) addPage();}}>{">"}</button>
            </div>  
        </div>
    {/*<div className='h-28 flex flex-row pb-6 px-18 justify-between text-sm gap-35 text-[#999999] text-center'>
        <div className='flex flex-row justify-around w-102 px-5'>
            <Icon      ///////////最初设计稿的提示
            url={checkbox}
            checkedUrl={selected}
            onClick={(res: boolean) => {
                setSelectList(res ? list?.map((item) => item) : []);
                setIsAll(res);
            }}
            select={isAll}/>
            <div className=''>Option</div>
        </div>
        <span className='w-120 '>Address</span>
        <span className='w-135 '>Theme</span>
        {/*<div className='h-14 w-1 rounded-1 bg-[#333333] align-center'/>
        <div className='min-w-0 flex-1 overflow-hidden'>Abstract</div>
        <div className='w-120'>Date</div>
    </div>*/}
    <div className='flex flex-col overflow-auto flex-1 h-0 pl-8 relative'>
      {loading?<div className='flex justify-center align-center m-auto radial-progress animate-spin text-[#006AD4]'/>:
        list.map((item,index) => { 
          //const url = ('/home/mail?id='+item.message_id.replaceAll('@','%40')+'&type='+item.meta_type);
          //router.prefetch(url); 
        return (
          //<Link key={index} rel='prefetch' href={'/home/mail?id='+item.message_id+'&type='+item.meta_type}>
        <button key={index} className={selectList.findIndex(
          (i) =>
            i.message_id === item.message_id &&
            i.mailbox === item.mailbox,
        ) >= 0 ?'text-left select-bg':'text-left'}>
          <MailListItem
            mark={item?.mark}
            from={item.mail_from}
            subject={item.subject}
            date={item.mail_date}
            metaType={item.meta_type as MetaMailTypeEn}
            isRead={
                item.read == ReadStatusTypeEn.read //||
                //sessionStorage.getItem(item?.message_id) !== null
            } // message_id as primary key
            abstract={item?.digest}
            onClick={() => {
              //sessionStorage.setItem(item?.message_id, item?.message_id); // set read in sessionstorage for update without fetching maillist

              handleClickMail(item);

            }}
            select={
              selectList.findIndex(
                (i) =>
                  i.message_id === item.message_id &&
                  i.mailbox === item.mailbox,
              ) >= 0
            }
            onFavorite={(isSelect: boolean) => {
              handleChangeMailStatus(
                [
                  {
                    message_id: item?.message_id,
                    mailbox: item?.mailbox,
                  },
                ],
                isSelect ? MarkTypeEn.Starred : MarkTypeEn.Normal,
              );
            }}
            onSelect={(isSelect) => {
              handleChangeSelectList(item, isSelect);
            }}
            onDelete={() => {
              handleChangeMailStatus(
                [
                  {
                    message_id: item?.message_id,
                    mailbox: item?.mailbox,
                  },
                ],
                item?.mailbox===3 ? MarkTypeEn.Deleted : MarkTypeEn.Trash,
              );
            }}
            onUnread={() => {
              handleChangeMailStatus(
                [
                  {
                    message_id: item?.message_id,
                    mailbox: item?.mailbox,
                  },
                ],
                undefined,
                ReadStatusTypeEn.unread,
              );
            }}
          />
          </button>
          //</Link>
          )}
          )}
        </div>
    </div>

  );
}

const mapStateToProps = (state: any) => {
  return state.user ?? {};
};

//const mapIndexStateToProps = (state: any) => {
//  return state.pageIndex ?? {};
//};

//export default connect(mapStateToProps, mapDispatchToProps)(MailList);
export default MailList;