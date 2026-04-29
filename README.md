# 🏠 My Home Timer (내 집 마련 타이머)

> **"당신의 내 집 마련, AI가 냉철하게 진단해 드립니다."**<br/>
> 토스 미니앱 생태계(Granite)와 Next.js 기반의 외부 API(Vercel)를 연동한 하이브리드 웹 애플리케이션 프로젝트

<br/>

## Project Overview
단순한 자산 계산기를 넘어, 사용자의 현재 자산과 목표 아파트 가격을 비교하여 **AI가 맞춤형 '팩트 폭행' 및 현실적인 솔루션을 제공**하는 서비스입니다. <br/> 데이터 기반의 시스템 설계와 직관적인 UI/UX를 통해 사용자의 목표 달성을 독려합니다.

- **개발 기간:** 2026.04 ~ 
- **배포 주소:** [https://myhometimer.vercel.app](https://myhometimer.vercel.app) (API Server)
- **플랫폼:** Toss Mini App (토스 앱 내 구동)

<br/>

## Key Features
- **토스 간편 로그인 (Toss OAuth2):** 토스 앱 내에서 끊김 없는(Seamless) 로그인 경험 제공 및 암호화된 유저 정보 복호화 처리
- **실시간 국토부 아파트 실거래가 조회:** 공공데이터포털 API를 활용해 2030 인기 단지 500개의 최신 실거래가 데이터를 파싱 및 가공하여 제공
- **AI 팩폭 진단 (OpenAI API):** 사용자의 목표 금액, 시드머니, 월 저축액을 기반으로 목표 달성 소요 기간을 계산하고, GPT 모델을 활용해 4단계의 뉘앙스별 맞춤형 조언(팩트 폭행 및 대안 제시) 생성
- **사용자 액션 로깅:** 광고 클릭 및 주요 이벤트에 대한 상태(Status) 및 메시지를 Vercel 서버로 실시간 전송 및 로깅

<br/>

## Tech Stack

### Frontend (Toss Mini App)
- **Framework:** Next.js (App Router), Toss Granite (미니앱 프레임워크)
- **Styling:** Granite UI
- **Build:** `ait build` (Static Export)

### Backend (API Server)
- **Deployment:** Vercel
- **API Framework:** Next.js Route Handlers (`/api/*`)
- **Integration:** OpenAI SDK, Axios, CORS Preflight(OPTIONS)

<br/>

## Architecture & Problem Solving

토스 미니앱(정적 파일 배포)과 동적 API 서버의 한계를 극복하기 위해 투트랙(Two-Track) 빌드 및 배포 전략을 설계했습니다.

1. **Frontend (Local/Toss):** `granite dev` / `ait build`를 통해 프론트엔드 뷰(View)를 정적 앱 번들(`.ait`)로 생성하여 토스 샌드박스에 업로드
2. **Backend (Vercel):** `next build` 명령어를 분리 설정하여 깃허브 푸시 시 Vercel이 서버 사이드 API(`/api`)만 독립적으로 구동하도록 아키텍처 분리
3. **CORS 보안 해결:** 클라이언트(토스 앱)와 서버(Vercel) 간의 교차 출처 리소스 공유(CORS) 에러를 해결하기 위해 모든 API 라우트에 `OPTIONS` 사전 요청(Preflight) 핸들러를 구현

<br/>
