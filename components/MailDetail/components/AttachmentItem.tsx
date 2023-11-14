import { toast } from 'react-toastify';
import { convertWordArrayToUint8Array, fileType } from 'lib/utils';
import { decryptMailAttachment } from 'lib/encrypt';
import Image from 'next/image';
type AttachmentItemProps = {
  url: string;
  name: string;
  idx: number;
  randomBits: string;
};

export default function AttachmentItem({ url, name, idx, randomBits }: AttachmentItemProps) {
  function fileTypeSvg(type?: any) {
    try {
      return <Image src={require(`assets/file/${type}.svg`)} alt={type} width={20} height={24} />
    } catch (err) {
      return <Image src={require(`assets/file/DEFAULT.svg`)} alt={type} width={20} height={24} />
    }
  }
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
    <div className='gap-10'>
      <div onClick={handleClick} className="mb-20 mr-10 flex text-[#878787] text-[14px] px-12 py-12 bg-[#F4F4F466] dark:bg-[#DCDCDC26] rounded-4 cursor-pointer  items-center gap-8">
        {/* <div>{name ?? `attachment${idx}`}</div> */}
        {fileTypeSvg(fileType(name).toLocaleUpperCase())}
        {name ?? `attachment${idx}`}
      </div>
    </div>
  );
}
