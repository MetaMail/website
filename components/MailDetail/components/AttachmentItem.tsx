import { toast } from 'react-toastify';
import { convertWordArrayToUint8Array } from 'lib/utils';
import { decryptMailAttachment } from 'lib/encrypt';

type AttachmentItemProps = {
    url: string;
    name: string;
    idx: number;
    randomBits: string;
};

export default function AttachmentItem({ url, name, idx, randomBits }: AttachmentItemProps) {
    const handleClick = async () => {
        if (!url) return;
        if (!randomBits) return window.open(url);

        try {
            const response = await fetch(url);
            const encryptedFileData = await response.text();
            const decryptedFileData = decryptMailAttachment(encryptedFileData, randomBits);
            const typedArrayData = convertWordArrayToUint8Array(decryptedFileData);
            const fileDec = new Blob([typedArrayData]);
            const a = document.createElement('a');
            const tmpUrl = window.URL.createObjectURL(fileDec);
            a.href = tmpUrl;
            a.download = name;
            a.click();
            window.URL.revokeObjectURL(tmpUrl);
        } catch (error) {
            console.error(error);
            toast.error('Download failed.');
        }
    };
    return (
        <div onClick={handleClick} className="cursor-pointer">
            <div>{name ?? `attachment${idx}`}</div>
        </div>
    );
}
