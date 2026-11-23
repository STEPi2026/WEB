import React,{useEffect,useState} from 'react';
import {client,authApi,studentApi,Student,classesApi} from './api/client';
import {menus} from './legacy/state';
import DashboardSummary from './DashboardSummary';

type Json=Record<string,unknown>;
const views:Record<string,{title:string;endpoint?:string;student?:boolean;description:string}>={
 dashboard:{title:'대시보드',endpoint:'/dashboard/summary',description:'백엔드 전체 요약'},
 students:{title:'학생 관리',endpoint:'/students',description:'연결된 학생 목록'},
 student:{title:'학생 상세',student:true,endpoint:'/students/{id}',description:'학생 기본 정보'},
 learning:{title:'학습 현황',student:true,endpoint:'/students/{id}/learning-history',description:'학생 학습 이력'},
 concepts:{title:'개념/Skill 분석',student:true,endpoint:'/students/{id}/knowledge-map',description:'학생 지식맵'},
 errors:{title:'오류·오개념 분석',student:true,endpoint:'/students/{id}/weak-skills',description:'학생 취약 Skill 및 오류 관련 분석'},
 tutor:{title:'AI Tutor 개입 내역',student:true,endpoint:'/students/{id}/tutor-history',description:'학생 Tutor 이력'},
 reports:{title:'학습 리포트',student:true,endpoint:'/students/{id}/reports',description:'학생 리포트 목록'},
 problems:{title:'문제 데이터 관리',description:'문제 조회 (쓰기 기능은 백엔드 권한 확인 필요)'},
 master:{title:'기준 데이터 관리',endpoint:'/concepts',description:'개념·Skill 조회'},
 gamification:{title:'게이미피케이션',student:true,endpoint:'/students/{id}/gamification',description:'학생 게임화 현황'},
 roadmap:{title:'학습 로드맵',student:true,endpoint:'/students/{id}/roadmap',description:'학생 맞춤 학습 로드맵'},
 analysis:{title:'AI 분석 이력',student:true,endpoint:'/students/{id}/ai-analyses',description:'학생 AI 분석'},
 standing:{title:'상대적 학습 현황',student:true,endpoint:'/students/{id}/relative-standing',description:'학생 상대적 학습 현황'},
};
// Presentation-only descriptions for each existing route. No API or navigation changes.
const screenGuide:Record<string,{eyebrow:string;headline:string;summary:string;steps:[string,string,string]}>= {
 student:{eyebrow:'STUDENT PROFILE',headline:'학생별 학습 프로필',summary:'백엔드에 저장된 학생의 기본 정보와 학습 상태를 확인합니다.',steps:['학생 선택','기본 정보 조회','학습 상태 확인']},
 concepts:{eyebrow:'KNOWLEDGE MAP',headline:'개념과 Skill을 한눈에',summary:'학생에게 연결된 지식 요소와 개념별 상태를 살펴봅니다.',steps:['학생 선택','지식맵 조회','개념·Skill 확인']},
 errors:{eyebrow:'LEARNING INSIGHTS',headline:'학생의 취약 영역 살펴보기',summary:'서버가 제공하는 취약 Skill과 오류 관련 분석을 확인합니다.',steps:['학생 선택','취약 영역 조회','보완 학습 참고']},
 tutor:{eyebrow:'AI TUTOR HISTORY',headline:'학습 도움의 과정을 기록합니다',summary:'실제 서버에 저장된 AI Tutor의 개입 및 힌트 이력을 조회합니다.',steps:['학생 선택','개입 이력 조회','힌트 단계 확인']},
 reports:{eyebrow:'LEARNING REPORTS',headline:'학습 성장을 리포트로 확인하세요',summary:'학생별 주간 리포트 목록과 저장된 상세 기록을 조회합니다.',steps:['학생 선택','리포트 목록','상세 내역 확인']},
 problems:{eyebrow:'PROBLEM LIBRARY',headline:'수학 문제를 체계적으로 관리하세요',summary:'서버의 문제 목록을 검색하고 관리자 권한으로 등록·수정합니다.',steps:['문제 검색','문제 목록 조회','관리자 등록·수정']},
 master:{eyebrow:'CONTENT MANAGEMENT',headline:'학습 기준 데이터를 관리하세요',summary:'문제와 연결되는 개념 및 Skill 기준 정보를 조회·관리합니다.',steps:['분류 선택','기준 데이터 조회','관리자 등록·수정']},
 gamification:{eyebrow:'LEARNING REWARDS',headline:'학습의 성취를 한눈에',summary:'레벨, 경험치, 연속 학습일과 배지 등 서버의 보상 데이터를 조회합니다.',steps:['학생 선택','성장 수치 조회','획득 보상 확인']},
 roadmap:{eyebrow:'LEARNING ROADMAP',headline:'학생별 학습 경로를 확인하세요',summary:'서버에 생성된 개인별 학습 로드맵과 추천 정보를 살펴봅니다.',steps:['학생 선택','로드맵 조회','다음 학습 확인']},
 analysis:{eyebrow:'AI ANALYSIS HISTORY',headline:'AI 풀이 분석 결과를 한눈에',summary:'분석 완료·판정 보류·인식 실패 등 실제 분석 기록을 구분해 표시합니다.',steps:['학생 선택','분석 기록 조회','판정 상태 확인']},
 standing:{eyebrow:'RELATIVE LEARNING',headline:'같은 학년 내 학습 위치 확인',summary:'비교 데이터가 충분한 경우 서버가 제공한 학년별 학습 지표를 보여줍니다.',steps:['학생 선택','비교 통계 조회','제공 가능 여부 확인']},
};
function ScreenGuide({view,studentName}:{view:string;studentName?:string}){
 const guide=screenGuide[view];if(!guide)return null;
 return <section className="stepi-showcase stepi-route-showcase" aria-label={guide.headline}>
  <div className="stepi-showcase-intro"><div><span className="stepi-showcase-kicker">{guide.eyebrow}</span><h2>{guide.headline}</h2><p>{guide.summary}</p></div>
  <span className="stepi-showcase-pill">{studentName?`조회 학생 · ${studentName}`:'백엔드 데이터 조회 화면'}</span></div>
  <div className="stepi-route-steps">{guide.steps.map((step,index)=><div key={step}><span>{String(index+1).padStart(2,'0')}</span><strong>{step}</strong><small>{index===0?'대상 및 범위 선택':index===1?'저장된 서버 정보 사용':'조회 결과를 화면에 표시'}</small></div>)}</div>
 </section>;
}
type EditorKind='concepts'|'skills'|'problems';
const editorFields:Record<EditorKind,{key:string;label:string;required?:boolean;type?:string;hint?:string}[]>={
 concepts:[{key:'code',label:'개념 코드',required:true},{key:'name',label:'개념명',required:true},{key:'subject',label:'과목',required:true},{key:'grade_level',label:'학년',required:true},{key:'description',label:'설명'},{key:'parent_concept_code',label:'상위 개념 코드'}],
 skills:[{key:'code',label:'Skill 코드',required:true},{key:'name',label:'Skill 이름',required:true},{key:'concept_code',label:'연결 개념 코드',required:true},{key:'description',label:'설명'}],
 problems:[{key:'problem_code',label:'문제 코드',required:true},{key:'question',label:'문제 내용',required:true},{key:'answer',label:'정답',required:true},{key:'explanation',label:'해설'},{key:'difficulty',label:'난이도(숫자)',required:true,type:'number'},{key:'problem_type',label:'문제 유형',required:true,hint:'예: SHORT_ANSWER'},{key:'usage',label:'사용 목적',required:true,hint:'예: PRACTICE'},{key:'concept_codes',label:'개념 코드(쉼표 구분)'},{key:'skill_codes',label:'Skill 코드(쉼표 구분)'}]
};
const fieldNames:Record<string,string>={week_start:'시작일',week_end:'종료일',student_count:'학생 수',students:'학생별 현황',user_id:'학생 ID',student_id:'학생 ID',name:'이름',grade_level:'학년',id:'ID',question:'문제',problem_code:'문제 코드',difficulty:'난이도',problem_type:'문제 유형',usage:'사용 목적',concept_codes:'개념 코드',skill_codes:'Skill 코드',code:'코드',description:'설명',subject:'과목',concept_code:'개념 코드',xp:'경험치',level:'레벨',current_streak:'연속 학습일',longest_streak:'최장 연속 학습일',last_study_date:'마지막 학습일',updated_at:'수정일',created_at:'생성일',attempts:'문제 풀이 수',correct_rate:'정답률',study_seconds:'학습 시간(초)',correct_attempts:'정답 수',active_days:'학습일 수',xp_gained:'획득 경험치',completed_contents:'완료 콘텐츠',badges_earned:'획득 배지',weak_skills:'취약 Skill',available:'통계 제공',metric:'비교 지표',percentile:'백분위',group_size:'비교 인원',minimum_group_size:'최소 필요 인원',reason:'제공 불가 사유',nodes:'지식 요소',edges:'연결 관계',source:'출발 요소',target:'도착 요소',type:'유형',mastery_score:'숙련도',weakness_score:'취약도',parent_concept_code:'상위 개념 코드',action_type:'개입 유형',hint_level:'힌트 단계',attempt_id:'풀이 시도 ID',ai_analysis_id:'AI 분석 ID',problem_id:'문제 ID',is_correct:'정오 판정',status:'분석 상태',badges:'배지',total_badges:'전체 배지 수',max_level:'최대 레벨'};
function label(k:string){return fieldNames[k]||k.replace(/_/g,' ')}
function AdminEditor({kind,items,onSaved,onRefresh}:{kind:EditorKind;items:unknown;onSaved:()=>Promise<void>;onRefresh?:()=>void}){
 const [mode,setMode]=useState<'create'|'edit'|null>(null);const [values,setValues]=useState<Record<string,string>>({});const [selected,setSelected]=useState('');const [saving,setSaving]=useState(false);const [message,setMessage]=useState('');
 const rows=Array.isArray(unwrap(items))?unwrap(items) as Record<string,unknown>[]:[];
 const identity=(r:Record<string,unknown>)=>String(kind==='problems'?r.id??'':r.code??'');
 const start=(m:'create'|'edit',r?:Record<string,unknown>)=>{setMode(m);setMessage('');setSelected(r?identity(r):'');setValues(r?Object.fromEntries(editorFields[kind].map(f=>[f.key,Array.isArray(r[f.key])?(r[f.key] as unknown[]).join(', '):String(r[f.key]??'')])):{});};
 const submit=async(e:React.FormEvent)=>{e.preventDefault();setSaving(true);setMessage('');try{
 const payload:Record<string,unknown>={};for(const f of editorFields[kind]){if(mode==='edit'&&(f.key==='code'||f.key==='problem_code'))continue;const v=(values[f.key]||'').trim();if(!v){if(mode==='create'&&f.required)throw new Error(f.label+'을(를) 입력하세요.');continue;}payload[f.key]=f.type==='number'?Number(v):f.key.endsWith('_codes')?v.split(',').map(x=>x.trim()).filter(Boolean):v;}
 const base='/admin/'+kind; if(mode==='create')await client.post(base,payload);else await client.patch(base+'/'+encodeURIComponent(selected),payload);
 await onSaved();setMode(null);setMessage('저장했습니다. 목록을 새로 불러왔습니다.');
 }catch(err){const e=err as Error & {httpStatus?:number};setMessage(e.httpStatus===403?'권한이 없습니다. 이 기능은 관리자 계정이 필요합니다.':e.httpStatus===401?'로그인이 필요합니다.':e.message||'저장 실패')}finally{setSaving(false)}};
 return <section className="card" style={{marginBottom:16}}><h2>{kind==='problems'?'문제':kind==='concepts'?'개념':'Skill'} 관리</h2><p style={{color:'#64748b'}}>조회는 현재 계정으로 가능하며, 등록·수정은 백엔드 관리자 권한이 있어야 저장됩니다. 삭제 API는 제공되지 않습니다.</p><div style={{display:'flex',gap:8,flexWrap:'wrap',margin:'12px 0'}}><button type="button" onClick={()=>start('create')}>+ 신규 등록</button><button type="button" onClick={()=>{setMode(null);if(onRefresh)onRefresh();else void onSaved()}}>목록 새로고침</button></div>
 {rows.length>0&&<div style={{marginBottom:12}}><label>기존 항목 수정　<select value={selected} onChange={e=>{const r=rows.find(x=>identity(x)===e.target.value);if(r)start('edit',r);else{setSelected('');setMode(null)}}}><option value="">항목 선택</option>{rows.map((r,i)=><option key={i} value={identity(r)}>{identity(r)} · {String(r.name??r.problem_code??r.question??'').slice(0,48)}</option>)}</select></label></div>}
 {mode&&<form onSubmit={submit} style={{border:'1px solid #e5e7eb',borderRadius:12,padding:18,marginTop:12}}><h3>{mode==='create'?'신규 등록':'기존 항목 수정'}</h3><div className="stepi-editor-grid">{editorFields[kind].map(f=><label key={f.key} className="stepi-editor-field"><span>{f.label}{mode==='create'&&f.required?' *':''}</span>{f.key==='question'||f.key==='explanation'||f.key==='description'?<textarea value={values[f.key]||''} onChange={e=>setValues(v=>({...v,[f.key]:e.target.value}))} rows={3}/>:<input type={f.type||'text'} min={f.type==='number'?1:undefined} disabled={mode==='edit'&&(f.key==='code'||f.key==='problem_code')} placeholder={f.hint||''} value={values[f.key]||''} onChange={e=>setValues(v=>({...v,[f.key]:e.target.value}))}/>}</label>)}</div><div style={{display:'flex',gap:8,marginTop:14}}><button disabled={saving} type="submit">{saving?'저장 중...':'서버에 저장'}</button><button type="button" onClick={()=>setMode(null)}>취소</button></div></form>}
 {message&&<p role="status" style={{marginTop:12}}>{message}</p>}</section>;
}
const additional=[['roadmap','◇','학습 로드맵'],['analysis','✧','AI 분석 이력'],['standing','▤','상대적 학습 현황']] as const;
function unwrap(data:any):any{if(data&&typeof data==='object'&&!Array.isArray(data)){if(Array.isArray(data.items))return data.items;if(Array.isArray(data.content))return data.content;if(Array.isArray(data.results))return data.results;}return data;}
function display(v:unknown):string{if(v===null||v===undefined||v==='')return '-';if(typeof v==='boolean')return v?'예':'아니요';if(typeof v==='object')return Array.isArray(v)?`${v.length}개 항목`:`${Object.keys(v as object).length}개 속성`;return String(v);}
function NestedValue({value,depth=0}:{value:unknown;depth?:number}):React.ReactElement{
 if(value===null||value===undefined)return <span>-</span>;
 if(typeof value!=='object')return <span>{display(value)}</span>;
 if(depth>=4)return <span>중첩 데이터</span>;
 if(Array.isArray(value))return <div>{value.length===0?'항목 없음':value.map((v,i)=><div key={i} style={{padding:'8px 0',borderBottom:'1px solid #eee'}}><strong>{i+1}.</strong> <NestedValue value={v} depth={depth+1}/></div>)}</div>;
 return <div style={{display:'grid',gap:8}}>{Object.entries(value).map(([k,v])=><div key={k} style={{overflowWrap:'anywhere'}}><small style={{color:'#64748b'}}>{label(k)}</small><div><NestedValue value={v} depth={depth+1}/></div></div>)}</div>;
}
function prettyValue(k:string,v:unknown):string{if(v===null||v===undefined||v==='')return '정보 없음';if(k==='reason'){const reasons:Record<string,string>={GRADE_NOT_SET:'학년 정보 미설정',INSUFFICIENT_GROUP_SIZE:'비교 학생 수 부족',NOT_ENOUGH_DATA:'분석 데이터 부족'};return reasons[String(v)]||String(v).replace(/_/g,' ')}if(k==='action_type'&&v==='SOCRATIC_HINT')return '모르겠어요 · 단계별 힌트';if(k==='metric'&&v==='CORRECT_RATE')return '문제 정답률';if(k==='study_seconds'&&typeof v==='number')return v>=3600?`${(v/3600).toFixed(1)}시간`:v>=60?`${Math.round(v/60)}분`:`${v}초`;if(k==='correct_rate'&&typeof v==='number')return `${v<=1?(v*100).toFixed(1):v}%`;if(k==='percentile'&&typeof v==='number')return `${v}%`;if(k==='available')return v?'제공 가능':'현재 제공 불가';if(k.endsWith('_at')&&typeof v==='string'){const d=new Date(v);if(!isNaN(d.getTime()))return d.toLocaleString('ko-KR')}return display(v)}
// Backend 2026-11-12: null correctness is never an incorrect answer.
export function analysisVerdict(item:Record<string,unknown>):string{
 const status=String(item.status??'');
 if(status==='REVIEW_REQUIRED')return '판정 보류';
 if(status==='UNKNOWN')return '판정 보류 / 인식 불가';
 if(status==='FAILED')return '인식 실패';
 if(status==='ANALYZED')return item.is_correct===true?'정답':item.is_correct===false?'오답':'판정 정보 없음';
 return '판정 정보 없음';
}
function TutorRecord({item}:{item:Record<string,unknown>}){
 const unanalysed=item.attempt_id==null&&item.ai_analysis_id==null;
 return <div className="stepi-detail-grid">{Object.entries(item).map(([k,v])=><div className="stepi-detail" key={k}><span>{label(k)}</span><div>{v!==null&&typeof v==='object'?<NestedValue value={v}/>:prettyValue(k,v)}</div></div>)}{unanalysed&&<div className="stepi-detail"><span>기록 유형</span><div>분석 없이 생성된 튜터 기록{item.problem_id!=null?` · 문제 ID ${String(item.problem_id)}`:''}</div></div>}</div>;
}
function AnalysisRecord({item}:{item:Record<string,unknown>}){
 return <div className="stepi-detail-grid"><div className="stepi-detail"><span>정오 판정</span><strong>{analysisVerdict(item)}</strong></div>{Object.entries(item).filter(([k])=>k!=='is_correct').map(([k,v])=><div className="stepi-detail" key={k}><span>{label(k)}</span><div>{v!==null&&typeof v==='object'?<NestedValue value={v}/>:prettyValue(k,v)}</div></div>)}</div>;
}
function SpecialRecords({items,view}:{items:Record<string,unknown>[];view:string}){
 return <div style={{display:'grid',gap:12}}>{items.map((item,i)=><section className="stepi-subsection" key={String(item.id??i)}><h3>기록 {i+1}</h3>{view==='tutor'?<TutorRecord item={item}/>:<AnalysisRecord item={item}/>}</section>)}</div>;
}
function Result({data,view}:{data:unknown;view?:string}){const value=unwrap(data);if(value===null||value===undefined)return <div className="stepi-empty"><strong>표시할 데이터가 없습니다</strong><p>학생을 선택하거나 서버 조회를 확인해 주세요.</p></div>;
 if(Array.isArray(value)){if((view==='tutor'||view==='analysis')&&value.length&&value.every(x=>x&&typeof x==='object'&&!Array.isArray(x)))return <SpecialRecords items={value as Record<string,unknown>[]} view={view}/>;if(!value.length)return <div className="stepi-empty"><strong>아직 등록된 기록이 없습니다</strong><p>실제 데이터가 생성되면 이곳에 자동으로 표시됩니다.</p></div>;const keys=[...new Set(value.filter(x=>x&&typeof x==='object').flatMap(x=>Object.keys(x)))].slice(0,9);return keys.length?<div className="stepi-table-scroll"><table className={view==='problems'?'stepi-data-table stepi-problem-table':'stepi-data-table'}><thead><tr>{keys.map(k=><th key={k} scope="col" className={k==='question'?'stepi-question':undefined}>{label(k)}</th>)}</tr></thead><tbody>{value.map((item,i)=><tr key={i}>{keys.map(k=><td key={k} className={k==='question'?'stepi-question':undefined}>{item?.[k]!==null&&typeof item?.[k]==='object'?<NestedValue value={item[k]}/>:prettyValue(k,item?.[k])}</td>)}</tr>)}</tbody></table></div>:<div className="stepi-empty">{value.length}개 항목</div>}
 if(typeof value==='object'){
 if((view==='tutor'||view==='analysis')&&value&&typeof value==='object'&&('status' in value||'attempt_id' in value||'ai_analysis_id' in value||'problem_id' in value))return view==='tutor'?<TutorRecord item={value as Record<string,unknown>}/>:<AnalysisRecord item={value as Record<string,unknown>}/>;
 const entries=Object.entries(value as Record<string,unknown>);
 if(view==='concepts'&&Array.isArray((value as any).nodes)){const nodes=(value as any).nodes as Record<string,unknown>[];const edges=Array.isArray((value as any).edges)?(value as any).edges:[];return <><div className="stepi-stats"><div className="stepi-stat"><span>지식 요소</span><strong>{nodes.length}</strong><small>개념 및 Skill</small></div><div className="stepi-stat"><span>연결 관계</span><strong>{edges.length}</strong><small>지식 구조 연결</small></div></div>{nodes.length?<div className="stepi-node-grid">{nodes.map((n,i)=><div className="stepi-node" key={i}><span className="stepi-node-type">{String(n.type??n.node_type??'지식 요소')==='CONCEPT'?'개념':String(n.type??n.node_type??'Skill')==='SKILL'?'Skill':'지식 요소'}</span><strong>{String(n.name??n.label??n.code??n.id??`요소 ${i+1}`)}</strong><small>{String(n.status??n.mastery_level??'평가 대기').replace('UNASSESSED','미평가')}</small></div>)}</div>:<div className="stepi-empty">지식맵 데이터가 없습니다.</div>}{edges.length>0&&<details className="stepi-details"><summary>지식 요소 연결 관계 {edges.length}개 보기</summary><Result data={edges}/></details>}</>}
 if(view==='dashboard'||view==='gamification'||view==='standing'||view==='student'){const primary=entries.filter(([k,v])=>v===null||typeof v!=='object');const nested=entries.filter(([k,v])=>v!==null&&typeof v==='object');return <><div className="stepi-stats">{primary.map(([k,v])=><div className="stepi-stat" key={k}><span>{label(k)}</span><strong>{prettyValue(k,v)}</strong></div>)}</div>{nested.map(([k,v])=><section className="stepi-subsection" key={k}><h3>{label(k)}</h3><Result data={v}/></section>)}</>}
 return <div className="stepi-detail-grid">{entries.map(([k,v])=><div className="stepi-detail" key={k}><span>{label(k)}</span><div>{v!==null&&typeof v==='object'?<NestedValue value={v}/>:prettyValue(k,v)}</div></div>)}</div>}
 return <p>{display(value)}</p>}
