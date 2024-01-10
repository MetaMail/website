import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { PostfixOfAddress } from 'lib/base';
import { userLocalStorage } from 'lib/utils';
import { useNewMailStore } from 'lib/zustand-store';
import { arrowDown } from 'assets/icons';
import Icon from 'components/Icon';

export enum MailFromType {
  address = 1,
  ensName = 2,
}

interface IProps {
  initValue?: MailFromType;
  onChange?: (value: MailFromType) => void;
}

function NameSelector({ initValue, onChange }: IProps) {
  const JazziconGrid = dynamic(() => import('components/JazziconAvatar'), { ssr: false });
  const { ensName, address } = userLocalStorage.getUserInfo();
  const [showAddress, setShowAddress] = useState<string>(address);
  useEffect(() => {
    setShowAddress(initValue === MailFromType.address ? address : ensName);
  }, [initValue]);
  const [isOpen, setIsOpen] = useState(false);
  const [isHover, setIsHover] = useState(0);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };
  const handleHover = () => {
    console.log('hover')
    setIsHover(1)
  }

  const handleOptionClick = (value: any) => {
    onChange(value);
    setShowAddress(value === MailFromType.address ? address : ensName);
    setIsOpen(false);
  };
  return (
    <div className="flex items-center relative w-fit   cursor-pointer text-[#706F6F] ">
      {ensName ? (
        // from 有可选项
        // <select
        //   className="omit "
        //   onChange={e => {
        //     onChange(Number(e.target.value as unknown as MailFromType));
        //   }}
        //   defaultValue={initValue}>
        //   <option value={MailFromType.address} className=''>
        //     {address}
        //     {PostfixOfAddress}
        //   </option>
        //   <option value={MailFromType.ensName}>
        //     {ensName}
        //     {PostfixOfAddress}
        //   </option>
        // </select>
        // 发件人选择框
        <div onClick={handleToggle} className={` dark:bg-[#1F1F1F]  ${isOpen ? 'rounded-t-[8px]' : 'rounded-[8px]'} overflow-hidden`}>
          <div className={`flex items-center  gap-8 p-5 pr-9  dark:bg-[#1F1F1F] bg-[#F5F5F6]`}>
            {/* 头像 */}
            <JazziconGrid size={27} addr={showAddress} />
            <p className="w-[200px] overflow-x-hidden flex dark:text-[#B9B9B9]">
              <span className=' text-ellipsis flex-1 overflow-hidden'>{showAddress}</span>
              <span className='block'>{PostfixOfAddress}</span>
            </p>
            <Icon url={arrowDown} className={isOpen ? 'transform rotate-180 duration-75' : ''} />
          </div>
          {isOpen ? (
            <div className=''>
              <ul className='absolute text-[#969696] hover:bg-[#B0B0B033] bg-[#F5F5F6] w-[100%] py-[2px]  z-999 left-0  top-[37px] dark:hover:bg-[#B0B0B01A] dark:bg-[#1F1F1F]  ' onMouseEnter={handleHover} onMouseLeave={() => setIsHover(0)}>
                {MailFromType.address !== initValue ?
                  (<li className='w-[100%] px-5 py-3  flex items-center gap-8 pr-9 hover:text-[##969696CC] dark:hover:text-[##969696CCCC] dark:text-[#B9B9B9]' onClick={() => handleOptionClick(MailFromType.address)}>
                    <JazziconGrid size={27} addr={address} className={`${isHover === 1 ? 'opacity-40' : ''}`} />
                    <p className="w-[200px] overflow-x-hidden flex">
                      <span className='text-ellipsis  flex-1 overflow-hidden'>{address}</span>
                      <span>{PostfixOfAddress}</span>
                    </p>
                  </li>)
                  :
                  (
                    <li className='w-[100%] px-5 py-3  flex items-center gap-8  pr-9 hover:text-[#969696CC] dark:hover:text-[#969696CC] dark:text-[#B9B9B9]' onClick={() => handleOptionClick(MailFromType.ensName)}>
                      <JazziconGrid size={27} addr={ensName} className={`${isHover === 1 ? 'opacity-40' : ''}`} />
                      <p className="w-[200px] overflow-x-hidden flex">
                        <span className='w-[200px] text-ellipsis  flex-1 overflow-hidden'>{ensName}</span>
                        <span>{PostfixOfAddress}</span>{!isHover}
                      </p>
                    </li>
                  )
                }
              </ul>
            </div>
          ) : null}
        </div>
      ) : (
        <div className='flex items-center gap-8 rounded-[8px] p-5 pr-9   bg-[#F5F5F6] dark:bg-[#1F1F1F]'>
          <JazziconGrid size={27} addr={showAddress} />
          <span className='break-all'>{address + PostfixOfAddress}</span>
        </div>
      )
      }
    </div >
  );
}
export default NameSelector;
