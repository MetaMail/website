import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'react-toastify';
import { debounce } from 'lodash';

import { IPersonItem } from 'lib/constants/interfaces';
import { mailHttp } from 'lib/http';
import Icon from 'components/Icon';
import { addSquare, addSquareDark, close, addDark } from 'assets/icons';
import { useNewMailStore, useIsInputShow } from 'lib/zustand-store';

interface EmailRecipientInputProps {
  receivers: IPersonItem[];
  onAddReceiver: (address: string) => void;
  onRemoveReceiver: (email: string) => void;
  isDark: boolean;
}

const EmailRecipientInput: React.FC<EmailRecipientInputProps> = ({ isDark, receivers, onAddReceiver, onRemoveReceiver }) => {
  const JazziconGrid = dynamic(() => import('components/JazziconAvatar'), { ssr: false });

  const inputRef = useRef<HTMLInputElement>();
  useEffect(() => {
    // 在组件挂载后，将焦点设置到 input 元素
    inputRef.current?.focus();
  }, []); // 空依赖数组表示只在组件挂载时执行
  const [suggestedReceivers, setSuggestedReceivers] = useState<string[]>([]);
  const { selectedDraft, setSelectedDraft } = useNewMailStore();
  const { isInputShow, setIsInputShow } = useIsInputShow();

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
      // 回车要做去重
      if (!selectedDraft.mail_to.find((item: { address: string }) => { return item.address === emailInput })) {
        inputRef.current.value = '';
        onAddReceiver(emailInput);
      }
    } else {
      toast.error('Invalid Email Address.', {
        autoClose: 2000
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
      setIsInputShow(false)
    }, 200);
  };
  const handleClickAdd = () => {
    setIsInputShow(true);
    setTimeout(() => {
      inputRef.current?.focus()
    }, 200)
  }
  return (
    <div className="text-[#878787] items-center relative">

      <ul className='flex gap-x-18 gap-y-6 flex-wrap'>
        <li className='flex gap-y-14'>
          {/* 添加收件人 */}
          <input
            type="email"
            placeholder="Add Receipients"
            onChange={debounce(handleChange, 200)}
            onKeyDown={handleKeyPress}
            className={`dark:bg-[unset] dark:text-[#fff] h-35 pl-0 box-border py-0 input focus:h-35 px-0 placeholder:text-[14px] text-[14px] text-[#000] ${isInputShow ? 'block' : 'hidden'}`}
            onBlur={handleInputBlur}
            ref={inputRef}
            autoFocus
          />
          <button onClick={handleClickAdd}  >
            {   /* 添加收件人 */}
            <Icon url={isDark ? addSquareDark : addSquare} className="w-35 h-35 dark:bg-unset  rounded-[5px]" />
          </button>
        </li>
        {receivers.map((email, index) => (
          <li key={index} className="flex">
            <div
              className="p-5 bg-[#4F4F4F0A] dark:bg-[#DCDCDC26] rounded-9 cursor-pointer flex items-center gap-8"
              title={email.address}>
              <JazziconGrid size={27} addr={email.address} />
              <span className="w-120 omit">{email.address}</span>
              <button onClick={() => removeRecipient(email.address)} className='pr-[5px]'>
                <Icon url={close} title="cancel" className="w-20 h-20" />
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
