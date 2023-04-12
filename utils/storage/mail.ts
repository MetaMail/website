import { deleteStorage, getStorage, updateStorage } from '@utils/storage';

const MailListInfo = 'MailListInfo';
/*
const ShowNameKey = 'MetaMailShowName';
const randomBitsKey = 'MetamailRandomBits';

interface IMailListInfo {
  publicKey?: string;
  ensName?: string;
  address?: string;
}

interface IAllUserInfo extends IUserInfo {
  showName?: string;
}

export const saveUserInfo = (value: any) => {
  updateStorage(UserInfoStoreKey, {
    ...getStorage(UserInfoStoreKey),
    ...value,
  });

  const { ensName, address } = value;
  updateStorage(ShowNameKey, ensName ?? address);
};

export const getPublicKeyFromLocal = () => {
  return getStorage(UserInfoStoreKey, null)?.publicKey;
};

export const getWalletAddress = () => {
  return getStorage(UserInfoStoreKey, null)?.address;
};

export const getEnsName = () => {
  return getStorage(UserInfoStoreKey, null)?.ensName;
};
*/
export const getMailListInfo = () => {
  return getStorage(MailListInfo, null);
}
//  return (
//    basic
//      ? {
//          ...basic,
//          showName: getShowName(),
//        }
//      : {
//          showName: getShowName(),
//        }
//  ) as IAllUserInfo;
//};


export const clearMailListInfo = () => {
  deleteStorage(MailListInfo);
};

/*export const getShowName = () => {
//  return getStorage(ShowNameKey);
//};

export const saveShowName = (name: string) => {
  updateStorage(ShowNameKey, name);
};

export const getRandomBits = () => {
  return getStorage(randomBitsKey);
};

export const setRandomBits = (name?: string) => {
  updateStorage(randomBitsKey, name);
};
*/