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

export function transformTime(timeStr: string) {
    const time = moment(timeStr);
    const now = moment();
    const isToday = time.isSame(now, 'day');
    if (isToday) return time.format('hh:mm');
    const isThisYear = time.isSame(now, 'year');
    if (isThisYear) return time.format('MMM D');
    return time.format('MM/DD/YY');
}

export * from './session-storage';
