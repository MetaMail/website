import React, { ReactElement, useEffect, useState, useContext } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

import { useMailListStore, useMailDetailStore, useNewMailStore } from 'lib/zustand-store';
import { userSessionStorage, mailSessionStorage } from 'lib/session-storage';
import { MailBoxContext } from 'context';

import Layout from './components/Layout';
import MailList from './components/MailList';
import MailDetail from './components/MailDetail';
import NewMail from './components/NewMail';

export default function MailBoxPage() {
    const JazziconGrid = dynamic(() => import('components/JazziconAvatar'), { ssr: false });
    const router = useRouter();
    const [address, setAddress] = useState<string>();
    const { removeAllState } = useContext(MailBoxContext);
    const { isMailDetail } = useMailDetailStore();
    const { isWriting } = useNewMailStore();

    function getLogOut() {
        userSessionStorage.clearUserInfo();
        mailSessionStorage.clearMailListInfo();
        removeAllState();
        router.push('/');
    }

    useEffect(() => {
        const address = userSessionStorage.getUserInfo()?.address;
        if (!address) return getLogOut();
        setAddress(address);
    }, []);

    return (
        <div>
            <div className="flex flex-col flex-1 h-screen pb-24 font-poppins pr-21 w-[calc(100vw-206px)] min-w-[700px]">
                <div className="flex flex-row pt-10 justify-end">
                    <div className="flex flex-row justify-end gap-4">
                        <JazziconGrid size={24} addr={address} />
                        <button
                            className="flex text-md omit font-bold pb-6 mr-17 justify-between w-131"
                            onClick={getLogOut}>
                            <div className="omit pt-2">{address}</div>
                        </button>
                    </div>
                </div>
                <div className="flex flex-row flex-1 h-0 bg-white rounded-10">
                    <MailList />
                    {isMailDetail && <MailDetail />}
                    {isWriting && <NewMail />}
                </div>
            </div>
        </div>
    );
}

MailBoxPage.getLayout = (page: ReactElement) => {
    const RenderLayoutWithContext = () => {
        const { setFilterType, resetPageIndex, setUnreadCount } = useMailListStore();
        const { setDetailFromList, setDetailFromNew } = useMailDetailStore();

        const removeAllState = () => {
            setFilterType(0);
            resetPageIndex();
            setUnreadCount(0);
            setDetailFromList(null);
            setDetailFromNew(null);
        };
        return (
            <MailBoxContext.Provider value={{ removeAllState }}>
                <Layout>{page}</Layout>
            </MailBoxContext.Provider>
        );
    };

    return <RenderLayoutWithContext />;
};
