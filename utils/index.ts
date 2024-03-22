export function isEmptyObject(obj: Record<string, any>): boolean {
  return Object.keys(obj).length === 0;
}
export const getThirdLetter = (str: string) => {
  if (str && str.length > 2) {
    return str[2]
  } else return ''
}