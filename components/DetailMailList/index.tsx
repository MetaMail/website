
import LoadingRing from 'components/LoadingRing';
import React, { useContext, useState } from 'react';
import DetailMailListItem from './components/MailListItem/MailItem';
import { empty } from 'assets/icons';
import { MailListItemType } from 'lib/constants';
import { useMailDetailStore, useMailListStore } from 'lib/zustand-store';
import Image from 'next/image';

const detailMailList = () => {
  const { selectedMail } = useMailDetailStore();
  const { list } = useMailListStore();
  const [loading, setLoading] = useState(false);
  return (
    <div className={`flex flex-col h-full transition-all text-[14px]  overflow-y-scroll w-333 pt-35`}>
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
export default detailMailList;