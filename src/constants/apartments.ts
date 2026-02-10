export interface Apartment {
  id: number;
  region: string; // 지역 (예: 서울 강남구)
  name: string;   // 아파트명
  price: number;  // 가격 (원 단위)
  dealDate: string; // 거래일 (YYYY.MM.DD)
}

// API 로딩 실패 시 보여줄 '샘플 데이터' (빈 화면 방지용)
export const MOCK_DATA: Apartment[] = [
  { id: 1, region: "서울 서초구", name: "래미안 원베일리", price: 4500000000, dealDate: "2024.12.15" },
  { id: 2, region: "서울 강남구", name: "압구정 현대 7차", price: 5500000000, dealDate: "2024.12.10" },
  { id: 3, region: "서울 송파구", name: "헬리오시티", price: 2100000000, dealDate: "2024.12.20" },
];