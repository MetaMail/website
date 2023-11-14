import React, { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'react-toastify';
import { debounce } from 'lodash';

import { IPersonItem } from 'lib/constants/interfaces';
import { mailHttp } from 'lib/http';
import Icon from 'components/Icon';
import { add, cancel, addDark } from 'assets/icons';

interface EmailRecipientInputProps {
  receivers: IPersonItem[];
  onAddReceiver: (address: string) => void;
  onRemoveReceiver: (email: string) => void;
  isDark: boolean
}

const EmailRecipientInput: React.FC<EmailRecipientInputProps> = ({ isDark, receivers, onAddReceiver, onRemoveReceiver }) => {
  const JazziconGrid = dynamic(() => import('components/JazziconAvatar'), { ssr: false });

  const inputRef = useRef<HTMLInputElement>();
  const [isInputShow, setIsInputShow] = useState(false)
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
        addRecipient()
        setSuggestedReceivers([]);
      }
    }, 200);
  };

  return (
    <div className="text-[#878787] items-center relative">

      <ul className='flex gap-10 flex-wrap'>
        <li className='flex'>
          {/* 添加收件人 */}
          <input
            type="email"
            placeholder="Add Receipients"
            onChange={debounce(handleChange, 200)}
            onKeyDown={handleKeyPress}
            className={`dark:bg-[unset] dark:text-[#fff] h-25 pl-0 py-5 box-border input focus:h-36 px-0 placeholder:text-[14px] text-[14px] text-[#000] ${isInputShow ? 'block' : 'hidden'}`}
            onBlur={handleInputBlur}
            ref={inputRef}
          />
          <button onClick={() => setIsInputShow(true)}>
            {/* 添加收件人 */}
            <Icon url={isDark ? addDark : add} title="add receivers" className="w-26 h-26" />
          </button>
        </li>
        {receivers.map((email, index) => (
          <li key={index} className="flex">
            <div
              className="p-5 bg-[#4f4f4f0a] dark:bg-[#DCDCDC26] rounded-9 cursor-pointer flex items-center gap-8"
              title={email.address}>
              <JazziconGrid size={27} addr={email.address} />
              <span className="w-120 omit">{email.address}</span>
              <button onClick={() => removeRecipient(email.address)}>
                <Icon url={cancel} title="cancel" className="w-14 h-14" />
              </button>
            </div>

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
