import Image from 'next/image';
import logo_brand from '@assets/logo_brand.svg';

export default function Intro() {
  return (
    <div className="pt-43 relative">
      <header className="flex flex-row justify-between px-102">
        <Image src={logo_brand} alt="logo" className="w-298 h-52" width={298} height={52} />
        <button className=" w-250 h-44 border border-[#1e1e1e] rounded-40">Connect Wallet</button>
      </header>
    </div>
  );
}
