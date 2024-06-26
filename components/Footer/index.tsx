import Link from 'next/link';
import LinkItem from './LinkItem';
import twitter from 'assets/twitter.svg';
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

          <Link className="font-extrabold text-[20px] pt-10 cursor-pointer" target="_blank" href="/FAQs">
            FAQs
          </Link>
          <Link className="font-extrabold text-[20px] pt-10 cursor-pointer" target="_blank" href="https://mirror.xyz/metamailink.eth">
            Blog
          </Link>
        </div>
        <div className="flex flex-col gap-23">
          <div className="flex flex-row gap-10">
            {allLinks.map((link, index) => (
              <LinkItem {...link} target='_blank' key={index} />
            ))}
          </div>
          <div className="font-extrabold text-[20px] flex flex-row justify-between gap-30 text-[#333] font-poppins">
            <Link href='/terms-of-service' target="_blank" className='cursor-pointer'>
              Terms of Service
            </Link>
            <Link href='/privacy-policy' target="_blank" className='cursor-pointer'>
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
