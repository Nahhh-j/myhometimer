export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('ko-KR').format(value);
};

export const formatKoreanCurrency = (value: number) => {
  if (value === 0) return "0원";

  const eok = Math.floor(value / 100000000);
  const remainder = value % 100000000;
  const man = Math.floor(remainder / 10000);

  let result = "";
  if (eok > 0) result += `${eok}억 `;
  if (man > 0) result += `${new Intl.NumberFormat('ko-KR').format(man)}만원`;
  else if (eok > 0) result += ""; // 억 단위로 딱 떨어질 때 '만원' 생략
  else result += `${new Intl.NumberFormat('ko-KR').format(man)}만원`;

  return result.trim() || "0원";
};