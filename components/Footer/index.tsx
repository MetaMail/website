import Link from 'next/link';
import LinkItem from './LinkItem';
import twitter from 'assets/twitter.svg';
import facebook from 'assets/facebook.svg';
import discord from 'assets/discord.png';
import tg from 'assets/telegram.svg';
import git from 'assets/git.png';
import { useRouter } from 'next/router';

const allLinks = [
  {
    href: 'https://twitter.com/MetaMailInk',
    logo: twitter,
    alt: 'twitter',
  },
  // {
  //   href: '',
  //   logo: facebook,
  //   alt: 'facebook',
  // },
  {
    href: 'https://discord.com/invite/URYGebMHye',
    logo: discord,
    alt: 'discord',
  },
  {
    href: 'https://t.me/metamailink',
    logo: tg,
    alt: 'telegram',
  },
  {
    href: 'https://github.com/MetaMail',
    logo: git,
    alt: 'github',
  },
];

export default function Footer() {
  const router = useRouter()
  return (
    <footer className="relative flex-col md:flex-row h-auto md:h-262 bg-white flex flex-row justify-between py-20 md:py-83  px-20 md:px-130 ">
      <div className="hidden lg:flex flex-col gap-21">
        <div className="text-[#0069E5] text-3xl font-black font-poppins">MetaMail</div>
        <div className="w-370 text-3xl font-light leading-tight ">Create And Use Your Crypto Email</div>
      </div>
      <div className="flex  items-start text-[#333] flex-col md:flex-row justify-between gap-30 font-poppins md:absolute bottom-0 md:bottom-83 right-0 md:right-130 zIndex-9">
        <div className="flex items-center gap-40 md:gap-20">
          <span className="font-extrabold text-ml pt-10 cursor-pointer" onClick={() => router.push('/staticPages/FAQs')}>
            FAQs
          </span>
          <Link className="font-extrabold text-ml pr-20 pt-10" target='_blank' href="https://mirror.xyz/metamailink.eth">
            Blog
          </Link>
        </div>
        <div className="flex flex-col gap-23">
          <div className="flex flex-row gap-10">
            {allLinks.map((link, index) => (
              <LinkItem {...link} key={index} />
            ))}
          </div>
          <div className="font-normal text-[20px] flex flex-row justify-between gap-30 text-[#3E3E3E] font-poppins">
            <span onClick={() => router.push('/staticPages/TermsOfService')} className='cursor-pointer'>Terms of Service</span>
            <span onClick={() => router.push('/staticPages/Privacy')} className='cursor-pointer'>Privacy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
