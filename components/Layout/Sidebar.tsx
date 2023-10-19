import React, {
  useEffect,
  useContext,
  useState
} from 'react';
import Image from 'next/image';

import MailBoxContext from 'context/mail';
import { useMailListStore } from 'lib/zustand-store';
import { FilterTypeEn, MenusMap, IMenuItem } from 'lib/constants';

import { MetaMailSvg, WriteMailSvg } from 'components/svg';

import logoBrand from 'assets/MetaMail.svg';
import logo from 'assets/logo.svg';
import write from 'assets/mailbox/write.svg';
import { transform } from 'lodash';

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
    return <p className="badge badge-sm rounded-2 btn-primary p-0 w-26 h-16">
      <span className='text-[18px] scale-50'> {count > 99 ? '99+' : count}</span>
    </p>;
  };

  const [menus_Map, setMenusMap] = useState(MenusMap);
  function handleToggle(list: any[], index: number, key: string) {
    list[index][key] = !list[index][key];
    const newList = [...list]
    setMenusMap(newList)
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
            className='mb-2 '>
            <a className={`hover:bg-base-300 rounded-4 py-4   ${filterType === Number(item.key) ? 'active rounded-4 ' : ''}  dark:!bg-E7E7E7 dark:hover:!!bg-opacity-6 dark:!bg-opacity-10 `}>
              <Image src={filterType === Number(item.key) ? item.activeLogo : item?.logo} alt={item?.title} height="12.5" className="self-center stroke-width-100 fill-primary filter-primary" />
              <span>{item.title}</span>
              {renderBadge(item.key)}
            </a>
          </li>
        )
      } else {
        // dropdown
        return (
          <li key={item.key} >
            {/* <details open> */}
            <div className={`hover:bg-base-300 rounded-4 py-4 menu-dropdown-toggle menu-dropdown-show after:w-0 ${filterType === Number(item.key) && item.childrenShow ? 'active rounded-4' : ''}`} onClick={() => handleToggle(menus_Map, index, 'childrenShow')}>
              <Image src={item?.logo} alt={item?.title} height="12.5" className={`self-center stroke-width-100 fill-primary filter-primary ${item.childrenShow ? 'transform rotate-180 duration-75' : ''}`} />
              <span>{item.title}</span>
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
    <div className="w-200 px-10 flex flex-col justify-between font-poppins text-sm flex-shrink-0">
      <div className="flex flex-col">
        <button onClick={logout} className="flex h-45 items-center justify-center">
          <Image src={logo} alt="logo" className="w-auto h-32 mr-5" />
          {/* <Image src={logoBrand} alt="logo-brand" className="w-116" /> */}
          <span className="text-2xl font-bold">MetaMail</span>
        </button>
        <button className="btn btn-xs btn-primary text-white mt-10 h-40" onClick={handleClickNewMail}>
          <Image src={write} alt="new_mail" className="w-16 h-auto" />
          <span className='fz-500'>New Message</span>
        </button>
        <div>
          <ul className="menu px-4 py-8">
            {renderLi(menus_Map)}
          </ul>
        </div>
      </div>
    </div>
  );
}
