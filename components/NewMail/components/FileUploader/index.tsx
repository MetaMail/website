import React from 'react';
import Image from 'next/image';
import CryptoJS from 'crypto-js';
import { throttle } from 'lodash';

import { mailHttp, IUploadAttachmentResponse } from 'lib/http';
import { useNewMailStore } from 'lib/zustand-store';
import { AttachmentRelatedTypeEn } from 'lib/constants';
import { ArrayBufferToWordArray } from 'lib/utils';
import { encryptMailAttachment } from 'lib/encrypt';

import addAttach from 'assets/addAttach.svg';
interface IFileUploader {
    randomBits: string;
    onChange: () => void;
}
const FileUploader = ({ randomBits, onChange }: IFileUploader) => {
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

    const handleClickUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = e.target.files;
        if (!fileList || !fileList.length) return;

        const uploadResult = await Promise.all(Array.from(fileList).map((file: File) => handleSingleFileUpload(file)));
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
        <>
            <label className="flex justify-center items-center bg-[#ddd] px-14 py-8 rounded-[8px] cursor-pointer">
                <input type="file" className="hidden" onChange={handleClickUpload} multiple />
                <Image src={addAttach} className="h-full" alt="上传文件" />
                <span className="ml-6">Attach</span>
            </label>
        </>
    );
};

export default FileUploader;
