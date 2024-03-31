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

// 通过文件名判断文件类型
export function fileType(name: string) {

  //获取最后一个.的位置
  const index = name.lastIndexOf(".");
  //获取后缀
  const ext = name.substring(index + 1);
  return ext
}

export function originFileName(name: string) {
  //获取最后一个.的位置
  const index = name.lastIndexOf(".");
  return name.substring(0, index)
}



export const isCompleteHtml = (htmlString: string) => {
  // 定义正则表达式匹配完整的 HTML 标签
  const htmlRegex = /<html[^>]*>[\s\S]*<\/html>/i;
  // 定义正则表达式匹配 body 标签
  const bodyRegex = /<body[^>]*>[\s\S]*<\/body>/i;
  // 
  const styleRegex = /<style[^>]*>[\s\S]*<\/style>/i;

  // 使用正则表达式测试 HTML 字符串
  return (htmlRegex.test(htmlString) && bodyRegex.test(htmlString)) || styleRegex.test(htmlString);
};

// 合并并去重数组，根据指定键
export function mergeAndUniqueArraysByKey<T>(arr1: T[], arr2: T[], key: keyof T): T[] {
  // 合并两个数组
  const mergedArray = [...arr1, ...arr2];
  // 创建一个记录唯一键的映射
  const uniqueKeys: Record<string, boolean> = {};

  // 返回去重后的数组
  return mergedArray.reduce((result: T[], item: T) => {
      // 获取指定键的值，并进行类型断言
      const keyValue = item[key] as unknown as string;

      // 如果该键尚未被添加，则将其添加到结果数组中
      if (!uniqueKeys[keyValue]) {
          result.push(item);
          uniqueKeys[keyValue] = true;
      }

      // 返回结果数组
      return result;
  }, []);
}


export * from './session-storage';
export * from './local-storage';
