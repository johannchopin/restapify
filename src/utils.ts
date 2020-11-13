export const replaceAll = (str: string, find: string, replace: string): string => {
  return str.split(find).join(replace)
}
