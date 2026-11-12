# STEPi 프론트엔드 — 통합 점검용

React 18 / Vite 6 / TypeScript / Tailwind CSS / Axios. 기존 16개 화면 구조를 유지한 로컬 데모입니다.

## 실행
```powershell
npm.cmd install
npm.cmd run build
npm.cmd run dev
```

## 설정
`.env.example`을 `.env`로 복사합니다. `VITE_USE_MOCK=true`는 로컬 샘플 데이터 모드, `false`는 실제 백엔드 요청 모드입니다. `VITE_API_BASE_URL`은 API v0.3 협의안의 `/api/v1`을 기준으로 합니다.

## 유의사항
백엔드 119개 API는 협의용 초안입니다. AI① 내부 API는 프론트에서 직접 호출하지 않습니다. 데모 학생/문제/기준 데이터는 localStorage에 저장되며 실제 서버에 저장되지 않습니다. 리포트 PDF는 서버 생성 파일이 아닌 브라우저 인쇄 기능입니다. 시각화 일부는 정적 예시입니다. 자세한 검증 및 잔여 작업은 `QA_CHECKLIST.md`를 참고하세요.


## 2026-10-24 로고/연동 인수인계
- 공식 로고 원본 `public/assets/stepi-logo-official.png` 적용 (로그인, 회원가입, 사이드바).
- `API_MODE_QA.md`에 API 모드 확인 사항과 백엔드 담당자 협의 요청 정리.
- 실제 백엔드 연결은 아직 검증되지 않음.
