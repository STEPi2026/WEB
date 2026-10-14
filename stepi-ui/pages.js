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
    return `<section class="card">${filters(true)}${table(["번호", "학생 이름", "학년/반", "상태", "최근 학습일", "총 학습 시간", "목표 달성률", "관리"], studentRows())}<p class="sub" style="margin-top:20px">총 ${students.length}명의 학생 · 학생을 클릭하여 상세 정보 확인</p></section>`;
  },

  // 05. student
  student: function () {
    return `<div class="student-intro"><div class="avatar">👨🏻‍🎓</div><div><h2>${escapeHTML(students[selected][0])}</h2><p>${students[selected][1]}　 ${badge("활동 중")}　최근 학습일　2026.09.30</p></div><button data-action="edit-student">학생 정보 수정</button></div>${tabs(["학습 요약", "개념/Skill", "오류·오개념", "AI Tutor 개입", "학습 리포트", "학습 지속"])}${
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
    return (
      filters() +
      stats([
        ["◉", "평균 정답률", "72", "%", "5%"],
        ["◴", "평균 풀이 시간", "3분 42초", "", "20%"],
        ["▣", "분석한 문제 수", "1,842", "개", "24%"],
        ["♙", "활동 학생 수", "128", "명", "12명"],
      ]) +
      `<div class="grid">${card("학년별 학습 참여도", "최근 한 달간 학년별 참여율", `<svg class="chart" viewBox="0 0 300 240" role="img" aria-label="중1 82%, 중2 76%, 중3 60%">${[82, 76, 60].map((v, i) => `<rect x="${45 + i * 85}" y="${210 - v * 2}" width="40" height="${v * 2}" fill="${["var(--primary-400)", "var(--primary-300)", "var(--primary-200)"][i]}" rx="4"/><text x="${51 + i * 85}" y="${200 - v * 2}">${v}%</text><text x="${55 + i * 85}" y="232">중${i + 1}</text>`).join("")}</svg>`)}${card("일별 학습 추이", "전체 학생의 학습 참여 변화", lineChart())}</div>`
    );
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
              `<tr><td><span class="rank">${i + 1}</span></td><td>${tab === 2 ? students[i][0] : tab === 3 ? "P00" + (i + 1) + " · " + x : x}</td><td>${42 - i * 5}</td></tr>`,
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
      `<div class="heading"><div><h1>9월 전체 학습 리포트</h1><p>2026.09.01 – 2026.09.30</p></div><button class="primary" data-action="print">PDF 다운로드 / 인쇄</button></div>` +
      overview() +
      `<div class="grid">${card("학습 참여도 추이", "꾸준한 학습이 성장을 만듭니다", lineChart())}${card("핵심 인사이트", "9월 학습 데이터 요약", '<div class="insight">✧ 전체 학생의 평균 정답률이 전월 대비 5% 상승했습니다.</div><div class="insight">✧ 수와 연산 영역에서 가장 높은 숙련도를 보였습니다.</div><div class="insight">✧ 함수 영역의 개념 복습을 권장합니다.</div>')}</div>`
    );
  },

  // 12. problems
  problems: function () {
    return (
      tabs(["문제 목록", "문제 등록", "문제 일괄 등록"]) +
      (tab
        ? `<section class="card"><h3>${tab === 1 ? "새 문제 등록" : "문제 일괄 등록"}</h3><p class="sub">JSON 파일을 선택해 데모 문제 목록을 확인하세요.</p><input type="file" id="problem-file" accept=".json"><div id="file-result" class="insight">실제 업로드 저장을 위해서는 서버 연동이 필요합니다.</div></section>`
        : filters() +
          card(
            "문제 목록",
            "문제를 클릭하면 AI 분석 결과를 확인할 수 있습니다.",
            table(
              ["문제 ID", "문제 내용", "단원", "난이도", "유형", "상태"],
              [
                "일차방정식의 해를 구하시오.",
                "다음 식을 간단히 하세요.",
                "함수의 그래프를 고르시오.",
                "도형의 넓이를 구하시오.",
                "확률을 구하시오.",
              ].map(
                (x, i) =>
                  `<tr data-analysis="${i}" style="cursor:pointer"><td>P000${i + 1}</td><td>${x}</td><td>${["문자와 식", "문자와 식", "함수", "기하", "확률"][i]}</td><td>중</td><td>기본</td><td>${badge(i === 2 ? "미사용" : "사용 중", i === 2)}</td></tr>`,
              ),
            ),
          ))
    );
  },

  // 13. master
  master: function () {
    return (
      tabs(["개념 관리", "Skill 관리", "오개념 관리"]) +
      filters() +
      card(
        ["개념 목록", "Skill 목록", "오개념 목록"][tab],
        "학습 분석에 사용하는 기준 정보",
        table(
          ["개념 ID", "개념명", "상위 개념", "연결 항목 수", "사용 여부"],
          (tab === 0
            ? ["수와 연산", "문자와 식", "함수", "기하", "확률과 통계"]
            : tab === 1
              ? [
                  "식의 전개",
                  "방정식 풀이",
                  "그래프 해석",
                  "도형 추론",
                  "자료 분석",
                ]
              : [
                  "분수 크기 혼동",
                  "이항 부호 오류",
                  "좌표 해석 오류",
                  "넓이 공식 혼동",
                  "확률 계산 오류",
                ]
          ).map(
            (x, i) =>
              `<tr><td>C00${i + 1}</td><td>${x}</td><td>수학 기초</td><td>${12 + i * 3}</td><td>${badge("사용 중")}</td></tr>`,
          ),
        ),
      )
    );
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
      students.map(
        (s, i) =>
          `<tr data-tutor="${i}" style="cursor:pointer"><td>09.${30 - i}</td><td>${escapeHTML(s[0])}</td><td>${i % 2 ? "개념 복습" : "힌트 제공"}</td><td>${["부호 계산 힌트", "일차방정식 개념 설명", "유사 문제 제공", "도형 넓이 힌트", "비율 개념 가이드"][i]}</td><td>${badge(i === 3 ? "오답" : "정답", i === 3)}</td></tr>`,
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
        "9월 전체 학습 리포트",
        "중2-1 학습 리포트",
        "수학 단원 분석 리포트",
        "김수연 학생 개인 리포트",
        "오개념 분석 리포트",
      ].map(
        (x, i) =>
          `<tr><td>${i + 1}</td><td><a href="#report-detail">${tab === 1 ? students[i][0] + " 개인 학습 리포트" : x}</a></td><td>${i === 3 ? "김수연" : "전체 학생"}</td><td>2026.09.01 – 09.30</td><td>2026.09.30</td><td>${badge("완료")}</td><td><button data-action="download">다운로드 ↓</button></td></tr>`,
      ),
    ),
  );
}
