import { NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const { authorizationCode, referrer } = await request.json();
    console.log("🔥 토스 로그인 시도:", { authorizationCode, referrer });

    if (!authorizationCode) {
      return NextResponse.json(
        { success: false, message: "인증 코드가 없습니다." }, 
        { status: 400, headers: corsHeaders }
      );
    }

    const certPath = path.join(process.cwd(), 'certs', 'toss.crt'); 
    const keyPath = path.join(process.cwd(), 'certs', 'toss.key'); 

    if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
      console.error("🚨 인증서 파일 없음 경로:", certPath);
      throw new Error("인증서(.crt) 또는 키(.key) 파일이 없습니다! Vercel에 certs 폴더가 배포되었는지 확인하세요.");
    }

    const httpsAgent = new https.Agent({
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath),
      rejectUnauthorized: false
    });

    const tokenResponse = await axios.post(
      'https://apps-in-toss-api.toss.im/api-partner/v1/apps-in-toss/user/oauth2/generate-token',
      { authorizationCode, referrer },
      { headers: { 'Content-Type': 'application/json' }, httpsAgent }
    );

    if (!tokenResponse.data.success) throw new Error('토큰 발급 응답 실패');
    const accessToken = tokenResponse.data.success.accessToken;

    const userResponse = await axios.get(
      'https://apps-in-toss-api.toss.im/api-partner/v1/apps-in-toss/user/oauth2/login-me',
      { headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, httpsAgent }
    );
    
    const userData = userResponse.data;
    if (!userData.success) throw new Error('유저 정보 조회 실패');

    const encryptedName = userData.success.name;
    let decryptedName = '고객'; 

    if (encryptedName === 'ENCRYPTED_VALUE') {
      decryptedName = '테스트유저'; 
    } else if (encryptedName) {
      try {
        const SECRET_KEY = process.env.TOSS_DECRYPT_KEY;
        const AAD = process.env.TOSS_AAD || 'TOSS';

        if (!SECRET_KEY) throw new Error("환경 변수에 TOSS_DECRYPT_KEY가 없습니다!");

        const encryptedBuffer = Buffer.from(encryptedName, 'base64');
        const iv = encryptedBuffer.subarray(0, 12);
        const tag = encryptedBuffer.subarray(encryptedBuffer.length - 16);
        const ciphertext = encryptedBuffer.subarray(12, encryptedBuffer.length - 16);

        const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(SECRET_KEY, 'base64'), iv);
        decipher.setAuthTag(tag);
        decipher.setAAD(Buffer.from(AAD, 'utf-8'));

        decryptedName = decipher.update(ciphertext, undefined, 'utf8') + decipher.final('utf8');
      } catch (err) {
        console.error("❌ 복호화 실패:", err);
      }
    }

    return NextResponse.json({ 
      success: true, 
      userKey: userData.success.userKey,
      userName: decryptedName 
    }, { headers: corsHeaders });

  } catch (error: any) {
    console.error('❌ Toss Login Error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500, headers: corsHeaders }
    );
  }
}