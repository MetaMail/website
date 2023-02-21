import { MarkTypeEn, ReadStatusTypeEn } from "@constants/interfaces";
import { IMailChangeParams, changeMailStatus } from "@services/home";
import router from "next/router";

export const handleDelete = async (
    inputMails: IMailChangeParams[],
  ) => {
    const mails = inputMails;
    try {
      await changeMailStatus(mails, MarkTypeEn.Trash, undefined);
    } catch {
      //notification.error({
      //  message: 'Failed',
      //  description: 'Sorry, network problem.',
      //});
    } finally {
    }
  };

  export const handleStar = async (
    inputMails: IMailChangeParams[],
  ) => {
    const mails = inputMails;
    try {
      await changeMailStatus(mails, MarkTypeEn.Starred, undefined);
    } catch {
      //notification.error({
      //  message: 'Failed',
      //  description: 'Sorry, network problem.',
      //});
    } finally {
    }
  };

  export const handleSpam = async (
    inputMails: IMailChangeParams[],
  ) => {
    const mails = inputMails;
    try {
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
  export const handleChangeReadStatus = async (
    inputMails: IMailChangeParams[],
    status: ReadStatusTypeEn,
  ) => {
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



