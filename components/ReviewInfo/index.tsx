import Image, { StaticImageData } from 'next/image';
import suneal from 'assets/suneal.svg';
import mvs from 'assets/mvs.jpg';
import colin from 'assets/colin.png';
import fiveStar from 'assets/5star.png';
import Carousel from '../Carousel';
interface IReview {
  imgSrc: string | StaticImageData;
  content: string;
  role?: string;
  role2?: string;
}

function Review({ imgSrc, content, role, role2 }: IReview) {
  return (
    <div className="relative bg-white border border-[#1e1e1e] rounded-20 md:w-1/4 hover:scale-125 hover:z-20 transition-transform duration-500 font-poppins  shadow-md">
      <Image className="pt-20 pl-40 w-180" src={fiveStar} alt="fiveStar" />
      <div className="flex  text-ml px-16 py-10">{content ?? '-'}</div>
      <div className="flex space-x-7 pl-28 pr-10  mt-5 items-center">
        <Image className="w-36 h-36 " src={imgSrc} alt="reviewer" />
        <p className="leading-snug text-[#979797]">
          {role}
          <br />
          {role2}
        </p>
      </div>
    </div>
  );
}
const slides = [
  {
    content: <div className="swiper relative h-full lg:flex  flex-row   mx-auto  justify-around z-10">
      <Review
        imgSrc={suneal}
        role={'Suneal'}
        role2={'dev @ WeChat'}
        content={'MetaMail is the most secure mail application with end-to-end encryption.'}
      />
      <Review
        imgSrc={mvs}
        role={'mvs'}
        role2={'UI designer'}
        content={'We designed Metamail with the hope that users feel their data is valued, the internet is trustworthy, and they are empowered.'}
      />
      <Review
        imgSrc={colin}
        role={'Colin'}
        role2={'protocol co-designer'}
        content={'MetaMail protocol: Secure, verifiable, interoperable, evolving towards more trustless.'}
      />
    </div>
  },
  // {
  //   content: <div className="swiper relative h-full lg:flex  flex-row   mx-auto  justify-around z-10">
  //     <Review
  //       imgSrc={suneal}
  //       role={'Suneal'}
  //       role2={'dev @ WeChat'}
  //       content={'MetaMail is the most secure mail application with end-to-end encryption.'}
  //     />
  //     <Review
  //       imgSrc={mvs}
  //       role={'mvs'}
  //       role2={'UI designer'}
  //       content={'We designed Metamail with the hope that users feel their data is valued, the internet is trustworthy, and they are empowered.'}
  //     />
  //     <Review
  //       imgSrc={colin}
  //       role={'Colin'}
  //       role2={'protocol co-designer'}
  //       content={'MetaMail protocol: Secure, verifiable, interoperable, evolving towards more trustless.'}
  //     />
  //   </div>
  // },
];


export default function ReviewInfo() {
  return (
    <Carousel slides={slides} autoplayInterval={5000000} />
  );
}
