const $ = (s) => document.querySelector(s);
const menus = [
  ["dashboard", "▦", "대시보드"],
  ["students", "♙", "학생 관리"],
  ["learning", "▤", "학습 현황"],
  ["concepts", "◇", "개념/Skill 분석"],
  ["errors", "⌕", "오류·오개념 분석"],
  ["tutor", "✧", "AI Tutor 개입 내역"],
  ["reports", "▧", "학습 리포트"],
  ["problems", "▣", "문제 데이터 관리"],
  ["master", "⚙", "기준 데이터 관리"],
  ["gamification", "♧", "게이미피케이션"],
];
let page = "login",
  tab = 0,
  selected = 0,
  query = "";
let students = [];

function toast(t) {
  $("#toast").textContent = t;
  $("#toast").classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(
    () => $("#toast").classList.remove("show"),
    2600,
  );
}

function render() {
  if (page === "login" || page === "signup") {
    auth(page === "signup");
    return;
  }
  $("#app").innerHTML = layout();
  if ($("#student-search"))
    $("#student-search").oninput = (e) => {
      query = e.target.value;
      const body = $("tbody");
      body.innerHTML =
        studentRows().join("") ||
        '<tr><td colspan="8" class="empty">검색 결과가 없습니다.</td></tr>';
    };
  $("#global-search").onkeydown = (e) => {
    if (e.key === "Enter") {
      query = e.target.value;
      if (page === "students") render();
      else location.hash = "students";
    }
  };
  if ($("#problem-file"))
    $("#problem-file").onchange = (e) => {
      $("#file-result").textContent = e.target.files[0]
        ? `${e.target.files[0].name} 선택됨 · 데모에서는 서버에 저장되지 않습니다.`
        : "파일을 선택하세요.";
    };
}
document.addEventListener("click", (e) => {
  const nav = e.target.closest("[data-page]");
  if (nav) {
    location.hash = nav.dataset.page;
    return;
  }
  const t = e.target.closest("[data-tab]");
  if (t) {
    tab = Number(t.dataset.tab);
    render();
    return;
  }
  const student = e.target.closest("[data-student]");
  if (student) {
    selected = Number(student.dataset.student);
    tab = 0;
    location.hash = "student";
    return;
  }
  if (e.target.closest("[data-analysis]")) {
    location.hash = "analysis";
    return;
  }
  if (e.target.closest("[data-tutor]")) {
    location.hash = "tutor-detail";
    return;
  }
  const action = e.target.closest("[data-action]")?.dataset.action;
  if (action === "demo") location.hash = "dashboard";
  if (action === "notifications") toast("새로운 알림이 없습니다.");
  if (action === "filter") {
    const start = $("#start-date")?.value,
      end = $("#end-date")?.value;
    if (!start || !end || start > end) {
      toast("올바른 조회 기간을 선택하세요.");
      return;
    }
    toast(`${start} ~ ${end} 조회 · 샘플 데이터입니다.`);
  }
  if (action === "add-student") $("#modal").showModal();
  if (action === "edit-student")
    toast("학생 정보는 학생 관리에서 확인할 수 있습니다.");
  if (action === "print") window.print();
  if (action === "download") {
    const blob = new Blob(
      [
        "\ufeff학생,학년,학습시간,달성률\r\n" +
          students.map((s) => `${s[0]},${s[1]},${s[3]},${s[4]}%`).join("\r\n"),
      ],
      { type: "text/csv;charset=utf-8;" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "STEPi-학습리포트.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast("학습 리포트를 다운로드했습니다.");
  }
});
document.addEventListener("keydown", (e) => {
  if (
    (e.key === "Enter" || e.key === " ") &&
    e.target.matches("[data-student]")
  ) {
    e.preventDefault();
    e.target.click();
  }
});
$("#cancel").onclick = () => $("#modal").close();
$("#student-form").onsubmit = async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  try {
    await api.students.create({
      name: form.get("name").trim(),
      grade: form.get("grade"),
    });
    students = await api.students.list();
  } catch (error) {
    toast(error.message);
    return;
  }
  query = "";
  $("#modal").close();
  e.target.reset();
  render();
  toast("학생이 추가되었습니다.");
};
function route() {
  const next = location.hash.slice(1) || "login";
  page = [
    ...menus.map((x) => x[0]),
    "login",
    "signup",
    "student",
    "report-detail",
    "analysis",
    "tutor-detail",
  ].includes(next)
    ? next
    : "login";
  tab = 0;
  render();
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", route);
async function init() {
  try {
    students = await api.students.list();
    route();
  } catch (error) {
    $("#app").textContent = "데이터를 불러오지 못했습니다: " + error.message;
  }
}
init();