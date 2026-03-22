import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

// 💡 0이 너무 많은 숫자를 '억', '만' 단위로 예쁘게 바꿔주는 함수
function formatKorean(num: number) {
  if (num === 0) return '0';
  const uk = Math.floor(num / 100000000);
  const man = Math.floor((num % 100000000) / 10000);
  
  let result = '';
  if (uk > 0) result += `${uk}억 `;
  if (man > 0) result += `${man}만`;
  return result.trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { aptName, aptPrice, seedMoney, monthlySaving } = body;

    const goal = Number(aptPrice);
    const current = Number(seedMoney) * 10000;
    const monthly = Number(monthlySaving) * 10000;
    
    const remaining = goal - current;
    const years = remaining <= 0 ? 0 : Math.ceil(remaining / (monthly * 12));

    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      system: `너는 2030 직장인들에게 뼈아픈 현실을 알려주면서도 실질적인 대안을 제시하는 '츤데레 현실주의 멘토'야. 
      
      [🚨 절대 금지 규칙 - 금융 정책 완벽 방어]
      1. 대출, 주식, 코인 등 투자 상품 추천 절대 금지.
      2. 희망고문 및 무의미한 인사말 금지.
      
      [출력 형식 및 구성 (약 4~5줄 분량, 줄바꿈 활용)]
      - 1~2줄 (현실 진단): '소요 기간'과 '현재 자산'을 바탕으로 아주 냉철하고 뼈때리는 팩트 폭행.
      - 3~4줄 (유익한 정보/대안): 투자 권유 없이 할 수 있는 현실적 액션 플랜 제시. (예: "지방/수도권 외곽의 소형 평수부터 알아보며 징검다리를 놔라", "지출을 완벽히 통제하고 본업 소득을 높여라", "관심 지역의 실거래가를 매일 확인하고 주말마다 동네 임장을 가라" 등)
      - 5줄 (마무리): 정신 차리고 당장 실행하게 만드는 단호하지만 응원하는 멘트.
      - 정중하고 깔끔한 '해요체'를 사용해.`,
      
      prompt: `
      - 목표 아파트: ${aptName} (${formatKorean(goal)}원)
      - 현재 모은 돈: ${formatKorean(current)}원
      - 월 저축액: ${formatKorean(monthly)}원
      - 예상 소요 기간: 약 ${years}년
      
      이 유저에게 필요한 팩트 폭행과 현실적인 대안을 5줄 내외로 조언해 줘.
      `,
    });

    return Response.json({ success: true, advice: text });

  } catch (error) {
    console.error("AI API 에러 발생:", error);
    return Response.json(
      { success: false, advice: "앗, 팩폭 요정이 잠시 자리를 비웠어요. 잠시 후 다시 시도해주세요!" },
      { status: 500 }
    );
  }
}