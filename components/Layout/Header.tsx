import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

import { userSessionStorage, mailSessionStorage } from 'lib/session-storage';
import { useUtilsStore } from 'lib/zustand-store';

export default function Header() {
    const JazziconGrid = dynamic(() => import('components/JazziconAvatar'), { ssr: false });
    const router = useRouter();
    const [address, setAddress] = useState<string>();

    const { removeAllState } = useUtilsStore();

    const getLogOut = () => {
        userSessionStorage.clearUserInfo();
        mailSessionStorage.clearMailListInfo();
        removeAllState();
        router.push('/');
    };

    useEffect(() => {
        const address = userSessionStorage.getUserInfo()?.address;
        if (!address) return getLogOut();
        setAddress(address);
    }, []);
    return (
        <div className="flex flex-row justify-end h-45 px-28 py-10">
            <div className="flex flex-row justify-end gap-4">
                <JazziconGrid size={24} addr={address} />
                <button className="flex text-md omit font-bold justify-between w-131" onClick={getLogOut}>
                    <div className="omit">{address}</div>
                </button>
            </div>
        </div>
    );
}
