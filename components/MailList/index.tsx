/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef, useContext, useCallback, memo } from 'react';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { useMailListStore, useMailDetailStore, useNewMailStore } from 'lib/zustand-store';
import { mergeAndUniqueArraysByKey, userLocalStorage } from 'lib/utils';
import { MarkTypeEn, MetaMailTypeEn, ReadStatusTypeEn, MailListItemType, FilterTypeEn } from 'lib/constants';
import { mailHttp, IMailChangeParams, IMailChangeOptions } from 'lib/http';
import MailBoxContext from 'context/mail';
import MailListItem from './components/MailListItem';
import LoadingRing from 'components/LoadingRing';
import Icon from 'components/Icon';
import { empty } from 'assets/icons';
import {
  arrowLeft,
  arrowRight,
  checkboxSvg, checkboxedSvg,
  trash, read, starred, removeStarred, markUnread, spam, filter as filterIcon, update
} from 'assets/icons';

const MailListFilters = ['All', 'Read', 'Unread', 'Plain', 'Encrypted'] as const;
type MailListFiltersType = (typeof MailListFilters)[number];

const MailList = () => {
  // 发送邮件成功，刷新列表
  const { isSendSuccess, setIsSendSuccess } = useNewMailStore();
  const { getMailStat } = useContext(MailBoxContext);
  const { filterType, pageIndex, list, setList, detailList, setDetailList, addPageIndex, subPageIndex } = useMailListStore();
  // isDetailExtend : 详情是否占满全屏
  // selectedMail : 选中查看详情的邮件
  const { selectedMail, isDetailExtend } = useMailDetailStore();
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(0);
  const [selectedAll, setSelectedAll] = useState(false);
  const [filter, setFilter] = useState<MailListFiltersType>();
  //------
  const prePageIndex = useRef(pageIndex);
  const preFilterType = useRef(filterType);
  const preIsSendSuccess = useRef(isSendSuccess);

  // -----
  const inputCheckBoxRef = useRef<HTMLInputElement>();

  const handleFilterChange = (currentFilter: MailListFiltersType) => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    if (filter === currentFilter) return;
    setFilter(currentFilter);
    switch (currentFilter) {
      case 'All':
        list.map(item => {
          item.selected = true;
        });
        setSelectedAll(true)
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
      case 'Plain':
        list.map(item => {
          item.selected = item.meta_type === MetaMailTypeEn.Plain;
        });
        break;
      case 'Encrypted':
        list.map(item => {
          item.selected = item.meta_type === MetaMailTypeEn.Encrypted;
        });
        break;
      default:
        break;
    }
    setList([...list]);
    setSelectedAll(list.length && list.every(item => item.selected));
  };

  const mailActions = [
    {
      title: 'Trash',
      src: trash,
      httpParams: { mark: MarkTypeEn.Trash },
    },
    // 在starred的时候，变成Remove star;别的时候都是starred
    {
      title: filterType === FilterTypeEn.Starred ? 'Remove star' : 'Star',
      src: filterType === FilterTypeEn.Starred ? removeStarred : starred,
      httpParams: { mark: filterType === FilterTypeEn.Starred ? MarkTypeEn.Normal : MarkTypeEn.Starred },
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

    // 如果在Delete列表里面删除，应该传4
    if (filterType === FilterTypeEn.Trash) {
      httpParams.mark = MarkTypeEn.Deleted;
    }
    try {
      await mailHttp.changeMailStatus(getSelectedMailsParams(), httpParams);
      await fetchMailList(false);
      if (httpParams.mark === MarkTypeEn.Spam || httpParams.read !== undefined) {
        getMailStat();
      }
    } catch (error) {
      console.error(error);
      toast.error('Operation failed, please try again later.', {
        position: 'top-center',
        autoClose: 2000
      });
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
        limit: 30,
      });

      const { mails, page_num } = data;
      let mailsList = mails as MailListItemType[];
      const ids: string[] = []
      mailsList.forEach(item => {
        ids.push(item.message_id)
        item.selected = false;
        item.local_id = item.message_id;
      });
      // 批量获取邮件详情
      if (filterType !== FilterTypeEn.Draft && ids.length) {
        const batchResult = await mailHttp.getMailDetailByIdArr({
          message_ids: ids
        })
        setDetailList(mergeAndUniqueArraysByKey(detailList, batchResult, 'message_id'));
      }

      setList(mailsList ?? []);
      setPageNum(page_num);
      // 发送邮件成功，刷新列表
      setIsSendSuccess(false)
    } catch (error) {
      console.error(error);
      toast.error('Fetch mail list failed, please try again later.', {
        position: 'top-center',
        autoClose: 2000
      });
    } finally {
      if (showLoading) setLoading(false);
    }
  };
  // 选中某一条邮件
  const handleSelectItem = (item: MailListItemType) => {
    // console.log('选中某一条邮件', filter, item.selected)
    if (filter && item.selected) {
      // 之前是选中状态，取消选中,之后把filter置空
      setFilter(null)
    }
    item.selected = !item.selected;

    setList([...list]);
    setSelectedAll(list.length && list.every(item => item.selected));

  };
  // 点击全选
  const handleSelectedAllChange = () => {
    list.map(item => {
      item.selected = !selectedAll;
    });
    setList([...list]);
    setSelectedAll(!selectedAll);
  };

  //  list
  useEffect(() => {
    // console.log('list改变')
    if (list.length) {
      const selectedListNum = getSelectedList().length;
      const isIndeterminate = selectedListNum > 0 && selectedListNum < list.length;
      inputCheckBoxRef.current.indeterminate = isIndeterminate;
      setSelectedAll(list.length && list.every(item => item.selected));
      isAllFilter()
    }
  }, [list]);

  // 遍历list后反填入filter
  const isAllFilter = () => {
    const selectList = list.filter(item => item.selected)
    // console.log('selectList', selectList, selectList.length, list.length)
    if (selectList.length === list.length) {
      setFilter('All')
    } else if (selectList.length > 0) {
      if (selectList.every(item => item.read === ReadStatusTypeEn.Read)) {
        setFilter('Read')
      }
      if (selectList.every(item => item.read === ReadStatusTypeEn.Unread)) {
        setFilter('Unread')
      }
      if (selectList.every(item => item.read === ReadStatusTypeEn.Unread)) {
        setFilter('Plain')
      }
      if (selectList.every(item => item.meta_type === MetaMailTypeEn.Encrypted)) {
        setFilter('Encrypted')
      }
    } else {
      setFilter(null)
    }
  }
  useEffect(() => {
    // 每隔 30 秒执行一次
    const intervalId = setInterval(() => fetchMailList(false), 20000);
    // 只有在第一页的时候定时器查询
    if (pageIndex > 0) {
      clearInterval(intervalId);
    }
    // 组件卸载时清除定时器
    return () => {
      clearInterval(intervalId);
    };
  }, [])
  // 左边slider点击，filterType改变的时候重新获取邮件列表
  useEffect(() => {
    // 检查前后依赖项的值是否相同
    if (list.length <= 0 || prePageIndex.current !== pageIndex || preFilterType.current !== filterType || preIsSendSuccess.current !== isSendSuccess) {

      if (userLocalStorage.getUserInfo()?.address && !loading) fetchMailList(true);
      setFilter(null)
      // 更新 prePageIndex 的值为当前依赖项的值
      prePageIndex.current = pageIndex;
      preFilterType.current = filterType;
      preIsSendSuccess.current = isSendSuccess;

    } else {
      // 前后依赖项的值相同，不执行逻辑
      console.log('都没改变', list, pageIndex, filterType, isSendSuccess);
    }
  }, [pageIndex, filterType, isSendSuccess]); // 在这里添加你的依赖项

  return (
    <div
      className={`flex flex-col h-full transition-all text-[14px]  overflow-y-scroll w-full`}>
      {
        list.length > 0 ? (<div className="sticky  top-0 bg-base-100 flex flex-row w-full justify-between px-16 box-border pt-12 pb-6 z-10 ">
          <div className="flex flex-row space-x-10 items-center" >
            {/* 全选按钮 */}
            <input
              type="checkbox"
              title="Select"
              ref={inputCheckBoxRef}
              checked={selectedAll}
              onChange={handleSelectedAllChange}
              className={`checkbox bg-no-repeat bg-cover checkbox-sm w-18 h-18 rounded-2 border-0 bg-transparent ${!selectedMail ? 'block' : 'hidden'}`}
              style={{ backgroundImage: `url(${selectedAll ? checkboxedSvg.src : checkboxSvg.src})` }}
            />

            <div className={`dropdown dropdown - bottom ${selectedMail ? 'invisible' : 'visible'} `}>
              {/* 筛选漏斗icon */}
              <label tabIndex={0} className="cursor-pointer flex items-center  gap-3">
                <Icon url={filterIcon} title="Filter" className="w-18 h-18" />
                <span className="text-[14px] h-16 leading-[18px] text-[#b2b2b2]">{filter}</span>
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
            <div className={`transition - all duration - 200 ease -in -out transform flex gap - 5 border-l - 2 border-[#EFEFEF] pl - 10 ${getSelectedList().length > 0 ? 'scale-100' : 'scale-0'} `}>
              {/* 筛选旁边的小icon */}
              {!selectedMail && mailActions.map((item, index) => {
                return (
                  <div key={index} className="box-border bg-opacity-0 rounded-10 hover:bg-opacity-60 p-4 hover:bg-[#EDF3FF]">
                    <Icon
                      title={item.title}
                      url={item.src}
                      key={index}
                      onClick={async () => {
                        await handleMailActionsClick(item.httpParams);
                      }}
                      className="w-18 h-18 self-center box-border bg-opacity-0 "
                    />
                  </div>
                );
              })}
            </div>
          </div>
          {/* 分页 */}
          <div className="flex items-center flex-row justify-end space-x-8  text-[#7F7F7F]">
            {/* <span className="text-md">total page: {pageNum}</span> */}
            <button
              disabled={pageIndex === 1}
              onClick={() => {
                if (pageIndex > 1) subPageIndex();
              }}>
              {/* 当是第一页 */}
              {pageIndex === 1 ? (<Icon url={arrowLeft} title="arrowLeft" className="w-16 h-16 opacity-100"></Icon>) : (<Icon url={arrowRight} title="arrowRight" className="w-20 h-20 rotate-180"></Icon>)}
            </button>

            <button
              disabled={pageIndex === pageNum}
              onClick={() => {
                if (pageIndex < pageNum) addPageIndex();
              }}>
              <Icon url={arrowRight} title="arrowRight" className="w-20 h-20"></Icon>
            </button>
            <Icon
              url={update}
              title="Refresh"
              onClick={() => {
                fetchMailList(true);
              }}
            />
          </div>
        </div>
        ) : ''
      }

      <div className="relative">
        {<LoadingRing loading={loading} />}
        <div className={`${loading ? `fadeOutAnimation` : 'fadeInAnimation'}  flex-col cursor-pointer ${selectedMail ? 'overflow-y-scroll' : 'overflow-y-visible'} flex - 1 relative   ${list.length ? 'justify-start' : 'justify-center'} `}>
          {list.length ? (<div className='listContainer'>
            {list.map(item => {
              return (
                <MailListItem
                  loading={loading}
                  key={`${item.message_id}${item.mailbox} `}
                  mail={item}
                  onSelect={() => {
                    handleSelectItem(item);
                  }}
                />
              )
            })
            }
          </div>)
            : (
              !loading && <Image src={empty} alt="No Mail" className="w-auto h-136 mt-[20%]" />
            )
          }
        </div>
      </div>
    </div >
  );
}
export default memo(MailList);