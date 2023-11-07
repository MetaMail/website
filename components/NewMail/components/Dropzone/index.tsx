/*
 * @Author: your name
 * @Date: 2023-11-03 16:07:51
 * @LastEditTime: 2023-11-07 15:27:15
 * @LastEditors: 韦玮莹
 * @Description: In User Settings Edit
 * @FilePath: \website\components\NewMail\components\Dropzone\index.tsx
 */
import Image from 'next/image';
import React, { ReactNode } from 'react';
import Dropzone from 'react-dropzone';
import addAttach from 'assets/addAttach.svg';
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

  return (
    <Dropzone onDrop={handleDrop} >
      {({ getRootProps, getInputProps }) => (
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          {
            isExtend && (
              <div className='mb-20 flex-col text-[16px] text-[#1F2937] font-semibold w-full h-[120px] border-dashed leading-24 border-[#E5E7EB] border-2 flex justify-center items-center'>
                <p>Drop your files here or <span> browse </span></p>
                <p className='text-[#9CA3AF] leading-[20px] mt-5'>Maximum size: 50MB</p>
              </div>
            )
          }
          {
            !isExtend && (
              <label className="flex justify-center items-center bg-[#ddd] px-14 py-8 rounded-[8px]  cursor-pointer">
                <Image src={addAttach} className="h-18" alt="上传文件" />
                <span className="ml-6">Attach</span>
              </label>
            )
          }
        </div>
      )}
    </Dropzone>
  );
};

export default UploadComponent;