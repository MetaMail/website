import { MailBoxTypeEn, MarkTypeEn, ReadStatusTypeEn, IMailContentItem, FilterTypeEn } from 'constants/interfaces';
import { httpInstance } from 'lib/request';

const APIs = {
  getMailList: '/mails/filter', // 根据筛选条件获取邮件列表
  mailDetail: '/mails/', // 获取邮件详情
};

interface IGetMailDetailResponse {
  mail: IMailContentItem;
}

interface IGetMailListParams {
  limit: number;
  filter: FilterTypeEn;
  page_index: number;
}

interface IGetMailListResponse {
  total: number;
  unread: number;
  page_num: number;
  page_index: number;
  mails: IMailContentItem[];
}

interface IChangeMailStatusParams {
  mails: IMailChangeParams[];
  mark?: MarkTypeEn;
  read?: ReadStatusTypeEn;
}

export interface IMailChangeParams {
  message_id: string;
  mailbox?: MailBoxTypeEn;
}

export async function getMailDetailByID(id: string) {
  return httpInstance.get<void, IGetMailDetailResponse>(`${APIs.mailDetail}${id}`);
}

export async function getMailList(params: IGetMailListParams) {
  return httpInstance.post<IGetMailListParams, IGetMailListResponse>(APIs.getMailList, params);
}

export async function changeMailStatus(mails: IMailChangeParams[], mark?: MarkTypeEn, read?: ReadStatusTypeEn) {
  return httpInstance.post<IChangeMailStatusParams, void>(APIs.mailDetail, {
    mails,
    mark,
    read,
  });
}
