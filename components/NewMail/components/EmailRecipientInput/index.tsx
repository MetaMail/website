import React, { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'react-toastify';
import { debounce } from 'lodash';

import { IPersonItem } from 'lib/constants/interfaces';
import { mailHttp } from 'lib/http';
import Icon from 'components/Icon';
import { add, cancel } from 'assets/icons';

interface EmailRecipientInputProps {
  receivers: IPersonItem[];
  onAddReceiver: (address: string) => void;
  onRemoveReceiver: (email: string) => void;
}

const EmailRecipientInput: React.FC<EmailRecipientInputProps> = ({ receivers, onAddReceiver, onRemoveReceiver }) => {
  const JazziconGrid = dynamic(() => import('components/JazziconAvatar'), { ssr: false });

  const inputRef = useRef<HTMLInputElement>();

  const [suggestedReceivers, setSuggestedReceivers] = useState<string[]>([]);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const currentValue = e.target.value;
    if (!currentValue) {
      setSuggestedReceivers([]);
      return;
    }
    const { suggestions } = await mailHttp.getSuggestedReceivers({
      prefix: currentValue,
    });
    setSuggestedReceivers(suggestions);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addRecipient();
    }
  };

  const addRecipient = () => {
    const emailInput = inputRef.current.value;
    if (emailInput && validateEmail(emailInput)) {
      onAddReceiver(emailInput);
      inputRef.current.value = '';
    } else {
      toast.error('Invalid Email Address.', {
        autoClose: 90000
      });
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

  const handleAddSuggestedReceivers = (email: string) => {
    inputRef.current.value = email;
    addRecipient();
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      if (inputRef.current.value) {
        setSuggestedReceivers([]);
      }
    }, 200);
  };

  return (
    <div className="flex h-40 text-[#878787] items-center relative">
      <input
        type="email"
        placeholder="Add Receipients"
        onChange={debounce(handleChange, 200)}
        onKeyDown={handleKeyPress}
        className="input input-ghost h-40 focus:h-36 px-0 placeholder:text-sm"
        onBlur={handleInputBlur}
        ref={inputRef}
      />
      <button onClick={addRecipient}>
        {/* 添加收件人 */}
        <Icon url={add} title="add receivers" className="w-23 h-23" />
      </button>
      <ul className='flex gap-10 '>
        {receivers.map((email, index) => (
          <li key={index} className="flex">
            <div
              className="p-4 bg-[#4f4f4f0a] dark:bg-[#DCDCDC26] rounded-8 cursor-pointer flex items-center gap-8"
              title={email.address}>
              <JazziconGrid size={24} addr={email.address} />
              <span className="w-120 omit">{email.address}</span>
            </div>
            <button onClick={() => removeRecipient(email.address)}>
              <Icon url={cancel} title="cancel" className="w-20 h-20" />
            </button>
          </li>
        ))}
      </ul>
      {suggestedReceivers.length > 0 && (
        <div className="absolute w-560 rounded-[4px] border border-[#ccc] bg-[#fff] top-40 left-0 z-[999]">
          <ul>
            {
              // TODO: 检索命中的字符串需要高亮
            }
            {suggestedReceivers.map((email, index) => (
              <li
                key={index}
                className="h-40 leading-[40px] cursor-pointer hover:bg-[#ccc] px-10"
                onClick={() => {
                  handleAddSuggestedReceivers(email);
                  setSuggestedReceivers([]);
                }}>
                {email}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default EmailRecipientInput;
