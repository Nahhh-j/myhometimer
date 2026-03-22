import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'myhometimer',
  brand: {
    displayName: '내 집은 몇 년 뒤?', // 화면에 노출될 앱의 한글 이름으로 바꿔주세요.
    primaryColor: '#3182F6', // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
    icon: 'https://static.toss.im/appsintoss/17621/87023d64-527a-4b10-a3d7-f03b5c89e8d5.png', // 화면에 노출될 앱의 아이콘 이미지 주소로 바꿔주세요.
  },
  web: {
    host: '192.168.1.101',
    port: 3000,
    commands: {
      dev: 'next dev',
      build: 'npm run build',
    },
  },
  permissions: [],
  outdir: 'out',
});
