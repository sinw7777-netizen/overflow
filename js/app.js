const KEY = 'transferPrepApp_v2';
const defaults = { 
  university: '', 
  year: '', 
  type: '', 
  unit: '', 
  checks: [false, false, false, false], 
  notes: {} 
};

let state;
try {
  state = { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
} catch (e) {
  state = { ...defaults };
}

let page = 'home', detailIndex = 0;

// 연도 범위 2020 ~ 2030
const years = Array.from({ length: 11 }, (_, i) => String(2020 + i));

// 카테고리 정의 및 시스템 기준 안내 데이터
const categories = [
  {
    title: '지원 자격·학점',
    desc: '지원 대상 및 수료·학점 기준',
    guidelines: [
      { label: '지원 대상 기준', text: '국내·외 4년제 정규대학 2학년(4학기) 이상 수료(예정)자 또는 전문대학 졸업(예정)자' },
      { label: '최소 이수 학점', text: '보통 65~70학점 이상 취득 필요 (해당 대학 2학년 수료 기준 학점 적용)' }
    ]
  },
  {
    title: '시험 과목·범위',
    desc: '필기·전공·영어 등 시험 정보',
    guidelines: [
      { label: '필기 시험 구성', text: '인문계열: 편입영어(어휘, 문법, 논리, 독해) / 자연계열: 편입영어 + 편입수학(미적분, 선형대수)' },
      { label: '전형 반영 비율', text: '1단계: 필답고사 100% (배수 선발) / 2단계: 1단계 성적 + 서류/면접' }
    ]
  },
  {
    title: '어학·자격증',
    desc: '공인어학성적 및 자격증 기준',
    guidelines: [
      { label: '공인영어 반영 여부', text: '토익/토플 성적 필수 제출 또는 지원 자격 충족 요건(최저 기준점수 확인 필요)' },
      { label: '가산점 및 자격증', text: '모집단위별 관련 기사 자격증 또는 한국사능력검정시험 가산점 여부 점검' }
    ]
  },
  {
    title: '제출 서류·일정',
    desc: '필요 서류와 원서 접수 일정',
    guidelines: [
      { label: '필수 제출 서류', text: '전적대학 수료(예정)증명서, 성적증명서, 학업계획서(해당 전형)' },
      { label: '주요 전형 일정', text: '원서접수: 보통 12월 초~중순 / 필기고사: 12월 말~1월 중 / 합격자 발표: 2월 초' }
    ]
  }
];

function save() {
  localStorage.setItem(KEY, JSON.stringify(state));
}

function toast(msg = '저장되었습니다.') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1600);
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function progress() {
  return Math.round(state.checks.filter(Boolean).length / 4 * 100);
}

