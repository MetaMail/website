import React, { useState, useEffect, useContext } from 'react';
import Image from 'next/image';

import MailBoxContext from 'context/mail';
import { useMailListStore } from 'lib/zustand-store';
import { FilterTypeEn, MenusMap, IMenuItem } from 'lib/constants';

import { MetaMailSvg, WriteMailSvg } from 'components/svg';

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
        if (type === FilterTypeEn.Inbox) {
            return <span className="badge-inbox">{count > 99 ? '99+' : count}</span>;
        }
        return <span className="badge-spam">{count > 99 ? '99+' : count}</span>;
    };

    const renderLi = (menusMap: IMenuItem[]) => {
        return menusMap.map(item => (
            <li
                key={item.key}
                onClick={() => {
                    handleChangeFilter(item.key);
                }}>
                <a className={filterType === Number(item.key) ? 'active' : ''}>
                    {React.createElement(item.logo)}
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
                    <MetaMailSvg />
                </button>
                <button className="btn btn-primary mt-10 w-180" onClick={handleClickNewMail}>
                    <WriteMailSvg />
                    <span>New Message</span>
                </button>
                <ul className="menu w-175 mx-auto">
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
    );
}
