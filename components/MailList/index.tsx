import { useState, useEffect, useRef, useContext } from 'react';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { useMailListStore, useMailDetailStore } from 'lib/zustand-store';
import { userLocalStorage } from 'lib/utils';
import { MarkTypeEn, MetaMailTypeEn, ReadStatusTypeEn, MailListItemType } from 'lib/constants';
import { mailHttp, IMailChangeParams, IMailChangeOptions } from 'lib/http';
import MailBoxContext from 'context/mail';
import MailListItem from './components/MailListItem';
import LoadingRing from 'components/LoadingRing';
import Icon from 'components/Icon';
import { empty } from 'assets/icons';
import {
  checkboxSvg,
  checkboxedSvg, trash, read, starred, markUnread, spam, filter as filterIcon, update
} from 'assets/icons';

const MailListFilters = ['All', 'Read', 'Unread', 'Encrypted', 'UnEncrypted'] as const;
type MailListFiltersType = (typeof MailListFilters)[number];

export default function MailList() {
  const { getMailStat } = useContext(MailBoxContext);
  const { filterType, pageIndex, list, setList, addPageIndex, subPageIndex } = useMailListStore();
  const { selectedMail, isDetailExtend } = useMailDetailStore();

  const [loading, setLoading] = useState(false);

  const [pageNum, setPageNum] = useState(0);
  const [selectedAll, setSelectedAll] = useState(false);
  const [filter, setFilter] = useState<MailListFiltersType>(null);

  const inputCheckBoxRef = useRef<HTMLInputElement>();

  const handleFilterChange = (currentFilter: MailListFiltersType) => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    if (filter === currentFilter) return;
    setFilter(currentFilter);
  };

  const mailActions = [
    {
      title: 'Trash',
      src: trash,
      httpParams: { mark: MarkTypeEn.Trash },
    },
    {
      title: 'Star',
      src: starred,
      httpParams: { mark: MarkTypeEn.Starred },
    },
    {
      title: 'Spam',
      src: spam,
      httpParams: { mark: MarkTypeEn.Spam },
    },
    {
      title: 'Read',
      src: read,
      httpParams: { read: ReadStatusTypeEn.Read },
    },
    {
      title: 'Unread',
      src: markUnread,
      httpParams: { read: ReadStatusTypeEn.Unread },
    },
  ];

  const handleMailActionsClick = async (httpParams: IMailChangeOptions) => {
    try {
      await mailHttp.changeMailStatus(getSelectedMailsParams(), httpParams);
      await fetchMailList(false);
      if (httpParams.mark === MarkTypeEn.Spam || httpParams.read !== undefined) {
        getMailStat();
      }
    } catch (error) {
      console.error(error);
      toast.error('Operation failed, please try again later.');
    }
  };

  const getSelectedList = () => {
    return list.filter(item => item.selected);
  };

  const getSelectedMailsParams = () => {
    const res: IMailChangeParams[] = [];
    getSelectedList().forEach(item => {
      res.push({
        message_id: item.message_id,
        mailbox: item.mailbox,
      });
    });
    return res;
  };

  const fetchMailList = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await mailHttp.getMailList({
        filter: filterType,
        page_index: pageIndex,
        limit: 20,
      });

      const { mails, page_num } = data;
      const mailsList = mails as MailListItemType[];
      mailsList.forEach(item => {
        item.selected = false;
        item.local_id = item.message_id;
      });
      setList(mailsList ?? []);
      setPageNum(page_num);
    } catch (error) {
      console.error(error);
      toast.error('Fetch mail list failed, please try again later.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleSelectItem = (item: MailListItemType) => {
    item.selected = !item.selected;
    setList([...list]);
    setSelectedAll(list.length && list.every(item => item.selected));
  };

  const handleSelectedAllChange = () => {
    list.map(item => {
      item.selected = !selectedAll;
    });
    setList([...list]);
    setSelectedAll(!selectedAll);
  };

  useEffect(() => {
    const selectedListNum = getSelectedList().length;
    const isIndeterminate = selectedListNum > 0 && selectedListNum < list.length;
    inputCheckBoxRef.current.indeterminate = isIndeterminate;
    setSelectedAll(list.length && list.every(item => item.selected));
  }, [list]);

  useEffect(() => {
    if (userLocalStorage.getUserInfo()?.address) fetchMailList(true);
  }, [pageIndex, filterType]);

  useEffect(() => {
    switch (filter) {
      case 'All':
        list.map(item => {
          item.selected = true;
        });
        break;
      case null:
        list.map(item => {
          item.selected = false;
        });
        break;
      case 'Read':
        list.map(item => {
          item.selected = item.read === ReadStatusTypeEn.Read;
        });
        break;
      case 'Unread':
        list.map(item => {
          item.selected = item.read === ReadStatusTypeEn.Unread;
        });
        break;
      case 'Encrypted':
        list.map(item => {
          item.selected = item.meta_type === MetaMailTypeEn.Encrypted;
        });
        break;
      case 'UnEncrypted':
        list.map(item => {
          item.selected = item.meta_type === MetaMailTypeEn.Plain;
        });
        break;
      default:
        break;
    }
    setList([...list]);
    setSelectedAll(list.length && list.every(item => item.selected));
  }, [filter]);

  useEffect(() => {
    setFilter(null);
    const onRefresh: (e: Event) => Promise<void> = async event => {
      const e = event as CustomEvent;
      await fetchMailList(e.detail.showLoading);
    };

    window.addEventListener('refresh-list', onRefresh);
    return () => {
      window.removeEventListener('refresh-list', onRefresh);
    };
  }, [filterType]);

  return (
    <div
      className={`flex flex-col h-full transition-all ${!selectedMail ? 'flex-1 min-w-0' : isDetailExtend ? 'w-0 invisible' : 'w-300'
        }`}>
      <div className="flex flex-row w-full justify-between px-20 pb-7 pt-20">
        <div className="flex flex-row space-x-14 items-center">
          <input
            type="checkbox"
            title="Select"
            ref={inputCheckBoxRef}
            checked={selectedAll}
            onChange={handleSelectedAllChange}
            className={`checkbox checkbox-sm w-12 h-12 rounded-2 border-0 ${selectedAll ? 'checked:bg-transparent' : ''}`}
            style={{ backgroundImage: `url(${selectedAll ? checkboxedSvg.src : checkboxSvg.src})` }}
          />
          <Icon
            url={update}
            title="Refresh"
            className="w-12 h-12"
            onClick={() => {
              fetchMailList(true);
            }}
          />
          <div className={`dropdown dropdown-bottom ${isDetailExtend ? 'invisible' : ''}`}>
            <label tabIndex={0} className="cursor-pointer flex items-center">
              <Icon url={filterIcon} title="Filter" className="w-12 h-12" />
              <span className="text-[10px] text-[#707070]">{filter}</span>
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-130">
              {MailListFilters.map((item, index) => {
                return (
                  <li
                    onClick={() => {
                      handleFilterChange(item);
                    }}
                    key={index}>
                    <a>{item}</a>
                  </li>
                );
              })}
            </ul>
          </div>

          {getSelectedList().length > 0 && (
            <div className="flex gap-9 pl-10 border-l-2 border-[#EFEFEF]">
              {mailActions.map((item, index) => {
                return (
                  <div className="box-border bg-opacity-0 rounded-10 hover:bg-opacity-60 p-4 hover:bg-[#EDF3FF]">
                    <Icon
                      title={item.title}
                      url={item.src}
                      key={index}
                      onClick={async () => {
                        await handleMailActionsClick(item.httpParams);
                      }}
                      className="w-12 h-12 self-center box-border bg-opacity-0 "
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center flex-row justify-end space-x-20 text-xl text-[#7F7F7F]">
          <span className="text-md">total page: {pageNum}</span>
          <button
            disabled={pageIndex === 1}
            className="w-20 disabled:opacity-40"
            onClick={() => {
              if (pageIndex > 1) subPageIndex();
            }}>
            {'<'}
          </button>
          <button
            className="w-20 disabled:opacity-40"
            disabled={pageIndex === pageNum}
            onClick={() => {
              if (pageIndex < pageNum) addPageIndex();
            }}>
            {'>'}
          </button>
        </div>
      </div>

      <div className={`flex flex-col overflow-y-auto  overflow-x-hidden flex-1 relative ${list.length ? 'justify-start' : 'justify-center'}`}>
        {loading && <LoadingRing />}
        {list.length ? (
          list.map((item, index) => {
            return (
              <MailListItem
                key={`${item.message_id}${item.mailbox}`}
                mail={item}
                onSelect={() => {
                  handleSelectItem(item);
                }}
              />
            );
          })
        ) : (
          // <div className="text-center pt-24">{'<No Mail>'}</div>
          <Image src={empty} alt="No Mail" className="w-auto h-136" />
        )}
      </div>
    </div>
  );
}