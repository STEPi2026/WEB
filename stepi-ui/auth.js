// 01. Login / 02. Signup — shared authentication layout.
function auth(signup = false) {
  $("#app").innerHTML =
    `<div class="auth"><div class="auth-art"><div>${logo()}<p>AI와 함께<br>수학의 가능성을 넓히다</p><p style="font-size:12px;font-weight:400">한 걸음씩, 나만의 속도로 성장하는 학습</p></div></div><div class="auth-main"><form class="auth-form" id="auth-form">${logo()}<h2>${signup ? "새로운 학습 여정을 시작하세요" : "STEPi에 오신 것을 환영합니다"}</h2><p>${signup ? "회원으로 등록하고 더 나은 학습을 경험해 보세요." : "관리자 계정으로 로그인하세요."}</p>${signup ? '<div class="roles"><button type="button">학생</button><button type="button">학부모</button><button type="button">교사</button><button type="button" class="active">관리자</button></div><label>이름<input name="name" required placeholder="이름을 입력하세요" autocomplete="name"></label>' : ""}<label>이메일<input name="email" type="email" required placeholder="이메일을 입력하세요" autocomplete="email"></label><label>비밀번호<input name="password" id="password" type="password" required minlength="4" placeholder="비밀번호를 입력하세요" autocomplete="${signup ? "new-password" : "current-password"}"></label>${signup ? '<label>비밀번호 확인<input id="password-confirm" type="password" required minlength="4" placeholder="비밀번호를 다시 입력하세요" autocomplete="new-password"></label><label><input type="checkbox" required> 데모 서비스 이용에 동의합니다.</label>' : '<label><input type="checkbox"> 로그인 상태 유지</label>'}<button class="primary">${signup ? "회원가입" : "로그인"}</button><button type="button" data-action="demo" style="width:100%">데모 대시보드 둘러보기 →</button><div class="auth-bottom">${signup ? '이미 계정이 있으신가요? <a href="#login">로그인</a>' : '계정이 없으신가요? <a href="#signup">회원가입하기</a>'}</div><p style="text-align:center;margin-top:28px">UI 데모 · 실제 계정 인증은 제공하지 않습니다.</p></form></div></div>`;
  $("#auth-form").onsubmit = async (e) => {
    e.preventDefault();
    if (signup && $("#password").value !== $("#password-confirm").value) {
      toast("비밀번호가 일치하지 않습니다.");
      return;
    }
    try {
      const data = new FormData(e.target);
      if (signup) await api.auth.signup(Object.fromEntries(data));
      else await api.auth.login(Object.fromEntries(data));
      toast(
        signup
          ? "데모 회원가입이 완료되었습니다."
          : "데모 모드로 로그인했습니다.",
      );
      location.hash = "dashboard";
    } catch (error) {
      toast(error.message);
    }
  };
  document.querySelectorAll(".roles button").forEach(
    (b) =>
      (b.onclick = () => {
        document
          .querySelectorAll(".roles button")
          .forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
      }),
  );
}
