import axios from 'axios';
export const MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
export const client = axios.create({baseURL:import.meta.env.VITE_API_BASE_URL || '/api/v1',timeout:15000});
client.interceptors.request.use(config=>{const token=sessionStorage.getItem('stepi_access_token');if(token)config.headers.Authorization=`Bearer ${token}`;return config;});
// Only refresh an expired access token. Concurrent 401s share one refresh request.
let refreshing:Promise<string>|null=null;
client.interceptors.response.use(r=>r,async err=>{
 const original=err.config as (typeof err.config & {_retry?:boolean})|undefined;
 const code=err.response?.data?.code;
 if(!MOCK && original && err.response?.status===401 && code==='AUTH_TOKEN_EXPIRED' && !original._retry && !String(original.url||'').includes('/auth/refresh')){
  original._retry=true;
  try{
   if(!refreshing)refreshing=(async()=>{
    const refreshToken=sessionStorage.getItem('stepi_refresh_token');
    if(!refreshToken)throw new Error('재로그인이 필요합니다.');
    const result=await axios.post((import.meta.env.VITE_API_BASE_URL||'/api/v1')+'/auth/refresh',{refresh_token:refreshToken});
    const access=result.data?.access_token??result.data?.accessToken;
    const nextRefresh=result.data?.refresh_token??result.data?.refreshToken;
    if(!access || !nextRefresh)throw new Error('토큰 갱신 응답이 올바르지 않습니다.');
    sessionStorage.setItem('stepi_access_token',access);
    sessionStorage.setItem('stepi_refresh_token',nextRefresh);
    return access as string;
   })().finally(()=>{refreshing=null;});
   const token=await refreshing;
   original.headers.set('Authorization',`Bearer ${token}`);
   return client(original);
  }catch{sessionStorage.removeItem('stepi_access_token');sessionStorage.removeItem('stepi_refresh_token');location.hash='login';}
 }
 const message=err.response?.data?.message || err.message || '서버 요청 실패';
 return Promise.reject(new Error(message));
});
export type Student = {id:string;name:string;grade:string;active:boolean;studyTime:string;goalRate:number};
const fixture:Student[]=[
{id:'demo-1',name:'김수연',grade:'중2-1',active:true,studyTime:'12h 10m',goalRate:78},
{id:'demo-2',name:'이도윤',grade:'중2-1',active:true,studyTime:'8h 20m',goalRate:62},
{id:'demo-3',name:'박지민',grade:'중2-1',active:true,studyTime:'15h 40m',goalRate:81},
{id:'demo-4',name:'최은서',grade:'중2-2',active:true,studyTime:'9h 10m',goalRate:47},
{id:'demo-5',name:'정하윤',grade:'중2-3',active:false,studyTime:'11h 20m',goalRate:73}];
export const authApi={
async login(data:{email:string;password:string}){if(MOCK)return {demo:true};const r=await client.post('/auth/login',data);const token=r.data?.accessToken??r.data?.access_token;if(token)sessionStorage.setItem('stepi_access_token',token);const refresh=r.data?.refresh_token??r.data?.refreshToken;if(refresh)sessionStorage.setItem('stepi_refresh_token',refresh);return r.data;},
async signup(data:{name:string;email:string;password:string;role:"PARENT"|"TEACHER"|"ADMIN"|"STUDENT";nickname?:string}){if(MOCK)return {demo:true};return (await client.post('/auth/signup',data)).data;},
logout(){sessionStorage.removeItem('stepi_access_token');sessionStorage.removeItem('stepi_refresh_token');}
};
export const studentApi={
async list():Promise<Student[]>{if(MOCK)return [...fixture];const {data}=await client.get('/students');const items=Array.isArray(data)?data:(data.items??data.content??data.data?.items??[]);return items.map((x:any)=>({id:String(x.id??x.studentId??''),name:String(x.name??x.studentName??''),grade:String(x.grade??x.className??'-'),active:Boolean(x.active??true),studyTime:String(x.studyTime??'-'),goalRate:Number(x.goalRate??0)}));},
async detail(id:string){if(MOCK)return fixture.find(s=>s.id===id);return (await client.get(`/students/${encodeURIComponent(id)}`)).data;}
};
export const dashboardApi={summary:async(params?:Record<string,string>)=>MOCK?null:(await client.get('/dashboard/summary',{params})).data};
export const studentAnalyticsApi={
knowledgeMap:(id:string)=>client.get(`/students/${encodeURIComponent(id)}/knowledge-map`),
weakSkills:(id:string)=>client.get(`/students/${encodeURIComponent(id)}/weak-skills`),
roadmap:(id:string)=>client.get(`/students/${encodeURIComponent(id)}/roadmap`),
learningHistory:(id:string)=>client.get(`/students/${encodeURIComponent(id)}/learning-history`),
aiAnalyses:(id:string)=>client.get(`/students/${encodeURIComponent(id)}/ai-analyses`),
tutorHistory:(id:string)=>client.get(`/students/${encodeURIComponent(id)}/tutor-history`),
gamification:(id:string)=>client.get(`/students/${encodeURIComponent(id)}/gamification`),
relativeStanding:(id:string)=>client.get(`/students/${encodeURIComponent(id)}/relative-standing`),
reports:(id:string)=>client.get(`/students/${encodeURIComponent(id)}/reports`),
reportDetail:(id:string,reportId:string)=>client.get(`/students/${encodeURIComponent(id)}/reports/${encodeURIComponent(reportId)}`)
};

