import { FilterTypeEn } from './interfaces';

export interface IMenuItem {
  activeLogo?: string,
  key: FilterTypeEn;
  title: string;
  logo?: string;
  // belong: 'basic' | 'more';
  children?: Array<IMenuItem>
  childrenShow?: false;
}

export const MenusMap: IMenuItem[] = [
  { key: FilterTypeEn.Inbox, title: 'Inbox', logo: 'inbox', },
  { key: FilterTypeEn.Sent, title: 'Sent', logo: 'send', },
  { key: FilterTypeEn.Draft, title: 'Draft', logo: 'draft', },
  { key: FilterTypeEn.Starred, title: 'Starred', logo: 'starred', },
  {
    key: FilterTypeEn.More, title: 'More', logo: 'more', childrenShow: false, children: [
      { key: FilterTypeEn.Trash, title: 'Deleted', logo: 'trash', },
      { key: FilterTypeEn.Spam, title: 'Spam', logo: 'spam', },
    ]
  },
];
