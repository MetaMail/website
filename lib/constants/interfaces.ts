import type { MMCancelableUpload } from 'lib/http';
export enum AccountStatusTypeEn {
  Normal = 0,
  Locked,
}

export enum MailBoxTypeEn {
  Inbox = 0,
  Send,
  Draft,
}

export enum MarkTypeEn {
  Normal = 0,
  Starred,
  Trash,
  Spam,
  Deleted,
}

export enum ReadStatusTypeEn {
  Read = 1,
  Unread = 0,
}

export enum MetaMailTypeEn {
  Plain = 0,
  Signed = 1,
  Encrypted = 2,
}

export const getMailBoxType = (filter: FilterTypeEn) => {
  switch (filter) {
    case FilterTypeEn.Draft:
      return MailBoxTypeEn.Draft;
    case FilterTypeEn.Sent:
      return MailBoxTypeEn.Send;
    default:
      return MailBoxTypeEn.Inbox;
  }
};

export enum FilterTypeEn {
  Inbox = 0,
  Encrypted,
  Sent,
  Trash,
  Draft,
  Starred,
  Spam,
  Read,
  Unread,
  More,
}

export interface IPersonItem {
  address?: string;
  name?: string;
}

export interface IMailContentAttachment {
  attachment_id?: string;
  size?: number;
  encrypted_sha256?: string;
  plain_sha256?: string;
  filename: string;
  content_type?: string;
  download?: {
    expire_at: string;
    url: string;
  };
}

export interface IMailDetailBaseItem {
  read?: ReadStatusTypeEn;
  mailbox?: MailBoxTypeEn;
  mark?: MarkTypeEn;

  meta_type?: MetaMailTypeEn;
  subject?: string;
  mail_from?: IPersonItem;
  mail_to?: IPersonItem[];
  mail_cc?: IPersonItem[];
  mail_bcc?: IPersonItem[];
  mail_date?: string;
  download?: {
    expire_at: string;
    url: string;
  };
  in_reply_to?: IPersonItem;
  reply_to?: IPersonItem;
  digest?: string;
  part_text?: string;
  part_html?: string;
  attachments?: IMailContentAttachment[];
  meta_header?: {
    addr?: string;
    date?: string;
    signature?: string;
    domain?: any;
    types?: any;
    value?: any;
    encrypted_encryption_keys?: string[];
    encryption_public_keys?: string[];
  };
}

export interface IMailContentItem extends IMailDetailBaseItem {
  message_id?: string;
}

export interface IUpdateMailContentParams extends IMailDetailBaseItem {
  mail_id?: string;
}

export interface IAttachment extends IMailContentAttachment {
  uploadProcess?: number;
  cancelableUpload?: MMCancelableUpload;
}

export interface MailListItemType extends IMailContentItem {
  attachments?: IAttachment[];
  selected?: boolean;
  local_id?: string;
}

export enum AttachmentRelatedTypeEn {
  Embedded = '1',
  Outside = '0',
}
