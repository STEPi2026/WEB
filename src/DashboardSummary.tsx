import React from 'react';

type AnyRecord = Record<string, unknown>;

type StudentSnapshot = {
  id: string;
  name: string;
  attempts: number | null;
  studySeconds: number | null;
  correctRate: number | null;
  lastStudy: string | null;
  weakSkills: string;
};

function record(value: unknown): AnyRecord | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as AnyRecord : null;
}
function numeric(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  // Some API versions encode numeric fields as strings.
  if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) return Number(value);
  return null;
}
function fallback(value: unknown): string {
  return value == null || String(value).trim() === '' ? '정보 없음' : String(value);
}
function dateText(value: unknown): string {
  if (typeof value !== 'string' || !value) return '정보 없음';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat('ko-KR', {year:'numeric', month:'long', day:'numeric', timeZone:'Asia/Seoul'}).format(parsed);
}
function duration(seconds: number | null): string {
  if (seconds === null) return '정보 없음';
  if (seconds < 60) return `${Math.max(0, Math.round(seconds))}초`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}분 ${Math.round(seconds % 60)}초`;
  return `${Math.floor(seconds / 3600)}시간 ${Math.floor((seconds % 3600) / 60)}분`;
}
function rateText(value: number | null): string {
  if (value === null) return '정보 없음';
  const percent = value <= 1 && value >= 0 ? value * 100 : value;
  return `${Math.max(0, Math.min(100, percent)).toFixed(1)}%`;
}
function weakSkillsText(value: unknown): string {
  if (Array.isArray(value)) {
    if (!value.length) return '항목 없음';
    return value.map(x => {
      if (typeof x === 'string' || typeof x === 'number') return String(x);
      const entry = record(x);
      return entry ? fallback(entry.name ?? entry.skill_name ?? entry.code) : '';
    }).filter(Boolean).join(', ');
  }
  return fallback(value);
}
function studentFromApi(value: unknown, index: number): StudentSnapshot | null {
  const item = record(value);
  if (!item) return null;
  return {
    id: fallback(item.student_id ?? item.user_id ?? item.id ?? index + 1),
    name: fallback(item.name ?? item.nickname),
    attempts: numeric(item.attempts ?? item.problem_count ?? item.problem_solved_count),
    studySeconds: numeric(item.study_seconds),
    correctRate: numeric(item.correct_rate),
    lastStudy: typeof item.last_study_date === 'string' ? item.last_study_date : null,
    weakSkills: weakSkillsText(item.weak_skills),
  };
}
function Tile({label, value, hint, icon, accent, onClick}: {label:string;value:string;hint:string;icon:string;accent?:boolean;onClick:()=>void}) {
  return <button type="button" className={`stepi-overview-tile stepi-overview-tile-button${accent?' is-accent':''}`} onClick={onClick} aria-label={`${label} 상세 화면으로 이동`}>
    <span className="stepi-overview-tile-top"><span>{label}</span><span className="stepi-overview-tile-icon" aria-hidden="true">{icon}</span></span>
    <strong>{value}</strong><small>{hint}</small>
    <span className="stepi-overview-tile-action" aria-hidden="true">상세 보기 →</span>
  </button>;
}
export default function DashboardSummary({data, onNavigate}: {data:unknown;onNavigate:(path:string)=>void}) {
  const summary = record(data);
  if (!summary) return <section className="stepi-dashboard-empty" role="status"><strong>대시보드 데이터가 없습니다</strong><span>백엔드 응답을 확인하면 실제 학습 현황이 이곳에 표시됩니다.</span></section>;
  const rawStudents = Array.isArray(summary.students) ? summary.students : [];
  const students = rawStudents.map(studentFromApi).filter((s):s is StudentSnapshot => s !== null);
  const declaredCount = numeric(summary.student_count);
  const totalAttempts = students.length && students.every(s=>s.attempts!==null)
    ? students.reduce((sum,s)=>sum+(s.attempts??0),0) : null;
  const totalStudy = students.length && students.every(s=>s.studySeconds!==null)
    ? students.reduce((sum,s)=>sum+(s.studySeconds??0),0) : null;
  const studentsWithAttempts = students.filter(s=>(s.attempts??0)>0);
  const knownRates = studentsWithAttempts.filter(s=>s.correctRate!==null);
  // Weighted aggregate would require successful attempt counts. Do not infer it from an unweighted mean.
  const activeCount = students.filter(s=>(s.attempts??0)>0).length;
  const hasLearning = studentsWithAttempts.length > 0;
  const maxAttempts = Math.max(1, ...students.map(s=>s.attempts??0));
  return <div className="stepi-overview">
    <div className="stepi-overview-hero">
      <div className="stepi-overview-hero-copy"><span className="stepi-overview-kicker">LIVE LEARNING OVERVIEW</span><h2>우리 학급 학습 현황</h2><p>백엔드가 제공한 실제 데이터로 학생들의 학습 상태를 확인합니다.</p></div>
      <div className="stepi-overview-period"><span>조회 기준일</span><strong>{dateText(summary.week_start)}</strong><small>서버 대시보드 요약 기준</small></div>
    </div>
    <div className="stepi-overview-tiles">
      <Tile label="연결된 학생" value={declaredCount!==null?`${declaredCount}명`:'정보 없음'} hint="백엔드 조회 기준" icon="♙" accent onClick={()=>onNavigate('students')}/>
      <Tile label="문제 풀이 수" value={totalAttempts!==null?`${totalAttempts.toLocaleString('ko-KR')}건`:'집계 불가'} hint={totalAttempts!==null?'조회된 학생별 풀이 수 합계':'학생별 풀이 기록 부족'} icon="▣" onClick={()=>onNavigate('learning')}/>
      <Tile label="누적 학습 시간" value={totalStudy!==null?duration(totalStudy):'집계 불가'} hint={totalStudy!==null?'조회된 학생별 학습 시간 합계':'학생별 학습 시간 정보 부족'} icon="◷" onClick={()=>onNavigate('learning')}/>
      <Tile label="풀이 기록 있는 학생" value={`${activeCount}명`} hint="문제 풀이 수가 1건 이상인 학생" icon="↗" onClick={()=>onNavigate('learning')}/>
    </div>
    <div className="stepi-overview-layout">
      <section className="stepi-overview-panel stepi-overview-chart">
        <div className="stepi-overview-panel-heading"><div><span className="stepi-overview-section-kicker">LEARNING ACTIVITY</span><h3>학생별 문제 풀이 현황</h3></div><span className="stepi-overview-legend"><i/> 실제 풀이 수</span></div>
        {hasLearning ? <div className="stepi-overview-bars" role="list" aria-label="학생별 문제 풀이 수">
          {students.map((student,i)=><div className="stepi-overview-bar-line" role="listitem" key={`${student.id}-${i}`}><span className="stepi-overview-bar-name">{student.name}</span><div className="stepi-overview-bar-track"><div style={{width:`${Math.max(0,(student.attempts??0)/maxAttempts*100)}%`}}/></div><strong>{student.attempts===null?'—':student.attempts}</strong></div>)}
        </div> : <div className="stepi-overview-no-activity"><div className="stepi-overview-empty-icon" aria-hidden="true">▥</div><strong>아직 문제 풀이 기록이 없습니다</strong><p>학생이 문제를 풀면 서버에서 받은 풀이 수를 바탕으로 학생별 비교 막대가 표시됩니다.</p><span>샘플 데이터나 임의의 통계는 사용하지 않습니다.</span></div>}
      </section>
      <section className="stepi-overview-panel stepi-overview-side">
        <div className="stepi-overview-panel-heading"><div><span className="stepi-overview-section-kicker">DATA STATUS</span><h3>학습 데이터 상태</h3></div></div>
        <div className="stepi-overview-status-row"><div className="stepi-overview-status-dot"/><div><strong>{hasLearning?'풀이 기록 확인됨':'학습 기록 수집 대기'}</strong><p>{hasLearning?'실제 풀이 데이터를 바탕으로 현황을 표시합니다.':'현재 조회된 학생에게 풀이 기록이 없습니다.'}</p></div></div>
        <div className="stepi-overview-small-stats"><div><span>정답률 확인 가능</span><strong>{knownRates.length}명</strong></div><div><span>조회된 학생 목록</span><strong>{students.length}명</strong></div></div>
        <p className="stepi-overview-explanation">정답률은 학습 기록이 있는 학생에게 실제 값이 제공된 경우에만 표시합니다. 데이터가 없으면 추정하지 않습니다.</p>
        <button type="button" className="stepi-overview-link" onClick={()=>onNavigate('students')}>학생 관리로 이동 <span aria-hidden="true">→</span></button>
      </section>
    </div>
    <section className="stepi-overview-panel stepi-overview-roster">
      <div className="stepi-overview-panel-heading"><div><span className="stepi-overview-section-kicker">STUDENT DETAILS</span><h3>학생별 학습 요약</h3></div><span className="stepi-overview-chip">서버 응답 기반</span></div>
      {students.length ? <div className="stepi-table-scroll"><table className="stepi-data-table stepi-overview-table"><thead><tr><th>학생</th><th>문제 풀이</th><th>학습 시간</th><th>정답률</th><th>마지막 학습</th><th>취약 Skill</th></tr></thead><tbody>{students.map((s,i)=><tr key={`${s.id}-${i}`}><td><span className="stepi-overview-avatar">{s.name==='정보 없음'?'?':s.name.slice(0,1)}</span><span className="stepi-overview-student"><strong>{s.name}</strong><small>ID {s.id}</small></span></td><td>{s.attempts===null?'정보 없음':`${s.attempts}건`}</td><td>{duration(s.studySeconds)}</td><td>{(s.attempts??0)>0?rateText(s.correctRate):'정보 없음'}</td><td>{dateText(s.lastStudy)}</td><td>{s.weakSkills}</td></tr>)}</tbody></table></div> : <div className="stepi-overview-no-rows">조회 가능한 학생 정보가 없습니다.</div>}
    </section>
  </div>;
}
