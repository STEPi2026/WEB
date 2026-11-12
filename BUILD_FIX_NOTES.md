# 빌드 오류 수정 기록

- `src/App.tsx`: 중복 import `appliedFilter` 제거 (TS2300 2건)
- `src/App.tsx`: 기준 데이터 탭 인덱스가 `null`인 경우 `0` 사용 (TS2538 1건). 같은 표현이 있던 두 위치 모두 수정.

## Windows PowerShell 실행

1. VS Code에서 `STEPi_React_Integration_Ready` 폴더를 직접 열기
2. `npm.cmd install`
3. `npm.cmd run build`
4. `npm.cmd run dev`

**검증 상태:** 이번 실행 환경에서 npm 패키지 다운로드가 시간 초과되어 전체 빌드는 실행하지 못했습니다. 사용자가 보고한 TypeScript 오류 3개의 원인을 코드에서 수정한 버전입니다. 전체 기능 및 실제 API 연동이 완료됐다는 의미는 아닙니다.
