import { useState, useEffect } from 'react';

import { useMailListStore, useMailDetailStore, useNewMailStore, useUtilsStore } from 'lib/zustand-store';
import { userSessionStorage, mailSessionStorage } from 'lib/utils';
import { FilterTypeEn, IMailContentItem, MarkTypeEn, MetaMailTypeEn, ReadStatusTypeEn } from 'lib/constants';
import { mailHttp, IMailChangeParams } from 'lib/http';
import MailListItem from './components/MailListItem';
import Icon from 'components/Icon';

import { checkbox, trash, read, starred, markUnread, temp1, spam, filter, update, cancelSelected } from 'assets/icons';

export default function MailList() {
    const {
        filterType,
        setFilterType,
        pageIndex,
        addPageIndex,
        subPageIndex,
        setUnreadInboxCount,
        setUnreadSpamCount,
    } = useMailListStore();
    const { setDetailFromList, setDetailFromNew, setIsMailDetail, detailFromNew } = useMailDetailStore();
    const { setIsWriting } = useNewMailStore();
    const { removeAllState } = useUtilsStore();

    const [loading, setLoading] = useState(false);
    const [list, setList] = useState<IMailContentItem[]>([]);
    const [pageNum, setPageNum] = useState(0);
    const [selectList, setSelectList] = useState<IMailContentItem[]>([]);
    const [isAll, setIsAll] = useState(false);
    const [isFilterHidden, setIsFilterHidden] = useState(true);

    const sixList = [
        {
            src: trash,
            handler: async () => {
                await mailHttp.changeMailStatus(getMails(), MarkTypeEn.Trash, undefined);
                await fetchMailList(false);
            },
        },
        {
            src: starred,
            handler: async () => {
                await mailHttp.changeMailStatus(getMails(), MarkTypeEn.Starred, undefined);
                await fetchMailList(false);
            },
        },
        {
            src: spam,
            handler: async () => {
                await mailHttp.changeMailStatus(getMails(), MarkTypeEn.Spam, undefined);
                await fetchMailList(false);
            },
        },
        {
            src: read,
            handler: async () => {
                await mailHttp.changeMailStatus(getMails(), undefined, ReadStatusTypeEn.read);
                await fetchMailList(false);
            },
        },
        {
            src: markUnread,
            handler: async () => {
                await mailHttp.changeMailStatus(getMails(), undefined, ReadStatusTypeEn.unread);
                await fetchMailList(false);
            },
        },
    ];

    const fourFilter = [
        { content: 'All', filter: FilterTypeEn.Inbox },
        { content: 'Read', filter: FilterTypeEn.Read },
        { content: 'Unread', filter: FilterTypeEn.Unread },
        { content: 'Encrypted', filter: FilterTypeEn.Encrypted },
    ];

    const getMails = () => {
        const res: IMailChangeParams[] = [];
        selectList?.forEach(item => {
            res.push({
                message_id: item.message_id,
                mailbox: item.mailbox,
            });
        });
        return res;
    };

    const handleBlur = () => {
        setIsFilterHidden(true);
    };

    const handleFocus = () => {
        setIsFilterHidden(false);
    };

    const fetchMailList = async (showLoading = true) => {
        if (showLoading) {
            setLoading(true);
        }
        try {
            const mailListStorage = mailSessionStorage.getMailListInfo();
            console.log(mailListStorage);
            const isMailListStorageExist =
                mailListStorage?.data?.page_index === pageIndex && mailListStorage?.filter === filterType;
            if (isMailListStorageExist && showLoading) {
                //showLoading=true的时候相同的邮件列表已经改变了，需要重新取
                console.log('mailliststoragecunle');
                setList(mailListStorage?.data?.mails ?? []); //用缓存更新状态组件
                setPageNum(mailListStorage?.data?.page_num);
                setUnreadInboxCount(mailListStorage.data?.unread ?? 0);
            } else {
                ////////不是缓存 重新取
                mailSessionStorage.clearMailListInfo();
                console.log('meiyoulisthuancun');
                const data = await mailHttp.getMailList({
                    filter: filterType,
                    page_index: pageIndex,
                    limit: 20,
                });

                const { mails, page_num, unread } = data;
                setList(mails ?? []);
                setPageNum(page_num);
                setUnreadInboxCount(unread ?? 0);
                const mailListStorage = {
                    //设置邮件列表缓存
                    data: data,
                    filter: filterType,
                };
                mailSessionStorage.setMailListInfo(mailListStorage);
            }
        } catch (e) {
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        if (userSessionStorage.getUserInfo()?.address) fetchMailList(true);
        //getMailDetail();  预加载feature abort
    }, [pageIndex, filterType]);

    useEffect(() => {
        if (userSessionStorage.getUserInfo()?.address) fetchMailList(false);
        //getMailDetail();  预加载feature abort
    }, [detailFromNew]);

    const handleChangeSelectList = (item: IMailContentItem, isSelect?: boolean) => {
        if (isSelect) {
            const nextList = selectList.slice();
            nextList.push(item);
            setSelectList(nextList);
        } else {
            const nextList = selectList.filter(i => i.message_id !== item.message_id && i.mailbox !== item.mailbox);
            setSelectList(nextList);
        }
    };

    const handleChangeMailStatus = async (
        inputMails?: IMailChangeParams[],
        mark?: MarkTypeEn,
        read?: ReadStatusTypeEn
    ) => {
        const mails = inputMails ?? getMails();
        try {
            await mailHttp.changeMailStatus(mails, mark, read);
        } catch (e) {
        } finally {
            fetchMailList(false);
        }
    };

    const handleClickMail = async (
        //id: string,
        //type: MetaMailTypeEn,
        //mailbox: MailBoxTypeEn,
        //read: number,
        item: IMailContentItem
    ) => {
        userSessionStorage.setRandomBits(''); // clear random bits
        if (!read) {
            const mails = [{ message_id: item?.message_id, mailbox: Number(item.mailbox) }];
            await mailHttp.changeMailStatus(mails, undefined, ReadStatusTypeEn.read);
        }
        fetchMailList(false);
        if (filterType === FilterTypeEn.Draft) {
            setDetailFromNew(item);
            setIsWriting(true);
        } else {
            setDetailFromList(item);
            setIsMailDetail(true);
        }
    };
    return (
        <div className="flex flex-col flex-1 min-w-0">
            <div className="flex flex-row w-full justify-between p-13 py-7">
                <div className="flex flex-row space-x-12 pt-4">
                    <Icon ///////////最初设计稿的提示
                        url={checkbox}
                        checkedUrl={cancelSelected}
                        onClick={(res: boolean) => {
                            setSelectList(res ? list?.map(item => item) : []);
                            setIsAll(res);
                        }}
                        select={isAll}
                    />
                    <Icon ///////////最初设计稿的提示
                        url={update}
                        onClick={() => {
                            removeAllState();
                            mailSessionStorage.clearMailListInfo();
                            //deleteStorage('mailDetailStorage');
                            fetchMailList(true);
                        }}
                    />
                    <div className="dropdown inline-relative" tabIndex={0} onBlur={handleBlur} onFocus={handleFocus}>
                        <Icon ///////////最初设计稿的提示
                            url={filter}
                        />
                        <ul
                            className={
                                isFilterHidden
                                    ? 'hidden'
                                    : 'flex z-[2] menu absolute mt-6 shadow bg-base-100 rounded-5 '
                            }>
                            {fourFilter.map((item, index) => {
                                return (
                                    <li
                                        onClick={() => {
                                            setFilterType(Number(item.filter));
                                        }}
                                        key={index}>
                                        <a className="px-12 py-4 text-xs modal-bg">{item.content}</a>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                    <div className="h-14 flex gap-10">
                        {selectList.length
                            ? sixList.map((item, index) => {
                                  return (
                                      <Icon
                                          url={item.src}
                                          key={index}
                                          onClick={item.handler}
                                          className="w-13 h-auto self-center"
                                      />
                                  );
                              })
                            : null}
                    </div>
                </div>

                <div className="flex flex-row justify-end space-x-20 text-xl text-[#7F7F7F]">
                    <button
                        disabled={pageIndex === 1}
                        className="w-24 disabled:opacity-40"
                        onClick={() => {
                            if (pageIndex > 1) subPageIndex();
                        }}>
                        {'<'}
                    </button>
                    {/*<span className='text-sm pt-3'>{pageIdx ?? '-'} /{pageNum ?? '-'}</span>//////显示邮件的数量*/}
                    <button
                        className="w-24 disabled:opacity-40"
                        disabled={pageIndex === pageNum}
                        onClick={() => {
                            if (pageIndex < pageNum) addPageIndex();
                        }}>
                        {'>'}
                    </button>
                </div>
            </div>

            <div className="flex flex-col overflow-auto flex-1 h-0 pl-8 relative">
                {loading ? (
                    <div className="flex justify-center align-center m-auto radial-progress animate-spin text-[#006AD4]" />
                ) : (
                    list.map((item, index) => {
                        return (
                            <button
                                key={index}
                                className={`text-left ${
                                    selectList.findIndex(
                                        i => i.message_id === item.message_id && i.mailbox === item.mailbox
                                    ) >= 0
                                        ? ''
                                        : 'select-bg'
                                }`}>
                                <MailListItem
                                    mark={item?.mark}
                                    from={item.mail_from}
                                    subject={item.subject}
                                    date={item.mail_date}
                                    metaType={item.meta_type as MetaMailTypeEn}
                                    isRead={
                                        item.read == ReadStatusTypeEn.read //||
                                        //sessionStorage.getItem(item?.message_id) !== null
                                    } // message_id as primary key
                                    abstract={item?.digest}
                                    onClick={() => {
                                        //sessionStorage.setItem(item?.message_id, item?.message_id); // set read in sessionstorage for update without fetching maillist

                                        handleClickMail(item);
                                    }}
                                    select={
                                        selectList.findIndex(
                                            i => i.message_id === item.message_id && i.mailbox === item.mailbox
                                        ) >= 0
                                    }
                                    onFavorite={(isSelect: boolean) => {
                                        handleChangeMailStatus(
                                            [
                                                {
                                                    message_id: item?.message_id,
                                                    mailbox: item?.mailbox,
                                                },
                                            ],
                                            isSelect ? MarkTypeEn.Starred : MarkTypeEn.Normal
                                        );
                                    }}
                                    onSelect={isSelect => {
                                        handleChangeSelectList(item, isSelect);
                                    }}
                                    onDelete={() => {
                                        handleChangeMailStatus(
                                            [
                                                {
                                                    message_id: item?.message_id,
                                                    mailbox: item?.mailbox,
                                                },
                                            ]
                                            // item?.mailbox === 3 ? MarkTypeEn.Deleted : MarkTypeEn.Trash
                                        );
                                    }}
                                    onUnread={() => {
                                        handleChangeMailStatus(
                                            [
                                                {
                                                    message_id: item?.message_id,
                                                    mailbox: item?.mailbox,
                                                },
                                            ],
                                            undefined,
                                            ReadStatusTypeEn.unread
                                        );
                                    }}
                                />
                            </button>
                            //</Link>
                        );
                    })
                )}
            </div>
        </div>
    );
}