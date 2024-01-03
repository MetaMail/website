import React from 'react';

import CryptoJS from 'crypto-js';
import { throttle } from 'lodash';
import { toast } from 'react-toastify';
import MyDropzone from '../Dropzone';
import { mailHttp, IUploadAttachmentResponse } from 'lib/http';
import { useNewMailStore } from 'lib/zustand-store';
import { AttachmentRelatedTypeEn } from 'lib/constants';
import { ArrayBufferToWordArray } from 'lib/utils';
import { encryptMailAttachment } from 'lib/encrypt';



const Max_File_Size = 20 * 1024 * 1024; // 20MB
interface IFileUploader {
  isExtend: boolean; // true-拖拽上传；false-点击上传
  randomBits: string;
  onChange: () => void;
  onCheckDraft: () => Promise<void>;
}
const FileUploader = ({ randomBits, onChange, onCheckDraft, isExtend }: IFileUploader) => {
  const { selectedDraft, setSelectedDraft } = useNewMailStore();

  const getFileArrayBuffer = (file: File) => {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const input = reader?.result;
        if (!input) reject(new Error("Can't read file"));
        resolve(input as ArrayBuffer);
      };
      reader.readAsArrayBuffer(file);
      reader.onerror = reject;
    });
  };
  // 上传单个文件
  const handleSingleFileUpload = async (file: File) => {
    const fileBuffer = await getFileArrayBuffer(file);
    if (!fileBuffer) return;
    const fileProps = {
      type: file.type,
      lastModified: file.lastModified,
    };
    let finalFile = file;

    // 同时把原始附件的哈希传给后端，用于后续发邮件签名是直接用原始附件的哈希，就不用前端先下载解密再计算哈希了
    const pureSha256 = CryptoJS.SHA256(CryptoJS.lib.WordArray.create(fileBuffer as any)).toString();
    // draft阶段 附件都是需要加密的
    const encrypted = encryptMailAttachment(ArrayBufferToWordArray(fileBuffer), randomBits);
    finalFile = new File([new Blob([encrypted])], file.name, { ...fileProps });

    const wordArray = CryptoJS.lib.WordArray.create((await getFileArrayBuffer(finalFile)) as any);
    const encryptSha256 = CryptoJS.SHA256(wordArray).toString();

    const form = new FormData();
    form.append('attachment', finalFile);
    form.append('encrypted_sha256', encryptSha256);
    form.append('plain_sha256', pureSha256);
    form.append('related', AttachmentRelatedTypeEn.Outside);
    form.append('mail_id', window.btoa(selectedDraft.message_id));
    // cid && form.append('cid', cid);

    const cancelableUpload = mailHttp.uploadAttachment(
      form,
      throttle(processEvent => {
        console.log(file.name, processEvent);
        useNewMailStore.setState(oldValue => ({
          selectedDraft: {
            ...oldValue.selectedDraft,
            attachments: [
              ...oldValue.selectedDraft.attachments.map(attachment => {
                if (attachment?.cancelableUpload?.id === cancelableUpload.id) {
                  attachment.uploadProcess = parseFloat(processEvent.progress.toFixed(2));
                }
                return attachment;
              }),
            ],
          },
        }));
      }, 500)
    );

    return { cancelableUpload, file };
  };

  const checkFilesSize = (files: FileList) => {
    return Array.from(files).every(file => file.size <= Max_File_Size);
  };

  // 点击上传获得原始files
  const handleClickUpload = async (fileList: FileList) => {
    // console.log('e', e)
    // const fileList = e.target.files;
    console.log('fileList', fileList)
    if (!fileList || !fileList.length) return;
    const isFilesSizeValid = checkFilesSize(fileList);
    if (!isFilesSizeValid) {
      return toast.error('Single attachment size should be less than 20MB.', {
        autoClose: 2000
      });
    }
    await onCheckDraft();
    const uploadResult = await Promise.all(Array.from(fileList).map((file: File) => handleSingleFileUpload(file)));
    // e.target.value = null; // ensure same file can be uploaded again
    const attachmentsWithoutAttachmentId = uploadResult.map(result => {
      return {
        filename: result.file.name,
        uploadProcess: 0,
        cancelableUpload: result.cancelableUpload,
      };
    });
    setSelectedDraft({
      ...selectedDraft,
      attachments: [...selectedDraft.attachments, ...attachmentsWithoutAttachmentId],
    });

    uploadResult.forEach(item => {
      item.cancelableUpload.waitComplete<IUploadAttachmentResponse>().then(res => {
        // get attachment id and update then
        useNewMailStore.setState(oldValue => ({
          selectedDraft: {
            ...oldValue.selectedDraft,
            attachments: oldValue.selectedDraft.attachments.map(attachment => {
              if (item.cancelableUpload?.id === attachment.cancelableUpload?.id) {
                attachment.attachment_id = res.attachment_id;
                attachment.encrypted_sha256 = res.attachment.encrypted_sha256;
                attachment.plain_sha256 = res.attachment.plain_sha256;
              }
              return attachment;
            }),
          },
        }));
      });
    });
    onChange();
  };


  return (
    <MyDropzone
      onChange={handleClickUpload}
      isExtend={isExtend}
    >
    </MyDropzone>
  )

};

export default FileUploader;
