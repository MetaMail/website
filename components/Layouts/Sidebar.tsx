import Link from 'next/link';
import Image from 'next/image';
import logoBrand from '@assets/inboxbrand.svg';
import logo from '@assets/logo.svg';
import compose from '@assets/inbox_compose.svg';
import { MailMenuItems } from '@constants/menu';
//import { FilterTypeEn, MetaMailTypeEn } from '@constants/interfaces';
import React, { useState } from 'react';
export default function Sidebar(props:any) {
  const [dropStatus, setDropStatus] = useState(false);
  return (
  <div className='bg-[#F3F7FF] w-206 p-25 pr-15 flex flex-col justify-between font-poppins'>
    <div className='flex flex-col space-y-24'>
      <Link href="/" className='flex flex-row space-x-9'>
          <Image src={logo} alt="logo" className="w-auto h-38 "/>
          <Image src={logoBrand} alt="logo_brand" className="flex self-end pb-8"/>
      </Link>
      <button className='flex h-38 bg-[#006AD4] rounded-11 justify-center gap-17 py-10' onClick={()=>console.log('is')}>
        <Image src={compose} alt="new_mail" className="w-16 h-auto"/>
        <div className='text-sm text-white'>Compose</div>
      </button>
        <div className=''>
          <ul className="p-2 rounded-box w-full text-[#7F7F7F]">
            {MailMenuItems.map((item,index) => {
            return (
              <li
                key={index}
                //icon={<Icon url={item.logo} />}
                className=''
                ><Link href={''} className={item.title === 'Inbox'? 'hover:bg-[#DAE7FF] p-10 flex flex-row gap-7 active-bg rounded-8':'hover:bg-[#DAE7FF] p-10 flex flex-row gap-7 rounded-8'}>
                <Image src={item?.logo} alt={item?.title} height="12.5"/>
                <div className=''>
                  <span className=''> {item.title}</span>
                  {item.title === 'Inbox' ? (
                    <span className=''>
                      {props?.unreadCount?.unread}
                    </span>
                  ) : null}
                </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <button className="flex items-center" onClick={()=>setDropStatus(!dropStatus)}>
  <svg className={dropStatus?'rotate-270 fill-[#7F7F7F] h-20 w-20': 'fill-[#7F7F7F] h-20 w-20 '} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414-.707.707L10 10.828 5.757 6.586 4.343 8z"/>
  </svg>
  <div className="ml-2">Toggle</div>
</button>
{dropStatus?<div>hidden</div>:null}
    </div>
  </div>
  );
}
