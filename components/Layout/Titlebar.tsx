import React, { useState, useEffect, useContext } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { toast } from 'react-toastify';

import MailBoxContext from 'context/mail';
import { userLocalStorage, getShowAddress, percentTransform } from 'lib/utils';
import { PostfixOfAddress } from 'lib/base/request';
import { userHttp } from 'lib/http';

import copy from 'assets/mailbox/copy.svg';
import copyDark from 'assets/mailbox/copyDark.svg'
import right from 'assets/mailbox/right.svg';
import { dropdownImg, searchNormal } from 'assets/icons';
export default function Titlebar() {
  const { logout } = useContext(MailBoxContext);
  const JazziconGrid = dynamic(() => import('components/JazziconAvatar'), { ssr: false });
  const [address, setAddress] = useState<string>();
  const [ensName, setEnsName] = useState<string>();
  const [emailSize, setEmailSize] = useState<number>();
  const [emailSizeLimit, setEmailSizeLimit] = useState<number>();
  const [dropdownShow, setDropdownShow] = useState<boolean>(false)
  const [theme, setTheme] = useState<string>();
  const handleCopy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    toast.success('Copied to clipboard');
  };

  useEffect(() => {
    const { address, ensName } = userLocalStorage.getUserInfo() ?? {};
    const localTheme = userLocalStorage.getTheme() || 'light'
    if (!address) return logout();
    setAddress(address);
    setEnsName(ensName);
    setTheme(localTheme)
    userHttp
      .getUserProfile()
      .then(res => {
        setEmailSize(res.total_email_size / 1024 / 1024 / 1024);
        setEmailSizeLimit(res.total_email_size_limit / 1024 / 1024 / 1024);
      })
      .catch(error => {
        console.log(error);
        toast.error('Get user profile failed.', {
          autoClose: 2000
        });
      });
  }, []);
  useEffect(() => {
    document.querySelector('html').setAttribute('data-theme', theme);
  }, [theme])
  // 点击切换主题
  const toggleTheme = (e: React.MouseEvent) => {
    // console.log('点击切换主题')
    e.stopPropagation()
    const changeToTheme = theme == 'dark' ? 'light' : 'dark';
    setTheme(changeToTheme);
    userLocalStorage.setTheme(changeToTheme)
    // setDropdownShow(false)
  };
  const handleMouseEnter = () => {
    // console.log('鼠标进入')
    setDropdownShow(true)
  }
  const handleMouseLeave = () => {
    // console.log('鼠标离开')
    setDropdownShow(false)
  }


  return (
    <div className="navbar p-0 min-h-fit h-[50px] box-border py-[10px] flex items-center">
      {/* header-left 左边搜索框 */}
      <div className="flex-1">
        {/* 这版先隐藏 */}
        {/* <div className='rounded-4 bg-white dark:!bg-[#353739] flex  pl-7 items-center'>
          <Image src={searchNormal} alt='search' title='search' className={`w-14 h-14`} />
          <input type="text" className="input w-405 h-32 rounded-5 pl-7 text-[14px] dark:!bg-[#353739]" />
        </div> */}
      </div>
      <div className="flex-none gap-2 text-[14px] ">
        <div className="form-control"></div>
        <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className={`dropdown dropdown-end  dropdown-bottom  w-100  dropdown-hover`} onClick={() => setDropdownShow(!dropdownShow)}>
          <label tabIndex={0} className="rounded-7 border-0 flex w-full justify-between items-center h-38 p-0 avatar mr-18 flex-shrink-0 bg-[#DCDCDC26] pl-9 pr-16   box-border">
            <div className="w-31 h-31 rounded-full  hover:border-5 flex items-center">
              {/* 头像 */}
              <JazziconGrid size={31} addr={address} />
            </div>
            <Image src={dropdownImg} alt='dropdown' title='dropdown' className={`w-18 h-18  transition-all duration-300 ease-in-out transform ${dropdownShow ? 'transform rotate-180' : 'rotate-0'}`} />
          </label>
          {/* */}
          <div
            tabIndex={0}
            className={`${dropdownShow ? 'scale-100' : 'scale-0'}   transition-all duration-300 ease-in-out transform   mt-3 z-[1] px-[34px] py-[28px] shadow menu menu-sm bg-base-100 rounded-box w-280 dropdown-content `}>
            <div className={`text-[#93989A] flex flex-row items-center `}>
              <p className="flex-1 leading-none flex mr-4 cursor-default dark:text-[#fff] text-[14px] " title={`${address}${PostfixOfAddress}`}>
                <span className='max-w-[184px] text-ellipsis flex-1 overflow-hidden'>{getShowAddress(address)}</span>
                {PostfixOfAddress}
              </p>
              <Image
                src={theme == 'light' ? copy : copyDark}
                alt="copy"
                title="copy"
                className="w-18 h-18 p-0 cursor-pointer"
                onMouseDown={() => {
                  handleCopy(`${address}${PostfixOfAddress}`);
                }}
              />

            </div>
            {ensName && (
              <div className="text-[#93989A] flex flex-row items-center mt-[10px]">
                <span className="flex-1 leading-none dark:text-[#fff] omit mr-4 cursor-default max-w-[184px] text-ellipsis overflow-hidden text-[14px]">{ensName}{PostfixOfAddress}</span>
                <Image
                  src={theme == 'light' ? copy : copyDark}
                  alt="copy"
                  title="copy"
                  className="w-18 h-18 p-0 cursor-pointer"
                  onClick={() => {
                    handleCopy(`${ensName}${PostfixOfAddress}`);
                  }}
                />
              </div>
            )}

            {/* <div className="divider my-4"></div> */}
            <div className="my-[8px] mt-[26px] text-[16px]">
              <p className="flex justify-between font-bold text-[14px] leading-none">
                <span>Mailbox capacity</span>
                <span>{percentTransform((emailSize < 0.1 ? 0 : emailSize) / emailSizeLimit)}%</span>
              </p>
              <progress
                className="progress progress-primary w-[100%] mt-[12px]"
                value={percentTransform(emailSize / emailSizeLimit)}
                max="100"></progress>
              <p className="flex justify-between text-[12px] my-[4px] leading-none">
                <span>0</span>
                <span>{emailSizeLimit}GB</span>
              </p>
            </div>
            {/* 这版先隐藏 */}
            {/* <div className="flex justify-between font-bold items-center my-12 cursor-pointer">
              <span>Setting</span>
              <Image src={right} alt="go" />
            </div> */}
            <div className="form-control">
              <label className="label cursor-pointer px-0" >
                <span className="label-text font-bold text-[14px] leading-none">Dark mode</span>
                <input
                  type="checkbox"
                  className={`toggle checked:bg-[#fff]`}
                  onClick={toggleTheme}
                  onChange={() => { }}
                  checked={theme == 'dark'}

                />
              </label>
            </div>
          </div>
        </div >
      </div>
    </div >
  );
}