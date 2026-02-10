export interface Apartment {
  id: number;
  region: string; // 지역 (예: 서울 강남구)
  name: string;   // 아파트명
  price: number;  // 가격 (원 단위)
  dealDate: string; // 거래일 (YYYY.MM.DD)
}

// API 로딩 실패 시 보여줄 '샘플 데이터' (빈 화면 방지용)
export const MOCK_DATA: Apartment[] = [
  // 서초구
  { id: 1, region: "서울 서초구", name: "래미안 원베일리", price: 4500000000, dealDate: "2024.12.15" },
  { id: 4, region: "서울 서초구", name: "아크로리버파크", price: 3900000000, dealDate: "2024.12.18" },
  { id: 5, region: "서울 서초구", name: "반포 자이", price: 3500000000, dealDate: "2024.12.22" },
  
  // 강남구
  { id: 2, region: "서울 강남구", name: "압구정 현대 7차", price: 5500000000, dealDate: "2024.12.10" },
  { id: 6, region: "서울 강남구", name: "디에이치 퍼스티어 아이파크", price: 3100000000, dealDate: "2024.12.05" },
  { id: 7, region: "서울 강남구", name: "은마아파트", price: 2400000000, dealDate: "2024.12.12" },
  { id: 8, region: "서울 강남구", name: "개포 자이 프레지던스", price: 2950000000, dealDate: "2024.12.28" },

  // 송파구
  { id: 3, region: "서울 송파구", name: "헬리오시티", price: 2100000000, dealDate: "2024.12.20" },
  { id: 9, region: "서울 송파구", name: "잠실 엘스", price: 2500000000, dealDate: "2024.12.14" },
  { id: 10, region: "서울 송파구", name: "잠실 리센츠", price: 2450000000, dealDate: "2024.12.11" },

  // 용산구 & 성동구 (마용성)
  { id: 11, region: "서울 용산구", name: "한남 더 힐", price: 9500000000, dealDate: "2024.12.02" },
  { id: 12, region: "서울 용산구", name: "나인원 한남", price: 9000000000, dealDate: "2024.12.07" },
  { id: 13, region: "서울 성동구", name: "아크로서울포레스트", price: 6200000000, dealDate: "2024.12.13" },
  { id: 14, region: "서울 성동구", name: "트리마제", price: 4100000000, dealDate: "2024.12.19" },

  // 분당 & 과천
  { id: 15, region: "경기 성남 분당구", name: "판교 푸르지오 그랑블", price: 2600000000, dealDate: "2024.12.21" },
  { id: 16, region: "경기 과천시", name: "과천 위버필드", price: 2100000000, dealDate: "2024.12.24" },
  
  // 마포구
  { id: 17, region: "서울 마포구", name: "마포 래미안 푸르지오", price: 1850000000, dealDate: "2024.12.26" },
  { id: 18, region: "서울 마포구", name: "마포 프레스티지 자이", price: 1980000000, dealDate: "2024.12.15" },
];