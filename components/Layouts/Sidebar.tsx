import Image from 'next/image';
import logoBrand from 'assets/MetaMail.svg';
import logo from 'assets/logo.svg';
import showMore from 'assets/showMore.svg';
import { add, more } from 'assets/icons';
import compose from 'assets/inbox_compose.svg';
import { MailMenuItems } from 'lib/constants/menu';
import React, { useState } from 'react';
import Icon from 'components/Icon';
import { useRouter } from 'next/router';
import useStore from 'lib/storage/zustand';
import { FilterTypeEn, MetaMailTypeEn } from 'lib/constants/interfaces';
import { createMail } from 'lib/utils/crypto/crypt';
import { getMailDetailByID } from 'lib/http/mail';

export default function Sidebar(props: any) {
    const setFilter = useStore((state: any) => state.setFilter);
    const filterType = useStore((state: any) => state.filter);
    const resetPage = useStore((state: any) => state.resetPage);
    const unreadCount = useStore((state: any) => state.unreadCount);
    const [dropTag, setDropTag] = useState(false);
    const [dropFilter, setDropFilter] = useState(false);
    const setIsOnCompose = useStore((state: any) => state.setIsOnCompose);
    const setDetailFromNew = useStore((state: any) => state.setDetailFromNew);
    const router = useRouter();
    async function handleReturnHome() {
        router.push('/');
    }
    function handleChangeFilter(filter: FilterTypeEn) {
        if (router?.query?.id) router.push('/mailbox');
        setFilter(Number(filter));
        resetPage();
    }
    async function handleClickNewMail() {
        const newMailID = await createMail(MetaMailTypeEn.Encrypted);
        //const newMailID = await createMail(MetaMailTypeEn.Plain);
        console.log(newMailID);
        if (newMailID) {
            setDetailFromNew(await getMailDetailByID(window.btoa(newMailID ?? '')));
            setIsOnCompose(true);
        } else {
            console.log('throw new Error:no const newMailID = await createMail');
        }
    }

    return (
        <div className="bg-[#F3F7FF] w-200 pl-15 pr-10 pt-12 flex flex-col justify-between font-poppins text-sm ">
            <div className="flex flex-col">
                <button onClick={handleReturnHome} className="flex flex-row space-x-5">
                    <Image src={logo} alt="logo" className="w-auto h-24 " />
                    <Image src={logoBrand} alt="logo_brand" className="flex self-end pb-4" />
                </button>
                <button
                    className="my-19 flex h-35 bg-[#006AD4] rounded-5 justify-center gap-20 py-8"
                    onClick={() => {
                        handleClickNewMail();
                    }}>
                    <Image src={compose} alt="new_mail" className="w-16 h-auto" />
                    <div className="text-white overflow-hidden">New Message</div>
                </button>
                <div className="">
                    <ul className="p-2 rounded-box w-full text-[#7F7F7F]">
                        {MailMenuItems.map((item, index) => {
                            return (
                                <li key={index} className={item.hidden === false ? 'auto' : 'hidden'}>
                                    <button
                                        onClick={() => {
                                            handleChangeFilter(item.key);
                                            setDropFilter(false);
                                        }}
                                        className={
                                            filterType === Number(item.key)
                                                ? 'w-full hover:bg-[#DAE7FF] px-7 py-6 flex flex-row gap-7 active-bg rounded-5 font-bold'
                                                : 'w-full hover:bg-[#DAE7FF] px-7 py-6 flex flex-row gap-7 rounded-5'
                                        }>
                                        <Image
                                            src={item?.logo}
                                            alt={item?.title}
                                            height="12.5"
                                            className="self-center stroke-width-100"
                                        />
                                        <div className="flex w-full justify-between">
                                            <span className=""> {item.title}</span>
                                            {item.title === 'Inbox' ? (
                                                <span className="">{unreadCount === 0 ? '' : unreadCount}</span>
                                            ) : null}
                                        </div>
                                    </button>
                                </li>
                            );
                        })}
                        <button
                            className="p-9 py-3 flex flex-row gap-10 rounded-5 text-[#BDBDBD] w-full"
                            onClick={() => setDropFilter(dropFilter === false)}>
                            <Icon
                                url={showMore}
                                className={dropFilter ? 'mt-4 h-12 self-center rotate-90' : 'mt-4 h-12 self-center'}
                            />
                            <div className="flex justify-between w-full ">
                                <span className="">More</span>
                                <span className="">2</span>
                            </div>
                        </button>
                    </ul>
                    <ul className="text-[#7F7F7F]">
                        {dropFilter
                            ? MailMenuItems.map((item, index) => {
                                  return (
                                      <li key={index} className={item.hidden ? 'auto' : 'hidden'}>
                                          <button
                                              onClick={() => {
                                                  handleChangeFilter(item.key);
                                              }}
                                              className={
                                                  filterType === Number(item.key)
                                                      ? 'w-full hover:bg-[#DAE7FF] px-7 py-6 flex flex-row gap-7 active-bg rounded-5 font-bold'
                                                      : 'w-full hover:bg-[#DAE7FF] px-7 py-6 flex flex-row gap-7 rounded-5'
                                              }>
                                              <Image src={item?.logo} alt={item?.title} height="12.5" />
                                              <div className="">
                                                  <span className=""> {item.title}</span>
                                                  {item.title === 'Inbox' ? (
                                                      <span className="">{props?.unreadCount?.unread}</span>
                                                  ) : null}
                                              </div>
                                          </button>
                                      </li>
                                  );
                              })
                            : null}
                    </ul>
                    <div className="w-177 h-0 border"></div>
                    <ul>
                        <button
                            className="p-9 flex flex-row gap-10 rounded-5 text-[#707070] w-full"
                            onClick={() => setDropTag(dropTag === false)}>
                            <Icon
                                url={showMore}
                                className={dropTag ? 'mt-4 h-12 self-center rotate-90' : 'mt-4 h-12 self-center'}
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
                    {dropTag ? (
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
                    ) : null}
                </div>
            </div>
        </div>
    );
}
