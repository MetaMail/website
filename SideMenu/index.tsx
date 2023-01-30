import logo_brand from '@assets/inbox_brand.svg';
import logo from '@assets/logo.svg';
import compose from '@assets/inbox_compose.svg';
import Image from 'next/image';
import { MailMenuItems } from 'SideMenu/constants';
import { FilterTypeEn, MetaMailTypeEn } from '@pages/home/interfaces';
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
              <Image src={logo_brand} alt="logo_brand" className="h-29 w-auto py-4"/>
          </a>
          <div className='flex h-38 bg-[#006AD4] rounded-11 justify-center gap-17 py-10'>
          <Image src={compose} alt="new_mail" className="w-16 h-auto"/>
          <div className='text-sm text-white'>Compose</div>
          </div>
          <div className=''>
          <ul className="menu w-56 p-2 rounded-box w-full">
          {MailMenuItems.map((item) => {
          return (
            <li
              className=''
              key={Number(item.key)}
              //icon={<Icon url={item.logo} />}
            ><a className='p-10 flex flex-row gap-7'>
              <Image src={item?.logo} alt={item?.title} height="12.5"></Image>
              <div className=''>
                <span className=''> {item.title}</span>
                {item.title === 'Inbox' ? (
                  <span className=''>
                    {props?.unreadCount?.unread}
                  </span>
                ) : null}
              </div>
              </a>
            </li>
          );
        })}
        </ul>
        </div>
</div>
</div>
  )
}