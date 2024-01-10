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
    <div className="flex items-center relative w-fit p-5 pr-9  bg-[#F5F5F6] dark:bg-[#B9B9B90A] rounded-t-[8px] cursor-pointer text-[#706F6F]">
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
        <div onClick={handleToggle}>
          <div className='flex items-center gap-8 '>
            {/* 头像 */}
            <JazziconGrid size={27} addr={showAddress} />

            <p className="w-[200px] overflow-x-hidden flex">

              <span className=' text-ellipsis flex-1 overflow-hidden'>{showAddress}</span>
              <span className='block'>{PostfixOfAddress}</span>
            </p>
            <Icon url={arrowDown} className={isOpen ? 'transform rotate-180 duration-75' : ''} />
          </div>
          {isOpen ? (
            <ul className='absolute w-[100%]  z-999 left-0  top-[37px] bg-[#F5F5F6] rounded-b-[8px]' onMouseEnter={handleHover} onMouseLeave={() => setIsHover(0)}>
              {MailFromType.address !== initValue ?
                (<li className='flex items-center gap-8 w-fit p-5 pr-9 hover:text-[#969696] ' onClick={() => handleOptionClick(MailFromType.address)}>
                  <JazziconGrid size={27} addr={address} className={`${isHover === 1 ? 'opacity-40' : ''}`} />
                  <p className="w-[200px] overflow-x-hidden flex">
                    <span className='text-ellipsis  flex-1 overflow-hidden'>{address}</span>
                    <span>{PostfixOfAddress}</span>
                  </p>
                </li>)
                :
                (
                  <li className='flex items-center gap-8 w-fit p-5 pr-9 hover:text-[#969696] ' onClick={() => handleOptionClick(MailFromType.ensName)}>
                    <JazziconGrid size={27} addr={ensName} className={`${isHover === 1 ? 'opacity-40' : ''}`} />
                    <p className="w-[200px] overflow-x-hidden flex">
                      <span className='w-[200px] text-ellipsis  flex-1 overflow-hidden'>{ensName}</span>
                      <span>{PostfixOfAddress}</span>{!isHover}
                    </p>
                  </li>
                )
              }
            </ul>
          ) : null}
        </div>
      ) : (
        <div className='flex items-center gap-8'>
          <JazziconGrid size={27} addr={showAddress} />
          <span className='break-all'>{address + PostfixOfAddress}</span>
        </div>
      )
      }
    </div >
  );
}
export default NameSelector;
