import React, { useState, useEffect, useContext } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { toast } from 'react-toastify';

import MailBoxContext from 'context/mail';
import { userLocalStorage, getShowAddress, percentTransform } from 'lib/utils';
import { PostfixOfAddress } from 'lib/base/request';
import { userHttp } from 'lib/http';

import copy from 'assets/mailbox/copy.svg';
import right from 'assets/mailbox/right.svg';
import { dropdownImg } from 'assets/icons';
export default function Titlebar() {
  const { logout } = useContext(MailBoxContext);
  const JazziconGrid = dynamic(() => import('components/JazziconAvatar'), { ssr: false });
  const [address, setAddress] = useState<string>();
  const [ensName, setEnsName] = useState<string>();
  const [emailSize, setEmailSize] = useState<number>();
  const [dropdownShow, setDropdownShow] = useState<boolean>(false)
  const [emailSizeLimit, setEmailSizeLimit] = useState<number>();

  const handleCopy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    toast.success('Copied to clipboard');
  };

  useEffect(() => {
    const { address, ensName } = userLocalStorage.getUserInfo() ?? {};
    if (!address) return logout();
    setAddress(address);
    setEnsName(ensName);
    userHttp
      .getUserProfile()
      .then(res => {
        setEmailSize(res.total_email_size / 1024 / 1024 / 1024);
        setEmailSizeLimit(res.total_email_size_limit / 1024 / 1024 / 1024);
      })
      .catch(error => {
        console.log(error);
        toast.error('Get user profile failed.');
      });
  }, []);
  return (
    <div className="navbar p-0 min-h-fit h-45">
      <div className="flex-1">
        <input type="text" placeholder="Search" className="input w-380 h-29 rounded-4 dark:!bg-[#353739]" />
      </div>
      <div className="flex-none gap-2">
        <div className="form-control"></div>
        <div className={`dropdown dropdown-end  dropdown-bottom`} onClick={() => { if (!dropdownShow) setDropdownShow(!dropdownShow) }} onBlur={() => { setDropdownShow(false) }}>
          <div className="flex justify-center items-center">
            <label tabIndex={0} className="btn btn-circle btn-sm p-0 avatar mr-18 flex-shrink-0  hover:border-5">
              <div className="w-28 h-28 rounded-full">
                <JazziconGrid size={28} addr={address} />
              </div>
            </label>
            <Image src={dropdownImg} alt='dropdown' title='dropdown' className={`w-16 h-16 ${dropdownShow ? 'transform rotate-180' : ''}`} />
          </div>
          <div
            tabIndex={0}
            className={`mt-3 z-[1] px-24 py-12 shadow menu menu-sm bg-base-100 rounded-box w-280 dropdown-content `}>
            <div className="text-[#93989A] flex flex-row items-center my-4">
              <p className="flex-1 flex mr-4 cursor-default" title={`${address}${PostfixOfAddress}`}>
                {getShowAddress(address)}
                {PostfixOfAddress}
              </p>
              <Image
                src={copy}
                alt="copy"
                title="copy"
                className="w-18 h-18 p-0 cursor-pointer"
                onClick={() => {
                  handleCopy(`${address}${PostfixOfAddress}`);
                }}
              />
            </div>
            {ensName && (
              <div className="text-[#93989A] flex flex-row items-center my-8">
                <span className="flex-1 omit mr-4 cursor-default">{ensName}</span>
                <Image
                  src={copy}
                  alt="copy"
                  title="copy"
                  className="w-18 h-18 p-0 cursor-pointer"
                  onClick={() => {
                    handleCopy(ensName);
                  }}
                />
              </div>
            )}

            <div className="divider my-4"></div>
            <div className="my-8">
              <p className="flex justify-between font-bold">
                <span>Mailbox capacity</span>
                <span>{percentTransform(emailSize / emailSizeLimit)}%</span>
              </p>
              <progress
                className="progress progress-primary w-222 mt-12"
                value={percentTransform(emailSize / emailSizeLimit)}
                max="100"></progress>
              <p className="flex justify-between font-bold text-sm my-4">
                <span>0</span>
                <span>{emailSizeLimit}GB</span>
              </p>
            </div>
            <div className="flex justify-between font-bold items-center my-12 cursor-pointer">
              <span>Setting</span>
              <Image src={right} alt="go" />
            </div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Change theme</span>
                <input
                  type="checkbox"
                  className="toggle"
                  data-toggle-theme="dark,light"
                  data-act-class="ACTIVECLASS"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
