import Layout from '@components/Layouts';
import { clearUserInfo } from '@utils/storage/user';
import { useRouter } from 'next/router';
import React, { ReactElement, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import MailList from './list';
import RainbowLogin from 'components/RainbowLogin';
import NewMail from './new';

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const router = useRouter()
  const [onCompose, setOnCompose] = useState(false);  
  useEffect(() => { 
  if (!isConnected) {
      clearUserInfo();
      router.push('/'); ///////////////////返回首页
    }
  },[isConnected, onCompose]);
  return (
    <div className='flex flex-col flex-1 h-screen pt-12 pb-24 font-poppins pr-21 w-[calc(100vw-206px)] min-w-[700px]'>
      <div className='flex flex-row pt-10 justify-between'>
        <div className='flex flex-row'><div className='w-6 h-24 bg-[#006AD4] rounded-4'/>
        {/*<span className='pl-7 font-black text-xl'>Inbox</span>*/}</div>
        <div className='flex flex-row justify-right'>
        <div className="flex text-sm omit font-bold pb-12 px-20 justify-between">
      <RainbowLogin content='Address Expired'/>
      </div>
          {/*<div className="form-control"> ////////////////////// Search 先不加了
            <div className="input-group ">
              <input type="text" placeholder="Search Mail" className="input input-bordered h-32" />
              <button className="btn h-32 min-h-0 px-5 bg-[#006AD4]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
            </div>
  </div>*/}
        </div>
      </div>
      <MailList/>
      {onCompose===true?<NewMail/>:null}
    </div>
  );
}

HomePage.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;
