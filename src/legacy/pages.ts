// @ts-nocheck
import {students, page, tab, selected, query,appliedFilter,filteredStudents,scaled,demoProblems,masterData,aggregateMetrics,studentMetrics} from "./state";
import {overview,card,radar,lineChart,donut,table,studentRows,filters,stats,badge,escapeHTML,tabs,conceptBars} from "./components";
// Screen renderers. Numbers correspond to the supplied Figma overview.
const screens = {
  // 03. dashboard
  dashboard: function () {
    return (
      overview() +
      `<div class="grid three">${card("개념별 숙련도", "전체 학생의 영역별 학습 수준", radar())}${card("학습 추이", "일별 문제 풀이 및 학습 활동", lineChart())}${card("문제 정답 분포", "총 문제 풀이 결과", donut())}</div>` +
      card(
        "최근 학습한 학생",
        "학생을 선택하면 상세 학습 정보를 확인할 수 있습니다.",
        table(
          [
            "번호",
            "학생 이름",
            "학년/반",
            "상태",
            "최근 학습일",
            "총 학습 시간",
            "목표 달성률",
            "",
          ],
          studentRows(),
        ),
      )
    );
  },

  // 04. students
  students: function () {
    return `<section class="card">${filters(true)}${table(["번호", "학생 이름", "학년/반", "상태", "최근 학습일", "총 학습 시간", "목표 달성률", "관리"], studentRows())}<p class="sub" style="margin-top:20px">검색 결과 ${filteredStudents().length}명 / 전체 ${students.length}명 · 학생을 클릭하여 상세 정보 확인</p></section>`;
  },

  // 05. student
  student: function () {
    return `<div class="student-intro"><div class="avatar">👨🏻‍🎓</div><div><h2>${escapeHTML(students[selected][0])}</h2><p>${students[selected][1]}　 ${badge("활동 중")}　최근 학습일　${appliedFilter.end}</p></div><button data-action="edit-student">학생 정보 수정</button></div>${tabs(["학습 요약", "개념/Skill", "오류·오개념", "AI Tutor 개입", "학습 리포트", "학습 지속"])}${
      tab === 0
        ? stats([
            ["▣", "분석한 문제 수", "867", "개", "18%"],
            ["◉", "정답률", "78", "%", "7%"],
            ["◴", "총 학습 시간", "6h 30m", "", "2h"],
            ["♧", "연속 학습일", "5", "일 🔥", "1일"],
          ]) +
          `<div class="grid">${card("개념별 숙련도", "영역별 이해 수준", radar())}${card("학습 추이", "최근 한 달간의 학습 변화", lineChart())}</div>`
        : tab === 1
          ? card("개념/Skill 숙련도", "학생의 세부 영역별 분석", conceptBars())
          : tab === 2
            ? card("주요 오류 분석", "자주 발생하는 오류 유형", donut("331"))
            : tab === 3
              ? tutorTable()
              : tab === 4
                ? reportTable()
                : card("학습 지속 현황", "꾸준히 성장하고 있어요", lineChart())
    }`;
  },

  // 06. learning
  learning: function () {
    const m=aggregateMetrics(); const accuracy=m.attempts?Math.round(100*m.correct/m.attempts):0;
    return filters()+stats([
      ['◉','평균 정답률',String(accuracy),'%','데모 집계'],
      ['◴','평균 풀이 시간',m.attempts?String(Math.round(m.minutes/m.attempts)):'0','분','데모 집계'],
      ['▣','분석한 문제 수',String(m.attempts),'개','데모 집계'],
      ['♙','활동 학생 수',String(m.active),'명','데모 집계']
    ])+`<div class="grid">${card('학생별 풀이 현황','선택한 조회 기간의 재현 가능한 모의 데이터',table(['학생','풀이 수','정답 수','정답률'],filteredStudents().map(({s,i})=>{const x=studentMetrics(i);return `<tr><td>${escapeHTML(s[0])}</td><td>${x.attempts}</td><td>${x.correct}</td><td>${x.attempts?Math.round(x.correct/x.attempts*100):0}%</td></tr>`;})))}${card('학습 추이','기간 변경 시 데모 통계 재계산',lineChart())}</div>`;
  },

  // 07. concepts
  concepts: function () {
    return (
      tabs(["개념별 분석", "Skill별 분석"]) +
      filters() +
      `<div class="grid">${card(tab ? "Skill별 숙련도 현황" : "개념별 숙련도 현황", "전체 학생 · 평균 숙련도", conceptBars(!!tab))}${card("정답률 분포", "정답 / 오답 / 부분 정답 / 미응답", ["수와 연산", "문자와 식", "함수", "기하", "확률과 통계"].map((x, i) => `<p class="sub" style="margin-bottom:0">${x}</p><div class="stack"><i style="width:${58 - i * 5}%"></i><i style="width:20%"></i><i style="flex:1"></i></div>`).join(""))}</div>`
    );
  },

  // 08. errors
  errors: function () {
    return (
      tabs([
        "반복 오개념 TOP 10",
        "오류 유형 분석",
        "학생별 오개념",
        "문제별 분석",
      ]) +
      filters() +
      `<div class="grid">${card(
        tab === 0
          ? "반복 오개념 TOP 10"
          : ["", "오류 유형 분석", "학생별 오개념", "문제별 분석"][tab],
        "오류가 자주 발생하는 학습 항목",
        table(
          ["순위", tab === 2 ? "학생 이름" : "오개념 내용", "발생 횟수"],
          [
            "분수의 크기 비교",
            "일차방정식 해석",
            "함수의 그래프 해석",
            "도형의 넓이 공식",
            "확률의 기본 개념",
          ].map(
            (x, i) =>
              `<tr><td><span class="rank">${i + 1}</span></td><td>${tab === 2 ? students[i]?.[0] || "학생 없음" : tab === 3 ? "P00" + (i + 1) + " · " + x : x}</td><td>${scaled(42 - i * 5)}</td></tr>`,
          ),
        ),
      )}${card("오류 유형 분포", "학습 중 발견된 오류의 비율", donut("331"))}</div>`
    );
  },

  // 09. tutor
  tutor: function () {
    return filters() + tutorTable();
  },

  // 10. reports
  reports: function () {
    return (
      tabs(["자동 리포트", "학생 리포트", "반 리포트", "기간 리포트"]) +
      filters() +
      reportTable()
    );
  },

  // 11. report-detail
  "report-detail": function () {
    return (
      `<div class="heading"><div><h1>기간별 전체 학습 리포트</h1><p>${appliedFilter.start} – ${appliedFilter.end}</p></div><button class="primary" data-action="print">PDF 다운로드 / 인쇄</button></div>` +
      overview() +
      `<div class="grid">${card("학습 참여도 추이", "꾸준한 학습이 성장을 만듭니다", lineChart())}${card("핵심 인사이트", "선택 기간 학습 데이터 요약", `<div class="insight">선택 기간 모의 풀이 수: ${aggregateMetrics().attempts}건</div><div class="insight">모의 정답 수: ${aggregateMetrics().correct}건</div><div class="insight">실제 학습 분석 및 AI 결과는 백엔드 연동 후 제공됩니다.</div>`)}</div>`
    );
  },

  // 12. problems
  problems: function () {
    return tabs(['문제 목록','문제 등록','문제 일괄 등록'])+
    (tab===1?`<section class="card"><h3>새 문제 등록 (로컬 데모)</h3><form id="problem-create-form" class="admin-form"><label>문제 내용<input name="text" required maxlength="300" placeholder="문제를 입력하세요"/></label><label>단원<input name="unit" required placeholder="예: 함수"/></label><label>난이도<select name="difficulty"><option>하</option><option selected>중</option><option>상</option></select></label><button class="primary" type="submit">문제 등록</button></form></section>`:
    tab===2?`<section class="card"><h3>문제 일괄 등록</h3><p class="sub">JSON 배열 또는 {"problems": [...]} 형식, 각 항목에 text 필드 필수</p><input type="file" id="problem-file" accept=".json,application/json"/><div id="file-result" class="insight">파일 검증 후 브라우저에만 저장됩니다.</div></section>`:
    filters()+card('문제 목록','수정·삭제는 로컬 데모에 저장됩니다',table(['문제 ID','문제 내용','단원','난이도','상태','관리'],demoProblems.map(p=>`<tr><td>${escapeHTML(p.id)}</td><td>${escapeHTML(p.text)}</td><td>${escapeHTML(p.unit)}</td><td>${escapeHTML(p.difficulty)}</td><td>${badge(p.active?'사용 중':'미사용',!p.active)}</td><td><button data-action="toggle-problem" data-id="${escapeHTML(p.id)}">상태 변경</button> <button data-action="delete-problem" data-id="${escapeHTML(p.id)}">삭제</button> <button data-action="view-problem" data-id="${escapeHTML(p.id)}">AI 예시</button></td></tr>`)))) ;
  },

  // 13. master
  master: function () {
    const key=['concepts','skills','misconceptions'][tab]||'concepts';const rows=masterData[key]||[];
    return tabs(['개념 관리','Skill 관리','오개념 관리'])+`<section class="card"><h3>${['개념','Skill','오개념'][tab]} 데이터 관리 (로컬 데모)</h3><form id="master-create-form" class="admin-form"><label>이름<input name="name" maxlength="80" required placeholder="새 항목 이름"/></label><label>상위 분류<input name="parent" maxlength="80" placeholder="수학"/></label><button type="submit" class="primary">항목 추가</button></form></section>`+
    card('기준 데이터 목록','추가·상태 변경·삭제를 브라우저에 저장',table(['ID','이름','상위 분류','상태','관리'],rows.map(x=>`<tr><td>${escapeHTML(x.id)}</td><td>${escapeHTML(x.name)}</td><td>${escapeHTML(x.parent)}</td><td>${badge(x.active?'사용 중':'미사용',!x.active)}</td><td><button data-action="toggle-master" data-id="${escapeHTML(x.id)}">상태 변경</button> <button data-action="delete-master" data-id="${escapeHTML(x.id)}">삭제</button></td></tr>`)));
  },

  // 14. analysis
  analysis: function () {
    return `<div class="grid">${card("문제 이미지", "P0031 · 수학 연산", `<div class="paper">다음 일차방정식을 풀어보세요.<br>3(x + 2) = 2x + 10<br>3x + 6 = 2x + 10<br>x = 10 + 6<br>∴ x = 16</div>`)}${card(
      "AI 분석 결과",
      "단계별 풀이 검토",
      table(
        ["단계", "분석 내용", "결과"],
        ["분배법칙 적용", "동류항 정리", "이항 부호 처리", "최종 정답"].map(
          (x, i) =>
            `<tr><td>Step ${i + 1}</td><td>${x}</td><td>${badge(i === 2 ? "오류" : "정상", i === 2)}</td></tr>`,
        ),
      ) +
        '<div class="insight">💡 최초 오류 위치: Step 3<br>이항할 때 부호를 바꾸어야 합니다. x = 10 − 6 = 4</div>',
    )}</div>`;
  },

  // 15. tutor-detail
  "tutor-detail": function () {
    return `<div class="grid">${card("문제 정보", "김수연 학생 · P0031", '<div class="paper">3(x + 2) = 2x + 10<br>3x + 6 = 2x + 10<br>x = ?</div><div class="insight">단원　문자와 식<br>난이도　중<br>개입 유형　개념 힌트</div>')}${card("AI Tutor 개입 과정", "학생의 이해를 돕는 단계별 안내", '<div class="timeline"><p>오류 탐지　<span class="badge red">이항 부호 오류</span></p><p>힌트 제공　이항할 때 부호는 어떻게 바뀔까요?</p><p>개념 복습　등식의 양변에 같은 수를 빼 보세요.</p><p>재풀이　x = 10 − 6</p><p>재도전 성공　' + badge("정답 (x = 4)") + "</p></div>")}</div>`;
  },

  // 16. gamification
  gamification: function () {
    return (
      tabs(["전체 현황", "Badge 현황", "Daily 연습", "Daily Quest 현황"]) +
      stats([
        ["♧", "평균 레벨", "Lv.12", "", "2"],
        ["✧", "총 XP", "12,450", "XP", "1,250"],
        ["◴", "연속 학습일", "5", "일", "1"],
        ["▣", "획득한 Badge", "328", "개", "45"],
      ]) +
      `<div class="grid">${card(tab === 2 ? "Daily 연습 현황" : tab === 3 ? "Daily Quest 달성 추이" : "학습 지속 현황", "일별 학습 참여 및 목표 달성", lineChart())}${card("Badge 달성 비율", "학생들의 성장을 함께 축하해요", donut("328"))}</div>`
    );
  },
};

