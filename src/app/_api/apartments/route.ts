import { NextResponse } from 'next/server';
import axios from 'axios';
import { TARGET_REGIONS, TARGET_APTS } from '@/constants/targetList';
import { MOCK_DATA } from '@/constants/apartments';

export const dynamic = 'force-dynamic';

export async function GET() {
  // 환경변수 초기화
  process.env.HTTP_PROXY = '';
  process.env.HTTPS_PROXY = '';

  const API_KEY = process.env.DATA_PORTAL_API_KEY;
  if (!API_KEY) {
    return NextResponse.json({ success: false, message: 'API Key missing' });
  }

  const serviceKey = encodeURIComponent(API_KEY.trim());
  
  // 🗓️ 140개에서 500개로 늘리기 위해 조회 기간을 3개월로 확장합니다.
  const targetMonths = ["202410", "202411", "202412"];
  const BASE_URL = "https://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev";

  console.log(`📡 [국토부 API] 2030 인기 단지 500개 확보 시작...`);

  try {
    // 모든 지역(TARGET_REGIONS) x 모든 달(targetMonths) 조합으로 요청 생성
    const fetchPromises = TARGET_REGIONS.flatMap((regionCode) =>
      targetMonths.map(async (dealYm) => {
        // 🚀 한 번에 가져오는 양을 1000개로 늘려 누락을 방지합니다.
        const url = `${BASE_URL}?serviceKey=${serviceKey}&pageNo=1&numOfRows=1000&LAWD_CD=${regionCode}&DEAL_YMD=${dealYm}&_type=json`;

        try {
          const response = await axios.get(url, {
            timeout: 15000, // 데이터가 많으므로 타임아웃을 넉넉히 잡습니다.
            headers: { 'User-Agent': 'Mozilla/5.0' }
          });

          const items = response.data.response?.body?.items?.item;
          return Array.isArray(items) ? items : (items ? [items] : []);
        } catch (err) {
          return []; // 에러 난 지역은 빈 배열 반환
        }
      })
    );

    // 모든 요청을 병렬로 처리하여 속도를 높임
    const allResults = await Promise.all(fetchPromises);
    
    // 낱개로 흩어진 배열들을 하나로 합침
    let rawApartments: any[] = [];
    allResults.forEach(list => {
      rawApartments = [...rawApartments, ...list];
    });

    // 🔍 필터링 및 데이터 가공 시작
    const processedData = rawApartments
      .filter((apt: any) => {
        // 아파트 이름이 존재하고, 우리가 설정한 TARGET_APTS 키워드가 포함된 경우만 필터링
        return apt && apt.aptNm && TARGET_APTS.some(target => apt.aptNm.includes(target));
      })
      .map((apt: any, index) => {
        // 가격 콤마 제거 및 숫자로 변환
        const priceStr = String(apt.dealAmount).replace(/,/g, '').trim();
        
        // 아파트 이름 정리 (괄호 안의 내용 제거)
        let cleanName = apt.aptNm.replace(/\(.*\)/gi, '').trim();

        // 지역명 조립 (구 + 동)
        let regionName = `${apt.sggNm || ''} ${apt.umdNm || ''}`.trim();

        return {
          id: `apt-${index}-${apt.dealYear}${apt.dealMonth}`, // 고유 ID 부여
          region: regionName || "서울",
          name: cleanName,
          price: Number(priceStr) * 10000, // 만원 단위를 원 단위로 변환
          dealDate: `${apt.dealYear}.${apt.dealMonth}.${apt.dealDay}`
        };
      });

    // 1️⃣ 가격이 높은 순서대로 정렬
    processedData.sort((a, b) => b.price - a.price);

    // 2️⃣ 중복 제거 (3개월치라 같은 아파트가 여러 번 나옴. 가장 최신/비싼 것 하나만 남김)
    const uniqueMap = new Map();
    processedData.forEach(item => {
      if (!uniqueMap.has(item.name)) {
        uniqueMap.set(item.name, item);
      }
    });

    // 3️⃣ 맵에서 꺼내서 최종 배열 생성 및 딱 500개로 자르기
    const finalData = Array.from(uniqueMap.values()).slice(0, 500);

    if (finalData.length === 0) {
      console.log("⚠️ 검색 결과가 없습니다. MOCK_DATA를 반환합니다.");
      return NextResponse.json({ success: true, count: MOCK_DATA.length, data: MOCK_DATA });
    }

    console.log(`🎉 [최종 성공] 원본 ${rawApartments.length}건 중 인기 단지 ${finalData.length}건 선별 완료!`);
    
    return NextResponse.json({ 
      success: true, 
      count: finalData.length, 
      data: finalData 
    });

  } catch (error) {
    console.error('🔥 [서버 에러]', error);
    // 에러 발생 시 서비스 중단을 막기 위해 MOCK_DATA 반환
    return NextResponse.json({ success: false, data: MOCK_DATA });
  }
}