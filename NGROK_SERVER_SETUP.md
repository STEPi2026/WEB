# STEPi 개발 서버 연결 설정 (2026-11-07)

- `.env`의 `VITE_API_BASE_URL`에 팀원 ngrok API 주소 적용
- 모든 axios client 요청에 `ngrok-skip-browser-warning: true` 추가
- 토큰 재발급 요청에도 ngrok 헤더 추가
- `VITE_USE_MOCK=false` 유지

## 실행
```powershell
npm.cmd install
npm.cmd run dev
```

서버 주소 변경 시 `.env` 수정 후 개발 서버를 재시작하세요.
백엔드 개발 서버가 켜져 있어야 실제 API 검증이 가능합니다.
AI 연동 API는 백엔드 공지에 따라 503 오류가 날 수 있습니다.
이 파일은 새 주소/헤더 반영본이며, 기존 16개 화면 전체 연동 완료를 의미하지 않습니다.
