import Alert from '@components/Alert';
import Layout from '@components/Layouts';
import { clearMailListInfo } from '@utils/storage/mail';
import { clearUserInfo, getUserInfo } from '@utils/storage/user';
import useStore from '@utils/storage/zustand';
import { useRouter } from 'next/router';
import React, { ReactElement, useEffect, useState } from 'react';
import MailList from './list';
import Mail from './mail';
import NewMail from './new/index.tsx';

export default function HomePage() {
  const router = useRouter()
  const [onShow, setOnShow] = useState(false);
  const [address,setAddress] = useState<string>();  
  const removeAll = useStore((state:any) => state.removeAll)
  function getLogOut(){
    clearUserInfo();
    //clearMailListInfo();
    removeAll();
    router.push('/');
  }
  useEffect(()=>{
    if (!getUserInfo().address) {
      getLogOut();
    } 
    setAddress(getUserInfo()?.address);
  }, []);
  return (
    <div>
    <div className='flex flex-col flex-1 h-screen pb-24 font-poppins pr-21 w-[calc(100vw-206px)] min-w-[700px]'>
      <div className='flex flex-row pt-10 justify-end'>
        <div className='flex flex-row justify-end gap-4'>
        <div className='w-24 h-24 rounded-2 bg-[#7070DE]'/>
        <button className="flex text-md omit font-bold pb-6 mr-17 justify-between w-131" onClick={getLogOut}>
          <div className='omit pt-2'>{address}</div>
        </button>
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
      <div className='flex flex-row flex-1 h-0 bg-white rounded-10'>
        <MailList/>
        <Mail/>
      </div>
      <Alert message={'Network Error'} description={'Can not fetch detail info of this email for now.'}/>
      <NewMail/>
    </div>
    </div>
  );
}

HomePage.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;
