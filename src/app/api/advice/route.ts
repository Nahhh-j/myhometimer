import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

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

    let situationGuide = "";
    
    if (years === 0) {
      situationGuide = "목표 금액을 이미 달성했거나 거의 다 모은 상태야. 차갑지만 인정하는 뉘앙스로 칭찬해주고, 실제 매수 시 놓치기 쉬운 세금, 부대비용(취등록세, 복비 등)이나 실전 임장 꿀팁을 조언해 줘.";
    } else if (years <= 5) {
      situationGuide = "5년 내로 달성 가능한 아주 현실적이고 훌륭한 목표야. 조금만 더 허리띠를 졸라매도록 격려하되, 급매물을 모니터링하거나 청약 같은 현실적인 액션 플랜을 짚어 줘.";
    } else if (years <= 20) {
      situationGuide = "10~20년 정도 걸리는 험난한 여정이야. 현재 저축 속도로는 지쳐 쓰러질 수 있다고 팩트 폭행을 날려 줘. 처음부터 워너비 아파트를 노리지 말고, 눈을 낮춰서 수도권 외곽이나 소형 평수부터 매수해 자산을 불려가는 '갈아타기(징검다리)' 전략을 강하게 권유해 줘.";
    } else {
      situationGuide = "지금 저축액으로는 20년 이상 걸리거나 평생 모아도 절대 살 수 없는 절망적인 수준이야. 엄청나게 뼈아픈 팩트 폭행으로 정신이 번쩍 들게 해 줘. 월 저축액을 파격적으로 늘리거나 본업 소득을 높여야 한다는 쓴소리를 하고, 목표 아파트를 아예 현실적인 곳으로 바꾸라는 극약 처방을 내려 줘.";
    }

    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      system: `너는 2030 직장인들에게 뼈아픈 현실을 알려주면서도 실질적인 대안을 제시하는 '츤데레 현실주의 멘토'야. 
      
      [🚨 절대 금지 규칙 - 금융 정책 완벽 방어]
      1. 대출, 주식, 코인 등 투자 상품 추천 절대 금지.
      2. 희망고문 및 무의미한 인사말 금지.
      
      [출력 형식 및 구성 (약 4~5줄 분량, 줄바꿈 활용)]
      - 1~2줄 (현실 진단): '소요 기간'과 '현재 자산'을 바탕으로 아주 냉철하고 뼈때리는 팩트 폭행.
      - 3~4줄 (유익한 정보/대안): 투자 권유 없이 할 수 있는 현실적 액션 플랜 제시.
      - 5줄 (마무리): 정신 차리고 당장 실행하게 만드는 단호하지만 응원하는 멘트.
      - 정중하고 깔끔한 '해요체'를 사용해.`,
      
      prompt: `
      - 목표 아파트: ${aptName} (${formatKorean(goal)}원)
      - 현재 모은 돈: ${formatKorean(current)}원
      - 월 저축액: ${formatKorean(monthly)}원
      - 예상 소요 기간: 약 ${years}년
      
      [👉 현재 유저 상황에 맞춘 특별 가이드라인: ${situationGuide}]
      
      위 가이드라인과 유저의 데이터를 바탕으로, 5줄 내외의 조언을 작성해 줘.
      `,
    });

    return Response.json({ success: true, advice: text }, { headers: corsHeaders });

  } catch (error) {
    console.error("AI API 에러 발생:", error);
    return Response.json(
      { success: false, advice: "앗, 팩폭 요정이 잠시 자리를 비웠어요. 잠시 후 다시 시도해주세요!" },
      { status: 500, headers: corsHeaders }
    );
  }
}