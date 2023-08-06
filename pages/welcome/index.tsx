import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAccount } from 'wagmi';
import { disconnect } from '@wagmi/core';
import { toast } from 'react-toastify';

import { userHttp } from 'lib/http';
import { userSessionStorage } from 'lib/utils';
import { generateEncryptionUserKey, getPrivateKey } from 'lib/encrypt';
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

export default function Welcome() {
    const router = useRouter();
    const address = useAccount().address?.toLowerCase();

    const handleAutoLogin = async () => {
        try {
            const signData = await userHttp.getRandomStrToSign(address);
            randomStringSignInstance.signData = signData;
            const signedMessage = await randomStringSignInstance.doSign(signData.signMessages);
            const { user } = await userHttp.getJwtToken({
                tokenForRandom: signData.tokenForRandom,
                signedMessage,
            });
            let encryptionData = await userHttp.getEncryptionKey(address);
            if (!encryptionData?.signature) {
                encryptionData = await generateEncryptionUserKey();
                // do upload
                await userHttp.putEncryptionKey({
                    data: encryptionData,
                });
            }
            const decryptPrivateKey = await getPrivateKey(encryptionData.encryption_private_key, encryptionData.salt);
            userSessionStorage.setUserInfo({
                address,
                ensName: user.ens || '',
                publicKey: encryptionData.encryption_public_key,
                privateKey: encryptionData.encryption_private_key,
                salt: encryptionData.salt,
                purePrivateKey: decryptPrivateKey,
            });
            router.push('/mailbox');
        } catch (error) {
            console.error(error);
            toast.error('Login failed, please try again later.');
        } finally {
            await disconnect();
            console.log('Disconnected');
        }
    };

    useEffect(() => {
        window.ethereum.on('accountsChanged', (accounts: string[]) => {
            console.log(accounts);
        });
        (async () => {
            if (!address) return;
            if (userSessionStorage.getUserInfo().address !== address) return handleAutoLogin();
            await disconnect();
            router.push('/mailbox');
        })();
    }, [address]);

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
                        <Image
                            src={table}
                            alt="table under computer"
                            className="absolute right-0 bottom-0 height-440"
                        />
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
                    <div className="text-3xl font-normal leading-normal">
                        Use the wallet to log in our mailbox directly, send and receive mails with users of our mailbox
                        and other common mainstream mailboxes. Totally free!
                    </div>
                    <div className=" w-250 h-44 border border-[#1e1e1e] rounded-40 invisible lg:visible font-poppins flex items-center justify-center">
                        <RainbowLogin content="Connect Wallet" />
                    </div>
                </div>
            </div>
            <div className="relative h-820 description-bg2 flex flex-row justify-between px-141 gap-40 2xl:gap-200 2xl:justify-center">
                <div className="hidden lg:flex flex-col self-start justify-between gap-52 w-519 pt-246">
                    <div className="text-5xl font-medium leading-normal">Sign every mail you send</div>
                    <div className="text-3xl font-normal leading-normal">
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
                    <div className="text-3xl font-normal leading-normal">
                        Mails sent and received by MetaMail users could be optionally encrypted, and only the recipient
                        has the private key to decrypt the mails, ensuring the ultimate security.
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
