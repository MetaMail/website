import { draft, encryptedInbox, inbox, read, sent, spam, trash, unread, markFavorite,starred } from '@assets/icons';
import { FilterTypeEn } from './interfaces';

export const SiderFilterMap: Record<FilterTypeEn, { title: string; logo: string }> = {
  [FilterTypeEn.Inbox]: { title: 'Inbox', logo: inbox },
  //[FilterTypeEn.Encrypted]: { title: 'Encrypted Inbox', logo: encryptedInbox },

  [FilterTypeEn.Sent]: { title: 'Sent', logo: sent },
  // [FilterTypeEn.Read]: { title: 'Read', logo: read },
  [FilterTypeEn.Draft]: { title: 'Draft', logo: draft },
  //[FilterTypeEn.Unread]: { title: 'Unread', logo: unread },
  [FilterTypeEn.Starred]: { title: 'Starred', logo: starred },
  [FilterTypeEn.Trash]: { title: 'Delete', logo: trash },
  //[FilterTypeEn.Spam]: { title: 'Spam', logo: spam },

};

export const MenuItems = {
  mailbox: {
    key: 'inbox',
    title: 'Inbox',
  },
  contacts: {
    key: 'contacts',
    title: 'Contacts',
  },
  settings: {
    key: 'settings',
    title: 'Settings',
  },
};

export const MailMenuItems: {
  key: FilterTypeEn;
  title: string;
  logo: string;
}[] = Object.keys(SiderFilterMap).map((key: string) => {
  const filterTypeKey = Number(key) as FilterTypeEn;
  return {
    key: filterTypeKey,
    title: SiderFilterMap[filterTypeKey].title,
    logo: SiderFilterMap[filterTypeKey].logo,
  };
});

export const ContactSubMenuItems = {
  block: {
    key: 'block',
    title: 'Block List',
  },
  allow: {
    key: 'allow',
    title: 'Allow List',
  },
};
