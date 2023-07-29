import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { toast } from 'react-toastify';

import { userSessionStorage, mailSessionStorage } from 'lib/utils';
import { useUtilsStore } from 'lib/zustand-store';
import { PostfixOfAddress } from 'lib/base/request';

import copy from 'assets/mailbox/copy.svg';
import right from 'assets/mailbox/right.svg';

export default function Titlebar() {
    const JazziconGrid = dynamic(() => import('components/JazziconAvatar'), { ssr: false });
    const router = useRouter();
    const [address, setAddress] = useState<string>();
    const [ensName, setEnsName] = useState<string>();

    const { removeAllState } = useUtilsStore();

    const getLogOut = () => {
        userSessionStorage.clearUserInfo();
        userSessionStorage.clearToken();
        mailSessionStorage.clearMailListInfo();
        removeAllState();
        router.push('/');
    };

    const handleCopy = (txt: string) => {
        navigator.clipboard.writeText(txt);
        toast.success('Copied to clipboard');
    };

    useEffect(() => {
        const { address, ensName } = userSessionStorage.getUserInfo() ?? {};
        if (!address) return getLogOut();
        setAddress(address);
        setEnsName(ensName);
    }, []);
    return (
        <div className="navbar p-0">
            <div className="flex-1">
                <input type="text" placeholder="Search" className="input w-380 h-42" />
            </div>
            <div className="flex-none gap-2">
                <div className="form-control"></div>
                <div className="dropdown dropdown-end">
                    <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                        <div className="w-40 h-40 rounded-full">
                            <JazziconGrid size={40} addr={address} />
                        </div>
                    </label>
                    <div
                        tabIndex={0}
                        className="mt-3 z-[1] px-24 py-12 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-270">
                        <div className="text-[#93989A] flex flex-row items-center my-4">
                            <p className="flex-1 flex mr-4 cursor-default" title={`${address}${PostfixOfAddress}`}>
                                <span className="flex-1 omit w-0">{address}</span>
                                <span>{PostfixOfAddress}</span>
                            </p>
                            <Image
                                src={copy}
                                alt="copy"
                                title="copy"
                                className="w-18 h-18 p-0 cursor-pointer"
                                onClick={() => {
                                    handleCopy(address);
                                }}
                            />
                        </div>
                        {ensName && (
                            <div className="text-[#93989A] flex flex-row items-center my-8">
                                <span className="flex-1 omit mr-4 cursor-default">{ensName}</span>
                                <Image
                                    src={copy}
                                    alt="copy"
                                    title="copy"
                                    className="w-18 h-18 p-0 cursor-pointer"
                                    onClick={() => {
                                        handleCopy(ensName);
                                    }}
                                />
                            </div>
                        )}

                        <div className="divider my-4"></div>
                        <div className="my-8">
                            <p className="flex justify-between font-bold">
                                <span>Mailbox capacity</span>
                                <span>50%</span>
                            </p>
                            <progress className="progress progress-primary w-222 mt-12" value="50" max="100"></progress>
                            <p className="flex justify-between font-bold text-sm my-4">
                                <span>0</span>
                                <span>32GB</span>
                            </p>
                        </div>
                        <div className="flex justify-between font-bold items-center my-12 cursor-pointer">
                            <span>Setting</span>
                            <Image src={right} alt="go" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
