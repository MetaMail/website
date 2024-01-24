import Link from 'next/link';
import LinkItem from './LinkItem';
import twitter from 'assets/twitter.svg';
import facebook from 'assets/facebook.svg';
import discord from 'assets/discord.png';
import tg from 'assets/telegram.svg';
import git from 'assets/git.png';

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
  return (
    <footer className="h-262 bg-white flex flex-row justify-between py-83 px-130 ">
      <div className="hidden lg:flex flex-col gap-21">
        <div className="text-[#0069E5] text-3xl font-black font-poppins">MetaMail</div>
        <div className="w-370 text-3xl font-light leading-tight ">Create And Use Your Crypto Email</div>
      </div>
      <div className="flex flex-row justify-between gap-30 font-poppins">
        <Link className="font-extrabold text-ml pt-10" href="http://www.example.com">
          FAQs
        </Link>
        <Link className="font-extrabold text-ml pr-20 pt-10" href="http://www.example.com">
          Blog
        </Link>
        <div className="flex flex-col gap-23">
          <div className="flex flex-row gap-10">
            {allLinks.map((link, index) => (
              <LinkItem {...link} key={index} />
            ))}
          </div>
          <div className="font-normal text-[20px] flex flex-row justify-between gap-30 text-[#3E3E3E] font-poppins">
            <Link href="http://www.example.com">Terms of Service</Link>
            <Link href="http://www.example.com">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
