import CryptoJS from 'crypto-js';
import { useRef } from 'react';
import { convertWordArrayToUint8Array } from 'lib/utils';

export default function AttachmentItem({
    url,
    name,
    idx,
    randomBits,
}: {
    url: string;
    name: string;
    idx: number;
    randomBits: string;
}) {
    const key = url;
    const decrypting = useRef(false);

    const handleClick = () => {
        if (!url) return;
        if (!randomBits) return window.open(url);
        if (decrypting.current) return;
        decrypting.current = true;
        //message.loading({ content: 'Decrypting...', key });
        fetch(url)
            .then(response => response.text())
            .then(text => {
                const decrypted = CryptoJS.AES.decrypt(text, randomBits); // Decryption: I: Base64 encoded string (OpenSSL-format) -> O: WordArray
                const typedArray = convertWordArrayToUint8Array(decrypted); // Convert: WordArray -> typed array
                const fileDec = new Blob([typedArray]); // Create blob from typed array
                const a = document.createElement('a');
                const tmpUrl = window.URL.createObjectURL(fileDec);
                a.href = tmpUrl;
                a.download = name;
                a.click();
                window.URL.revokeObjectURL(tmpUrl);
                //message.success({ content: 'Decrypted', key, duration: 2 });
            })
            .catch(err => {
                console.log(err);
                //message.error({ content: 'Decrypt failed', key, duration: 2 });
            })
            .finally(() => (decrypting.current = false));
    };
    return (
        <div onClick={handleClick}>
            <div>{name ?? `attachment${idx}`}</div>
        </div>
    );
}