const problemPageSize = 20;

type ProblemPage = {
 items: Json[];
 total: number;
 total_pages: number;
};

async function fetchProblemPage(page: number, signal: AbortSignal): Promise<ProblemPage> {
 const {data} = await client.get<ProblemPage>('/problems', {
  params: {page, size: problemPageSize},
  signal,
 });
 return data;
}

async function fetchProblemCatalog(signal: AbortSignal): Promise<Json[]> {
 const firstPage = await fetchProblemPage(1, signal);
 const items = [...firstPage.items];
 const batchSize = 4;
 for (let start = 2; start <= firstPage.total_pages; start += batchSize) {
  const count = Math.min(batchSize, firstPage.total_pages - start + 1);
  const pages = await Promise.all(
   Array.from({length: count}, (_, index) => fetchProblemPage(start + index, signal)),
  );
  for (const page of pages) items.push(...page.items);
 }
 return items;
}

function ProblemWorkspace() {
 const [input, setInput] = useState('');
 const [query, setQuery] = useState('');
 const [page, setPage] = useState(1);
 const [serverPage, setServerPage] = useState<ProblemPage | null>(null);
 const [catalog, setCatalog] = useState<Json[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');
 const [revision, setRevision] = useState(0);
 const [refreshed, setRefreshed] = useState(false);

 const searching = query !== '';
 const requestedPage = searching ? 1 : page;

 useEffect(() => {
  const controller = new AbortController();
  setLoading(true);
  setError('');
  async function load() {
   try {
    if (searching) {
     const items = await fetchProblemCatalog(controller.signal);
     if (!controller.signal.aborted) setCatalog(items);
    } else {
     const result = await fetchProblemPage(requestedPage, controller.signal);
     if (!controller.signal.aborted) setServerPage(result);
    }
   } catch (error) {
    if (!controller.signal.aborted) {
     setError(error instanceof Error ? error.message : '문제 목록을 불러오지 못했습니다.');
    }
   } finally {
    if (!controller.signal.aborted) setLoading(false);
   }
  }
  void load();
  return () => controller.abort();
 }, [searching, requestedPage, revision]);

 const results = searching
  ? catalog.filter(item => [item.problem_code, item.question].some(
    value => typeof value === 'string' && value.toLowerCase().includes(query),
   ))
  : [];
 const total = searching ? results.length : (serverPage?.total ?? 0);
 const lastPage = Math.max(1, searching
  ? Math.ceil(total / problemPageSize)
  : (serverPage?.total_pages ?? 1));
 const currentPage = Math.min(page, lastPage);
 const items = searching
  ? results.slice((currentPage - 1) * problemPageSize, currentPage * problemPageSize)
  : (serverPage?.items ?? []);

 function applySearch(value: string) {
  setPage(1);
  setRefreshed(false);
  setQuery(value.trim().toLowerCase());
 }
 async function afterSaved() {
  if (searching) {
   setPage(1);
  } else {
   const {data} = await client.get<ProblemPage>('/problems', {params: {page: 1, size: problemPageSize}});
   setPage(Math.max(1, data.total_pages));
  }
  setRevision(value => value + 1);
 }
 function refresh() {
  setRefreshed(true);
  setRevision(value => value + 1);
 }

 return <>
  <AdminEditor kind="problems" items={loading || error ? [] : items} onSaved={afterSaved} onRefresh={refresh}/>
  <section className="card stepi-problem-catalog">
   <h2>문제 목록</h2>
   <form className="stepi-problem-tools" onSubmit={event => {
    event.preventDefault();
    applySearch(input);
   }}>
    <label htmlFor="stepi-problem-search">전체 문제 검색</label>
    <input id="stepi-problem-search" type="search" placeholder="문제 코드 또는 지문" value={input}
     onChange={event => setInput(event.target.value)}/>
    <button type="submit">검색</button>
    <button type="button" disabled={!input && !query} onClick={() => {
     setInput('');
     applySearch('');
    }}>초기화</button>
   </form>
   {loading ? <p role="status">문제 목록을 불러오는 중입니다.</p> : error
    ? <p role="alert">문제 목록 조회 실패 · {error}</p>
    : <>
     <div className="stepi-problem-tools">
      <span role="status">{searching ? `검색 결과 ${total}개 / 전체 ${catalog.length}개` : `전체 ${total}개`}
       {total > 0 && ` · ${currentPage} / ${lastPage}페이지`}
      </span>
      <button type="button" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>이전</button>
      <button type="button" disabled={currentPage >= lastPage} onClick={() => setPage(currentPage + 1)}>다음</button>
      <button type="button" disabled={currentPage >= lastPage} onClick={() => setPage(lastPage)}>마지막 페이지</button>
     </div>
     {refreshed && <p role="status">목록을 새로 불러왔습니다.</p>}
     {searching && total === 0
      ? <p className="stepi-empty">검색 결과가 없습니다.</p>
      : <Result data={items} view="problems"/>}
    </>}
  </section>
 </>;
}

export default function LiveWorkspace(){
 const [account,setAccount]=useState<{role:string;name:string}>({role:'확인 중',name:''});const [classes,setClasses]=useState<Record<string,unknown>[]>([]);const [classDetails,setClassDetails]=useState<Record<string,Record<string,unknown>>>({});const [classBusy,setClassBusy]=useState('');const [className,setClassName]=useState('');const [classMessage,setClassMessage]=useState('');const [masterMode,setMasterMode]=useState<'concepts'|'skills'>('concepts');const [errorCode,setErrorCode]=useState('');const [route,setRoute]=useState(location.hash.slice(1)||'dashboard');const [students,setStudents]=useState<Student[]>([]);const [studentId,setStudentId]=useState('');const [data,setData]=useState<unknown>(null);const [extra,setExtra]=useState<unknown>(null);const [loading,setLoading]=useState(false);const [error,setError]=useState('');const [reportId,setReportId]=useState('');const [search,setSearch]=useState('');const [masterPages,setMasterPages]=useState({concepts:1,skills:1});const [masterNotice,setMasterNotice]=useState('');
 useEffect(()=>{let active=true;client.get('/users/me').then(({data})=>{if(!active)return;const user=data?.user??data?.data??data;const raw=String(user?.role??user?.user_role??user?.userRole??'').toUpperCase();const roles:Record<string,string>={TEACHER:'교사',ADMIN:'관리자',PARENT:'학부모',STUDENT:'학생'};setAccount({role:roles[raw]??'역할 확인 필요',name:String(user?.nickname??user?.name??'')});}).catch(()=>{if(active)setAccount({role:'역할 확인 필요',name:''})});return()=>{active=false}},[]);
 useEffect(()=>{const fn=()=>setRoute(location.hash.slice(1)||'dashboard');window.addEventListener('hashchange',fn);return()=>window.removeEventListener('hashchange',fn)},[]);
 useEffect(()=>{let active=true;studentApi.list().then(items=>{if(active){setStudents(items);setStudentId(prev=>items.some(s=>s.id===prev)?prev:(items.find(s=>s.id===sessionStorage.getItem('stepi_selected_student_id'))?.id||items[0]?.id||''))}}).catch(e=>{if(active)setError('학생 목록: '+e.message)});return()=>{active=false}},[]);
 const config=views[route];
 const filteredStudents=students.filter(s=>s.name.toLowerCase().includes(search.toLowerCase()));
 const openStudent=(id:string)=>{setStudentId(id);sessionStorage.setItem('stepi_selected_student_id',id);location.hash='student';};
 useEffect(()=>{if(!config?.endpoint)return;let active=true;if(config.student&&!studentId){setData(null);return;}const endpoint=config.endpoint.replace('{id}',encodeURIComponent(studentId))+(route==='master'?`?page=${masterPages.concepts}&size=20`:'');setLoading(true);setError('');setErrorCode('');setData(null);client.get(endpoint).then(r=>{if(active)setData(r.data)}).catch(e=>{if(active){setError(e.message);setErrorCode(String((e as any)?.apiCode||''))}}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[route,studentId,masterPages.concepts]);
 useEffect(()=>{if(route!=='master')setExtra(null)},[route]);
 async function fetchExtra(path:string){setLoading(true);setError('');try{setExtra((await client.get(path)).data)}catch(e){setError(e instanceof Error?e.message:'조회 실패')}finally{setLoading(false)}}
 async function selectMaster(mode:'concepts'|'skills',page=masterPages[mode]){setMasterMode(mode);setLoading(true);setError('');setExtra(null);setMasterNotice('');try{setExtra((await client.get(`/${mode}?page=${page}&size=20`)).data)}catch(e){setError(e instanceof Error?e.message:'조회 실패')}finally{setLoading(false)}}
 useEffect(()=>{if(route==='master'&&masterMode==='skills')void selectMaster('skills',masterPages.skills)},[masterPages.skills]);
 useEffect(()=>{if(route==='master'&&masterMode==='concepts')void selectMaster('concepts',masterPages.concepts)},[masterPages.concepts]);
 async function afterMasterSaved(){const mode=masterMode;const result=await client.get(`/${mode}?page=1&size=20`);const total=Number(result.data?.total??0);const size=Number(result.data?.size??20)||20;const last=Math.max(1,Math.ceil(total/size));setMasterNotice('저장 후 마지막 페이지를 조회했습니다.');if(masterPages[mode]===last){setExtra((await client.get(`/${mode}?page=${last}&size=20`)).data)}else{setMasterPages(prev=>({...prev,[mode]:last}));if(mode==='concepts')setExtra((await client.get(`/${mode}?page=${last}&size=20`)).data)}}
 async function refreshClasses(){setClassMessage('');try{const r=await classesApi.list();const items:Record<string,unknown>[]=Array.isArray(r)?r:Array.isArray(r?.items)?r.items:[];setClasses(items);const details=await Promise.allSettled(items.map(c=>classesApi.detail(String(c.id))));const mapped:Record<string,Record<string,unknown>>={};details.forEach((d,i)=>{if(d.status==='fulfilled'&&d.value&&typeof d.value==='object'){const value=d.value as any;mapped[String(items[i].id)]=(value.data&&typeof value.data==='object'?value.data:value)}});setClassDetails(mapped);if(details.some(d=>d.status==='rejected'))setClassMessage('일부 학급의 학생 목록을 불러오지 못했습니다. 권한 및 서버 연결을 확인해 주세요.')}catch(e){setClassMessage((e as Error).message)}}
 useEffect(()=>{if(route==='students')void refreshClasses()},[route]);
 async function createClass(e:React.FormEvent){e.preventDefault();setClassMessage('');setClassBusy('create');try{await classesApi.create(className.trim());setClassName('');await refreshClasses();setClassMessage('학급을 생성했습니다.')}catch(e){setClassMessage((e as Error).message)}finally{setClassBusy('')}}
 async function unlinkStudent(classId:string,id:string){if(!window.confirm('이 학생을 해당 학급에서 제외할까요? 학생 계정은 삭제되지 않습니다.'))return;setClassBusy(classId);try{await classesApi.removeStudent(classId,id);await refreshClasses();setClassMessage('학급 연결을 해제했습니다.')}catch(e){setClassMessage((e as Error).message)}finally{setClassBusy('')}}
 async function renewCode(classId:string){if(!window.confirm('참여 코드를 재발급하면 기존 코드로는 가입할 수 없습니다. 계속할까요?'))return;setClassBusy(classId);try{await classesApi.renew(classId);await refreshClasses();setClassMessage('새 참여 코드를 발급했습니다.')}catch(e){setClassMessage((e as Error).message)}finally{setClassBusy('')}}
 async function deleteClass(classId:string,classLabel:string){if(!window.confirm(`「${classLabel}」 학급을 삭제할까요? 이 작업은 되돌릴 수 없습니다.`))return;setClassBusy(classId);try{await classesApi.remove(classId);await refreshClasses();setClassMessage('학급을 삭제했습니다.')}catch(e){setClassMessage((e as Error).message)}finally{setClassBusy('')}}
 const logout=()=>{authApi.logout();location.hash='login';location.reload()};
 const allMenus=[...menus.filter(m=>m[0]!=='guardians'&&m[0]!=='classes'),...additional];
 return <div className="shell"><aside className="sidebar stepi-live-sidebar"><div className="logo"><img src="/assets/stepi-logo-official.png" alt="STEPi" style={{maxWidth:140}}/></div><p className="nav-label">LIVE BACKEND</p><nav className="nav stepi-live-nav" aria-label="주 메뉴">{allMenus.map(([id,icon,name])=><button key={id} className={route===id?'active':''} onClick={()=>location.hash=id}><span className="icon">{icon}</span><span className="nav-text">{name}</span></button>)}</nav><div className="profile"><div>{account.role} · 실서버 연동<small>{account.name||'실시간 학습 데이터'}</small></div><button onClick={logout}>로그아웃</button></div></aside><main className="main"><header className="topbar"><input placeholder="학생 이름 검색" value={search} onChange={e=>setSearch(e.target.value)}/><span>{account.role} · 학습 관리 시스템</span></header><div className="content"><div className="heading"><div><span className="eyebrow">STEPi LEARNING ANALYTICS</span><h1>{config?.title??route}</h1><p>{config?.description??'실제 API 데이터'}</p></div></div>
 {config&&route!=='dashboard'&&route!=='students'&&route!=='learning'&&<ScreenGuide view={route} studentName={config.student?students.find(s=>s.id===studentId)?.name:undefined}/>}
 {config?.student&&<section className="card" style={{marginBottom:16}}><label>조회 학생　<select value={studentId} onChange={e=>setStudentId(e.target.value)}>{!students.length&&<option value="">연결된 학생 없음</option>}{filteredStudents.map(s=><option key={s.id} value={s.id}>{s.name} ({s.id})</option>)}</select></label></section>}
 {route==='learning'&&<section className="stepi-showcase stepi-learning-showcase" aria-label="학습 기록 요약">
  <div className="stepi-showcase-intro"><div><span className="stepi-showcase-kicker">LEARNING HISTORY</span><h2>학생의 학습 과정을 확인하세요</h2><p>선택한 학생의 실제 학습 기록을 백엔드에서 조회합니다.</p></div><span className="stepi-showcase-pill">실서버 학습 이력</span></div>
  <div className="stepi-learning-steps"><div><span>01</span><strong>학생 선택</strong><small>조회 대상 선택</small></div><div><span>02</span><strong>학습 데이터 조회</strong><small>서버에 저장된 기록</small></div><div><span>03</span><strong>학습 이력 확인</strong><small>풀이 및 학습 상태</small></div></div>
 </section>}
 {route==='standing'&&Boolean(data)&&typeof data==='object'&&(data as any).available===false&&<section className="card" style={{marginBottom:16}}><h3>비교 통계를 아직 제공할 수 없습니다.</h3><p>{(data as any).reason==='GRADE_NOT_SET'?'학생의 학년 정보가 설정되지 않았습니다.':`사유: ${String((data as any).reason||'비교 데이터 부족')}`}</p><p>현재 비교 인원: {String((data as any).group_size??0)}명 / 최소 필요 인원: {String((data as any).minimum_group_size??30)}명</p></section>}
 {route==='roadmap'&&errorCode==='ROADMAP_NOT_FOUND'&&<section className="card" style={{marginBottom:16}}><h3>아직 학습 로드맵이 없어요.</h3><p>진단 학습 또는 로드맵 생성이 완료되면 이곳에서 확인할 수 있습니다.</p></section>}{route==='roadmap'&&errorCode==='STUDENT_NOT_FOUND'&&<section className="card" style={{marginBottom:16}}><h3>학생 정보를 찾을 수 없습니다.</h3><p>학생 연결 또는 조회 권한을 확인해 주세요.</p><button onClick={()=>location.hash='students'}>학생 목록으로 이동</button></section>}
 {route==='students'&&<section className="stepi-showcase" aria-label="교사 학생 관리 요약">
  <div className="stepi-showcase-intro"><div><span className="stepi-showcase-kicker">STUDENT MANAGEMENT</span><h2>학생과 학급을 한눈에 관리하세요</h2><p>연결된 실제 학생 및 학급 정보를 확인할 수 있습니다.</p></div><span className="stepi-showcase-pill">{account.role} 계정 · 조회 가능한 학생</span></div>
  <div className="stepi-showcase-kpis"><div><span>연결된 학생</span><strong>{students.length}<small>명</small></strong><p>현재 계정의 조회 가능 학생</p></div><div><span>관리 학급</span><strong>{classes.length}<small>개</small></strong><p>실제 서버에서 불러온 학급</p></div><div><span>선택 가능한 학생</span><strong>{filteredStudents.length}<small>명</small></strong><p>{search.trim()?'현재 이름 검색 기준':'전체 학생 목록 기준'}</p></div></div>
 </section>}
 {route==='students'&&<section className="card stepi-showcase-card" style={{marginBottom:16}}><div className="stepi-showcase-card-header"><div><span className="stepi-showcase-kicker">STUDENT DIRECTORY</span><h3>학생 목록</h3><p>학생 이름 또는 상세 보기를 누르면 개별 학습 정보를 조회할 수 있습니다.</p></div><span className="stepi-showcase-count">{filteredStudents.length}명 표시</span></div>{!filteredStudents.length?<div className="stepi-showcase-blank"><strong>{students.length?'검색 결과가 없습니다.':'연결된 학생이 없습니다.'}</strong><p>실제 서버에서 조회할 수 있는 학생만 표시됩니다.</p></div>:<div className="stepi-table-scroll"><table className="stepi-data-table stepi-showcase-table"><thead><tr><th>학생 ID</th><th>학생 이름</th><th>학년</th><th>접근 상태</th><th>상세 조회</th></tr></thead><tbody>{filteredStudents.map(s=><tr key={s.id}><td>{s.id}</td><td><button type="button" className="stepi-showcase-name" onClick={()=>openStudent(s.id)}>{s.name}</button></td><td>{s.grade}</td><td><span className="stepi-showcase-access">조회 가능</span></td><td><button type="button" className="stepi-showcase-detail" onClick={()=>openStudent(s.id)}>상세 보기</button></td></tr>)}</tbody></table></div>}</section>}
 {route==='problems'&&<ProblemWorkspace/>}
 {route==='master'&&<AdminEditor key={masterMode} kind={masterMode} items={extra??(masterMode==='concepts'?data:null)} onSaved={afterMasterSaved}/>}
 {route==='master'&&<section className="card" style={{marginBottom:16}}><button aria-pressed={masterMode==='concepts'} onClick={()=>selectMaster('concepts',masterPages.concepts)}>개념 조회</button> <button aria-pressed={masterMode==='skills'} onClick={()=>selectMaster('skills',masterPages.skills)}>Skill 조회</button><p style={{marginTop:12,color:'#64748b'}}>현재 선택: {masterMode==='concepts'?'개념':'Skill'} · 실제 서버 조회 결과</p></section>}
 {route==='master'&&Boolean(extra)&&typeof extra==='object'&&<section className="card" style={{marginBottom:16}}><div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}><strong>{masterMode==='concepts'?'개념':'Skill'} 목록 페이지</strong><span>전체 {Number((extra as any).total??0)}개 · {masterPages[masterMode]} / {Math.max(1,Number((extra as any).total_pages??1))}페이지</span><button type="button" disabled={loading||masterPages[masterMode]<=1} onClick={()=>setMasterPages(p=>({...p,[masterMode]:Math.max(1,p[masterMode]-1)}))}>이전</button><button type="button" disabled={loading||masterPages[masterMode]>=Number((extra as any).total_pages??1)} onClick={()=>setMasterPages(p=>({...p,[masterMode]:p[masterMode]+1}))}>다음</button><button type="button" disabled={loading} onClick={()=>setMasterPages(p=>({...p,[masterMode]:Math.max(1,Number((extra as any).total_pages??1))}))}>마지막 페이지</button></div>{masterNotice&&<p role="status" style={{marginTop:8}}>{masterNotice}</p>}<p style={{marginTop:8,color:'#64748b'}}>기존 항목 수정은 현재 페이지의 항목을 선택할 수 있습니다. 다른 항목은 페이지를 이동한 후 선택하세요.</p></section>}
 {route==='students'&&<section className="card stepi-showcase-card stepi-class-management" style={{marginBottom:16}}><h2>학급·학생 연결 관리</h2><p style={{color:'#64748b'}}>학생은 APP에서 학급 참여 코드로 가입(POST /me/classes/join)해야 소속 목록에 나타납니다. 교사 본인의 학급만 관리할 수 있습니다. 학생 계정 정보는 조회 전용이며, 학급에서 제외해도 학생 계정은 삭제되지 않습니다.</p><form onSubmit={createClass} style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12}}><input aria-label="새 학급 이름" placeholder="새 학급 이름" value={className} onChange={e=>setClassName(e.target.value)} required/><button type="submit" disabled={Boolean(classBusy)}>학급 생성</button><button type="button" disabled={Boolean(classBusy)} onClick={()=>void refreshClasses()}>학급 조회·새로고침</button></form>{!classes.length&&<div className="stepi-empty">등록된 학급이 없습니다.</div>}{classes.map((c,i)=>{const cid=String(c.id??'');const detail=classDetails[cid]??c;const members=Array.isArray(detail.students)?detail.students:[];const joinCode=detail.join_code??c.join_code;return <div key={cid||i} className="stepi-class-panel" style={{padding:16,border:'1px solid #e2e8f0',borderRadius:12,marginTop:12}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,flexWrap:'wrap'}}><strong>{String(detail.name??c.name??'학급')} (ID: {cid})</strong><div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button type="button" disabled={Boolean(classBusy)} onClick={()=>void renewCode(cid)}>참여 코드 재발급</button><button type="button" disabled={Boolean(classBusy)} onClick={()=>void deleteClass(cid,String(detail.name??c.name??'학급'))} style={{color:'#b91c1c'}}>학급 삭제</button></div></div><p style={{margin:'10px 0'}}>학생 참여 코드: <strong>{joinCode?String(joinCode):'정보 없음'}</strong></p><h3 style={{fontSize:15,margin:'12px 0 8px'}}>소속 학생 ({members.length}명)</h3>{members.length?<div className="stepi-table-scroll"><table className="stepi-data-table"><thead><tr><th>학생 ID</th><th>이름</th><th>관리</th></tr></thead><tbody>{members.map((st:any,j:number)=>{const sid=String(st.user_id??st.student_id??st.id??'');return <tr key={sid||j}><td>{sid||'-'}</td><td>{String(st.name??st.nickname??'학생')}</td><td><button type="button" disabled={!sid||Boolean(classBusy)} onClick={()=>void unlinkStudent(cid,sid)}>학급에서 제외</button></td></tr>})}</tbody></table></div>:<p style={{color:'#64748b'}}>현재 소속 학생이 없습니다.</p>}</div>})}{classMessage&&<p role="status" style={{marginTop:12}}>{classMessage}</p>}</section>}
 {route==='reports'&&<section className="card" style={{marginBottom:16}}><label>리포트 ID　<input value={reportId} onChange={e=>setReportId(e.target.value)} placeholder="목록에서 리포트 ID 입력"/></label> <button disabled={!studentId||!reportId} onClick={()=>fetchExtra(`/students/${encodeURIComponent(studentId)}/reports/${encodeURIComponent(reportId)}`)}>리포트 상세 조회</button></section>}
 {route!=='problems'&&loading&&<section className="card"><p>서버 데이터 불러오는 중...</p></section>}{route!=='problems'&&error&&!(route==='roadmap'&&errorCode==='ROADMAP_NOT_FOUND')&&<section className="card" role="alert"><strong>API 요청 오류</strong><p>{error}</p><p>서버 주소, 계정 권한, 학생 연결 여부를 확인하세요.</p></section>}
 {route==='students'||route==='problems'?null:config&&route!=='master'?route==='dashboard'?(!loading&&!error&&<DashboardSummary data={data} onNavigate={page=>{location.hash=page}}/>):<section className={route==='learning'?'card stepi-learning-records':'card'}><h2>{route==='learning'?'학생 학습 기록':config.title}</h2>{route==='learning'&&<p className="stepi-learning-hint">실제 기록이 없으면 학습 내용이 생성될 때까지 대기 상태로 표시됩니다.</p>}{!loading&&!error&&<Result data={data} view={route}/>}</section>:null}
 {route==='master'&&<section className="card"><h2>{masterMode==='concepts'?'개념 조회 결과':'Skill 조회 결과'}</h2>{!loading&&!error&&<Result data={extra??(masterMode==='concepts'?data:null)} view="master"/>}</section>}{route!=='master'&&extra!==null&&<section className="card" style={{marginTop:16}}><h2>추가 조회 결과</h2><Result data={extra}/></section>}
 </div><footer className="footer">© 2026 STEPi · 실제 API 조회 모드 · 서버 연결과 응답 검증 필요</footer></main></div>;
}
