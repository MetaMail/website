import { useState } from 'react';

import { PostfixOfAddress } from 'lib/base';
import { userSessionStorage } from 'lib/utils';

import Icon from 'components/Icon';
import { swapAddr } from 'assets/icons';

export enum MailFromType {
    address = 1,
    ensName = 2,
}

interface IProps {
    initValue?: MailFromType;
    onChange?: (value: MailFromType) => void;
}

function NameSelector({ initValue, onChange }: IProps) {
    const { ensName, address } = userSessionStorage.getUserInfo();

    return (
        <div className="">
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
