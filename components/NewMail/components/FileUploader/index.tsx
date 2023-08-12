import React, { useState } from 'react';
import Image from 'next/image';
import CryptoJS from 'crypto-js';

import { mailHttp } from 'lib/http';
import { useNewMailStore } from 'lib/zustand-store';
import { MetaMailTypeEn, AttachmentRelatedTypeEn } from 'lib/constants';
import { ArrayBufferToWordArray } from 'lib/utils';
import Icon from 'components/Icon';
import { cancel } from 'assets/icons';
import addAttach from 'assets/addAttach.svg';
interface IFileUploader {
    randomBits: string;
}
const FileUploader = ({ randomBits }: IFileUploader) => {
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

    const handleSingleFileUpload = async (file: File) => {
        const fileBuffer = await getFileArrayBuffer(file);
        if (!fileBuffer) return;
        const fileProps = {
            type: file.type,
            lastModified: file.lastModified,
        };
        let finalFile = new File([new Blob([fileBuffer])], file.name, { ...fileProps });

        // 加密邮件才需要对附件进行加密
        if (selectedDraft.meta_type === MetaMailTypeEn.Encrypted) {
            const encrypted = CryptoJS.AES.encrypt(ArrayBufferToWordArray(fileBuffer), randomBits).toString();
            finalFile = new File([new Blob([encrypted])], file.name, { ...fileProps });
        }

        const wordArray = CryptoJS.lib.WordArray.create((await getFileArrayBuffer(finalFile)) as any);
        const sha256 = CryptoJS.SHA256(wordArray).toString();

        const form = new FormData();
        form.append('attachment', finalFile);
        form.append('sha256', sha256);
        form.append('related', AttachmentRelatedTypeEn.Outside);
        form.append('mail_id', window.btoa(selectedDraft.message_id));
        // cid && form.append('cid', cid);
        return mailHttp.uploadAttachment(form);
    };

    const handleClickUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = e.target.files;
        if (!fileList || !fileList.length) return;

        const result = await Promise.all(Array.from(fileList).map((file: File) => handleSingleFileUpload(file)));
        const newAttachments = result.map(res => res.attachment);
        setSelectedDraft({ ...selectedDraft, attachments: [...selectedDraft.attachments, ...newAttachments] });
    };

    const removeAttachment = (index: number) => {
        const newAttachments = [...selectedDraft.attachments];
        newAttachments.splice(index, 1);
        setSelectedDraft({ ...selectedDraft, attachments: newAttachments });
    };

    return (
        <>
            <label className="flex justify-center items-center bg-[#ddd] px-14 py-8 rounded-[8px] cursor-pointer">
                <input type="file" className="hidden" onChange={handleClickUpload} multiple />
                <Image src={addAttach} className="h-full" alt="上传文件" />
                <span className="ml-6">Attach</span>
            </label>
            {selectedDraft.attachments?.map((attr, index) => (
                <li key={index} className="flex">
                    <div
                        className="px-6 py-2 bg-[#4f4f4f0a] rounded-8 cursor-pointer flex items-center gap-8"
                        title={attr.filename}>
                        <span className="w-120 omit">{attr.filename}</span>
                    </div>
                    <button onClick={() => removeAttachment(index)}>
                        <Icon url={cancel} title="cancel" className="w-20 h-20" />
                    </button>
                </li>
            ))}
        </>
    );
};

export default FileUploader;