// v0.3 협의안에 명시된 웹용 후보 경로. 확정 응답 스키마는 백엔드 공유 후 연결합니다.
export const catalogApi = {
  concepts: (params?:Record<string,string|number>) => client.get('/concepts',{params}),
  skills: (params?:Record<string,string|number>) => client.get('/skills',{params}),
  problems: (params?:Record<string,string|number>) => client.get('/problems',{params}),
  problemDetail: (id:string) => client.get(`/problems/${encodeURIComponent(id)}`),
  createProblem: (payload:unknown) => client.post('/admin/problems',payload),
  updateProblem: (id:string,payload:unknown) => client.patch(`/admin/problems/${encodeURIComponent(id)}`,payload),
  createConcept: (payload:unknown) => client.post('/admin/concepts',payload),
  updateConcept: (code:string,payload:unknown) => client.patch(`/admin/concepts/${encodeURIComponent(code)}`,payload),
  createSkill: (payload:unknown) => client.post('/admin/skills',payload),
  updateSkill: (code:string,payload:unknown) => client.patch(`/admin/skills/${encodeURIComponent(code)}`,payload),
  addPrerequisite: (payload:unknown) => client.post('/admin/skill-prerequisites',payload),
  currentUser: () => client.get('/users/me'),
  refresh: (payload:unknown) => client.post('/auth/refresh',payload),
  logout: () => client.post('/auth/logout')
};

// WEB-only endpoints confirmed by Backend 2026-11-01.
export const guardianApi={
 list:async()=>MOCK?JSON.parse(localStorage.getItem('stepi_guardians')||'[]'):(await client.get('/guardian-links')).data,
 connect:async(code:string)=>{if(MOCK){const items=JSON.parse(localStorage.getItem('stepi_guardians')||'[]');items.push({id:'demo-'+Date.now(),code,status:'PENDING'});localStorage.setItem('stepi_guardians',JSON.stringify(items));return;}return (await client.post('/guardian-links',{code})).data;},
 remove:async(id:string)=>{if(MOCK){const items=JSON.parse(localStorage.getItem('stepi_guardians')||'[]').filter((x:{id:string})=>x.id!==id);localStorage.setItem('stepi_guardians',JSON.stringify(items));return;}return (await client.delete(`/guardian-links/${encodeURIComponent(id)}`)).data;}
};
export const classesApi={
 list:async()=>MOCK?JSON.parse(localStorage.getItem('stepi_classes')||'[]'):(await client.get('/classes')).data,
 detail:async(id:string)=>MOCK?JSON.parse(localStorage.getItem('stepi_classes')||'[]').find((x:{id:string})=>x.id===id):(await client.get(`/classes/${encodeURIComponent(id)}`)).data,
 create:async(name:string)=>{if(MOCK){const items=JSON.parse(localStorage.getItem('stepi_classes')||'[]');const item={id:'demo-'+Date.now(),name,join_code:String(Math.floor(10000000+Math.random()*90000000)),students:[]};items.push(item);localStorage.setItem('stepi_classes',JSON.stringify(items));return item;}return (await client.post('/classes',{name})).data;},
 renew:async(id:string)=>{if(MOCK){const items=JSON.parse(localStorage.getItem('stepi_classes')||'[]');const item=items.find((x:{id:string})=>x.id===id);if(item)item.join_code=String(Math.floor(10000000+Math.random()*90000000));localStorage.setItem('stepi_classes',JSON.stringify(items));return item;}return (await client.post(`/classes/${encodeURIComponent(id)}/join-code`)).data;},
 remove:async(id:string)=>{if(MOCK){localStorage.setItem('stepi_classes',JSON.stringify(JSON.parse(localStorage.getItem('stepi_classes')||'[]').filter((x:{id:string})=>x.id!==id)));return;}return (await client.delete(`/classes/${encodeURIComponent(id)}`)).data;},
 removeStudent:async(id:string,studentId:string)=>{if(MOCK){const items=JSON.parse(localStorage.getItem('stepi_classes')||'[]');const item=items.find((x:{id:string})=>x.id===id);if(item)item.students=(item.students||[]).filter((x:{id:string})=>x.id!==studentId);localStorage.setItem('stepi_classes',JSON.stringify(items));return;}return (await client.delete(`/classes/${encodeURIComponent(id)}/students/${encodeURIComponent(studentId)}`)).data;}
};
export const passwordResetApi={
 request:async(email:string)=>MOCK?{demo:true}:(await client.post('/auth/password-reset/request',{email})).data,
 confirm:async(payload:{email:string;code:string;new_password:string})=>MOCK?{demo:true}:(await client.post('/auth/password-reset/confirm',payload)).data
};
