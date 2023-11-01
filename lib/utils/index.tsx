import CryptoJS from 'crypto-js';
import moment from 'moment';

export function convertWordArrayToUint8Array(wordArray: CryptoJS.lib.WordArray) {
  const arrayOfWords = wordArray.hasOwnProperty('words') ? wordArray.words : [];
  const length = wordArray.hasOwnProperty('sigBytes') ? wordArray.sigBytes : arrayOfWords.length * 4;
  let uInt8Array = new Uint8Array(length),
    index = 0,
    word,
    i;
  for (i = 0; i < length; i++) {
    word = arrayOfWords[i];
    uInt8Array[index++] = word >> 24;
    uInt8Array[index++] = (word >> 16) & 0xff;
    uInt8Array[index++] = (word >> 8) & 0xff;
    uInt8Array[index++] = word & 0xff;
  }
  return uInt8Array;
}

export const ArrayBufferToWordArray = (arrayBuffer: ArrayBuffer) => {
  const u8 = new Uint8Array(arrayBuffer, 0, arrayBuffer.byteLength);
  const len = u8.length;
  const words: number[] = [];
  for (let i = 0; i < len; i += 1) {
    words[i >>> 2] |= (u8[i] & 0xff) << (24 - (i % 4) * 8);
  }
  return CryptoJS.lib.WordArray.create(words, len);
};

export const WordArrayToArrayBuffer = (wordArray: CryptoJS.lib.WordArray) => {
  const { words, sigBytes } = wordArray;
  const u8 = new Uint8Array(sigBytes);
  for (let i = 0; i < sigBytes; i += 1) {
    const byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    u8[i] = byte;
  }
  return u8.buffer;
};

export function transformTime(timeStr: string) {
  const time = moment(timeStr);
  const now = moment();
  const isToday = time.isSame(now, 'day');
  if (isToday) return time.format('HH:mm');
  const isThisYear = time.isSame(now, 'year');
  if (isThisYear) return time.format('MMM D');
  return time.format('MM/DD/YY');
}

export function getShowAddress(address: string) {
  // in 0x12207863361cdccdd33db00d857d9ae765a10064
  // out 0x122...0064
  // ?这里有点问题? 
  // if (!address || !address.startsWith('0x')) return '';
  // return `${address.slice(0, 6)}...${address.slice(-4)}`;
  if (!address) return;
  if (address.startsWith('0x')) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  } else
    return address

}

export function percentTransform(percent: number) {
  if (isNaN(percent)) return 0;
  return Number(percent.toPrecision(2)) * 100;
}

export function dispatchEvent(eventName: string, detail?: any) {
  const event = new CustomEvent(eventName, { detail });
  window.dispatchEvent(event);
}

export * from './session-storage';
export * from './local-storage';
