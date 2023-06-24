import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { useMailListStore, useNewMailStore, useMailDetailStore } from 'lib/zustand-store';
import { FilterTypeEn, MetaMailTypeEn, MenusMap } from 'lib/constants';
import { createEncryptedMailKey } from 'lib/encrypt';
import { mailHttp } from 'lib/http';
import { userSessionStorage } from 'lib/session-storage';
import Icon from 'components/Icon';

import logoBrand from 'assets/MetaMail.svg';
import logo from 'assets/logo.svg';
import showMore from 'assets/showMore.svg';
import compose from 'assets/inbox_compose.svg';
import { add, more } from 'assets/icons';

export default function Sidebar(props: any) {
    const router = useRouter();
    const { filterType, setFilterType, resetPageIndex, unReadCount } = useMailListStore();
    const { setIsWriting } = useNewMailStore();
    const { setDetailFromNew } = useMailDetailStore();

    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [showTagMenu, setShowTagMenu] = useState(false);

    function handleReturnHome() {
        router.push('/');
    }

    function handleChangeFilter(filter: FilterTypeEn) {
        setFilterType(filter);
        resetPageIndex();
    }

    async function handleClickNewMail() {
        const { publicKey, address } = userSessionStorage.getUserInfo();
        const key = await createEncryptedMailKey(publicKey, address);
        // 以前的代码中，如果不是MetaMailTypeEn.Encrypted，还会执行 userStorage.setRandomBits(undefined);
        // 这里目前全都当MetaMailTypeEn.Encrypted处理，估计代码还没写完，写完以后把注释删除
        const { message_id } = await mailHttp.createDraft(MetaMailTypeEn.Encrypted, key);
        const mail = await mailHttp.getMailDetailByID(window.btoa(message_id ?? ''));
        setDetailFromNew(mail);
        setIsWriting(true);
    }

    return (
        <div className="bg-[#F3F7FF] w-200 pl-15 pr-10 pt-12 flex flex-col justify-between font-poppins text-sm">
            <div className="flex flex-col">
                <button onClick={handleReturnHome} className="flex flex-row space-x-5">
                    <Image src={logo} alt="logo" className="w-auto h-24 " />
                    <Image src={logoBrand} alt="logo_brand" className="flex self-end pb-4" />
                </button>
                <button
                    className="my-19 flex h-35 bg-[#006AD4] rounded-5 justify-center gap-20 py-8"
                    onClick={handleClickNewMail}>
                    <Image src={compose} alt="new_mail" className="w-16 h-auto" />
                    <div className="text-white overflow-hidden">New Message</div>
                </button>
                <div className="">
                    <ul className="p-2 rounded-box w-full text-[#7F7F7F]">
                        {MenusMap.filter(menu => menu.belong === 'basic').map(item => (
                            <li key={item.key}>
                                <button
                                    onClick={() => {
                                        handleChangeFilter(item.key);
                                    }}
                                    className={`w-full hover:bg-[#DAE7FF] px-7 py-6 flex flex-row gap-7 rounded-5 ${
                                        filterType === Number(item.key) ? 'active-bg font-bold' : ''
                                    }`}>
                                    <Image
                                        src={item?.logo}
                                        alt={item?.title}
                                        height="12.5"
                                        className="self-center stroke-width-100"
                                    />
                                    <div className="flex w-full justify-between">
                                        <span className=""> {item.title}</span>
                                        {item.title === 'Inbox' && (
                                            <span className="">{unReadCount === 0 ? '' : unReadCount}</span>
                                        )}
                                    </div>
                                </button>
                            </li>
                        ))}
                        <button
                            className="p-9 py-3 flex flex-row gap-10 rounded-5 text-[#BDBDBD] w-full"
                            onClick={() => setShowMoreMenu(!showMoreMenu)}>
                            <Icon
                                url={showMore}
                                className={`mt-4 h-12 self-center ${showMoreMenu ? 'rotate-90' : ''}`}
                            />
                            <div className="flex justify-between w-full ">
                                <span className="">More</span>
                                <span className="">2</span>
                            </div>
                        </button>
                    </ul>
                    <ul className="text-[#7F7F7F]">
                        {showMoreMenu &&
                            MenusMap.filter(menu => menu.belong === 'more').map(item => (
                                <li key={item.key}>
                                    <button
                                        onClick={() => {
                                            handleChangeFilter(item.key);
                                        }}
                                        className={`w-full hover:bg-[#DAE7FF] px-7 py-6 flex flex-row gap-7 rounded-5 ${
                                            filterType === Number(item.key) ? 'active-bg font-bold' : ''
                                        }`}>
                                        <Image src={item?.logo} alt={item?.title} height="12.5" />
                                        <div className="">
                                            <span className=""> {item.title}</span>
                                            {item.title === 'Inbox' && (
                                                <span className="">{props?.unreadCount?.unread}</span>
                                            )}
                                        </div>
                                    </button>
                                </li>
                            ))}
                    </ul>
                    <div className="w-177 h-0 border"></div>
                    <ul>
                        <button
                            className="p-9 flex flex-row gap-10 rounded-5 text-[#707070] w-full"
                            onClick={() => setShowTagMenu(!showTagMenu)}>
                            <Icon
                                url={showMore}
                                className={`mt-4 h-12 self-center ${showTagMenu ? 'rotate-90' : ''}`}
                            />
                            <div className="flex flex-row justify-between w-full ">
                                <span className="">Tag</span>
                                <div className="flex flex-row gap-5">
                                    <Image src={add} alt="add" className="w-12 h-auto" />
                                    <Image src={more} alt="more" className="w-12 h-auto" />
                                </div>
                            </div>
                        </button>
                    </ul>
                    {showTagMenu && (
                        <div>
                            <div className="text-[#707070] flex flex-row gap-5 pl-12 pb-13">
                                <svg
                                    className="self-end pb-[0.5px]"
                                    width="12"
                                    height="10"
                                    viewBox="0 0 12 10"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M1.99581 0.550049H7.71581C8.05581 0.550049 8.48082 0.785049 8.66082 1.07505L10.7508 4.41505C10.9508 4.74005 10.9308 5.25005 10.7008 5.55505L8.11083 9.00505C7.92583 9.25005 7.52581 9.45005 7.22081 9.45005H1.99581C1.12081 9.45005 0.59083 8.49005 1.05083 7.74505L2.43581 5.53005C2.62081 5.23505 2.62081 4.75505 2.43581 4.46005L1.05083 2.24505C0.59083 1.51005 1.12581 0.550049 1.99581 0.550049Z"
                                        stroke="#8828FF"
                                        stroke-miterlimit="10"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                </svg>{' '}
                                {
                                    //temp
                                }
                                <div className="h-15">
                                    <span className="text-xs">Life</span>
                                    <span className="">{props?.unreadCount?.unread}</span>
                                </div>
                            </div>
                            <div className="text-[#707070] flex flex-row gap-5 pl-12 pb-13">
                                <svg
                                    className="self-end pb-[0.5px]"
                                    width="12"
                                    height="10"
                                    viewBox="0 0 12 10"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M1.99581 0.550049H7.71581C8.05581 0.550049 8.48082 0.785049 8.66082 1.07505L10.7508 4.41505C10.9508 4.74005 10.9308 5.25005 10.7008 5.55505L8.11083 9.00505C7.92583 9.25005 7.52581 9.45005 7.22081 9.45005H1.99581C1.12081 9.45005 0.59083 8.49005 1.05083 7.74505L2.43581 5.53005C2.62081 5.23505 2.62081 4.75505 2.43581 4.46005L1.05083 2.24505C0.59083 1.51005 1.12581 0.550049 1.99581 0.550049Z"
                                        stroke="#8828FF"
                                        stroke-miterlimit="10"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                </svg>{' '}
                                {
                                    //temp
                                }
                                <div className="h-15">
                                    <span className="text-xs">Life</span>
                                    <span className="">{props?.unreadCount?.unread}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
