import { draft, draftActive, inbox, inboxActive, sent, sentActive, spam, spamActive, trash, trashActive, starred, starredActive, down, moreActive } from 'assets/icons';
import { FilterTypeEn } from './interfaces';

export interface IMenuItem {
  activeLogo?: string,
  key: FilterTypeEn;
  title: string;
  logo: string;
  // belong: 'basic' | 'more';
  children?: Array<IMenuItem>
  childrenShow?: false;
}

export const MenusMap: IMenuItem[] = [
  { key: FilterTypeEn.Inbox, title: 'Inbox', logo: inbox, activeLogo: inboxActive },
  { key: FilterTypeEn.Sent, title: 'Sent', activeLogo: sentActive, logo: sent, },
  { key: FilterTypeEn.Draft, title: 'Draft', activeLogo: draftActive, logo: draft, },
  { key: FilterTypeEn.Starred, title: 'Starred', activeLogo: starredActive, logo: starred, },
  {
    key: FilterTypeEn.More, title: 'More', activeLogo: moreActive, logo: down,childrenShow:false, children: [
      { key: FilterTypeEn.Trash, title: 'Deleted', activeLogo: trashActive, logo: trash, },
      { key: FilterTypeEn.Spam, title: 'Spam', activeLogo: spamActive, logo: spam, },
    ]
  },
];
