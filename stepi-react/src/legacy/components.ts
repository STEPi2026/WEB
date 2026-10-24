// @ts-nocheck
import {menus, students, page, tab, selected, query,appliedFilter,filteredStudents,scaled,demoFactor} from "./state";
import {content} from "./pages";
// Shared UI: charts, cards, metrics, filters, table, tabs and brand.
function logo() {
  return `<div class="logo"><img src="/assets/stepi-logo-official.png" alt="STEPi"></div>`;
}

const escapeHTML = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

const badge = (s, red = false) =>
  `<span class="badge ${red ? "red" : ""}">${s}</span>`;

function lineChart() {
  const offset=(appliedFilter.start==='2026-09-01'&&appliedFilter.end==='2026-09-30'&&!appliedFilter.student)?0:(appliedFilter.start.length*7+Number(appliedFilter.start.slice(-2))*5+Number(appliedFilter.end.slice(-2))*3+(appliedFilter.student?Number(appliedFilter.student)*11+9:0));
  return `<svg class="chart" viewBox="0 0 480 240" role="img" aria-label="9월 학습 추이: 월말로 갈수록 상승"><defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop stop-color="var(--primary-300)" stop-opacity=".25"/><stop offset="1" stop-color="var(--primary-300)" stop-opacity="0"/></linearGradient></defs>${[40, 85, 130, 175, 215].map((y, i) => `<line class="gridline" x1="35" y1="${y}" x2="465" y2="${y}"/><text x="5" y="${y + 4}">${100 - i * 25}</text>`).join("")}<path d="M35 ${198-offset%17} L78 ${178-offset%23} L121 ${181-offset%29} L164 ${135-offset%19} L207 ${150-offset%31} L250 ${105-offset%17} L293 ${116-offset%27} L336 ${92-offset%19} L379 ${107-offset%13} L422 ${66-offset%15} L465 ${28+offset%23} L465 215 L35 215Z" fill="url(#area)"/><polyline points="35,205 78,199 121,190 164,180 207,183 250,160 293,145 336,151 379,132 422,125 465,102" fill="none" stroke="var(--primary-200)" stroke-width="2"/><polyline points="35,198 78,178 121,181 164,135 207,150 250,105 293,116 336,92 379,107 422,66 465,28" fill="none" stroke="var(--primary-500)" stroke-width="3"/>${[
    [35, 198],
    [78, 178],
    [121, 181],
    [164, 135],
    [207, 150],
    [250, 105],
    [293, 116],
    [336, 92],
    [379, 107],
    [422, 66],
    [465, 28],
  ]
    .map(
      ([x, y]) =>
        `<circle cx="${x}" cy="${y}" r="3.5" fill="var(--primary-500)"/>`,
    )
    .join(
      "",
    )}${["09.01", "09.05", "09.10", "09.15", "09.20", "09.25", "09.30"].map((s, i) => `<text x="${28 + i * 69}" y="238">${s}</text>`).join("")}</svg>`;
}

function radar() {
  return `<svg class="chart" viewBox="0 0 300 240" role="img" aria-label="개념별 숙련도 방사형 차트"><g fill="none" stroke="var(--primary-100)">${[1, 0.75, 0.5, 0.25].map((s) => `<polygon points="150,40 230,85 230,165 150,210 70,165 70,85" transform="translate(${150 * (1 - s)} ${125 * (1 - s)}) scale(${s})"/>`).join("")}<path d="M150 40V210 M70 85L230 165 M230 85L70 165"/></g><polygon points="150,58 216,92 208,153 150,192 84,158 89,96" fill="var(--primary-300)" stroke="var(--primary-400)" stroke-width="2"/>${[
    ["수와 연산", 127, 22],
    ["문자와 식", 232, 79],
    ["함수", 239, 178],
    ["기하", 140, 234],
    ["확률과 통계", 0, 177],
    ["자료와 가능성", 0, 80],
  ]
    .map(([s, x, y]) => `<text x="${x}" y="${y}">${s}</text>`)
    .join("")}</svg>`;
}

function donut(n = "1,842") {
  n=scaled(Number(n.replaceAll(",",""))).toLocaleString("ko-KR");
  return `<div class="donut-wrap"><div class="donut"><div class="donut-center">총 ${n === "331" ? "오류 수" : "문제 수"}<strong>${n}</strong></div></div><div class="donut-legend">${["개념 이해 38%", "풀이 과정 28%", "계산 실수 15%", "공식 적용 12%", "기타 7%"].map((x) => `<span>${x}</span>`).join("")}</div></div>`;
}

const card = (title, sub, body) =>
  `<section class="card"><div class="card-head"><h3>${title}</h3><span style="color:var(--gray-300)">···</span></div><p class="sub">${sub}</p>${body}</section>`;

function stats(items) {
  items=items.map(x=>{const a=[...x];if(/^\d[\d,]*$/.test(a[2]))a[2]=scaled(Number(a[2].replaceAll(",",""))).toLocaleString("ko-KR");return a;});
  return `<div class="stats">${items.map(([icon, label, value, unit, trend]) => `<div class="stat"><div class="stat-label"><i>${icon}</i>${label}</div><div class="stat-value">${value}<small>${unit}</small></div><div class="trend">▲ ${trend}<span>지난 기간 대비</span></div></div>`).join("")}</div>`;
}

