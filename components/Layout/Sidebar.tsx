import React, { useState, useEffect, useContext } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

import MailBoxContext from 'context/mail';
import { useMailListStore, useNewMailStore } from 'lib/zustand-store';
import {
    FilterTypeEn,
    MenusMap,
    IMenuItem,
    MetaMailTypeEn,
    MailBoxTypeEn,
    ReadStatusTypeEn,
    MarkTypeEn,
} from 'lib/constants';
import { mailHttp } from 'lib/http';

import logoBrand from 'assets/MetaMail.svg';
import logo from 'assets/logo.svg';
import write from 'assets/mailbox/write.svg';

import styles from './Siderbar.module.scss';

export default function Sidebar() {
    const { createDraft, logout } = useContext(MailBoxContext);
    const { filterType, setFilterType, resetPageIndex, unreadCount, setUnreadCount, spamCount, setSpamCount } =
        useMailListStore();
    const { setSelectedDraft } = useNewMailStore();

    function handleChangeFilter(filter: FilterTypeEn) {
        setFilterType(filter);
        resetPageIndex();
    }

    async function handleClickNewMail() {
        const { message_id, randomBits, key } = await createDraft();
        setSelectedDraft({
            randomBits,
            message_id,
            mail_from: { name: '', address: '' },
            mail_to: [],
            mark: MarkTypeEn.Normal,
            part_html: '',
            part_text: '',
            attachments: [],
            subject: '',
            meta_type: MetaMailTypeEn.Encrypted,
            mailbox: MailBoxTypeEn.Draft,
            mail_bcc: [],
            mail_cc: [],
            read: ReadStatusTypeEn.Read,
            digest: '',
            meta_header: {
                keys: [key],
            },
        });
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
                className={styles.menuLi}
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
        const doGetMailStat = async () => {
            try {
                const { spam, unread } = await mailHttp.getMailStat();
                setUnreadCount(unread);
                setSpamCount(spam);
            } catch (error) {
                console.error('get mail stat error');
                console.error(error);
            }
        };
        doGetMailStat();
        const getMailsStatInterval = setInterval(doGetMailStat, 60000);
        return () => {
            clearInterval(getMailsStatInterval);
        };
    }, []);

    return (
        <div className="bg-[#F3F7FF] w-200 px-10 flex flex-col justify-between font-poppins text-sm">
            <div className="flex flex-col">
                <button onClick={logout} className="flex h-45 items-center justify-center">
                    <Image src={logo} alt="logo" className="w-auto h-32 mr-5" />
                    <Image src={logoBrand} alt="logo-brand" className="w-116" />
                </button>
                <button className="btn btn-primary text-white mt-5" onClick={handleClickNewMail}>
                    <Image src={write} alt="new_mail" className="w-16 h-auto" />
                    <span>New Mail</span>
                </button>
                <div>
                    <ul className={`menu ${styles.mainMenu}`}>
                        {renderLi(MenusMap.filter(menu => menu.belong === 'basic'))}
                        <li>
                            <details open>
                                <summary className={styles.moreSummary}>
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
