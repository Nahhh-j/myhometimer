import { NextResponse } from 'next/server';
import axios from 'axios';
import { TARGET_REGIONS, TARGET_APTS } from '@/constants/targetList';
import { MOCK_DATA } from '@/constants/apartments';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  process.env.HTTP_PROXY = '';
  process.env.HTTPS_PROXY = '';

  const API_KEY = process.env.DATA_PORTAL_API_KEY;
  if (!API_KEY) {
    return NextResponse.json({ success: false, message: 'API Key missing' }, { headers: corsHeaders });
  }

  const serviceKey = encodeURIComponent(API_KEY.trim());
  const targetMonths = ["202410", "202411", "202412"];
  const BASE_URL = "https://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev";

  console.log(`📡 [국토부 API] 2030 인기 단지 500개 확보 시작...`);

  try {
    const fetchPromises = TARGET_REGIONS.flatMap((regionCode) =>
      targetMonths.map(async (dealYm) => {
        const url = `${BASE_URL}?serviceKey=${serviceKey}&pageNo=1&numOfRows=1000&LAWD_CD=${regionCode}&DEAL_YMD=${dealYm}&_type=json`;

        try {
          const response = await axios.get(url, {
            timeout: 15000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
          });

          const items = response.data.response?.body?.items?.item;
          return Array.isArray(items) ? items : (items ? [items] : []);
        } catch (err) {
          return []; 
        }
      })
    );

    const allResults = await Promise.all(fetchPromises);
    
    let rawApartments: any[] = [];
    allResults.forEach(list => {
      rawApartments = [...rawApartments, ...list];
    });

    const processedData = rawApartments
      .filter((apt: any) => {
        return apt && apt.aptNm && TARGET_APTS.some(target => apt.aptNm.includes(target));
      })
      .map((apt: any, index) => {
        const priceStr = String(apt.dealAmount).replace(/,/g, '').trim();
        let cleanName = apt.aptNm.replace(/\(.*\)/gi, '').trim();
        let regionName = `${apt.sggNm || ''} ${apt.umdNm || ''}`.trim();

        return {
          id: `apt-${index}-${apt.dealYear}${apt.dealMonth}`, 
          region: regionName || "서울",
          name: cleanName,
          price: Number(priceStr) * 10000, 
          dealDate: `${apt.dealYear}.${apt.dealMonth}.${apt.dealDay}`
        };
      });

    processedData.sort((a, b) => b.price - a.price);

    const uniqueMap = new Map();
    processedData.forEach(item => {
      if (!uniqueMap.has(item.name)) {
        uniqueMap.set(item.name, item);
      }
    });

    const finalData = Array.from(uniqueMap.values()).slice(0, 500);

    if (finalData.length === 0) {
      console.log("⚠️ 검색 결과가 없습니다. MOCK_DATA를 반환합니다.");
      return NextResponse.json({ success: true, count: MOCK_DATA.length, data: MOCK_DATA }, { headers: corsHeaders });
    }

    console.log(`🎉 [최종 성공] 원본 ${rawApartments.length}건 중 인기 단지 ${finalData.length}건 선별 완료!`);
    
    return NextResponse.json({ 
      success: true, 
      count: finalData.length, 
      data: finalData 
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('🔥 [서버 에러]', error);
    return NextResponse.json({ success: false, data: MOCK_DATA }, { headers: corsHeaders });
  }
}