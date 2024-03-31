import { toast } from 'react-toastify';
import { convertWordArrayToUint8Array, fileType, originFileName } from 'lib/utils';
import { decryptMailAttachment } from 'lib/encrypt';
import Image from 'next/image';
import { downloadFile } from 'assets/icons/index'
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
      toast.error('Download failed.', {
        position: 'top-center',
        autoClose: 2000
      });
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
    <div className='relative  cursor-pointer' onClick={handleClick}>
      <div className="absolute transition-all duration-200 opacity-0 hover:opacity-100 w-full h-full hover:bg-[rgba(0,0,0,0.55)]  rounded-15 flex justify-center items-center">
        <Image src={downloadFile} alt="" className='w-30 h-30 ' />
      </div>
      <div title={name} className=" flex text-lightMailContent dark:text-DarkMailContent text-[14px] px-12 py-12  bg-[#DCDCDC33] dark:bg-[#DCDCDC33] rounded-15 cursor-pointer  items-center gap-8">
        {fileTypeSvg(fileType(name).toLocaleUpperCase())}
        <div className='flex items-center '><p className="max-w-[150px] truncate">{originFileName(name ?? `attachment${idx}`)}</p><span>.{fileType((name ?? `attachment${idx}`))}</span></div>
      </div>
    </div>
  );
}
