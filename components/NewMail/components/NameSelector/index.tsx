import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { PostfixOfAddress } from 'lib/base';
import { userLocalStorage } from 'lib/utils';

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

  return (
    <div className="flex items-center gap-9 w-fit p-5 pr-9  bg-[#0700200A] dark:bg-[#DCDCDC26] rounded-8 cursor-pointer text-[#706F6F]">
      {/* 头像 */}
      <JazziconGrid size={27} addr={showAddress} />
      {ensName ? (
        <select
          className="omit max-w-[90%]"
          onChange={e => {
            onChange(Number(e.target.value as unknown as MailFromType));
          }}
          defaultValue={initValue}>
          <option value={MailFromType.address}>
            {address}
            {PostfixOfAddress}
          </option>
          <option value={MailFromType.ensName}>
            {ensName}
            {PostfixOfAddress}
          </option>
        </select>
      ) : (
        <span className='break-all'>{address + PostfixOfAddress}</span>
      )}
    </div>
  );
}
export default NameSelector;
