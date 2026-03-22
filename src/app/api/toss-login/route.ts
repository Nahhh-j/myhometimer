import { NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto'; // 👈 암호 해독(복호화)을 위한 기본 모듈 추가!

export async function POST(request: Request) {
  try {
    const { authorizationCode, referrer } = await request.json();
    console.log("🔥 토스 로그인 시도:", { authorizationCode, referrer });

    if (!authorizationCode) {
      return NextResponse.json({ success: false, message: "인증 코드가 없습니다." }, { status: 400 });
    }

    const certPath = path.join(process.cwd(), 'certs', 'toss.crt'); 
    const keyPath = path.join(process.cwd(), 'certs', 'toss.key'); 

    if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
      throw new Error("인증서(.crt) 또는 키(.key) 파일이 없습니다!");
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

    console.log("✅ 로그인 성공! UserKey:", userData.success.userKey);
    console.log("📝 토스가 준 이름(암호문):", userData.success.name);

    // ==========================================
    // 🕵️‍♀️ 여기서부터 암호 해독(복호화) 시작!
    // ==========================================
    const encryptedName = userData.success.name;
    let decryptedName = '고객'; // 실패했을 때 띄울 기본 이름

    // 1. 샌드박스에서 그냥 가짜 텍스트를 줬을 경우
    if (encryptedName === 'ENCRYPTED_VALUE') {
      decryptedName = '테스트유저'; 
    } 
    // 2. 진짜 암호문이 왔을 경우 (실제 서비스 환경)
    else if (encryptedName) {
      try {
        // 🚨 이메일로 받으신 진짜 복호화 키와 AAD를 여기에 넣어주세요!
        const SECRET_KEY = 'd8JPsWh0qz5ggMRmHK5iXvSTRpa//CWCCvmyxswgorQ='; 
        const AAD = 'TOSS';

        // 토스의 AES-256-GCM 암호 해독 공식
        const encryptedBuffer = Buffer.from(encryptedName, 'base64');
        const iv = encryptedBuffer.subarray(0, 12);
        const tag = encryptedBuffer.subarray(encryptedBuffer.length - 16);
        const ciphertext = encryptedBuffer.subarray(12, encryptedBuffer.length - 16);

        const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(SECRET_KEY, 'base64'), iv);
        decipher.setAuthTag(tag);
        decipher.setAAD(Buffer.from(AAD, 'utf-8'));

        decryptedName = decipher.update(ciphertext, undefined, 'utf8') + decipher.final('utf8');
      } catch (err) {
        console.error("❌ 복호화 실패 (키가 틀렸거나 형식이 다름):", err);
      }
    }

    return NextResponse.json({ 
      success: true, 
      userKey: userData.success.userKey,
      userName: decryptedName 
    });

  } catch (error: any) {
    console.error('❌ Toss Login Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}