function content() {
  return screens[page]?.() || "";
}

function tutorTable() {
  return card(
    "AI Tutor 개입 내역",
    "행을 선택하면 개입 과정을 확인할 수 있습니다.",
    table(
      ["날짜", "학생 이름", "개입 유형", "내용", "결과"],
      filteredStudents().map(
        ({s,i}) =>
          `<tr data-tutor="${i}" style="cursor:pointer"><td>${appliedFilter.end.slice(5)}</td><td>${escapeHTML(s[0])}</td><td>${i % 2 ? "개념 복습" : "힌트 제공"}</td><td>${["부호 계산 힌트", "일차방정식 개념 설명", "유사 문제 제공", "도형 넓이 힌트", "비율 개념 가이드"][i]}</td><td>${badge(i === 3 ? "오답" : "정답", i === 3)}</td></tr>`,
      ),
    ),
  );
}

function reportTable() {
  return card(
    "생성된 리포트",
    "리포트 제목을 클릭하여 상세 내용을 확인하세요.",
    table(
      ["번호", "리포트 제목", "대상", "기간", "생성일", "상태", "다운로드"],
      [
        "기간별 전체 학습 리포트",
        "중2-1 학습 리포트",
        "수학 단원 분석 리포트",
        "김수연 학생 개인 리포트",
        "오개념 분석 리포트",
      ].map(
        (x, i) =>
          `<tr><td>${i + 1}</td><td><a href="#report-detail">${tab === 1 ? (students[i]?.[0] || "학생 없음") + " 개인 학습 리포트" : x}</a></td><td>${i === 3 ? "김수연" : "전체 학생"}</td><td>${appliedFilter.start} – ${appliedFilter.end}</td><td>${appliedFilter.end}</td><td>${badge("완료")}</td><td><button data-action="download">다운로드 ↓</button></td></tr>`,
      ),
    ),
  );
}

export {screens,content,tutorTable,reportTable};
