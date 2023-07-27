import React, { useState } from 'react';
import { toast } from 'react-toastify';

import { IPersonItem } from 'lib/constants/interfaces';
import Icon from 'components/Icon';
import { add, cancel } from 'assets/icons';

interface EmailRecipientInputProps {
    receivers: IPersonItem[];
    onAddReceiver: (address: string) => void;
    onRemoveReceiver: (email: string) => void;
}

const EmailRecipientInput: React.FC<EmailRecipientInputProps> = ({ receivers, onAddReceiver, onRemoveReceiver }) => {
    const [emailInput, setEmailInput] = useState<string>('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmailInput(e.target.value);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            addRecipient();
        }
    };

    const addRecipient = () => {
        if (emailInput && validateEmail(emailInput)) {
            onAddReceiver(emailInput);
            setEmailInput('');
        } else {
            toast.error('Invalid Email Address.');
        }
    };

    const removeRecipient = (email: string) => {
        onRemoveReceiver(email);
    };

    const validateEmail = (email: string) => {
        const re =
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };

    return (
        <div className="flex h-40 text-[#878787] items-center gap-10">
            <input
                type="email"
                placeholder="Add Receipients"
                value={emailInput}
                onChange={handleChange}
                onKeyDown={handleKeyPress}
                className="focus:outline-none "
            />
            <button onClick={addRecipient}>
                <Icon url={add} title="add receivers" className="w-20 h-20" />
            </button>
            {receivers && receivers.length > 0 ? <div>Recipients:</div> : null}
            <ul>
                {receivers.map((email, index) => (
                    <li key={index} className="flex">
                        <div
                            className="w-100 omit px-6 py-2 bg-[#4f4f4f0a] rounded-8 cursor-pointer"
                            title={email.address}>
                            {email.address}
                        </div>
                        <button onClick={() => removeRecipient(email.address)}>
                            <Icon url={cancel} title="cancel" className="w-20 h-20" />
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default EmailRecipientInput;
