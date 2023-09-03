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

        let fileDec: Blob;
        try {
            const response = await fetch(url);
            const originData = await response.arrayBuffer();
            if (!randomBits) {
                // we download plain file in this way to specify file name
                fileDec = new Blob([originData]);
            } else {
                const decryptedFileData = decryptMailAttachment(originData, randomBits);
                const typedArrayData = convertWordArrayToUint8Array(decryptedFileData);
                fileDec = new Blob([typedArrayData]);
            }
        } catch (error) {
            console.error(error);
            toast.error('Download failed.');
            return;
        }

        const a = document.createElement('a');
        document.body.appendChild(a); // Firefox requires the link to be in the body
        const tmpUrl = window.URL.createObjectURL(fileDec);
        a.href = tmpUrl;
        a.download = name;
        a.click();
        window.URL.revokeObjectURL(tmpUrl);
        a.remove();
    };
    return (
        <div onClick={handleClick} className="cursor-pointer">
            <div>{name ?? `attachment${idx}`}</div>
        </div>
    );
}
