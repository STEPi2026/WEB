# STEPi 학습 관리 UI

첨부된 보라색 Figma 16개 화면을 참고한 프런트엔드 데모입니다. 공통 UI, 화면, API, 색상 정의를 분리했습니다. 전달받은 로고 이미지를 그대로 사용합니다.

## 실행

`index.html`을 브라우저에서 엽니다. 설치나 빌드 없이 실행되며, 파일 실행을 지원하는 일반 브라우저를 사용하세요. 또는 이 폴더에서 `python -m http.server 8080` 실행 후 http://localhost:8080 에 접속합니다.

## 파일 구조

```text
stepi-ui/
├── index.html       # 진입점, 학생 추가 대화상자, 스크립트 로드 순서
├── tokens.css       # 첨부 컬러표의 HEX 값과 의미별 색상 변수
├── styles.css       # 공통 스타일, 반응형 레이아웃, 인쇄 스타일
├── components.js    # 로고, 공통 레이아웃, 카드, 표, 탭, 필터, 차트
├── pages.js         # 03~16번 화면별 렌더 함수
├── auth.js          # 01 로그인, 02 회원가입 및 공유 인증 레이아웃
├── api.js           # API 설정, 공통 HTTP 요청, 데모 데이터와 API 메서드
├── app.js           # 라우팅, 화면 상태, 이벤트 연결, 초기 데이터 로딩
├── verify.cjs       # Node 기본 모듈만 사용하는 회귀 검사
└── assets/
    └── stepi-logo.png
```

별도 프레임워크와 번들러 없이 파일을 직접 열 수 있도록 일반 스크립트를 사용합니다. index.html의 로드 순서(api → components → pages → auth → app)를 유지하세요. 화면 함수는 호출 시 app.js의 상태를 읽습니다. UI 수정은 components.js, 특정 화면 수정은 pages.js의 번호 주석, 색상 수정은 tokens.css에서 시작하세요.

## 화면 번호

| 번호 | 화면 | 주소 해시 |
| --- | --- | --- |
| 01 | 로그인 | #login |
| 02 | 회원가입 | #signup |
| 03 | 대시보드 | #dashboard |
| 04 | 학생 관리 | #students |
| 05 | 학생 상세 | #student |
| 06 | 학습 현황 | #learning |
| 07 | 개념/Skill 분석 | #concepts |
| 08 | 오류·오개념 분석 | #errors |
| 09 | AI Tutor 개입 내역 | #tutor |
| 10 | 학습 리포트 | #reports |
| 11 | 리포트 상세 | #report-detail |
| 12 | 문제 데이터 관리 | #problems |
| 13 | 기준 데이터 관리 | #master |
| 14 | AI 분석 결과 상세 | #analysis |
| 15 | AI Tutor 개입 상세 | #tutor-detail |
| 16 | 게이미피케이션 | #gamification |

학생 행, 문제 행, Tutor 행, 리포트 제목을 누르면 해당 상세 화면으로 이동합니다.

## 색상 사용

UI의 CSS·SVG·인라인 스타일은 tokens.css의 색상 변수만 참조합니다. 기본 보라색은 #7C5CFC, 호버는 #5B3FD6, 성공은 #22A06B, 오류는 #E5484D입니다. 나머지 값도 첨부한 두 컬러표의 HEX 값만 정의했습니다. 원본 로고 이미지의 픽셀 색상은 유지합니다.

## API 연결

기본값은 `api.js`의 `config.mock: true`입니다. 로그인·회원가입·학생 조회·학생 추가가 이 파일의 API 경계를 통해 실행됩니다. 데모 학생은 메모리에 저장되어 새로고침하면 초기화됩니다. 비밀번호는 저장하지 않습니다.

실제 서버를 연결하려면 다음을 수정합니다.

1. `config.mock`을 `false`로 변경하고 `baseUrl`을 서버 주소로 설정합니다.
2. 아래 제안 경로를 실제 백엔드 명세에 맞게 수정합니다.
3. `toStudentRow`를 서버 응답 필드에 맞게 조정합니다.
4. 서버에서 인증·권한·입력 검증 및 쿠키/CORS 정책을 구현합니다.

| 메서드 | 제안 경로 | 요청 / 응답 |
| --- | --- | --- |
| POST | /auth/login | `{email,password}` / 사용자 정보 |
| POST | /auth/signup | `{name,email,password}` / 사용자 정보 |
| GET | /students | 학생 객체 배열 |
| POST | /students | `{name,grade}` / 생성 결과 |

학생 객체 필드: `name`, `grade`, `active`, `studyTime`, `goalRate`. 조회 응답은 페이지용 배열로 변환합니다. 현재 상세 화면은 선택한 행의 인덱스를 사용하며, 향후 개별 조회·수정 기능을 연결할 때 서버의 고유 ID로 변경해야 합니다. HTTP 요청은 공통 request 함수에서 JSON, 쿠키 포함, 상태 코드 오류를 처리합니다. UI에는 실패 메시지가 표시됩니다.

학습 분석·문제·Tutor·리포트 수치는 pages.js의 정적 예시입니다. 연결되지 않은 엔드포인트를 구현 완료로 표시하지 않습니다. 기간 조회는 데모 안내만 표시하며, 문제 파일은 선택까지만 지원합니다. CSV 다운로드는 현재 학생 목록을 내보내고 PDF 버튼은 브라우저 인쇄를 사용합니다.

## 검증

```sh
node verify.cjs
```

16개 화면 및 26개 탭 상태 렌더링, 학생 검색·추가, HTML 이스케이프, 데모/HTTP API 분기, HTTP 오류 전파, 색상 변수 사용을 검사합니다. DOM 스텁 기반 검사이므로 실제 브라우저 배치·클릭·반응형 시각 검증을 대체하지 않습니다.

원본 Figma 문서 대신 첨부된 화면 이미지를 기반으로 재구성했습니다. 실제 서비스 연결과 개별 고해상도 화면에 맞춘 세부 조정은 별도 작업입니다.
