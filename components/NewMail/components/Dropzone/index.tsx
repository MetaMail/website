/*
 * @Author: your name
 * @Date: 2023-11-03 16:07:51
 * @LastEditTime: 2023-11-03 18:11:27
 * @LastEditors: 韦玮莹
 * @Description: In User Settings Edit
 * @FilePath: \website\components\NewMail\components\Dropzone\index.tsx
 */
import Image from 'next/image';
import React, { useState } from 'react';
import Dropzone from 'react-dropzone';
import addAttach from 'assets/addAttach.svg';
interface IDropzone {
  onChange: (fileList: File[]) => void;
  isExtend: boolean
}
const UploadComponent = ({ onChange, isExtend }: IDropzone) => {
  const [files, setFiles] = useState([]);

  const handleDrop = (acceptedFiles: File[]) => {
    console.log('event', [...acceptedFiles])
    onChange([...acceptedFiles])
    // setFiles([...files, ...acceptedFiles]);
  };

  return (
    <Dropzone onDrop={handleDrop} >
      {({ getRootProps, getInputProps }) => (
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          {
            isExtend && (
              <div className='mb-30 flex-col text-[16px] text-[#1F2937] font-semibold w-full h-[120px] border-dashed leading-24 border-[#E5E7EB] border-2 flex justify-center items-center'>
                <p>Drop your files here or <span> browse </span></p>
                <p className='text-sm text-[#9CA3AF] leading-[20px] mt-5'>Maximum size: 50MB</p>
              </div>
            )
          }
          {
            !isExtend && (
              <label className="flex justify-center items-center bg-[#ddd] px-14 py-8 rounded-[8px] text-sm  cursor-pointer">
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