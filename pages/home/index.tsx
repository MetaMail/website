import Layout from '@components/Layouts';
import { clearUserInfo } from '@utils/storage/user';
import { useRouter } from 'next/router';
import React, { ReactElement, useEffect } from 'react';
import { useAccount } from 'wagmi';
import MailList from './list';

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const router = useRouter()  
  useEffect(() => { 
  if (!isConnected) {
      clearUserInfo();
      router.push('/'); ///////////////////返回首页
    }
  },[isConnected]);
  return (
    <div className='flex flex-col flex-1 h-screen pt-33 font-poppins pr-44 w-[calc(100vw-230px)]'>
      <div className='flex flex-row pt-10 justify-between'>
        <div className='flex flex-row'><div className='w-6 h-24 bg-[#006AD4] rounded-4'/>
        {/*<span className='pl-7 font-black text-xl'>Inbox</span>*/}</div>
        <div className='w-490 flex flex-row justify-between'>
          <div className="form-control">
            <div className="input-group ">
              <input type="text" placeholder="Search Mail" className="input input-bordered h-32" />
              <button className="btn h-32 min-h-0 px-5 bg-[#006AD4]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      <MailList/>
    </div>
  );
}

HomePage.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;
