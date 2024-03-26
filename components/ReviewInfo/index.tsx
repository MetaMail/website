import Image, { StaticImageData } from 'next/image';
import suneal from 'assets/suneal.svg';
import colin from 'assets/colin.png';
import fiveStar from 'assets/5star.png';
import mvs from 'assets/mvs.jpg';

interface IReview {
    imgSrc: string | StaticImageData;
    content: string;
    role?: string;
    role2?: string;
}

function Review({ imgSrc, content, role, role2 }: IReview) {
    return (
        <div className="relative bg-white border border-[#1e1e1e] rounded-20  lg:w-1/4 hover:scale-125 hover:z-20 transition-transform duration-500 font-poppins pb-20 lg:pb-0">
            <Image className="pt-20 pl-40 w-160" src={fiveStar} alt="fiveStar" />
            <div className="flex  text-ml px-16 py-10 text-[#333]">{content ?? '-'}</div>
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

export default function ReviewInfo() {
    return (
        <div className="relative  lg:flex xl:h-343 flex-col  lg:flex-row w-11/12 xl:w-5/6 2xl:w-2/3 max-w-500 top-0 md:-top-200 mx-auto border border-[#1e1e1e] bg-white rounded-28 py-30 lg:py-70 flex lg:justify-around justify-between z-10 h-700  lg:h-360 px-20 lg:px-0">
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
    );
}