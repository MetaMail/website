import React, { useContext } from 'react';
import Image from 'next/image';
import CryptoJS from 'crypto-js';
import { throttle } from 'lodash';

import MailBoxContext from 'context/mail';
import { mailHttp, IUploadAttachmentResponse } from 'lib/http';
import { useNewMailStore } from 'lib/zustand-store';
import { AttachmentRelatedTypeEn } from 'lib/constants';
import { ArrayBufferToWordArray } from 'lib/utils';

import addAttach from 'assets/addAttach.svg';
interface IFileUploader {
    randomBits: string;
    onChange: () => void;
}
const FileUploader = ({ randomBits, onChange }: IFileUploader) => {
    const { checkEncryptable } = useContext(MailBoxContext);
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

    const handleSingleFileUpload = async (file: File, encryptable: boolean) => {
        const fileBuffer = await getFileArrayBuffer(file);
        if (!fileBuffer) return;
        const fileProps = {
            type: file.type,
            lastModified: file.lastModified,
        };
        let finalFile = file;

        // 加密邮件才需要对附件进行加密
        if (encryptable) {
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

        const { encryptable } = await checkEncryptable(selectedDraft.mail_to);

        const uploadResult = await Promise.all(
            Array.from(fileList).map((file: File) => handleSingleFileUpload(file, encryptable))
        );
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
                                attachment.sha256 = res.attachment.sha256;
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
