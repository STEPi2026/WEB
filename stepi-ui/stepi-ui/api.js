/**
 * Single API boundary. Pages never call fetch directly.
 * Default: in-memory demo. To connect a backend, set mock=false and baseUrl.
 * Endpoint paths and JSON contracts below are proposals, not an existing server.
 */
const api = (() => {
  const config = { mock: true, baseUrl: "/api" };
  let demoStudents = [
    ["김수연", "중2-1", true, "12h 10m", 78],
    ["이도윤", "중2-1", true, "8h 20m", 62],
    ["박지민", "중2-1", true, "15h 40m", 81],
    ["최은서", "중2-2", true, "9h 10m", 47],
    ["정하윤", "중2-3", false, "11h 20m", 73],
  ];

  async function request(path, { method = "GET", body } = {}) {
    const response = await fetch(config.baseUrl + path, {
      method,
      credentials: "include",
      headers: body ? { "Content-Type": "application/json" } : {},
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.ok)
      throw new Error(`요청에 실패했습니다 (${response.status}).`);
    return response.status === 204 ? null : response.json();
  }

  // Backend student object -> current view model. Server IDs are retained separately.
  function toStudentRow(student) {
    return [
      student.name,
      student.grade,
      student.active,
      student.studyTime,
      student.goalRate,
    ];
  }

  return {
    config,
    auth: {
      async login(credentials) {
        if (config.mock) return { name: "관리자", demo: true };
        return request("/auth/login", { method: "POST", body: credentials });
      },
      async signup(profile) {
        if (config.mock) return { name: profile.name, demo: true };
        return request("/auth/signup", { method: "POST", body: profile });
      },
    },
    students: {
      async list() {
        if (config.mock) return demoStudents.map((row) => [...row]);
        const data = await request("/students");
        return data.map(toStudentRow);
      },
      async create({ name, grade }) {
        if (!name) throw new Error("학생 이름을 입력하세요.");
        if (config.mock) {
          const row = [name, grade, true, "0h 0m", 0];
          demoStudents.push(row);
          return [...row];
        }
        return request("/students", { method: "POST", body: { name, grade } });
      },
    },
    // Analytics remain static fixtures in pages.js until backend endpoints are defined.
  };
})();
