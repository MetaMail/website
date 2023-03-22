import suneal from '@assets/suneal.svg';
import colin from '@assets/colin.png';
import fiveStar from '@assets/5star.png';
import Image from 'next/image';
import { StaticImageData } from 'next/image';
interface IReview {
  imgSrc: string | StaticImageData;
  content: string;
  role?: string;
  role2?: string;
}

function Review({ imgSrc, content, role, role2 }: IReview) {
  return (
    <div className="relative bg-white border border-[#1e1e1e] rounded-20 md:w-1/4 hover:scale-125 hover:z-20 transition-transform duration-500 font-poppins">
      <Image className="pt-20 pl-40 w-160" src={fiveStar} alt="fiveStar" />
      <div className="flex  text-ml px-16 py-10">{content ?? '-'}</div>
      <div className="flex space-x-7 pl-28 pr-10">
        <Image className="w-36 h-36 mt-5" src={imgSrc} alt="reviewer" />
        <p className="leading-snug text-[#979797]">
          {role}
          <br />
          {role2}
        </p>
      </div>
    </div>
  );
}

export default function ReviewInfo({}) {
  return (
    <div
      className="relative hidden lg:flex h-410 md:h-373 xl:h-343 flex-row w-11/12 xl:w-5/6 2xl:w-2/3 max-w-500 -top-200 mx-auto
        border border-[#1e1e1e] 
        bg-white
        rounded-28 py-75 justify-around z-10">
      <Review
        imgSrc={suneal}
        role={'Suneal'}
        role2={'dev @ WeChat'}
        content={'MetaMail is the most secure mail application with end-to-end encryption.'}
      />
      <Review
        imgSrc={suneal}
        role={'suneal'}
        role2={'dev @ WeChat'}
        content={'MetaMail is the most secure mail application with end-to-end encryption.'}
      />
      <Review
        imgSrc={colin}
        role={'colin'}
        role2={'dev @ scroll.io'}
        content={'MetaMail is an amazing product, web3 style, and it evolves cauti-ously'}
      />
    </div>
  );
}
