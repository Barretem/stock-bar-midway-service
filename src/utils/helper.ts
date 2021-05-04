export const calcFixedPriceNumber = (
  open: string,
  yestclose: string,
  price: string,
  high: string,
  low: string
): number => {
  const reg = /0+$/g;
  open = open.replace(reg, '');
  yestclose = yestclose.replace(reg, '');
  price = price.replace(reg, '');
  high = high.replace(reg, '');
  low = low.replace(reg, '');
  const o = open.indexOf('.') === -1 ? 0 : open.length - open.indexOf('.') - 1;
  const yc =
    yestclose.indexOf('.') === -1
      ? 0
      : yestclose.length - yestclose.indexOf('.') - 1;
  const p = price.indexOf('.') === -1 ? 0 : price.length - price.indexOf('.') - 1;
  const h = high.indexOf('.') === -1 ? 0 : high.length - high.indexOf('.') - 1;
  const l = low.indexOf('.') === -1 ? 0 : low.length - low.indexOf('.') - 1;
  let max = Math.max(o, yc, p, h, l);
  if (max > 3) {
    max = 2; // 接口返回的指数数值的小数位为4，但习惯两位小数
  }
  return max;
};

export const formatNumber = (val = 0, fixed = 2, format = true): string => {
  const num = +val;
  if (format) {
    if (num > 1000 * 10000) {
      return (num / (10000 * 10000)).toFixed(fixed) + '亿';
    } else if (num > 1000) {
      return (num / 10000).toFixed(fixed) + '万';
    }
  }
  return `${num.toFixed(fixed)}`;
};