const overview = () =>
  stats([
    ["♙", "활동 학생 수", "128", "명", "12명"],
    ["▣", "전체 문제 풀이 수", "1,842", "개", "24%"],
    ["◴", "총 누적 학습 시간", "106h 20m", "", "16h"],
    ["◉", "오늘의 학습 목표 달성률", "78", "%", "5%"],
  ]);

function filters(search = false) {
  return `<div class="filters">${search ? '<input id="student-search" type="search" aria-label="학생 이름 검색" placeholder="⌕  학생 이름으로 검색" value="' + escapeHTML(query) + '">' : '<span>학생</span><select aria-label="학생 선택" id="student-filter"><option value="">전체 학생</option>' + students.map((s, i) => `<option value="${i}" ${appliedFilter.student===String(i)?"selected":""}>${escapeHTML(s[0])}</option>`).join("") + "</select>"}<span>기간</span><input id="start-date" type="date" aria-label="조회 시작일" value="${appliedFilter.start}"><span>—</span><input id="end-date" type="date" aria-label="조회 종료일" value="${appliedFilter.end}"><button class="primary" data-action="filter">조회</button>${search ? '<button class="primary push" data-action="add-student">＋ 학생 추가</button>' : ""}</div>`;
}

function table(headers, rows) {
  return `<div class="table-wrap"><table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody></table></div>`;
}

function studentRows() {
  return filteredStudents()
    .map(
      ({ s, i }) =>
        `<tr data-student="${i}" tabindex="0" role="button" aria-label="${s[0]} 학생 상세 보기"><td><span class="rank">${i + 1}</span></td><td><strong>${escapeHTML(s[0])}</strong></td><td>${s[1]}</td><td>${badge(s[2] ? "활동 중" : "미활동", !s[2])}</td><td>2026.09.30</td><td>${s[3]}</td><td>${s[4]}%</td><td>›</td></tr>`,
    );
}

function tabs(labels) {
  return `<div class="tabs">${labels.map((l, i) => `<button class="${tab === i ? "active" : ""}" data-tab="${i}">${l}</button>`).join("")}</div>`;
}

function conceptBars(skill = false) {
  let labels = skill
    ? ["식의 전개", "방정식 풀이", "그래프 해석", "도형 추론", "자료 분석"]
    : [
        "수와 연산",
        "문자와 식",
        "함수",
        "기하",
        "확률과 통계",
        "자료와 가능성",
      ];
  return labels
    .map(
      (s, i) =>
        `<div class="bar-row"><span>${s}</span><div class="track"><span style="width:${[72, 58, 51, 59, 69, 71][i]}%"></span></div><strong>${[72, 58, 51, 59, 69, 71][i]}%</strong></div>`,
    )
    .join("");
}

// Application shell: shared sidebar, header, page title and footer.
function layout() {
  const parent =
    {
      student: "students",
      "report-detail": "reports",
      analysis: "problems",
      "tutor-detail": "tutor",
    }[page] || page;
  const title =
    {
      student: "학생 상세",
      analysis: "AI 분석 결과 상세",
      "report-detail": "리포트 상세 보기",
      "tutor-detail": "AI Tutor 개입 상세",
    }[page] ||
    menus.find((m) => m[0] === page)?.[2] ||
    "대시보드";
  return `<div class="shell"><aside class="sidebar">${logo()}<p class="nav-label">WORKSPACE</p><nav class="nav" aria-label="주 메뉴">${menus.map(([id, icon, name]) => `<button data-page="${id}" class="${parent === id ? "active" : ""}" title="${name}" ${parent === id ? 'aria-current="page"' : ""}><span class="icon">${icon}</span><span class="nav-text">${name}</span></button>`).join("")}</nav><div class="profile"><div class="avatar">♟</div><div>관리자<small>온라인 · 데모 계정</small></div><button data-action="logout" title="로그아웃" aria-label="로그아웃">↪</button></div></aside><main class="main"><header class="topbar"><input type="search" id="global-search" aria-label="학생 빠른 검색" placeholder="⌕　학생 이름으로 빠르게 검색"><div class="top-right"><button class="dot" data-action="notifications" aria-label="알림" style="border:0;padding:6px">♧</button><div class="avatar">♟</div><span style="font-size:12px">관리자　⌄</span></div></header><div class="content"><div class="heading"><div><span class="eyebrow">STEPi LEARNING ANALYTICS</span><h1>${title}</h1><p>학습의 모든 순간을 연결하고, 더 나은 성장을 함께 만듭니다.</p></div><span class="period">▦　${appliedFilter.start} – ${appliedFilter.end}</span></div>${content()}</div><footer class="footer">© 2026 STEPi. Learning, one step at a time.　·　샘플 데이터 기반 UI · 실제 분석 결과 아님　<button data-action="reset-demo" style="font-size:11px">데모 데이터 초기화</button></footer></main></div>`;
}

export { logo, escapeHTML, badge, lineChart, radar, donut, card, stats, overview, filters, table, studentRows, tabs, conceptBars, layout };
