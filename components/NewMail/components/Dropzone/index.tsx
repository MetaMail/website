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
            isExtend && (
              <div className="dark:text-[#fff] mb-20 flex-col text-[16px] text-[#1F2937] font-['PoppinsBold'] font-[600] w-full h-[120px] border-2 border-dashed leading-24 border-dashed-[#E5E7EB]  flex justify-center items-center">
                <p>Drop your files here or <span> browse </span></p>
                <p className='text-[#9CA3AF] leading-[20px] mt-5'>Maximum size: 50MB</p>
              </div>
            )
          }
          {
            !isExtend && (
              <label className="flex justify-center items-center btn-primary px-14 py-8 rounded-[8px]  cursor-pointer dark:bg-[#ddd4]">
                {/* <Image src={AddAttach} className="h-18" alt="上传文件" /> */}
                <AddAttach height={18} width={18} fill={isDark ? '#fff' : '#fff'} />
                <span className="ml-6 font-Poppins h-[18px] leading-[20px]">Attach</span>
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