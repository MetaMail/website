import { InboxSvg, SendSvg, DeletedSvg, DraftSvg, StarredSvg, SpamSvg } from 'components/svg';
import { FilterTypeEn } from './interfaces';

export interface IMenuItem {
    key: FilterTypeEn;
    title: string;
    logo: () => JSX.Element;
    belong: 'basic' | 'more';
}

export const MenusMap: IMenuItem[] = [
    { key: FilterTypeEn.Inbox, title: 'Inbox', logo: InboxSvg, belong: 'basic' },
    { key: FilterTypeEn.Sent, title: 'Sent', logo: SendSvg, belong: 'basic' },
    { key: FilterTypeEn.Draft, title: 'Draft', logo: DraftSvg, belong: 'basic' },
    { key: FilterTypeEn.Starred, title: 'Starred', logo: StarredSvg, belong: 'basic' },
    { key: FilterTypeEn.Trash, title: 'Deleted', logo: DeletedSvg, belong: 'more' },
    { key: FilterTypeEn.Spam, title: 'Spam', logo: SpamSvg, belong: 'more' },
];