function setPage(p) {
  page = p;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function titlebar(title, step = '', showBack = true) {
  const backBtn = showBack ? `<button class="back" onclick="goBack()" aria-label="뒤로">←</button>` : '';
  const note = step ? `<span class="header-note">${step}</span>` : '';
  return `<div class="topline">${backBtn}<h2>${title}</h2>${note}</div>`;
}

function goBack() {
  if (page === 'detail') setPage('list');
  else if (page === 'list' || page === 'check' || page === 'search') setPage('home');
  else setPage('home');
}

function render() {
  document.querySelectorAll('.nav').forEach(b => {
    b.classList.toggle('active', b.dataset.page === (page === 'detail' ? 'list' : page));
  });
  
  const el = document.getElementById('screen');
  if (page === 'home') el.innerHTML = home();
  if (page === 'search') el.innerHTML = search();
  if (page === 'list') el.innerHTML = list();
  if (page === 'detail') el.innerHTML = detail();
  if (page === 'check') el.innerHTML = check();
  if (page === 'profile') el.innerHTML = profile();
}

function home() {
  return `
  <div class="eyebrow">TRANSFER PREPARATION · DASHBOARD</div>
  <h1>편입 준비,<br>한눈에 확인하세요.</h1>
  <p class="sub">목표 대학의 준비 조건부터 체크리스트까지 차근차근 관리할 수 있어요.</p>
  <div class="hero">
    <h2>나에게 맞는 편입 준비 시작하기</h2>
    <p>대학과 전형 조건만 선택하면 필요한 준비사항을 자동으로 모아볼 수 있습니다.</p>
    <button class="btn" onclick="setPage('search')">편입 조건 설정하기 →</button>
  </div>
  <div class="stats">
    <div class="stat">
      <strong>${progress()}%</strong><span>준비 확인 진행률</span>
      <div class="progress"><i style="width:${progress()}%"></i></div>
    </div>
    <div class="stat">
      <strong>${state.university ? esc(state.university) : '미선택'}</strong>
      <span>선택한 목표 대학</span>
    </div>
  </div>
  <div class="section-head"><h3>바로가기</h3><span class="header-note">QUICK MENU</span></div>
  <div class="grid">
    <button class="tile" onclick="detailIndex=0;setPage('detail')"><b>지원 자격·학점</b><span>조건 안내 보기 →</span></button>
    <button class="tile" onclick="detailIndex=1;setPage('detail')"><b>시험 과목·범위</b><span>시험 기준 보기 →</span></button>
    <button class="tile" onclick="detailIndex=2;setPage('detail')"><b>어학·자격증</b><span>공인어학 기준 보기 →</span></button>
    <button class="tile" onclick="detailIndex=3;setPage('detail')"><b>제출 서류·일정</b><span>일정 안내 보기 →</span></button>
  </div>
  <div class="section-head"><h3>나의 목표 설정 현황</h3><button class="btn small secondary" onclick="setPage('check')">체크리스트</button></div>
  <div class="card">
    <b>${state.university ? esc(state.university) + ' · ' + esc(state.unit || '모집단위 미입력') : '아직 목표 조건을 설정하지 않았어요.'}</b>
    <p class="sub" style="margin:6px 0 0">${state.year ? esc(state.year) + '학년도 · ' + esc(state.type) : '목표 대학과 전형을 설정하면 맞춤 정보를 확인할 수 있어요.'}</p>
  </div>`;
}

function search() {
  return `
  ${titlebar('조회 조건 선택', '1 / 4', true)}
  <div class="progress"><i style="width:25%"></i></div>
  <h1 style="font-size:20px">편입 준비를 위한<br>조회 조건을 선택해주세요.</h1>
  <p class="sub">선택한 정보에 맞춰 필요한 지원 요건이 자동으로 표시됩니다.</p>
  
  <label for="uni">목표 대학</label>
  <select id="uni">
    <option value="">대학을 선택하세요</option>
    ${['예시대학교','서울대학교','연세대학교','고려대학교','성균관대학교','한양대학교','중앙대학교','경희대학교','기타 대학'].map(x => `<option ${state.university === x ? 'selected' : ''}>${x}</option>`).join('')}
  </select>

  <label for="year">모집연도</label>
  <select id="year">
    <option value="">모집연도를 선택하세요</option>
    ${years.map(x => `<option ${state.year === x ? 'selected' : ''}>${x}학년도</option>`).join('')}
  </select>

  <label for="type">편입 전형</label>
  <select id="type">
    <option value="">전형을 선택하세요</option>
    ${['일반편입','학사편입','특별전형(농어촌/특성화)'].map(x => `<option ${state.type === x ? 'selected' : ''}>${x}</option>`).join('')}
  </select>

  <label for="unit">목표 모집단위(학과)</label>
  <input id="unit" type="text" placeholder="예: 컴퓨터공학과 / 경영학과" value="${esc(state.unit)}">
  <p class="form-hint">※ 학과에 따라 필기시험(인문/자연) 및 실기 반영 여부가 달라집니다.</p>

  <div class="actions">
    <button class="btn secondary" onclick="setPage('home')">취소</button>
    <button class="btn" onclick="saveSearch()">준비사항 확인 →</button>
  </div>`;
}

function saveSearch() {
  const uni = document.getElementById('uni').value;
  const year = document.getElementById('year').value.replace('학년도', '');
  const type = document.getElementById('type').value;
  const unit = document.getElementById('unit').value.trim();

  if (!uni || !year || !type || !unit) {
    toast('모든 조건을 선택·입력해주세요.');
    return;
  }
  state.university = uni;
  state.year = year;
  state.type = type;
  state.unit = unit;
  save();
  setPage('list');
}

function list() {
  return `
  ${titlebar('편입 준비사항 요약', '2 / 4', true)}
  <div class="progress"><i style="width:50%"></i></div>
  <div class="card" style="background:#f3f3f3">
    <b>${esc(state.university || '대학 미선택')} · ${esc(state.unit || '모집단위 미입력')}</b>
    <p class="sub" style="margin:5px 0 0">${esc(state.year || '연도 미선택')}학년도 · ${esc(state.type || '전형 미선택')}</p>
    <button class="btn secondary small" style="margin-top:10px" onclick="setPage('search')">조건 변경</button>
  </div>

  <p class="sub" style="margin-top:16px">각 항목을 눌러 준비 조건과 기준 가이드를 확인하세요.</p>
  
  ${categories.map((c, i) => `
    <button class="item" style="width:100%;text-align:left" onclick="detailIndex=${i};setPage('detail')">
      <span>
        <b>${c.title}</b>
        <p>${c.desc}</p>
      </span>
      <span class="arrow">›</span>
    </button>
  `).join('')}

  <div class="actions">
    <button class="btn secondary" onclick="setPage('search')">이전</button>
    <button class="btn" onclick="setPage('check')">준비 체크리스트 가기 →</button>
  </div>`;
}

function detail() {
  const c = categories[detailIndex];
  const uniName = state.university || '선택 대학';
  const unitName = state.unit || '해당 학과';
  const typeName = state.type || '편입';
  const noteVal = state.notes[detailIndex] || '';

  return `
  ${titlebar(c.title, '3 / 4', true)}
  <div class="progress"><i style="width:75%"></i></div>
  <p class="sub">${esc(uniName)} · ${esc(unitName)} (${esc(typeName)})</p>
  <span class="status-badge">기준 가이드 자동 제공</span>
  <h2>${c.title}</h2>
  <p class="sub">${c.desc}</p>

  <div class="guide-box">
    ${c.guidelines.map(g => `
      <div class="guide-row">
        <strong>• ${g.label}</strong>
        <p>${g.text}</p>
      </div>
    `).join('')}
  </div>

  <div class="info">
    💡 위 기준은 <strong>${esc(uniName)} ${esc(typeName)}</strong> 일반 기준입니다. 공식 세부 공지는 입학처 최신 모집요강을 반드시 확인하세요.
  </div>

  <label for="detailNote">나만의 확인 메모 (선택)</label>
  <input type="text" id="detailNote" placeholder="예: 전적대 68학점 충족 완료 / 단어장 2회독" value="${esc(noteVal)}">
  
  <div class="actions" style="margin-top:14px">
    <button class="btn secondary" onclick="setPage('list')">목록으로</button>
    <button class="btn" onclick="saveNote()">메모 저장</button>
  </div>

  <div class="section-head">
    <button class="btn secondary small" onclick="detailIndex=(detailIndex+3)%4;render()">← 이전 항목</button>
    <button class="btn secondary small" onclick="detailIndex=(detailIndex+1)%4;render()">다음 항목 →</button>
  </div>
  <button class="btn ghost" style="margin-top:10px" onclick="setPage('check')">체크리스트로 이동 →</button>`;
}

function saveNote() {
  state.notes[detailIndex] = document.getElementById('detailNote').value.trim();
  save();
  toast('메모가 저장되었습니다.');
}

function check() {
  let n = state.checks.filter(Boolean).length;
  return `
  ${titlebar('내 준비 체크리스트', '4 / 4', true)}
  <div class="progress"><i style="width:100%"></i></div>
  <div class="card" style="background:#f2f2f2">
    <div class="step"><b>전체 점검 진행률</b><b>${n} / 4개 확인</b></div>
    <h1 style="font-size:26px;margin:0">${Math.round(n / 4 * 100)}%</h1>
    <div class="progress"><i style="width:${n / 4 * 100}%"></i></div>
  </div>

  ${['지원 자격 및 학점 기준 충족 확인', '시험 과목 및 필기 출제 범위 확인', '공인어학성적 및 제출 자격증 확인', '제출 서류 목록 및 원서 일정 확인'].map((x, i) => `
    <label class="check-row">
      <input type="checkbox" ${state.checks[i] ? 'checked' : ''} onchange="toggleCheck(${i},this.checked)">
      <span>
        ${x}
        <small>${state.checks[i] ? '확인 완료' : '확인 필요 (클릭 시 완료)'}</small>
      </span>
    </label>
  `).join('')}

  <div class="info">체크는 개인적인 기준 확인 여부를 기록하는 용도입니다. 실제 지원 자격 적합 여부는 대학 입학처를 통해 최종 점검하세요.</div>

  <div class="actions">
    <button class="btn secondary" onclick="setPage('list')">준비사항 다시 보기</button>
    <button class="btn" onclick="setPage('home')">홈으로</button>
  </div>
  <button class="btn ghost" style="margin-top:10px" onclick="resetChecks()">체크 상태 초기화</button>`;
}

function toggleCheck(i, v) {
  state.checks[i] = v;
  save();
  render();
  toast('체크 상태가 저장되었습니다.');
}

function resetChecks() {
  if (confirm('체크 상태를 모두 초기화할까요?')) {
    state.checks = [false, false, false, false];
    save();
    render();
    toast('체크 상태가 초기화되었습니다.');
  }
}

function profile() {
  return `
  ${titlebar('설정 및 데이터 관리', '', false)}
  <h1 style="font-size:20px">내 정보와 저장 데이터</h1>
  <p class="sub">선택한 조건과 메모는 기기 브라우저에 안전하게 보관됩니다.</p>
  
  <div class="card">
    <h3>현재 설정된 목표</h3>
    <p style="font-size:13px;margin-bottom:0">
      ${esc(state.university || '대학 미선택')}<br>
      ${esc(state.year || '-')}학년도 · ${esc(state.type || '-')}<br>
      ${esc(state.unit || '모집단위 미입력')}
    </p>
  </div>

  <div class="section-head"><h3>데이터 관리</h3></div>
  <button class="btn secondary" onclick="exportData()">내 데이터 백업하기 (JSON)</button>
  <label for="importFile">백업 파일 불러오기</label>
  <input type="file" id="importFile" accept=".json,application/json">
  <button class="btn secondary" style="margin-top:10px" onclick="importData()">백업 데이터 복원</button>
  <button class="btn ghost" style="margin-top:16px" onclick="clearAll()">설정 초기화 (전체 삭제)</button>

  <div class="info">현재 버전은 와이어프레임 버전입니다. 차기 프로토타입 버전에서 대학별 공식 DB 등록 및 관리자 전용 관리자 모드가 추가될 예정입니다.</div>`;
}

function exportData() {
  let blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  let a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '편입준비_설정데이터.json';
  a.click();
  URL.revokeObjectURL(a.href);
  toast('백업 파일이 생성되었습니다.');
}

function importData() {
  let f = document.getElementById('importFile').files[0];
  if (!f) { 
    toast('백업 파일을 먼저 선택해주세요.'); 
    return; 
  }
  let r = new FileReader();
  r.onload = () => {
    try {
      let d = JSON.parse(r.result);
      state = { ...defaults, ...d };
      save();
      setPage('home');
      toast('데이터를 성공적으로 복원했습니다.');
    } catch (e) {
      toast('올바른 백업 파일이 아닙니다.');
    }
  };
  r.readAsText(f);
}

function clearAll() {
  if (confirm('설정한 대학 정보와 메모를 모두 삭제하시겠습니까?')) {
    state = { ...defaults, checks: [false, false, false, false], notes: {} };
    save();
    setPage('home');
    toast('모든 데이터가 초기화되었습니다.');
  }
}

document.querySelectorAll('.nav').forEach(b => {
  b.addEventListener('click', () => setPage(b.dataset.page));
});

render();
