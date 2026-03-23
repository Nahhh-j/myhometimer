import { NextResponse } from 'next/server';

// 🌟 토스 앱이 로그를 보낼 수 있게 문 열어주기 (CORS)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// 🌟 토스 앱의 "똑똑!" 사전 요청(Preflight) 받아주기
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const { status, userName, message } = await request.json();
    
    // ✅ 드디어 VS Code (또는 Vercel 로그) 검은색 터미널에 출력됩니다!
    console.log("");
    console.log("==========================================");
    console.log(`📣 [AD-TERMINAL] 유저: ${userName || '알 수 없음'}`);
    console.log(`📊 [상태] ${status}`);
    if (message) console.log(`📝 [내용] ${message}`);
    console.log("==========================================");
    console.log("");

    // 🌟 성공 응답을 보낼 때도 CORS 헤더를 꼭 같이 보내야 합니다!
    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    console.error("로그 저장 중 에러:", error);
    return NextResponse.json(
      { success: false, error: "로그 처리 실패" }, 
      { status: 500, headers: corsHeaders }
    );
  }
}