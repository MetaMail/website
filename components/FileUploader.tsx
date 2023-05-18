import React, { useState } from 'react';
import Image from 'next/image';
import addAttach from 'assets/addAttach.svg';
import { uploadAttachment } from 'services/mail';
import { AttachmentRelatedTypeEn } from 'pages/mailbox/new/utils';
import { MetaMailTypeEn } from 'constants/interfaces';
import CryptoJS from 'crypto-js';
interface IFileUploader {
  draftID: string;
  metatype: number;
  onAttachment: (attachment: any) => void;
  showList: any[];
}
const FileUploader = (item: IFileUploader) => {
  const [files, setFiles] = useState<File[]>([]);
  const handleFinalFileUpload = (file: File, originFile: any) => {
    const reader = new FileReader();
    console.log(item.showList);
    let res;
    reader.onload = async () => {
      if (reader?.result) {
        const input = reader.result;
        const wordArray = CryptoJS.lib.WordArray.create(input as any);
        const sha256 = CryptoJS.SHA256(wordArray).toString();
        await handleUploadAttachment(originFile, file, sha256, AttachmentRelatedTypeEn.Outside);
      }
    };

    reader.readAsArrayBuffer(file);
    return res;
  };
  const handleUploadAttachment = async (
    file: any,
    attachment: Blob,
    sha256: string,
    related: AttachmentRelatedTypeEn,
    cid?: string
  ) => {
    try {
      //message.loading({
      //  content: `uploading ${file.name}...`,
      //  key: sha256,
      //  duration: 0,
      //});
      const form = new FormData();

      form.append('attachment', attachment);
      form.append('sha256', sha256);
      form.append('related', related);
      cid && form.append('cid', cid);

      const data = await uploadAttachment(item.draftID, form);
      const attachmentRes = data.attachment;

      if (attachmentRes) {
        item.onAttachment(attachmentRes);
        //message.success({ content: 'Uploaded', key: sha256 });
      }
    } catch {
      //message.error({ content: 'Upload failed', key: sha256 });
      // notification.error({
      //   message: 'Upload Failed',
      //   description: 'Sorry, attachment can not upload to the server.',
      // });
    }
  };
  const handleClickUpload = (e: any) => {
    const reader = new FileReader();
    const fileList = e.target.files;
    console.log(fileList);
    fileList?.length !== 0 &&
      Array.from(fileList).map((file: any) => {
        reader.readAsArrayBuffer(file);

        reader.onload = () => {
          if (reader?.result) {
            const input = reader.result;
            const fileProps = {
              type: file.type,
              lastModified: file.lastModified,
            };

            let finalFile = new File([new Blob([input])], file.name, {
              ...fileProps,
            });

            // 加密邮件才需要对附件进行加密
            if (item.metatype === MetaMailTypeEn.Encrypted) {
              const encrypted = CryptoJS.AES.encrypt(
                CryptoJS.lib.WordArray.create(input as any),
                currRandomBitsRef.current
              ).toString();

              const fileEncBlob = new Blob([encrypted]);

              finalFile = new File([fileEncBlob], file.name, {
                ...fileProps,
              });
            }

            handleFinalFileUpload(finalFile, file);
          }
        };
      });
  };
  const handleChange = (e: any) => {
    setFiles([...files, ...e.target.files]);
    console.log(files);
  };
  return (
    <div className="">
      <label className="">
        <input type="file" className="hidden" onChange={handleClickUpload} multiple />
        <Image src={addAttach} className="cursor-pointer h-full" alt="上传文件" />
      </label>
      {item.showList.map(attr => {
        return <div>{attr.filename}</div>;
      })}
    </div>
  );
};

export default FileUploader;
