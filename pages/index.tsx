import Image from 'next/image';
import { useRouter } from 'next/router';
import logoBrand from 'assets/logo_brand.svg';
import computer from 'assets/computer.svg';
import table from 'assets/Table.svg';
import gradientDot from 'assets/pdot.svg';
import pic1Left from 'assets/pic1left.svg';
import pic2Right from 'assets/pic2Right.svg';
import pic3Left from 'assets/pic3Left.svg';
import gdL from 'assets/gdL.png';
import ReviewInfo from 'components/ReviewInfo';
import Footer from 'components/Footer';
import RainbowLogin from 'components/RainbowLogin';
import Head from 'next/head';
import { useEffect } from 'react';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { getJwtToken, getRandomStrToSign } from 'services/login';
import { getUserInfo, getWalletAddress, saveUserInfo } from 'storage/user';
import { disconnect } from '@wagmi/core';
import keccak256 from 'keccak256';
import crypto from 'crypto';
import CryptoJS from 'crypto-js';
import { getEncryptionKey, putEncryptionKey } from 'services/user';
export default function Intro() {
  //const setIsAlert = useStore((state:any) => state.setIsAlert)
  const router = useRouter();
  const isConnected = useAccount().isConnected;
  const address = useAccount().address?.toLowerCase();
  console.log('pages');
  console.log(address);
  console.log(isConnected);
  const generateEncryptionKey = async () => {
    //if (!window.ethereum) throw new Error('Your client does not support Ethereum');
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
      const signer = provider.getSigner();
      const salt = crypto.randomBytes(256).toString('hex');
      const signedSalt = await signer.signMessage(
        'Please sign this message to generate encrypted private key: \n \n' + salt
      );
      const Storage_Encryption_Key = keccak256(signedSalt).toString('hex');

      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: 'ECDSA',
          //modulusLength: 2048, //can be 1024, 2048, or 4096
          //publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
          //hash: {name: "SHA-256"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
          namedCurve: 'P-256',
        },
        true, //whether the key is extractable (i.e. can be used in exportKey)
        ['sign', 'verify'] //must be ["encrypt", "decrypt"] or ["wrapKey", "unwrapKey"]
      );
      console.log(keyPair);
      //if (keyPair){
      const privateBuffer = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
      const publicBuffer = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
      //var privateKey = RSA2text(keydata1,1);
      //var uint8private = new Uint8Array(privateBuffer);
      const Private_Store_Key = Buffer.from(privateBuffer).toString('hex');
      const Public_Store_Key = Buffer.from(publicBuffer).toString('hex');
      const Encrypted_Private_Store_Key = CryptoJS.AES.encrypt(Private_Store_Key, Storage_Encryption_Key).toString();
      let data = {
        addr: address ? address.toString() : '',
        date: new Date().toISOString(),
        salt: salt,
        message_encryption_public_key: Public_Store_Key,
        message_encryption_private_key: Encrypted_Private_Store_Key,
        signing_public_key: Public_Store_Key,
        signing_private_key: Encrypted_Private_Store_Key,
        data: 'this is a test',
        signature: '',
      };
      const keyData = keyPack(data);
      console.log(keyData);
      const keySignature = await signer.signMessage(keyData);
      console.log(keySignature);
      if (!keySignature) throw new Error('sign key error');
      data.signature = keySignature;
      await putEncryptionKey({ data: data });
      console.log('end');
      return {
        data: data,
      };
    } catch (e) {
      console.log('encrytionkey error');
      console.log(e);
    }
  };
  const keyPack = (keyData: any) => {
    const {
      addr,
      date,
      salt,
      message_encryption_public_key,
      message_encryption_private_key,
      signing_public_key,
      signing_private_key,
      data,
    } = keyData;
    let parts = [
      'Addr: ' + addr,
      'Date: ' + date,
      'Salt: ' + salt,
      'Message-Encryption-Public-Key: ' + message_encryption_public_key,
      'Message-Encryption-Private-Key: ' + message_encryption_private_key,
      'Signing-Public-Key: ' + signing_public_key,
      'Signing-Private-Key: ' + signing_private_key,
      'Data: ' + data,
    ];
    return parts.join('\n');
  };
  const handleAuth = async () => {
    try {
      if (!window.ethereum) throw new Error('Your client does not support Ethereum');
      const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
      const signer = provider.getSigner();
      //const lowAddr = address!.toLowerCase();
      //console.log(`address: ${address}\nlowAddr: ${lowAddr}`);
      const { data } = await getRandomStrToSign(address!);
      const { randomStr, signMethod, tokenForRandom } = data;
      console.log('randomStr');
      console.log(crypto.randomBytes(256));
      console.log(Buffer.from(randomStr, 'utf8'));
      const signedMessage = await signer.signMessage(randomStr);
      console.log('signedMessage');
      console.log(signedMessage);

      //console.log(await signer.signMessage('Hi there from MetaMail! Sign this message to prove you have access to this account. Sending and receiving mails are totally free, no gas fee.\n\nYour one-time nonce: zKKdqAaFMn8lQCQz0oZK3pabbJoOAZOx-KAjZKf4BjY'));
      //const signedMessage = await window.ethereum.request({
      //    method: 'personal_sign',
      //    params: [
      //      Buffer.from(randomStr, 'utf8').toString('hex'),
      //      address,
      //      'password',
      //    ],
      //  });
      //console.log(signedMessage);
      const res = await getJwtToken({
        tokenForRandom,
        signedMessage,
      });

      /*const postData = {
        salt: signedSalt,
        addr: address??'',
        signature: signedMessage,
        message_encryption_public_key: Public_Store_Key,
        message_encryption_private_key: Private_Store_Key,
        signing_private_key: Private_Store_Key,
        signing_public_key: Public_Store_Key,
        data: 'this is a test',        
      }*/
      //generateEncryptionKey();
      let encryptionData = await getEncryptionKey(address ?? '');
      console.log(encryptionData);
      if (encryptionData == 404) encryptionData = await generateEncryptionKey();
      console.log('encrydt');
      console.log(encryptionData?.data?.message_encryption_public_key);
      const { data: user } = res ?? {};
      saveUserInfo({
        address,
        ensName: user?.user?.ens,
        publicKey: encryptionData?.data?.message_encryption_public_key,
        privateKey: encryptionData?.data?.message_encryption_private_key,
        salt: encryptionData?.data?.salt,
      });
      router.push('/home');
      await disconnect();
    } catch (e) {
      console.log('aaaa');
      //setIsAlert(true);
      console.log(e);
      await disconnect();
    }
  };
  useEffect(() => {
    if (isConnected) {
      if (getUserInfo().address === address) {
        router.push('/home');
        disconnect();
      } else handleAuth();
    }
  });
  return (
    <div className="flex flex-col mx-auto max-w-[2000px]">
      <Head>
        <title>MetaMail</title>
      </Head>
      <div className="home-bg">
        <div className="flex justify-between relative">
          <Image src={gdL} alt="gradient NW" className="fixed w-1069 h-auto" />
          <div className="gradient-dot-NE" />
          <div className="gradient-dot-middle" />
        </div>
        <div className="pt-43 relative">
          <header className="flex flex-row justify-between px-40 lg:px-102">
            <Image src={logoBrand} alt="logo" className="w-298 h-52" />
            <div className=" w-250 h-44 border border-[#1e1e1e] rounded-40 invisible lg:visible font-poppins flex items-center justify-center">
              <RainbowLogin content="Connect Wallet" />
            </div>
            {/*<button className=" w-250 h-44 border border-[#1e1e1e] rounded-40 invisible lg:visible font-poppins" onClick={handleOpenConnectModal}>Connect Wallet</button>
        <div className=' w-250 h-44 border border-[#1e1e1e] rounded-40 invisible lg:visible font-poppins'></div>*/}
          </header>
        </div>
        <div className="pt-78 lg:pt-136 relative left-174 2xl:left-[18%] w-399">
          <h1 className="font-bold text-5xl leading-snug ">
            <p>Your</p>
            <p>Web3 Email</p>
          </h1>
          <p className="text-4xl font-light leading-snug">Create And Use Your Crypto Email</p>
          <div
            className="mt-80 relative z-[10] font-poppins flex items-center justify-center w-219 h-69 rounded-20 text-white font-semibold 
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
            <Image src={table} alt="table under computer" className="absolute right-0 bottom-0 height-440" />
          </div>
        </div>
        <ReviewInfo />
      </div>
      <div className="relative h-960 description-bg mt-150 lg:-mt-360 lg:flex flex-row justify-between xl:justify-center pt-153 px-57 gap-40 2xl:gap-200">
        <Image src={pic1Left} className="hidden lg:flex w-452 h-auto" alt="first carton pic" />
        <Image src={gradientDot} alt="dot SW" className="absolute w-36 top-217 right-903" />
        <Image src={gradientDot} alt="dot NE" className="absolute w-19 bottom-86 right-346" />
        <div className="flex flex-col self-start justify-between gap-52 w-519 pt-0 lg:pt-140 ">
          <div className="text-5xl font-medium leading-normal">Use your wallet or ens as email address</div>
          <div
            className="text-3xl font-normal leading-normal
          ">
            Use the wallet to log in our mailbox directly, send and receive mails with users of our mailbox and other
            common mainstream mailboxes. Totally free!
          </div>
          <div className=" w-250 h-44 border border-[#1e1e1e] rounded-40 invisible lg:visible font-poppins flex items-center justify-center">
            <RainbowLogin content="Connect Wallet" />
          </div>
        </div>
      </div>
      <div className="relative h-820 description-bg2 flex flex-row justify-between px-141 gap-40 2xl:gap-200 2xl:justify-center">
        <div className="hidden lg:flex flex-col self-start justify-between gap-52 w-519 pt-246">
          <div className="text-5xl font-medium leading-normal">Sign every mail you send</div>
          <div
            className="text-3xl font-normal leading-normal
          ">
            Sign evey mail digitally with your wallet. No forged mails anymore!
          </div>
          <div className=" w-250 h-44 border border-[#1e1e1e] rounded-40 invisible lg:visible font-poppins flex items-center justify-center">
            <RainbowLogin content="Start Now" />
          </div>
        </div>
        <Image src={pic2Right} alt="second carton pic" className="scale-125 lg:scale-100 w-420" />
        <Image src={gradientDot} alt="dot NW" className="absolute w-31 top-118 left-356" />
      </div>
      <div className="relative h-820 description-bg3 lg:flex flex-row justify-between xl:justify-center px-57 gap-40 2xl:gap-200">
        <Image src={pic3Left} className="hidden lg:inline py-200 w-452" alt="third carton pic" />
        <Image src={gradientDot} alt="dot" className="absolute w-32 bottom-97 left-388" />
        <div className="flex flex-col self-start justify-between gap-52 w-519 pt-140">
          <div className="text-5xl font-medium leading-normal">Protect mail with p2p encryption</div>
          <div
            className="text-3xl font-normal leading-normal
          ">
            Mails sent and received by Metamail users could be optionally encrypted, and only the recipient has the
            private key to decrypt the mails, ensuring the ultimate security.
          </div>
          <div className=" w-250 h-44 border border-[#1e1e1e] rounded-40 invisible lg:visible font-poppins flex items-center justify-center">
            <RainbowLogin content="Encrypt Now" />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
