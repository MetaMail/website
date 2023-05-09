import { add, cancel } from '@assets/icons';
import React, { useState } from 'react';
import Image from 'next/image';
import { IPersonItem } from '@constants/interfaces';

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
      alert('Invalid Email Address!');
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
    <div className="flex pl-38 mt-12 h-21 w-full text-sm text-[#878787] ">
      <input
        type="email"
        placeholder="Add Receipients"
        value={emailInput}
        onChange={handleChange}
        onKeyDown={handleKeyPress}
        className="focus:outline-none "
      />
      <button onClick={addRecipient}>
        <Image src={add} alt="add receivers" />
      </button>
      {receivers && receivers.length > 0 ? <div>Receipients:</div> : null}
      <ul>
        {receivers.map((email, index) => (
          <li key={index} className="flex">
            <div>{email.address}</div>
            <button onClick={() => removeRecipient(email.address)}>
              <Image src={cancel} alt="cancel" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EmailRecipientInput;
