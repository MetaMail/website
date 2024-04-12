/*
 * @Author: your name
 * @Date: 2023-11-03 16:07:51
 * @LastEditTime: 2024-02-24 14:14:41
 * @LastEditors: 韦玮莹
 * @Description: In User Settings Edit
 * @FilePath: \website\components\NewMail\components\Dropzone\index.tsx
 */
import Image from 'next/image';
import React, { ReactNode } from 'react';
import Dropzone from 'react-dropzone';
import AddAttach from 'components/svg/AddAttach';
import { useThemeStore } from 'lib/zustand-store';
export * from './'

interface IDropzone {
  children: ReactNode;
  onChange: any;
  isExtend: boolean
}
const UploadComponent = ({ onChange, isExtend }: IDropzone) => {
  const handleDrop = (acceptedFiles: any[]) => {
    // console.log('event', [...acceptedFiles])
    onChange([...acceptedFiles])
  };
  const { isDark } = useThemeStore()

  return (
    <Dropzone onDrop={handleDrop} >
      {({ getRootProps, getInputProps }) => (
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          {
            (
              <label className="flex justify-center items-center btn-primary px-14 py-8 rounded-[8px] cursor-pointer bg-lightGrayBg dark:bg-[#ddd4]" title='Attach file'>
                <AddAttach height={20} width={20} fill={isDark ? '#f6f6f6' : '#222'} />
              </label>
            )
          }
        </div>
      )
      }
    </Dropzone >
  );
};

export default UploadComponent;