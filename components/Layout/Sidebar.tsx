import React, {
  useEffect,
  useContext,
  useState
} from 'react';
import Image from 'next/image';

import MailBoxContext from 'context/mail';
import { useMailListStore, useThemeStore } from 'lib/zustand-store';
import { FilterTypeEn, MenusMap, IMenuItem } from 'lib/constants';

import logo from 'assets/logo.svg';
import write from 'assets/mailbox/write.svg';

// menu icons
import Inbox from 'components/svg/menu/Inbox'
import InboxActive from 'components/svg/menu/InboxActive'
import Send from 'components/svg/menu/Send';
import SendActive from 'components/svg/menu/SendActive'
import Draft from 'components/svg/menu/Draft';
import DraftActive from 'components/svg/menu/DraftActive'
import Starred from 'components/svg/menu/Starred';
import StarredActive from 'components/svg/menu/StarredActive'
import More from 'components/svg/menu/More';
import MoreActive from 'components/svg/menu/MoreActive'
import Deleted from 'components/svg/menu/Deleted';
import DeleteActive from 'components/svg/menu/DeleteActive'
import Spam from 'components/svg/menu/Spam';
import SpamActive from 'components/svg/menu/SpamActive';
import { dispatchEvent } from 'lib/utils';
function Sidebar() {
  const { isDark } = useThemeStore()
  useEffect(() => {
  }, [isDark])
  const { logout, getMailStat, createDraft } = useContext(MailBoxContext);
  const { filterType, setFilterType, resetPageIndex, unreadCount, spamCount } = useMailListStore();

  function handleChangeFilter(filter: FilterTypeEn) {
    // 如果不是Draft,隐藏编辑框？
    console.log('filter', filter, filterType, filterType === filter);
    setFilterType(filter);
    resetPageIndex();
    filterType === filter && dispatchEvent('refresh-list', { showLoading: true })
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
    return <p className="badge badge-sm rounded-2 btn-primary p-0 w-30 h-18 lh-18">
      <span className='text-[20px] scale-50 font-[400]'> {count > 99 ? '99+' : count}</span>
    </p>;
  };

  const [menus_Map, setMenusMap] = useState(MenusMap);
  function handleToggle(list: any[], index: number, key: string) {
    list[index][key] = !list[index][key];
    const newList = [...list]
    setMenusMap(newList)
  }
  const renderLogo = (logo: string, isActive: boolean) => {
    switch (logo) {
      case 'inbox':
        return isActive ? <InboxActive stroke={isDark ? '#fff' : '#3C6FF4'} /> : <Inbox stroke={isDark ? '#fff' : '#545454'} />
      // 如果有其他情况，可以在这里继续添加 case 分支
      case 'send':
        return isActive ? <SendActive stroke={isDark ? '#fff' : '#3C6FF4'} /> : <Send stroke={isDark ? '#fff' : '#545454'} />
      case 'draft':
        return isActive ? <DraftActive stroke={isDark ? '#fff' : '#3C6FF4'} /> : <Draft stroke={isDark ? '#fff' : '#545454'} />
      case 'starred':
        return isActive ? <StarredActive stroke={isDark ? '#fff' : '#3C6FF4'} /> : <Starred stroke={isDark ? '#fff' : '#545454'} />
      case 'more':
        return isActive ? <MoreActive fill={isDark ? '#fff' : '#3C6FF4'} /> : <More />
      case 'trash':
        return isActive ? <DeleteActive stroke={isDark ? '#fff' : '#3C6FF4'} /> : <Deleted stroke={isDark ? '#fff' : '#545454'} />
      case 'spam':
        return isActive ? <SpamActive fill={isDark ? '#fff' : '#3C6FF4'} /> : <Spam stroke={isDark ? '#fff' : '#545454'} />
      default:
        return null; // 或者返回适当的默认值
    }
  }

  const renderLi = (menus_Map: IMenuItem[]) => {
    return menus_Map.map((item, index) => {
      if (!item.children || item.children.length <= 0) {
        return (
          <li
            key={item.key}
            onClick={() => {
              handleChangeFilter(item.key);
            }}
            className='mb-2 text-[#545454]  dark:text-base-content'>
            <a className={`rounded-5 p-0 h-32 pl-12 pr-5 flex justify-between items-center  transition-colors duration-75  ${filterType === Number(item.key) ? "active rounded-4 " : 'hover:bg-base-300'}  dark:!bg-#E7E7E71A dark:hover:bg-[#E7E7E70F] dark:!bg-opacity-10 `}>
              <div className='flex items-center gap-x-9'>
                {renderLogo(item.logo, filterType === Number(item.key))}
                <span className={`inline-block ${filterType === Number(item.key) ? 'font-poppinsSemiBold' : ''} ${filterType === Number(item.key) ? isDark ? 'text-white' : 'text-primary' : ''}`}>{item.title}</span>
              </div>
              {renderBadge(item.key)}
            </a>
          </li >
        )
      } else {
        // dropdown
        return (
          <li key={item.key} >
            {/* More */}
            <div className={`rounded-5 flex items-center p-0 h-32 pl-12 pr-5  menu-dropdown-toggle menu-dropdown-show after:w-0 transition-colors duration-75 ${filterType === Number(item.key) && item.childrenShow ? 'active rounded-4' : 'hover:bg-base-300 dark:hover:bg-[#E7E7E70F] dark:!bg-opacity-10 '}`} onClick={() => handleToggle(menus_Map, index, 'childrenShow')}>
              <div className={`transition-all duration-200 ease-in-out transform ${item.childrenShow ? ' rotate-180  ' : 'rotate-0'}`}>{renderLogo(item.logo, filterType === Number(item.key))}</div>
              <span className='leading-[36px] text-[#54545499] dark:text-[#E9E9E9]'>{item.title}</span>
              {item.childrenShow}
            </div>
            <ul className={`ml-0 pl-0 before:w-0 menu-dropdown ${item.childrenShow ? 'menu-dropdown-show' : ''}`}>
              {renderLi(item.children)}
            </ul>
            {/* </details> */}
          </li >
        )
      }
    });
  };
  useEffect(() => {
    getMailStat();
    const getMailsStatInterval = setInterval(getMailStat, 60000);
    return () => {
      clearInterval(getMailsStatInterval);
    };
  }, []);

  return (
    <div className="w-203 px-12 flex flex-col justify-between font-poppins flex-shrink-0 text-[16px]">
      <div className="flex flex-col">
        <button className="flex items-center justify-center py-10">
          <Image src={logo} alt="logo" className="w-auto h-36 mr-3" />
          <p className="text-[27px] text-[#000] font-poppinsSemiBold  leading-[36px] h-36 dark:text-[#fff]">MetaMail</p>
        </button>
        <button className="btn-primary flex items-center justify-center text-white h-45 rounded-9 gap-9" onClick={handleClickNewMail}>
          <Image src={write} alt="new_mail" className="w-18 h-auto" />
          <span className='text-[16px] '>New Message</span>
        </button>
        <div>
          <ul className="menu px-4  py-9 text-[16px]">
            {renderLi(menus_Map)}
          </ul>
        </div>
      </div>
    </div>
  );
}
export default React.memo(Sidebar);
