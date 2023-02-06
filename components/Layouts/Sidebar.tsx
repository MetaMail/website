import Link from 'next/link';
import Image from 'next/image';
import logoBrand from '@assets/inbox_brand.svg';
import logo from '@assets/logo.svg';
import compose from '@assets/inbox_compose.svg';
import { MailMenuItems } from '@constants/menu';
//import { FilterTypeEn, MetaMailTypeEn } from '@constants/interfaces';
import RainbowLogin from '../RainbowLogin';
import React from 'react';
export default function Sidebar(props:any) {

  return (
  <div className='bg-[#F3F7FF] w-230 p-25 flex flex-col justify-between font-poppins'>
    <div className='flex flex-col space-y-24'>
      <Link href="/" className='flex flex-row space-x-9'>
          <Image src={logo} alt="logo" className="w-30 "/>
          <Image src={logoBrand} alt="logo_brand" className="h-29 w-auto py-4"/>
      </Link>
      <div className='flex h-38 bg-[#006AD4] rounded-11 justify-center gap-17 py-10'>
        <Image src={compose} alt="new_mail" className="w-16 h-auto"/>
        <div className='text-sm text-white'>Compose</div>
      </div>
        <div className=''>
          <ul className="menu w-56 p-2 rounded-box w-full text-[#7F7F7F]">
            {MailMenuItems.map((item,index) => {
            return (
              <li
                key={index}
                //icon={<Icon url={item.logo} />}
                ><Link href={''} className={item.title === 'Inbox'? 'p-10 flex flex-row gap-7 active-bg':'p-10 flex flex-row gap-7 '}>
                <Image src={item?.logo} alt={item?.title} height="12.5"></Image>
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
    </div>
    <div className="flex w-full text-lg omit font-bold py-8 justify-center text-[#7F7F7F]">
      <RainbowLogin content='Connect Wallet'/>
      </div>
  </div>
  );
}
