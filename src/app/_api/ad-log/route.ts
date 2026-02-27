import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { status, userName, message } = await request.json();
  
  // ✅ 드디어 VS Code 검은색 터미널에 출력됩니다!
  console.log("");
  console.log("==========================================");
  console.log(`📣 [AD-TERMINAL] 유저: ${userName}`);
  console.log(`📊 [상태] ${status}`);
  if (message) console.log(`📝 [내용] ${message}`);
  console.log("==========================================");
  console.log("");

  return NextResponse.json({ success: true });
}