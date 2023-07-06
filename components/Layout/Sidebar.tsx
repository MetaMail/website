import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { useMailListStore, useNewMailStore, useMailDetailStore } from 'lib/zustand-store';
import { FilterTypeEn, MetaMailTypeEn, MenusMap, IMenuItem } from 'lib/constants';
import { createEncryptedMailKey } from 'lib/encrypt';
import { mailHttp } from 'lib/http';
import { userSessionStorage } from 'lib/utils';
import Icon from 'components/Icon';

import logoBrand from 'assets/MetaMail.svg';
import logo from 'assets/logo.svg';
import write from 'assets/mailbox/write.svg';

import styles from './Siderbar.module.scss';

export default function Sidebar() {
    const router = useRouter();
    const {
        filterType,
        setFilterType,
        resetPageIndex,
        unreadInboxCount,
        setUnreadInboxCount,
        setUnreadSpamCount,
        unreadSpamCount,
    } = useMailListStore();
    const { setIsWriting } = useNewMailStore();
    const { setDetailFromNew } = useMailDetailStore();

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

    const renderBadge = (type: FilterTypeEn) => {
        if (type !== FilterTypeEn.Inbox && type !== FilterTypeEn.Spam) {
            return null;
        }
        const count = type === FilterTypeEn.Inbox ? unreadInboxCount : unreadSpamCount;
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
        const getUnreadCountPromise = async (type: FilterTypeEn) => {
            const data = await mailHttp.getMailList({
                filter: filterType,
                page_index: 1,
            });
            return data.unread;
        };
        Promise.all([getUnreadCountPromise(FilterTypeEn.Inbox), getUnreadCountPromise(FilterTypeEn.Spam)]).then(
            ([inboxCount, spamCount]) => {
                setUnreadInboxCount(inboxCount);
                setUnreadSpamCount(spamCount);
            }
        );
    }, []);

    return (
        <div className="bg-[#F3F7FF] w-200 px-10 flex flex-col justify-between font-poppins text-sm">
            <div className="flex flex-col">
                <button onClick={handleReturnHome} className="flex h-45 items-center justify-center">
                    <Image src={logo} alt="logo" className="w-auto h-32 mr-5" />
                    <Image src={logoBrand} alt="logo-brand" className="w-116" />
                </button>
                <button className="btn btn-primary text-white mt-5" onClick={handleClickNewMail}>
                    <Image src={write} alt="new_mail" className="w-16 h-auto" />
                    <span>New Message</span>
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
