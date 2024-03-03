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
            // isExtend && (
            //   <div className="dark:text-[#fff] flex-col text-[16px] text-[#1F2937] w-full h-[120px] border-2 rounded-[8px] border-dashed leading-24 border-dashed border-[#9CA3AF55] flex justify-center items-center">
            //     <p className="font-poppinsSemiBold">Drop your files here or <span> browse </span></p>
            //     <p className="text-[#9CA3AF] leading-[20px] font-['Poppins'] mt-5">Maximum size: 20MB</p>
            //   </div>
            // )
          }
          {
            (
              <label className="flex justify-center items-center btn-primary px-14 py-8 rounded-[8px] cursor-pointer bg-lightGrayBg dark:bg-[#ddd4]" title='Attach file'>
                {/* <Image src={AddAttach} className="h-18" alt="上传文件" /> */}
                <AddAttach height={20} width={20} fill={isDark ? '#f6f6f6' : '#222'} />
                {/* <span className="ml-6 font-Poppins h-[18px] leading-[20px]">Attach</span> */}
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