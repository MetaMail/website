import logo_brand from '@assets/inbox_brand.svg';
import logo from '@assets/logo.svg';
import compose from '@assets/inbox_compose.svg';
import Image from 'next/image';

const SiderWidth = 200;

export interface MenuInfo {
  key: string;
  keyPath: string[];
  domEvent: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>;
}

interface ISiderMenuProps {
  [K: string]: any;
}

export default function SideMenu(props: any) {
  return(
    <div className='bg-[#F3F7FF] w-230 px-25 pt-23'>
    <div className='flex flex-col space-y-24'>
            <a href="/" className='flex flex-row space-x-9'>
              <Image src={logo} alt="logo" className="w-30 "/>
              <Image src={logo_brand} alt="logo_brand" className="h-29"/>
          </a>
          <div className='flex h-38 bg-[#006AD4] rounded-11 justify-center gap-17 py-10'>
          <Image src={compose} alt="new_mail" className="w-16 "/>
          <div className='text-sm text-white'>Compose</div>
          </div>
          <div className=''>
          <ul className="menu w-56 p-2 rounded-box w-full">
  <li className="menu-title">
    <span>Category</span>
  </li>
  <li><a>Item 1</a></li>
  <li><a>Item 2</a></li>
</ul>
          </div>
</div>
</div>
  )
}