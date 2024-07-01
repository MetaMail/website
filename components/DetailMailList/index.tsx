
import LoadingRing from 'components/LoadingRing';
import React, { useContext, useState } from 'react';
import DetailMailListItem from './components/MailListItem/MailItem';
import { empty } from 'assets/icons';
import { MailListItemType } from 'lib/constants';
import { useMailDetailStore, useMailListStore, useNewMailStore } from 'lib/zustand-store';
import Image from 'next/image';
import Icon from 'components/Icon';
import { arrowLeft, arrowRight, update } from 'assets/icons'
import { mailHttp } from 'lib/http';
import { toast } from 'react-toastify';
const DetailMailList = () => {
  const { isSendSuccess, setIsSendSuccess } = useNewMailStore();
  const [pageNum, setPageNum] = useState(0);
  const { selectedMail } = useMailDetailStore();
  const { filterType, pageIndex, list, setList, detailList, setDetailList, addPageIndex, subPageIndex } = useMailListStore();
  const [loading, setLoading] = useState(false);

  const fetchMailList = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await mailHttp.getMailList({
        filter: filterType,
        page_index: pageIndex,
        limit: 30,
      });

      const { mails, page_num } = data;
      let mailsList = mails as MailListItemType[];
      const ids: string[] = []
      mailsList.forEach(item => {
        ids.push(item.message_id)
        item.selected = false;
        item.local_id = item.message_id;
      });
      setList(mailsList ?? []);
      setPageNum(page_num);
      // 发送邮件成功，刷新列表
      setIsSendSuccess(false)
    } catch (error) {
      console.error(error);
      toast.error('Fetch mail list failed, please try again later.', {
        position: 'top-center',
        autoClose: 2000
      });
    } finally {
      if (showLoading) setLoading(false);
    }
  };
  return (
    <div className={`flex flex-col h-full transition-all text-[14px]  overflow-y-scroll w-333 pt-14`}>
      {/* 分页 */}
      <div className="flex sticky z-10 top-0 pr-[17px] items-center flex-row justify-end space-x-8  text-[#7F7F7F]">
        {/* <span className="text-md">total page: {pageNum}</span> */}
        <button
          disabled={pageIndex === 1}
          onClick={() => {
            if (pageIndex > 1) subPageIndex();
          }}>
          {/* 当是第一页 */}
          {pageIndex === 1 ? (<Icon url={arrowLeft} title="arrowLeft" className="w-16 h-16 opacity-100"></Icon>) : (<Icon url={arrowRight} title="arrowRight" className="w-20 h-20 rotate-180"></Icon>)}
        </button>

        <button
          disabled={pageIndex === pageNum}
          onClick={() => {
            if (pageIndex < pageNum) addPageIndex();
          }}>
          <Icon url={arrowRight} title="arrowRight" className="w-20 h-20"></Icon>
        </button>
        <Icon
          url={update}
          title="Refresh"
          onClick={() => {
            fetchMailList(true);
          }}
        />
      </div>
      <div className="relative ">

        {<LoadingRing loading={loading} />}
        <div className={`${loading ? `fadeOutAnimation` : 'fadeInAnimation'} flex flex-col cursor-pointer overflow-y-scroll flex-1 relative   ${list.length ? 'justify-start' : 'justify-center'}`}>
          {list.length ? (<div className='listContainer'>
            {list.map((item: MailListItemType) => {
              return (
                <DetailMailListItem
                  loading={loading}
                  key={`${item.message_id}${item.mailbox}`}
                  mail={item}
                  onSelect={() => { }} />
              )
            })
            }
          </div>)
            : (
              !loading && <Image src={empty} alt="No Mail" className="w-auto h-136 mt-[20%]" />
            )
          }
        </div>
      </div>
    </div>
  )
}
export default DetailMailList;