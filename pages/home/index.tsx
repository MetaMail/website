import Layout from '@components/Layouts';
import { clearUserInfo } from '@utils/storage/user';
import { useRouter } from 'next/router';
import React, { ReactElement, useEffect } from 'react';
import { useAccount } from 'wagmi';

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const router = useRouter()  
  useEffect(() => { 
  if (!isConnected) {
      clearUserInfo();
      router.push('/'); ///////////////////返回首页
    }
  },[address]);
  return <div>Home Page</div>;
}

HomePage.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;
