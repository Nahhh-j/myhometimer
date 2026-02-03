export const formatCurrency = (value: number) => new Intl.NumberFormat('ko-KR').format(value);
export const formatKoreanCurrency = (value: number) => {
  if (value >= 100000000) return `${(value / 100000000).toFixed(1)}억`;
  return `${value / 10000}만`;
};