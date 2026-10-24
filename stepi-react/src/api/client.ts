import axios from 'axios';
export const MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
export const client = axios.create({baseURL:import.meta.env.VITE_API_BASE_URL || '/api/v1',timeout:15000});
client.interceptors.request.use(config=>{const token=sessionStorage.getItem('stepi_access_token');if(token)config.headers.Authorization=`Bearer ${token}`;return config;});
client.interceptors.response.use(r=>r,err=>{const message=err.response?.data?.message || err.message || '서버 요청 실패';return Promise.reject(new Error(message));});
export type Student = {id:string;name:string;grade:string;active:boolean;studyTime:string;goalRate:number};
const fixture:Student[]=[
{id:'demo-1',name:'김수연',grade:'중2-1',active:true,studyTime:'12h 10m',goalRate:78},
{id:'demo-2',name:'이도윤',grade:'중2-1',active:true,studyTime:'8h 20m',goalRate:62},
{id:'demo-3',name:'박지민',grade:'중2-1',active:true,studyTime:'15h 40m',goalRate:81},
{id:'demo-4',name:'최은서',grade:'중2-2',active:true,studyTime:'9h 10m',goalRate:47},
{id:'demo-5',name:'정하윤',grade:'중2-3',active:false,studyTime:'11h 20m',goalRate:73}];
export const authApi={
async login(data:{email:string;password:string}){if(MOCK)return {demo:true};const r=await client.post('/auth/login',data);const token=r.data?.accessToken??r.data?.access_token;if(token)sessionStorage.setItem('stepi_access_token',token);return r.data;},
async signup(data:{name:string;email:string;password:string}){if(MOCK)return {demo:true};return (await client.post('/auth/signup',data)).data;},
logout(){sessionStorage.removeItem('stepi_access_token');}
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
