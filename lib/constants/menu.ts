import { draft, inbox, sent, spam, trash, starred } from 'assets/icons';
import { FilterTypeEn } from './interfaces';

export interface IMenuItem {
    key: FilterTypeEn;
    title: string;
    logo: string;
    belong: 'basic' | 'more';
}

export const MenusMap: IMenuItem[] = [
    { key: FilterTypeEn.Inbox, title: 'Inbox', logo: inbox, belong: 'basic' },
    { key: FilterTypeEn.Sent, title: 'Sent', logo: sent, belong: 'basic' },
    { key: FilterTypeEn.Draft, title: 'Draft', logo: draft, belong: 'basic' },
    { key: FilterTypeEn.Starred, title: 'Starred', logo: starred, belong: 'basic' },
    { key: FilterTypeEn.Trash, title: 'Deleted', logo: trash, belong: 'more' },
    { key: FilterTypeEn.Spam, title: 'Spam', logo: spam, belong: 'more' },
];
