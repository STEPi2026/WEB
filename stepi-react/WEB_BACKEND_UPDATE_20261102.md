# STEPi WEB 백엔드 공지 반영 (2026-11-02)

- 학부모/교사 가입 role 전송, 닉네임 2~12자 선택 입력
- 보호자 연결 코드 요청/목록/해제 UI, 학급 생성/목록/코드 재발급/삭제 및 학생 제외 UI
- 이메일 → 6자리 코드 → 새 비밀번호 재설정 UI
- Access Token 만료 코드 AUTH_TOKEN_EXPIRED에 한해 단일 refresh 요청 및 토큰 회전 처리
- 기존 대시보드/학생 관리/분석 화면과 공식 로고 유지

## 실행
`npm.cmd install` 후 `npm.cmd run dev` (Windows PowerShell). 기본 데모 모드에서는 실제 API/메일 발송이 이루어지지 않습니다. 실제 서버 연동은 `.env`에 `VITE_USE_MOCK=false`, `VITE_API_BASE_URL=...` 설정 후 별도 검증이 필요합니다.

## 주의 / 미확정
- Refresh Token은 현재 sessionStorage에 저장하는 임시 방식입니다. HttpOnly 쿠키 방식으로 변경하려면 백엔드의 쿠키 지원과 인증 계약 확인이 필요합니다.
- 백엔드의 요청/응답 실제 필드명, 연결/학급 목록 구조, 비밀번호 재설정 confirm 본문은 공유 서버 `/docs`로 최종 확인해야 합니다.
- 실서버와의 E2E 검증은 수행하지 않았습니다. 학생 APP의 승인 단계도 별도입니다.
- 기존 ZIP에 node_modules를 포함하지 않았습니다.
