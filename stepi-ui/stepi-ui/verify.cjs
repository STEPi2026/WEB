const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = __dirname;
const elements = new Map();
const handlers = {};
function element() {
  return { innerHTML: '', textContent: '', value: '', classList: { add() {}, remove() {} }, showModal() {}, close() {}, reset() {} };
}
const context = {
  document: {
    querySelector(selector) { if (!elements.has(selector)) elements.set(selector, element()); return elements.get(selector); },
    querySelectorAll() { return []; },
    addEventListener(event, handler) { handlers[event] = handler; },
  },
  window: { addEventListener() {}, scrollTo() {} },
  location: { hash: '' },
  setTimeout() {}, clearTimeout() {}, console,
};
vm.createContext(context);
for (const file of ['api.js', 'components.js', 'pages.js', 'auth.js', 'app.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
}
async function run() {
  await vm.runInContext('init()', context);
  const routes = ['login', 'signup', ...vm.runInContext('Object.keys(screens)', context)];
  for (const route of routes) {
    vm.runInContext(`page=${JSON.stringify(route)}; tab=0; render()`, context);
    assert.ok(elements.get('#app').innerHTML.includes('STEPi'), route);
  }
  for (const [route, count] of [['student',6],['concepts',2],['errors',4],['reports',4],['problems',3],['master',3],['gamification',4]]) {
    for (let tab = 0; tab < count; tab++) vm.runInContext(`page='${route}'; tab=${tab}; render()`, context);
  }
  assert.equal(vm.runInContext("query='김수연';studentRows().length", context), 1);
  assert.equal(vm.runInContext("query='없는이름';studentRows().length", context), 0);
  await vm.runInContext("api.students.create({name:'테스트 학생',grade:'중2-1'})", context);
  assert.equal((await vm.runInContext('api.students.list()', context)).length, 6);
  await assert.rejects(vm.runInContext("api.students.create({name:'',grade:'중2-1'})", context));
  assert.equal(vm.runInContext("escapeHTML('<script>')", context), '&lt;script&gt;');
  // Real API branch: verifies endpoint, HTTP verb, JSON body and error propagation.
  let request;
  context.fetch = async (url, options) => {
    request = {url, options};
    return {ok:true, status:200, json:async()=>[{name:'서버 학생',grade:'중2-2',active:true,studyTime:'2h',goalRate:90}]};
  };
  vm.runInContext('api.config.mock=false', context);
  const remote = await vm.runInContext('api.students.list()', context);
  assert.equal(remote[0][0], '서버 학생');
  assert.equal(request.url, '/api/students');
  await vm.runInContext("api.students.create({name:'새 학생',grade:'중2-1'})", context);
  assert.equal(request.options.method, 'POST');
  assert.equal(JSON.parse(request.options.body).name, '새 학생');
  context.fetch = async()=>({ok:false,status:500});
  await assert.rejects(vm.runInContext('api.students.list()', context), /500/);
  // Palette rules: only tokens.css can define literal hex colors.
  for (const file of ['styles.css','components.js','pages.js','auth.js','app.js']) {
    assert.equal(/#[\da-f]{3,8}\b/i.test(fs.readFileSync(path.join(root,file),'utf8')),false, `${file}: literal color`);
  }
  const tokens = fs.readFileSync(path.join(root, 'tokens.css'), 'utf8');
  const names = new Set([...tokens.matchAll(/--([\w-]+)\s*:/g)].map(m=>m[1]));
  for (const file of ['styles.css','components.js','pages.js','auth.js','app.js','tokens.css']) {
    for (const match of fs.readFileSync(path.join(root,file),'utf8').matchAll(/var\(--([\w-]+)\)/g)) assert.ok(names.has(match[1]),match[1]);
  }
  console.log('PASS: 16 screens, 26 tab states, search, escaping, mock/HTTP API, error handling, palette tokens.');
  console.log('DOM stub checks only; browser layout is not covered.');
}
run().catch(error=>{console.error(error);process.exitCode=1});
