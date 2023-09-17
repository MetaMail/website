import React, { useState, useEffect, useContext } from 'react';
import Image from 'next/image';

import MailBoxContext from 'context/mail';
import { useMailListStore } from 'lib/zustand-store';
import { FilterTypeEn, MenusMap, IMenuItem } from 'lib/constants';

import logoBrand from 'assets/MetaMail.svg';
import logo from 'assets/logo.svg';
import write from 'assets/mailbox/write.svg';

export default function Sidebar() {
    const { logout, getMailStat, createDraft } = useContext(MailBoxContext);
    const { filterType, setFilterType, resetPageIndex, unreadCount, spamCount } = useMailListStore();

    function handleChangeFilter(filter: FilterTypeEn) {
        setFilterType(filter);
        resetPageIndex();
    }

    async function handleClickNewMail() {
        createDraft([]);
    }

    const renderBadge = (type: FilterTypeEn) => {
        if (type !== FilterTypeEn.Inbox && type !== FilterTypeEn.Spam) {
            return null;
        }
        const count = type === FilterTypeEn.Inbox ? unreadCount : spamCount;
        if (count <= 0) return null;
        return <span className="badge badge-sm">{count > 99 ? '99+' : count}</span>;
    };

    const renderLi = (menusMap: IMenuItem[]) => {
        return menusMap.map(item => (
            <li
                key={item.key}
                onClick={() => {
                    handleChangeFilter(item.key);
                }}>
                <a className={filterType === Number(item.key) ? 'active' : ''}>
                    <Image src={item?.logo} alt={item?.title} height="12.5" className="self-center stroke-width-100" />
                    <span>{item.title}</span>
                    {renderBadge(item.key)}
                </a>
            </li>
        ));
    };

    useEffect(() => {
        getMailStat();
        const getMailsStatInterval = setInterval(getMailStat, 60000);
        return () => {
            clearInterval(getMailsStatInterval);
        };
    }, []);

    return (
        <div className="w-200 px-10 flex flex-col justify-between font-poppins text-sm">
            <div className="flex flex-col">
                <button onClick={logout} className="flex h-45 items-center justify-center">
                    <Image src={logo} alt="logo" className="w-auto h-32 mr-5" />
                    {/* <Image src={logoBrand} alt="logo-brand" className="w-116" /> */}
                    <span className="text-2xl font-bold">MetaMail</span>
                </button>
                <button className="btn btn-primary text-white mt-5" onClick={handleClickNewMail}>
                    <Image src={write} alt="new_mail" className="w-16 h-auto" />
                    <span>New Mail</span>
                </button>
                <div>
                    <ul className="menu">
                        {renderLi(MenusMap.filter(menu => menu.belong === 'basic'))}
                        <li>
                            <details open>
                                <summary>
                                    <span className="ml-8">More</span>
                                </summary>
                                <ul className="ml-0 pl-0 before:w-0">
                                    {renderLi(MenusMap.filter(menu => menu.belong === 'more'))}
                                </ul>
                            </details>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
