import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { PostfixOfAddress } from 'lib/base';
import { userSessionStorage } from 'lib/utils';

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
    const { ensName, address } = userSessionStorage.getUserInfo();
    const [showAddress, setShowAddress] = useState<string>(address);

    useEffect(() => {
        setShowAddress(initValue === MailFromType.address ? address : ensName);
    }, [initValue]);

    return (
        <div className="flex items-center gap-8">
            <JazziconGrid size={24} addr={showAddress} />
            {ensName ? (
                <select
                    className=""
                    onChange={e => {
                        onChange(Number(e.target.value as unknown as MailFromType));
                    }}>
                    <option value={MailFromType.address} selected={initValue === MailFromType.address}>
                        {address}
                        {PostfixOfAddress}
                    </option>
                    <option value={MailFromType.ensName} selected={initValue === MailFromType.ensName}>
                        {ensName}
                    </option>
                </select>
            ) : (
                <span>{address + PostfixOfAddress}</span>
            )}
        </div>
    );
}
export default NameSelector;
