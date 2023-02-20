import MailListItem from '@components/MailItem';
import { useState, useEffect, useRef } from 'react';
import Icon from '@components/Icon';
import { useRouter } from 'next/router'
import useStore from '@utils/storage/filter';
import shallow from 'zustand/shallow';
//import Image from 'next/image';
//import turnLeft from '@assets/turnLeft.svg';
//import turnRight from '@assets/turnRight.png';
//import Collection from '@assets/Collection.svg';
//import Delete from '@assets/Delete.svg';
///import Read from '@assets/Read.svg';
//import Unread from '@assets/Unread.svg';
import {
  FilterTypeEn,
  getMailBoxType,
  IMailItem,
  MailBoxTypeEn,
  MarkTypeEn,
  MetaMailTypeEn,
  ReadStatusTypeEn,
} from 'constants/interfaces';
import { changeMailStatus, getMailList, IMailChangeParams } from 'services/home';
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
import { setRandomBits } from 'utils/storage/user';
function MailList(props: any) {
  const state = useStore()
  const pageIdx = useStore((state) => state.page)
  const filterType = useStore((state) => state.filter)
  const addPage = useStore((state) => state.addPage)
  const subPage = useStore((state) => state.subPage)
  const router = useRouter()
  const queryRef = useRef(0);
  const [hiddenIcon, setHiddenIcon] = useState(false);
  /////////const mailBox = getMailBoxType(queryRef.current);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<IMailItem[]>([]);
  const fiveSource = [trash,starred,spam,temp1,read,markUnread,]
  const [pageNum, setPageNum] = useState(0);
  ///////const [inboxType, setInboxType] = useState(Number(mailBox));
  const [inboxType, setInboxType] = useState(0);
  const [selectList, setSelectList] = useState<IMailItem[]>([]);
  const [isAll, setIsAll] = useState(false);
  const [isFilterHidden, setIsFilterHidden] = useState(true);

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
      if ( //////////缓存
        props?.data &&
        props?.data?.pageIndex == pageIdx &&
        props?.data?.inboxType == queryRef.current &&
        props?.data?.mailList.length !== 0
      ) {
        console.log('shi');
        setList(props?.data?.mailList);
        //setPageIdx(data?.page_index);
        setPageNum(props?.data?.totalPage);
      } else { ////////不是缓存 重新取
        const { data } = await getMailList({
          filter: filterType,
          page_index: pageIdx,
        });
        console.log('this');
        console.log(data);
        setList(data?.mails ?? []);
        setPageNum(data?.page_num);
        props.setUnreadCount({
          unread: data?.unread,
          total: data?.total,
        });
      }
    } catch {
      //notification.error({
      //  message: 'Network Error',
      //  description: 'Can not fetch mail list for now.',
      //});
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
    console.log('finally');
    console.log(list);
    //console.log(pageNum);
    //因为缓存的时候每次读data，所以如果old data有数据证明old data是下一次返回要用的，把old data变成data，现在这一页存进old data里
    ////////////////////props.setDataList({
    ////////////////  pageIndex: props?.data?.oldPageIndex ? props.data.oldPageIndex : pageIdx,
     //////////// inboxType: props?.data?.oldInboxType
    ///////////////    ? props.data.oldInboxType
    /////////////////////    : queryRef.current,
      //mailList: props?.data?.oldMailList ? props.data.oldMailList : list,
      //totalPage: props?.data?.oldTotalPage ? props.data.oldTotalPage : pageNum,
    ////////////////  mailList: list, //这里的list和pagenum实际上就是old data的state，由于在这个阶段未更新所以可以直接用
    /////////////  totalPage: pageNum,
    //////////////  oldPageIndex: pageIdx,
    ///////////  oldInboxType: queryRef.current,
    //////////////////});
  };

  useEffect(() => {
    console.log('useEffect')
    ///////////////props.setPageIndex({
    /////////////////  currentIndex: pageIdx,
    ///////////////  totalIndex: pageNum,
    ///////////////});
    ///////////queryRef.current = location?.query?.filter
    /////////////  ? Number(location?.query?.filter)
    //////////////  : 0;
    //if (!sessionStorage.getItem('pageIdx')) setPageIdx(1);
    /////////////setInboxType(queryRef.current);
    fetchMailList();
  }, [pageIdx, state, ]);
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
    } catch {
      //notification.error({
      //  message: 'Failed',
      //  description: 'Sorry, network problem.',
      //});
    } finally {
      fetchMailList(false);
    }
  };

  const handleClickMail = (
    id: string,
    type: MetaMailTypeEn,
    mailbox: MailBoxTypeEn,
    read: number,
  ) => {
    const pathname =
      queryRef.current === FilterTypeEn.Draft ? '/home/new' : '/home/mail';
    setRandomBits(undefined); // clear random bits
    if (!read) {
      const mails = [{ message_id: id, mailbox: Number(mailbox) }];
      changeMailStatus(mails, undefined, ReadStatusTypeEn.read);
    }
    router.push({
    pathname,
    query: {
        id,
        type: type + '',
    },
    });
  };
  return (
    <div className='flex flex-col flex-1 h-0 bg-white rounded-10'>
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
            url={update}/>
              <div className="dropdown inline-relative">
              <Icon      ///////////最初设计稿的提示
            url={filter}
            onClick={()=>setIsFilterHidden(!isFilterHidden)}/>
                <div className={isFilterHidden?'hidden':'auto'}>
                <ul className="menu absolute mt-6 shadow bg-base-100 rounded-5 ">
                  <li className='focus:bg-[#DAE7FF]'><a className='px-12 py-4 text-xs'>All</a></li>
                  <li><a className='px-12 py-4 text-xs'>Read</a></li>
                  <li><a className='px-12 py-4 text-xs'>Unread</a></li>
                  <li><a className='px-12 py-4 text-xs'>Encrypted</a></li>
                </ul>
                </div>
              </div>
            <div className='h-14 flex gap-10'>
            {selectList.length ?
                fiveSource.map((item,index) => {
            return (
                <Icon
                url={item}
                key={index}
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
    <div className='flex flex-col overflow-auto flex-1 h-0 pl-8'>
        {list.map((item,index) => { 
        return (
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
              ////////////////props.setDataList({
                //点击了邮件那肯定是需要返回最新的一页，因此重新把store更新
                ///////////////pageIndex: pageIdx,
                /////////////////inboxType: queryRef.current,
                //////////////mailList: list,
                ////////////////totalPage: pageNum,
              /////////////////});
              sessionStorage.setItem(item?.message_id, item?.message_id); // set read in sessionstorage for update without fetching maillist
              //console.log(item?.message_id);
              handleClickMail(
                item.message_id,
                item.meta_type,
                item.mailbox,
                item.read,
              );
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
          />
          </button>)}
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