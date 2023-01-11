import Image from 'next/image';
import logo_brand from '@assets/logo_brand.svg';
import computer from '@assets/computer.svg';
import table from '@assets/Table.svg';
import pDot from '@assets/pdot.svg';
import pic1left from '@assets/pic1left.svg';
import pic2Right from '@assets/pic2Right.svg';
import pic3left from '@assets/pic3left.png';
import gdL from '@assets/gdL.png';
import ReviewInfo from 'sections/reviewinfo';
import Footer from 'sections/Footer';

export default function Intro() {
  const handleOpenConnectModal = () => {
    //setIsConnectModalVisible(true);
    //if (address) {
    //  history.push('/home/list');
    //} else {
    //  setIsConnectModalVisible(true);
    //  setisOnLoginProcess(true);
    }
  return (
    <div className="flex flex-col mx-auto">
      <div className="home-bg">
        <div className='flex justify-between'>
        <Image src={gdL} alt="gradient NW" className="fixed w-1069"/>
        <div>
        <div className='gradient-dot-NE'/>
        <div className='gradient-dot-middle'/>
        </div>
        </div>
    <div className="pt-43 relative"> 
      <header className="flex flex-row justify-between px-40 lg:px-102">
        <Image src={logo_brand} alt="logo" className="w-298 h-52" onClick={handleOpenConnectModal}/>
        <button className=" w-250 h-44 border border-[#1e1e1e] rounded-40 invisible lg:visible font-poppins" onClick={handleOpenConnectModal}>Connect Wallet</button>
      </header>
      </div>
    <div className="pt-78 lg:pt-136 relative left-174 2xl:left-[18%] w-399">
    <h1 className="font-bold text-5xl leading-snug ">
      <p>Your</p>
      <p>Web3 Email</p>
    </h1>
    <p className="text-4xl font-light leading-snug">
    Create And Use Your Crypto Email
    </p>
    {/*<Image src={pDot} alt="purpledot" className="w-36 h-36" width={36} height={36}/>*/}
    <div className="pt-80 relative">
    <button className="w-219 h-69 rounded-20 text-white font-semibold 
    text-2xl bg-black " onClick={handleOpenConnectModal}>Try It Now</button>
    </div>
  </div>
  <div className='scale-65 xl:scale-80 2xl:scale-100'>
  <div className="relative hidden lg:flex">
          <Image
            src={computer}
            alt="computer height-404"
            className="absolute bottom-0 right-40 "/></div>
          <div className="pt-300 relative hidden lg:flex">
          <Image
            src={table}
            alt="table under computer"
            className="absolute right-0 bottom-0 z-[-1] height-440"/>
        </div>
        </div>
        <ReviewInfo/>
        </div>
        <div className='h-960 description-bg mt-150 lg:-mt-360 lg:flex flex-row justify-between xl:justify-center pt-153 px-57 gap-40 2xl:gap-200'>
          <Image
            src={pic1left}
            className='hidden lg:flex w-452'
            alt="first carton pic"
          />
          <div className='flex flex-col self-start justify-between gap-52 w-519 pt-0 lg:pt-140 '>
            <div className='text-5xl font-medium leading-normal'>Use your wallet or ens as email address</div>
          <div className='text-3xl font-normal leading-normal
          '>Use the wallet to log in our mailbox directly, send and receive mails with users of our mailbox and other common mainstream mailboxes. Totally free!</div>
          <button className=" w-250 h-44 border border-[#1e1e1e] rounded-40 font-poppins" onClick={handleOpenConnectModal}>Connect Wallet</button>
          </div>
        </div>
        <div className='h-820 description-bg2 flex flex-row justify-between px-141 gap-40 2xl:gap-200 2xl:justify-center'>
          <div className='hidden lg:flex flex-col self-start justify-between gap-52 w-519 pt-246'>
            <div className='text-5xl font-medium leading-normal'>Sign every mail you send</div>
          <div className='text-3xl font-normal leading-normal
          '>Sign evey mail digitally with your wallet. No forged mails anymore!</div>
          <button className=" w-250 h-44 border border-[#1e1e1e] rounded-40 font-poppins" onClick={handleOpenConnectModal}>Start Now</button>
          </div>
          <Image
            src={pic2Right}
            alt="second carton pic"
            className='scale-125 lg:scale-100 w-420'
          />
        </div>
        <div className='h-820 description-bg3 lg:flex flex-row justify-between xl:justify-center px-57 gap-40 2xl:gap-200'>
          <Image
            src={pic3left}
            className='hidden lg:inline py-200 w-452'
            alt="third carton pic"
          />
          <div className='flex flex-col self-start justify-between gap-52 w-519 pt-140'>
            <div className='text-5xl font-medium leading-normal'>Protect mail with p2p encryption</div>
          <div className='text-3xl font-normal leading-normal
          '>Mails sent and received by Metamail users could be optionally encrypted, and only the recipient has the private key to decrypt the mails, ensuring the ultimate security.</div>
          <button className=" w-250 h-44 border border-[#1e1e1e] rounded-40 font-poppins" onClick={handleOpenConnectModal}>Encrypt Now</button>
          </div>
        </div>
        <Footer/>
  </div>
  );
}

