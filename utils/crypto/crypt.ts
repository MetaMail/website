import { MetaMailTypeEn } from '@constants/interfaces';
import { createDraft } from '@services/mail';
import { getUserInfo, saveUserInfo, setRandomBits } from '@utils/storage/user';

export function generateRandom256Bits(address: string) {
  const rb = CryptoJS.lib.WordArray.random(256 / 8);
  return 'Encryption key of this mail from ' + address + ' is ' + rb.toString(CryptoJS.enc.Base64);
}

export const createMail = async (type: MetaMailTypeEn) => {
  let key;
  if (type === MetaMailTypeEn.Encrypted) {
    const { publicKey, address } = getUserInfo();
    if (!address) {
      console.warn('No address of current user, please check');
      return;
    }
    if (!publicKey || publicKey?.length === 0) {
    console.log('error: !pKey || pKey?.length === 0');
    return;
    }

    const randomBits = generateRandom256Bits(address);
    key = CryptoJS.AES.encrypt(randomBits, publicKey).toString();

  } else {
    setRandomBits(undefined);
  }
  if (type === MetaMailTypeEn.Encrypted && (!key || key?.length === 0)) {
    return;
  }
  const { data } = await createDraft(type, key);

  if (data && data?.message_id) return data?.message_id;
};
