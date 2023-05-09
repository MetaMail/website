import { MarkTypeEn, ReadStatusTypeEn } from '@constants/interfaces';
import { IMailChangeParams, changeMailStatus } from '@services/home';
//import { deleteStorage } from "./storage";
//import router from "next/router";

export const handleDelete = async (inputMails: IMailChangeParams[]) => {
  const mails = inputMails;
  try {
    await changeMailStatus(mails, MarkTypeEn.Trash, undefined);
  } catch (e) {
    console.log(e);
    //notification.error({
    //  message: 'Failed',
    //  description: 'Sorry, network problem.',
    //});
  } finally {
  }
};

export const handleStar = async (inputMails: IMailChangeParams[], setUnStar?: boolean) => {
  console.log(setUnStar);
  console.log(inputMails);
  const mails = inputMails;
  try {
    await changeMailStatus(mails, setUnStar === true ? MarkTypeEn.Normal : MarkTypeEn.Starred, undefined);
  } catch {
    //notification.error({
    //  message: 'Failed',
    //  description: 'Sorry, network problem.',
    //});
  } finally {
  }
};

export const handleSpam = async (inputMails: IMailChangeParams[]) => {
  const mails = inputMails;
  try {
    console.log(mails);
    await changeMailStatus(mails, MarkTypeEn.Spam, undefined);
  } catch {
    //notification.error({
    //  message: 'Failed',
    //  description: 'Sorry, network problem.',
    //});
  } finally {
    //router.back();
  }
};
export const handleChangeReadStatus = async (inputMails: IMailChangeParams[], status: ReadStatusTypeEn) => {
  const mails = inputMails;
  try {
    await changeMailStatus(mails, undefined, status);
  } catch {
    //notification.error({
    //  message: 'Failed',
    //  description: 'Sorry, network problem.',
    //});
  }
};
