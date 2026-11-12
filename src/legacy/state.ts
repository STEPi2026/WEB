export const menus: [string,string,string][] = [
 ["dashboard","▦","대시보드"],["students","♙","학생 관리"],["learning","▤","학습 현황"],["concepts","◇","개념/Skill 분석"],["errors","⌕","오류·오개념 분석"],["tutor","✧","AI Tutor 개입 내역"],["reports","▧","학습 리포트"],["problems","▣","문제 데이터 관리"],["master","⚙","기준 데이터 관리"],["gamification","♧","게이미피케이션"],["guardians","♙","보호자 연결"],["classes","▤","학급 관리"]];
export let page='login',tab=0,selected=0,query='';
export type StudentRow = [string,string,boolean,string,number];
export let students: StudentRow[]=[];
export type DemoProblem={id:string;text:string;unit:string;difficulty:string;active:boolean};
const defaultProblems:DemoProblem[]=[
{id:'P0001',text:'일차방정식의 해를 구하시오.',unit:'문자와 식',difficulty:'중',active:true},
{id:'P0002',text:'다음 식을 간단히 하세요.',unit:'문자와 식',difficulty:'중',active:true},
{id:'P0003',text:'함수의 그래프를 고르시오.',unit:'함수',difficulty:'중',active:false},
{id:'P0004',text:'도형의 넓이를 구하시오.',unit:'기하',difficulty:'중',active:true},
{id:'P0005',text:'확률을 구하시오.',unit:'확률',difficulty:'중',active:true}];
function stored<T>(key:string,fallback:T):T{try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw) as T:fallback;}catch{return fallback;}}
export type MasterItem={id:string;name:string;parent:string;active:boolean};
const masterSeed:Record<string,MasterItem[]>={
 concepts:['수와 연산','문자와 식','함수','기하','확률과 통계'].map((name,i)=>({id:`C${String(i+1).padStart(3,'0')}`,name,parent:'수학',active:true})),
 skills:['식의 전개','방정식 풀이','그래프 해석','도형 추론','자료 분석'].map((name,i)=>({id:`S${String(i+1).padStart(3,'0')}`,name,parent:'수학',active:true})),
 misconceptions:['분수 크기 혼동','이항 부호 오류','좌표 해석 오류','넓이 공식 혼동','확률 계산 오류'].map((name,i)=>({id:`M${String(i+1).padStart(3,'0')}`,name,parent:'수학',active:true}))
};
export let masterData:Record<string,MasterItem[]>=stored('stepi_master_v3',masterSeed);
export function saveMasterData(next:Record<string,MasterItem[]>){masterData=next;localStorage.setItem('stepi_master_v3',JSON.stringify(next));}
export let demoProblems:DemoProblem[]=stored('stepi_demo_problems_v2',defaultProblems);
export function saveDemoProblems(next:DemoProblem[]){demoProblems=next;localStorage.setItem('stepi_demo_problems_v2',JSON.stringify(next));}
export function restoreStudents(fallback:StudentRow[]):StudentRow[]{return stored('stepi_demo_students_v2',fallback);}

export function setPage(v:string){page=v;tab=0;}
export function setTab(v:number){tab=v;}
export function setSelected(v:number){selected=v;tab=0;}
export function setQuery(v:string){query=v;}
export function setStudents(v:StudentRow[]){students=v;}
export function saveDemoStudents(){localStorage.setItem('stepi_demo_students_v2',JSON.stringify(students));}

// UI-only filter state. Kept separate from API adapters for contract changes.
export let appliedFilter={start:'2026-09-01',end:'2026-09-30',student:'',revision:0};
export function applyFilter(start:string,end:string,student:string){appliedFilter={start,end,student,revision:appliedFilter.revision+1};}
export function studentMatchesFilter(i:number){return !appliedFilter.student||String(i)===appliedFilter.student;}
export function filteredStudents(){return students.map((s,i)=>({s,i})).filter(({s,i})=>(!appliedFilter.student||String(i)===appliedFilter.student)&&s[0].toLowerCase().includes(query.toLowerCase()));}
// Reproducible daily demo events: selecting different dates genuinely changes the counted events.
export function demoFactor(){const start=Date.parse(appliedFilter.start),end=Date.parse(appliedFilter.end);if(!Number.isFinite(start)||!Number.isFinite(end)||start>end)return 0;let total=0;const day=86400000;for(let t=start;t<=end&&t<start+366*day;t+=day){const index=Math.floor(t/day);const student=appliedFilter.student?Number(appliedFilter.student)+1:0;const activity=(index*17+student*23+91)%11;total+=student?activity/40:activity/9;}return total/30;}
export function scaled(n:number){return Math.round(n*demoFactor());}
export function studentMetrics(i:number){const base=students[i];if(!base)return {attempts:0,correct:0,minutes:0};const factor=demoFactor();const attempts=Math.max(0,Math.round((24+i*9)*factor));const correct=Math.round(attempts*Math.min(.95,.54+base[4]/250));return {attempts,correct,minutes:Math.round(attempts*(2.1+i*.3))};}
export function aggregateMetrics(){return students.reduce((a,_s,i)=>{if(!studentMatchesFilter(i))return a;const m=studentMetrics(i);a.attempts+=m.attempts;a.correct+=m.correct;a.minutes+=m.minutes;a.active+=m.attempts>0?1:0;return a;},{attempts:0,correct:0,minutes:0,active:0});}
export function resetDemoData(){['stepi_demo_students_v2','stepi_demo_problems_v2','stepi_master_v3'].forEach(k=>localStorage.removeItem(k));}

