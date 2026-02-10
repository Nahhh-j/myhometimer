import { NextResponse } from 'next/server';
import axios from 'axios';
import { TARGET_REGIONS, TARGET_APTS } from '@/constants/targetList';
import { MOCK_DATA } from '@/constants/apartments';

export const dynamic = 'force-dynamic'; 

export async function GET() {
  process.env.HTTP_PROXY = '';
  process.env.HTTPS_PROXY = '';

  const API_KEY = process.env.DATA_PORTAL_API_KEY;
  if (!API_KEY) return NextResponse.json({ success: false, message: 'API Key missing' });

  const serviceKey = encodeURIComponent(API_KEY.trim());
  const dealYm = "202412"; // 2024년 12월 데이터

  // _type=json 을 붙여서 확실하게 JSON으로 받습니다.
  const BASE_URL = "https://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev";
  
  let allApartments: any[] = [];

  console.log(`📡 [국토부 API] 데이터 수신 중... (기준: ${dealYm})`);

  try {
    const fetchPromises = TARGET_REGIONS.map(async (regionCode) => {
      // JSON 요청 명시
      const url = `${BASE_URL}?serviceKey=${serviceKey}&pageNo=1&numOfRows=100&LAWD_CD=${regionCode}&DEAL_YMD=${dealYm}&_type=json`;

      try {
        const response = await axios.get(url, {
          timeout: 10000,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        
        const data = response.data;

        // 에러 체크 (JSON 구조)
        const header = data.response?.header;
        if (header && header.resultCode !== '00' && header.resultCode !== '000') {
             // console.error(`❌ [API 에러] ${regionCode}: ${header.resultMsg}`);
             return [];
        }

        const items = data.response?.body?.items?.item;
        return Array.isArray(items) ? items : (items ? [items] : []);

      } catch (err: any) {
        return [];
      }
    });

    const results = await Promise.all(fetchPromises);
    
    results.forEach(list => {
      if (list && list.length > 0) allApartments = [...allApartments, ...list];
    });

    // 필터링 및 데이터 가공
    const filteredData = allApartments
      .filter((apt: any) => {
         // 🚨 [수정 포인트 1] 한글 '아파트'가 아니라 영어 'aptNm'을 써야 함!
         return apt && apt.aptNm && TARGET_APTS.some(target => apt.aptNm.includes(target));
      })
      .map((apt: any, index) => {
        // 🚨 [수정 포인트 2] 영어 키값 사용 (dealAmount)
        const priceStr = String(apt.dealAmount).replace(/,/g, '').trim();
        
        // 🚨 [수정 포인트 3] 아파트 이름 정리 (괄호 제거) - aptNm 사용
        // 예: "개포자이프레지던스(4단지)" -> "개포자이프레지던스"
        let cleanName = apt.aptNm.replace(/\(.*\)/gi, '').trim();

        // 지역명 조립
        let regionName = apt.estateAgentSggNm || "서울"; 
        if (apt.umdNm) regionName += ` ${apt.umdNm}`;

        return {
          id: index + 1000,
          region: regionName.trim(), 
          name: cleanName, // 괄호 제거된 이름
          price: Number(priceStr) * 10000,
          dealDate: `${apt.dealYear}.${apt.dealMonth}.${apt.dealDay}`
        };
      });

    // 정렬 (가격순)
    filteredData.sort((a, b) => b.price - a.price);
    
    // 중복 제거
    const uniqueData = Array.from(new Map(filteredData.map(item => [item.name, item])).values());

    if (uniqueData.length === 0) {
      console.log("⚠️ 데이터 0건 -> 샘플 데이터 반환 (필터링 조건 확인 필요)");
      return NextResponse.json({ success: true, count: MOCK_DATA.length, data: MOCK_DATA });
    }

    console.log(`🎉 [최종 성공] ${uniqueData.length}건 로드 완료 (이름 정리됨!)`);
    return NextResponse.json({ success: true, count: uniqueData.length, data: uniqueData });

  } catch (error) {
    console.error('🔥 [서버 에러]', error);
    return NextResponse.json({ success: false, data: MOCK_DATA });
  }
}