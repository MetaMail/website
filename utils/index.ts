import { IMailContentAttachment } from "lib/constants";

// 判断是否空对象
export function isEmptyObject(obj: Record<string, any>): boolean {
  return Object.keys(obj).length === 0;
}
// 头像获取第三个letter
export const getThirdLetter = (str: string) => {
  if (str && str.length > 2) {
    return str[2]
  } else return ''
}
// 获取html字符串里面<img标签的src属性值，返回一个数组
export function extractImageSrc(htmlString: string) {
  const regex = /<img.*?src=["'](.*?)["']/g;
  const matches = [];
  let match;

  while ((match = regex.exec(htmlString)) !== null) {
    matches.push(match[1]);
  }

  return matches;
}
export function replaceImageSrc(htmlString: string, attachments: IMailContentAttachment[]) {
  // 构建正则表达式来提取 img 标签的 src 属性值
  const imgRegex = /<img[^>]*src=["']cid:(.*?)["'][^>]*>/g;

  // 遍历附件数组
  attachments.forEach(attachment => {
    // 只处理 content_disposition 为 'inline' 的附件
    if (attachment.content_disposition === 'inline') {
      // 匹配 content_id
      const contentId = attachment.content_id?.replace(/[<>]/g, '');; //"<ii_lu21awul0>"

      // 替换 img 标签中的 src 属性值为附件对象中的 download.url
      htmlString = htmlString.replace(imgRegex, (match, p1) => {
        if (p1 === contentId) {
          return match.replace(`cid:${contentId}`, attachment.download.url);
        } else {
          return match;
        }
      });
    }
  });

  return htmlString;
}