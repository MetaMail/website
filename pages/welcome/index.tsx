import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAccount } from 'wagmi';
import { disconnect } from '@wagmi/core';
import { toast } from 'react-toastify';

import { userHttp } from 'lib/http';
import { userLocalStorage } from 'lib/utils';
import { generateEncryptionUserKey } from 'lib/encrypt';
import { randomStringSignInstance } from 'lib/sign';
import ReviewInfo from 'components/ReviewInfo';
import Footer from 'components/Footer';
import RainbowLogin from 'components/RainbowLogin';

import logoBrand from 'assets/logo_brand.svg';
import computer from 'assets/computer.svg';
import table from 'assets/Table.svg';
import gradientDot from 'assets/pdot.svg';
import pic1Left from 'assets/pic1left.svg';
import pic2Right from 'assets/pic2Right.svg';
import pic3Left from 'assets/pic3Left.svg';
import gdL from 'assets/gdL.png';
import LoadingRing from 'components/LoadingRing';
import NormalSignModal from 'components/Modal/SignModal';
import { useSignatureModalStore, useThreeSignatureModalStore } from 'lib/zustand-store';
import StepModal from 'components/Modal/StepModal';
export default function Welcome() {
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  let address = useAccount().address?.toLowerCase();
  useEffect(() => {
    document.body.style.fontFamily = 'SpaceGrotesk'; // 应用字体样式
  }, []);
  // 签名提示弹窗---start
  const { isShowSignature, setIsShowSignature, handleShowSignature } = useSignatureModalStore();
  // 签名提示弹窗---end

  // 新用户step弹窗
  const { isShowThreeSignature, setIsShowThreeSignature, activeStep, setActiveStep } = useThreeSignatureModalStore();

  const handleAutoLogin = async () => {
    try {
      if (!address) return;
      setLoading(true); // 开始请求时设置 loading 为 true
      const { address: localAddress, ensName, publicKey, privateKey, salt } = userLocalStorage.getUserInfo();

      const token = userLocalStorage.getToken();
      if (localAddress && token) {
        return router.push('/mailbox');
      }

      const signData = await userHttp.getRandomStrToSign(address);
      randomStringSignInstance.signData = signData;
      // 判断是否新用户
      if (!signData.isNewUser) {
        // 是
        handleShowSignature('Sign this message to verify your wallet');
      } else {
        // 否
        setIsShowThreeSignature(true);

      }

      const signedMessage = await randomStringSignInstance.doSign(signData.signMessages);
      // 关闭老用户签名提示弹窗
      setIsShowSignature(false)
      const { user } = await userHttp.getJwtToken({
        tokenForRandom: signData.tokenForRandom,
        signedMessage,
      });

      console.log('userLocalStorage.getUserInfo()', userHttp.getEncryptionKey(address))
      let encryptionData = await userHttp.getEncryptionKey(address);
      if (!ensName) {
        setActiveStep(1);
      }
      if (!encryptionData?.signature) {
        encryptionData = await generateEncryptionUserKey();
        // do upload
        await userHttp.putEncryptionKey({
          data: encryptionData,
        });
        setIsShowThreeSignature(false)
      }

      userLocalStorage.setUserInfo({
        address,
        ensName: (user && user.ens) || '',
        publicKey: encryptionData.public_key,
        privateKey: encryptionData.encrypted_private_key,
        salt: encryptionData.salt,
      });

      router.push('/mailbox');
    } catch (error: any) {
      console.error(error);
      if (error?.code === 'ACTION_REJECTED' || error?.code === 4001) {
        // 用户拒绝签名，不提示登录失败
        return;
      } else if (error.message) {
        toast.error(error.message, {
          position: 'top-center',
          autoClose: 2000
        });
      } else {
        toast.error('Login failed. Please make sure your balance > 0 in ETH Mainnet.', {
          position: 'top-center',
          autoClose: 2000
        });
      }
    } finally {
      await disconnect();
      setLoading(false); // 请求结束后设置 loading 为 false
      setActiveStep(0)
      setIsShowSignature(false);
      setIsShowThreeSignature(false)
    }
  };

  useEffect(() => {
    window.ethereum?.on('accountsChanged', (accounts: string[]) => {
      address = accounts[0].toLowerCase();
    });
    handleAutoLogin();
  }, [address]);

  useEffect(() => {
    const { address: localAddress } = userLocalStorage.getUserInfo();
    const token = userLocalStorage.getToken();
    if (localAddress && token) {
      // 检测到登录了自动跳转
      router.push('/mailbox');
    }
  }, [])

  return (
    <div className="!font-[spaceGrotesk] flex flex-col mx-auto max-w-[3000px]">
      {isShowSignature && <NormalSignModal />}
      <StepModal />
      <Head>
        <title>MetaMail</title>
      </Head>
      <div className="home-bg">
        <div className="flex justify-between relative">
          <Image src={gdL} alt="gradient NW" className="fixed w-[300px] md:w-1069 h-auto" />
          <div className="gradient-dot-NE" />
          <div className="gradient-dot-middle" />
        </div>
        <div className="pt-43 relative">
          <header className="flex flex-row justify-between px-40 lg:px-102">
            <Image src={logoBrand} alt="logo" width={298} height={52} />
            <div className="relative hover:shadow-md font-[600] text-[#000]  text-[16px] w-250 h-44 border border-[#1e1e1e] rounded-[20px] invisible lg:visible  flex items-center justify-center">
              <RainbowLogin content="Connect Wallet" />
            </div>
          </header>
        </div>
        {/* -------- */}
        <div className="pt-78 lg:pt-136 relative scale-[80%] md:scale-100 left-0 md:left-174 2xl:left-[18%] w-399 text-[#333] z-[1]">
          <h1 className="font-bold text-5xl leading-snug ">
            <p>Your</p>
            <p>Web3 Email</p>
          </h1>
          <p className="text-4xl font-light leading-snug">Create And Use Your Crypto Email</p>
          <div
            className="relative hover:shadow-md mt-80  z-[10]  flex items-center justify-center w-219 h-69 rounded-20 text-white  
    text-2xl bg-black ">
            <RainbowLogin content="Try It Now" />
          </div>
        </div>
        <div className="scale-65 xl:scale-80 2xl:scale-100">
          <div className="relative hidden lg:flex">
            <Image src={gradientDot} alt="dot SW" className="absolute w-32 bottom-100 right-903" />
            <Image src={gradientDot} alt="dot NE" className="absolute w-32 bottom-440 right-68" />
            <Image src={computer} alt="computer height-404" className="absolute bottom-0 right-40 " />
          </div>
          <div className="pt-300 relative hidden lg:flex">
            <Image
              src={table}
              alt="table under computer"
              className="absolute right-0 bottom-0 height-440"
            />
          </div>
        </div>
        {/* 轮播图 */}
        <ReviewInfo />
      </div>
      <div className="relative h-960 description-bg mt-50 lg:-mt-360 lg:flex flex-row justify-between 2xl:justify-center pt-60 md:pt-153 px-20  md:px-141 gap-40 2xl:gap-200">
        <Image src={pic1Left} className=" lg:flex w-452 h-auto" alt="first carton pic" />
        <Image src={gradientDot} alt="dot SW" className="absolute w-36 top-217 right-903" />
        <Image src={gradientDot} alt="dot NE" className="absolute w-19 bottom-86 right-346" />
        <div className="flex flex-col self-start justify-between gap-52 w-full md:w-519 pt-0 lg:pt-140 mt-50 md:mt-0 text-[#333]">
          <div className="text-[30px] md:text-5xl font-medium leading-normal">Use your wallet or ens as email address</div>
          <div className="text-[20px] md:text-3xl font-normal leading-normal">
            Use the wallet to log in our mailbox directly, send and receive mails with users of our mailbox
            and other common mainstream mailboxes. Totally free!
          </div>
          <div className="relative hover:shadow-md font-[600] text-[#000]   w-250 h-44 border border-[#1e1e1e] rounded-40 visible  flex items-center justify-center">
            <RainbowLogin content="Connect Wallet" />
          </div>
        </div>
      </div>
      <div className="relative h-820 description-bg2 flex flex-col md:flex-row justify-start md:justify-between px-20 md:px-141 gap-40 2xl:gap-200 2xl:justify-center">
        <div className=" lg:flex flex-col self-start justify-between gap-52 w-full md:w-519 pt-100 md:pt-246 font-[SpaceGrotesk] text-[#333]">
          <div className="text-[30px] md:text-5xl font-medium leading-normal">Sign every mail you send</div>
          <div className="text-[20px] md:text-3xl font-normal leading-normal">
            Sign evey mail digitally with your wallet. No forged mails anymore!
          </div>
          <div className="mb-10 md:mb-0 mt-40 md:mt-0 relative hover:shadow-md  font-[600] text-[#000]   w-250 h-44 border border-[#1e1e1e] rounded-40 visible  flex items-center justify-center">
            <RainbowLogin content="Start Now" />
          </div>
        </div>
        <Image src={pic2Right} alt="second carton pic" className="origin-top scale-[80%] sm:scale-[60%] md:scale-125 lg:scale-100 w-full md:w-420" />
        <Image src={gradientDot} alt="dot NW" className="absolute w-31 top-50 md:top-118 left-[90%] md:left-356" />
      </div>
      <div className="relative h-820 description-bg3 lg:flex flex-col md:flex-row justify-center md:justify-between 2xl:justify-center px-20 md:px-141  md:gap-40 2xl:gap-200">
        <Image src={pic3Left} className=" origin-top scale-[90%] sm:scale-[60%] md:scale-100 lg:inline pt-100 pb-50 md:py-200 w-full md:w-452" alt="third carton pic" />
        <Image src={gradientDot} alt="dot" className="absolute w-32 bottom-97 left-[90%] md:left-388" />
        <div className="flex flex-col self-start justify-between gap-52 w-full md:w-519 pt-20 md:pt-140 text-[#333]">
          <div className="text-[30px] md:text-5xl font-medium leading-normal">Protect mail with p2p encryption</div>
          <div className="text-[20px] md:text-3xl font-normal leading-normal">
            Mails sent and received by MetaMail users could be optionally encrypted, and only the recipient
            has the private key to decrypt the mails, ensuring the ultimate security.
          </div>
          <div className="relative hover:shadow-md  font-[600] text-[#000]   w-250 h-44 border border-[#1e1e1e] rounded-40 invisible lg:visible flex items-center justify-center">
            <RainbowLogin content="Encrypt Now" />
          </div>
        </div>
      </div>
      <Footer />
      {<LoadingRing loading={loading} />}
    </div>
  );
}
