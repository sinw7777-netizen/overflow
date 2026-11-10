const STORAGE_KEY = 'transfer_prep_prototype_v1';

// 전역 대학 데이터 저장소 (data/universities.json에서 비동기 로드)
let UNIV_DATA = {
  universityList: [
    '서울대', '연세대(신촌)', '고려대(서울)', '서강대', '성균관대', '한양대',
    '중앙대', '이화여대', '경희대', '한국외대', '서울시립대', '건국대',
    '동국대', '홍익대', '숙명여대', '국민대', '숭실대', '세종대',
    '단국대', '광운대', '인하대', '아주대', '서울과기대', '가천대',
    '경기대', '성신여대'
  ],
  sources: {},
  emblems: {},
  defaultCriteria: {},
  specialCriteria: {}
};

// JSON 파일 비동기 로드 함수
async function fetchUniversityData() {
  try {
    const response = await fetch('./data/universities.json');
    if (response.ok) {
      UNIV_DATA = await response.json();
    }
  } catch (err) {
    console.warn('로컬 파일 실행이거나 JSON 로드 실패 시 내장 폴백 데이터를 활용합니다.', err);
  } finally {
    renderScreen();
  }
}

// 대학별 전형 데이터 생성기 (JSON 데이터와 연동)
function getAdmissionCriteria(uni, unit, year, type) {
  if (UNIV_DATA.specialCriteria && UNIV_DATA.specialCriteria[uni]) {
    const spec = UNIV_DATA.specialCriteria[uni];
    return {
      qualification: { title: spec.qualification.title, list: spec.qualification.items },
      exam: { title: spec.exam.title, list: spec.exam.items },
      language: { title: spec.language.title, list: spec.language.items },
      schedule: { title: spec.schedule.title, list: spec.schedule.items },
      source: (UNIV_DATA.sources && UNIV_DATA.sources[uni]) || 'https://admission.snu.ac.kr'
    };
  }

  const isEngineering = /컴퓨터|소프트|인공지능|전자|기계|화학|생명|공학|수학|물리/i.test(unit);
  const examText = isEngineering 
    ? '자연계열: 편입수학(미적분·선형대수) + 편입영어 필답고사' 
    : '인문계열: 편입영어(독해·논리·어휘) 100% 필답고사';

  const defaultCrit = UNIV_DATA.defaultCriteria || {};
  return {
    qualification: {
      title: '지원 자격·학점',
      list: [
        { label: '지원 구분', text: `${uni} ${type} 기준: 국내 4년제 대학 2학년(4학기) 수료(예정)자` },
        { label: '이수 학점 기준', text: '65~70학점 이상 취득 권장 (전적대학 성적 평점 2.0 이상)' }
      ]
    },
    exam: {
      title: '시험 과목·범위',
      list: [
        { label: '필답고사 구성', text: examText },
        { label: '전형 선발 방식', text: '1단계 필기 100% 선발 후 2단계 서류평가/면접 합산' }
      ]
    },
    language: {
      title: '어학·자격증',
      list: [
        { label: '공인어학 기준', text: '자체 필답고사 실시 (공인영어 제출 여부는 학과별 요강 참조)' },
        { label: '자격증 가산점', text: '기사 자격증 및 대회 수상 실적 학업계획서 반영' }
      ]
    },
    schedule: {
      title: '제출 서류·일정',
      list: [
        { label: '원서 접수 기간', text: '12월 중순 예정 (진학사/유웨이 및 입학처)' },
        { label: '필기 시험일', text: '1월 중 주말 실시 (대학별 일정 중복 확인 요망)' }
      ]
    },
    source: (UNIV_DATA.sources && UNIV_DATA.sources[uni]) || 'https://admission.inha.ac.kr'
  };
}

function getEmblemSvg(uniName) {
  if (UNIV_DATA.emblems && UNIV_DATA.emblems[uniName]) {
    return UNIV_DATA.emblems[uniName];
  }
  return UNIV_DATA.emblems ? UNIV_DATA.emblems['default'] : '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" stroke="currentColor" fill="none"/></svg>';
}

// 기본 앱 상태
const defaultState = {
  user: null, // { isLoggedIn: false, name: '', id: '', agreedTerms: false }
  activeTargetIndex: 0,
  targets: [
    {
      id: 1,
      university: '인하대',
      year: '2027',
      type: '일반편입',
      unit: '컴퓨터공학과',
      checks: [true, false, false, false],
      notes: { 0: '전적대 68학점 이수 확인 완료' }
    },
    {
      id: 2,
      university: '성균관대',
      year: '2027',
      type: '일반편입',
      unit: '소프트웨어학과',
      checks: [false, false, false, false],
      notes: {}
    },
    {
      id: 3,
      university: '한양대',
      year: '2027',
      type: '일반편입',
      unit: '컴퓨터소프트웨어학부',
      checks: [true, true, false, false],
      notes: {}
    }
  ]
};

let appState;
try {
  appState = { ...defaultState, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
  if (!appState.targets || appState.targets.length === 0) appState.targets = [...defaultState.targets];
} catch (e) {
  appState = { ...defaultState };
}

let currentPage = 'home';
let activeCategoryKey = 'qualification';
const years = Array.from({ length: 11 }, (_, i) => String(2020 + i));

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

function showToast(msg = '저장되었습니다.') {
  const el = document.getElementById('toastMsg');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 1600);
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function getCurrentTarget() {
  if (!appState.targets.length) return null;
  const idx = Math.min(Math.max(appState.activeTargetIndex || 0, 0), appState.targets.length - 1);
  return appState.targets[idx];
}

function calcTargetProgress(target) {
  if (!target || !target.checks) return 0;
  return Math.round(target.checks.filter(Boolean).length / 4 * 100);
}

function navigateTo(p) {
  currentPage = p;
  renderScreen();
  document.getElementById('appScreen').scrollTo({ top: 0, behavior: 'smooth' });
}

function createTitlebar(title, step = '', showBack = true) {
  const backBtn = showBack ? `<button class="btn ghost small" style="padding:4px 8px;margin-right:8px;font-size:16px" onclick="handleBackAction()">←</button>` : '';
  const stepBadge = step ? `<span style="font-size:11px;font-weight:700;color:var(--ink-400)">${step}</span>` : '';
  return `<div style="display:flex;align-items:center;margin-bottom:14px;min-height:30px">${backBtn}<h2 style="flex:1;margin:0;font-size:18px">${title}</h2>${stepBadge}</div>`;
}

function handleBackAction() {
  if (currentPage === 'detail') navigateTo('list');
  else if (currentPage === 'list' || currentPage === 'check' || currentPage === 'search') navigateTo('home');
  else navigateTo('home');
}

/* =========================================================
   로그인/인증 인터랙션 함수 (오버플로우 전용 계정 연동)
   ========================================================= */
function renderHeaderAuth() {
  const container = document.getElementById('headerAuthArea');
  if (!container) return;

  if (appState.user && appState.user.isLoggedIn) {
    container.innerHTML = `
      <div class="user-profile-chip" onclick="handleUserLogoutPrompt()" title="클릭하여 로그아웃">
        <span class="user-dot"></span>
        <span>${escapeHtml(appState.user.name)}</span>
      </div>
    `;
  } else {
    container.innerHTML = `
      <button class="btn-login-header" onclick="openLoginModal()">로그인</button>
    `;
  }
}

function openLoginModal() {
  document.getElementById('loginOverlay').classList.add('show');
}

function closeLoginModal() {
  document.getElementById('loginOverlay').classList.remove('show');
}

function executeLogin() {
  const id = document.getElementById('loginId').value.trim();
  const pw = document.getElementById('loginPw').value.trim();
  const agree = document.getElementById('loginAgree').checked;

  if (!agree) {
    showToast('개인정보 처리약관에 동의해 주세요.');
    return;
  }

  if (!id || !pw) {
    showToast('아이디와 비밀번호를 모두 입력해 주세요.');
    return;
  }

  let nickname = '오버플로우 님';
  if (id === 'overflow7777') {
    nickname = '오버플로우 님';
  } else {
    nickname = id + ' 님';
  }

  appState.user = { isLoggedIn: true, name: nickname, id: id, agreedTerms: true };
  persist();
  closeLoginModal();
  renderScreen();
  showToast(`${nickname} 환영합니다!`);
}

function quickDemoLogin() {
  appState.user = { isLoggedIn: true, name: '오버플로우 님', id: 'overflow7777', agreedTerms: true };
  persist();
  closeLoginModal();
  renderScreen();
  showToast('오버플로우 계정으로 로그인되었습니다.');
}

function handleUserLogoutPrompt() {
  if (confirm(`현재 '${appState.user.name}' 계정으로 로그인되어 있습니다.\n로그아웃하시겠습니까?`)) {
    appState.user = null;
    persist();
    renderScreen();
    showToast('로그아웃되었습니다.');
  }
}

function renderScreen() {
  renderHeaderAuth();

  document.querySelectorAll('.nav-tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.page === (currentPage === 'detail' ? 'list' : currentPage));
  });
  
  const screen = document.getElementById('appScreen');
  if (currentPage === 'home') {
    screen.innerHTML = renderHome();
    setupCardDnD();
  }
  if (currentPage === 'search') screen.innerHTML = renderSearch();
  if (currentPage === 'list') screen.innerHTML = renderList();
  if (currentPage === 'detail') screen.innerHTML = renderDetail();
  if (currentPage === 'check') screen.innerHTML = renderCheck();
  if (currentPage === 'profile') screen.innerHTML = renderProfile();
}

/* =========================================================
   1. 홈 화면 (Home)
   ========================================================= */
function renderHome() {
  const target = getCurrentTarget();
  const prog = target ? calcTargetProgress(target) : 0;
  
  const top3 = appState.targets.slice(0, 3);
  const badgesHtml = top3.map((t, idx) => `
    <div class="rank-pill-item ${appState.activeTargetIndex === idx ? 'active' : ''}" onclick="selectTargetByRank(${idx})">
      <span><b>${idx + 1}순위</b> ${escapeHtml(t.university)}</span>
      <small>${calcTargetProgress(t)}%</small>
    </div>
  `).join('');

  return `
  <div class="eyebrow">${appState.user && appState.user.isLoggedIn ? `WELCOME BACK, ${escapeHtml(appState.user.name)}` : 'DASHBOARD · TRANSFER ASSISTANT'}</div>
  <h1>편입 준비,<br>AI 비서와 완벽하게.</h1>
  <p class="sub">다중 목표 대학의 전형 조건을 한눈에 비교하고 관리하세요.</p>
  
  <div class="banner-action">
    <h2>새로운 목표 대학 추가하기</h2>
    <p>26개 주요 대학 중 목표를 선택하면 AI가 입학처 공지를 탐색해 필요한 준비 요건을 구성합니다.</p>
    <button class="btn" onclick="navigateTo('search')">+ 목표 대학 추가 / 요강 탐색 →</button>
  </div>

  <div class="stats-grid">
    <div class="stat-box">
      <div>
        <span class="lbl">현재 선택 대학 진행률</span>
        <strong>${prog}%</strong>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${prog}%"></div></div>
    </div>
    <div class="stat-box">
      <span class="lbl">우선순위 (탭하여 전환)</span>
      <div class="rank-pills">
        ${badgesHtml || '<div style="font-size:11px;color:var(--ink-400)">등록된 대학이 없습니다.</div>'}
      </div>
    </div>
  </div>

  <div class="section-title-row">
    <div style="display:flex;align-items:center;gap:8px">
      <div style="width:28px;height:28px;border-radius:50%;background:var(--soft);display:grid;place-items:center;color:var(--primary);padding:3px">
        ${target ? getEmblemSvg(target.university) : getEmblemSvg('default')}
      </div>
      <h3 style="margin:0">현재 선택: ${target ? escapeHtml(target.university) : '미선택'}</h3>
    </div>
    <span class="section-tag">QUICK MENU</span>
  </div>

  <div class="tile-grid">
    <button class="quick-tile" onclick="openCategoryView('qualification')">
      <div>
        <div class="title">지원 자격·학점</div>
        <div class="desc">수료 학점 요건 확인</div>
      </div>
      <div class="arrow">조회 →</div>
    </button>
    <button class="quick-tile" onclick="openCategoryView('exam')">
      <div>
        <div class="title">시험 과목·범위</div>
        <div class="desc">필기·서류 전형 요소</div>
      </div>
      <div class="arrow">조회 →</div>
    </button>
    <button class="quick-tile" onclick="openCategoryView('language')">
      <div>
        <div class="title">어학·자격증</div>
        <div class="desc">공인영어 및 가산점</div>
      </div>
      <div class="arrow">조회 →</div>
    </button>
    <button class="quick-tile" onclick="openCategoryView('schedule')">
      <div>
        <div class="title">제출 서류·일정</div>
        <div class="desc">원서 접수 및 일정표</div>
      </div>
      <div class="arrow">조회 →</div>
    </button>
  </div>

  <div class="section-title-row" style="margin-top:24px">
    <div>
      <h3 style="margin-bottom:2px">나의 목표 대학 (${appState.targets.length}곳)</h3>
      <span style="font-size:11px;color:var(--ink-500)">우측 핸들(≡)을 눌러 순위를 위아래로 변경하세요.</span>
    </div>
    <button class="btn small secondary" onclick="navigateTo('search')">+ 추가</button>
  </div>

  <div id="targetListWrapper">
    ${appState.targets.map((t, idx) => `
      <div class="target-card ${appState.activeTargetIndex === idx ? 'active-card' : ''}" data-index="${idx}">
        <div class="target-card-header">
          <div style="display:flex;align-items:center;gap:6px">
            <span class="priority-tag p${idx + 1}">${idx + 1}순위</span>
            <span style="font-size:12px;font-weight:700;color:var(--primary)">진행률 ${calcTargetProgress(t)}%</span>
          </div>
          <div class="drag-handle" title="순서 변경">≡</div>
        </div>
        <b style="font-size:15.5px;color:var(--ink-900)">${escapeHtml(t.university)} · ${escapeHtml(t.unit)}</b>
        <p class="sub" style="margin:4px 0 10px">${escapeHtml(t.year)}학년도 · ${escapeHtml(t.type)}</p>
        <div class="card-actions">
          <button class="btn small ${appState.activeTargetIndex === idx ? 'ghost' : 'secondary'}" onclick="selectTargetByRank(${idx})">
            ${appState.activeTargetIndex === idx ? '✓ 현재 선택됨' : '이 대학 선택'}
          </button>
          <button class="btn small secondary" onclick="jumpToChecklist(${idx})">체크리스트</button>
          <button class="btn small danger" style="flex:0.35" onclick="deleteTargetItem(${idx})">삭제</button>
        </div>
      </div>
    `).join('')}
  </div>`;
}

function selectTargetByRank(idx) {
  appState.activeTargetIndex = idx;
  persist();
  renderScreen();
  showToast(`${idx + 1}순위 대학으로 전환되었습니다.`);
}

function jumpToChecklist(idx) {
  appState.activeTargetIndex = idx;
  persist();
  navigateTo('check');
}

function deleteTargetItem(idx) {
  if (confirm(`'${appState.targets[idx].university}' 목표를 삭제하시겠습니까?`)) {
    appState.targets.splice(idx, 1);
    if (appState.activeTargetIndex >= appState.targets.length) {
      appState.activeTargetIndex = Math.max(0, appState.targets.length - 1);
    }
    persist();
    renderScreen();
    showToast('목표 대학이 삭제되었습니다.');
  }
}

function openCategoryView(key) {
  activeCategoryKey = key;
  navigateTo('detail');
}

/* =========================================================
   드래그 앤 드롭 순서 변경 (Mobile Touch & PC Mouse)
   ========================================================= */
function setupCardDnD() {
  const container = document.getElementById('targetListWrapper');
  if (!container) return;

  const cards = container.querySelectorAll('.target-card');
  let draggedCard = null;
  let sourceIdx = -1;

  cards.forEach(card => {
    const handle = card.querySelector('.drag-handle');
    if (!handle) return;

    handle.addEventListener('mousedown', () => { card.setAttribute('draggable', 'true'); });
    card.addEventListener('dragstart', (e) => {
      draggedCard = card;
      sourceIdx = parseInt(card.dataset.index, 10);
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      card.setAttribute('draggable', 'false');
      cards.forEach(c => c.classList.remove('drag-over'));
    });
    card.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (card !== draggedCard) {
        cards.forEach(c => c.classList.remove('drag-over'));
        card.classList.add('drag-over');
      }
    });
    card.addEventListener('drop', (e) => {
      e.preventDefault();
      const targetIdx = parseInt(card.dataset.index, 10);
      if (draggedCard && sourceIdx !== targetIdx) {
        swapTargetPriority(sourceIdx, targetIdx);
      }
    });

    // Touch
    let isTouchActive = false;
    handle.addEventListener('touchstart', (e) => {
      isTouchActive = true;
      draggedCard = card;
      sourceIdx = parseInt(card.dataset.index, 10);
      card.classList.add('dragging');
    }, { passive: true });

    handle.addEventListener('touchmove', (e) => {
      if (!isTouchActive) return;
      const touchY = e.touches[0].clientY;
      const elBelow = document.elementFromPoint(e.touches[0].clientX, touchY);
      const cardBelow = elBelow ? elBelow.closest('.target-card') : null;
      cards.forEach(c => c.classList.remove('drag-over'));
      if (cardBelow && cardBelow !== draggedCard) {
        cardBelow.classList.add('drag-over');
      }
    }, { passive: true });

    handle.addEventListener('touchend', (e) => {
      if (!isTouchActive) return;
      isTouchActive = false;
      card.classList.remove('dragging');
      const touch = e.changedTouches[0];
      const elBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      const cardBelow = elBelow ? elBelow.closest('.target-card') : null;
      cards.forEach(c => c.classList.remove('drag-over'));
      if (cardBelow && cardBelow !== draggedCard) {
        const targetIdx = parseInt(cardBelow.dataset.index, 10);
        swapTargetPriority(sourceIdx, targetIdx);
      }
    });
  });
}

function swapTargetPriority(from, to) {
  const currentActiveId = appState.targets[appState.activeTargetIndex]?.id;
  const item = appState.targets.splice(from, 1)[0];
  appState.targets.splice(to, 0, item);

  if (currentActiveId) {
    const newIdx = appState.targets.findIndex(t => t.id === currentActiveId);
    appState.activeTargetIndex = newIdx !== -1 ? newIdx : 0;
  }

  persist();
  renderScreen();
  showToast(`목표 순위가 재설정되었습니다. (1순위: ${appState.targets[0].university})`);
}

/* =========================================================
   2. 대학 추가 및 서울대 전용 UX (Search)
   ========================================================= */
function renderSearch() {
  const uList = UNIV_DATA.universityList || [];
  return `
  ${createTitlebar('목표 대학 추가 / AI 탐색', '1 / 4', true)}
  <div class="progress-track" style="margin-bottom:16px"><div class="progress-fill" style="width:25%"></div></div>
  
  <h1 style="font-size:21px">목표 대학을 선택하면<br>AI가 최신 요강을 분석합니다.</h1>
  <p class="sub">26개 주요 대학 입학처 공지를 스캔해 전형 조건을 자동 추출합니다.</p>
  
  <label for="selUni">목표 대학 (수도권 주요 26개교)</label>
  <select id="selUni" onchange="handleUniSelection(this.value)">
    <option value="">대학을 선택하세요</option>
    ${uList.map(u => `<option value="${u}">${u}</option>`).join('')}
  </select>

  <!-- 서울대 선택 시 나타나는 전용 경고 배너 -->
  <div class="notice-banner" id="bannerSnu">
    ⚠️ <strong>서울대학교 지원 안내:</strong> 서울대학교는 <strong>일반편입학을 선발하지 않으며</strong>, 학사편입학만 선발합니다. 편입 전형이 '학사편입'으로 자동 고정되었습니다.
  </div>

  <label for="selYear">모집연도</label>
  <select id="selYear">
    ${years.map(y => `<option ${y === '2027' ? 'selected' : ''}>${y}학년도</option>`).join('')}
  </select>

  <label for="selType">편입 전형</label>
  <select id="selType">
    <option value="일반편입" id="optGeneral">일반편입</option>
    <option value="학사편입" id="optBachelor">학사편입</option>
    <option value="특별전형" id="optSpecial">특별전형 (재직자/농어촌 등)</option>
  </select>

  <label for="inputUnit">목표 모집단위(학과)</label>
  <input id="inputUnit" type="text" placeholder="예: 컴퓨터공학과 / 인공지능소프트웨어학과">

  <div class="tip-box" style="margin-top:16px">
    🤖 <strong>AI 비서 요강 탐색:</strong> 공식 입학처 편입학 공지사항과 모집요강 PDF를 가상 스캔하여 자격·시험·어학·서류 일정을 정형 데이터로 생성합니다.
  </div>

  <div class="card-actions" style="margin-top:20px">
    <button class="btn secondary" onclick="navigateTo('home')">취소</button>
    <button class="btn" onclick="executeAiScan()">🤖 AI 요강 탐색 & 추가 →</button>
  </div>`;
}

function handleUniSelection(val) {
  const banner = document.getElementById('bannerSnu');
  const typeSelect = document.getElementById('selType');
  const optGeneral = document.getElementById('optGeneral');

  if (val === '서울대') {
    banner.classList.add('show');
    optGeneral.disabled = true;
    optGeneral.textContent = '일반편입 (서울대 미선발)';
    typeSelect.value = '학사편입';
  } else {
    banner.classList.remove('show');
    optGeneral.disabled = false;
    optGeneral.textContent = '일반편입';
  }
}

function executeAiScan() {
  const uni = document.getElementById('selUni').value;
  const year = document.getElementById('selYear').value.replace('학년도', '');
  const type = document.getElementById('selType').value;
  const unit = document.getElementById('inputUnit').value.trim();

  if (!uni || !year || !type || !unit) {
    showToast('대학, 연도, 전형, 학과를 모두 입력해주세요.');
    return;
  }

  const overlay = document.getElementById('aiOverlay');
  const bar = document.getElementById('aiModalBar');
  const heading = document.getElementById('aiModalHeading');
  const detail = document.getElementById('aiModalDetail');

  overlay.classList.add('show');
  bar.style.width = '30%';
  heading.textContent = `[${uni}] 입학처 공지 스캔 중...`;
  detail.textContent = `최신 편입학 모집요강 문서를 탐색하고 있습니다.`;

  setTimeout(() => {
    bar.style.width = '70%';
    heading.textContent = `전형 조건 테이블 파싱 중...`;
    detail.textContent = `${unit} (${type}) 지원 자격 및 시험 과목을 추출합니다.`;
  }, 750);

  setTimeout(() => {
    bar.style.width = '100%';
    heading.textContent = `분석 완료!`;
    detail.textContent = `성공적으로 목표 대학 준비 목록에 추가되었습니다.`;
  }, 1450);

  setTimeout(() => {
    overlay.classList.remove('show');
    bar.style.width = '0%';

    appState.targets.push({
      id: Date.now(),
      university: uni,
      year: year,
      type: type,
      unit: unit,
      checks: [false, false, false, false],
      notes: {}
    });
    appState.activeTargetIndex = appState.targets.length - 1;
    persist();
    navigateTo('list');
    showToast(`'${uni}' 요강이 등록되었습니다.`);
  }, 1950);
}

/* =========================================================
   3. 준비사항 요약 목록 (List)
   ========================================================= */
function renderList() {
  const target = getCurrentTarget();
  if (!target) {
    return `<div class="guide-card"><p>등록된 목표 대학이 없습니다.</p><button class="btn" style="margin-top:12px" onclick="navigateTo('search')">+ 목표 대학 추가</button></div>`;
  }

  const data = getAdmissionCriteria(target.university, target.unit, target.year, target.type);

  return `
  ${createTitlebar('편입 준비사항 요약', '2 / 4', true)}
  <div class="progress-track" style="margin-bottom:14px"><div class="progress-fill" style="width:50%"></div></div>

  <div class="tab-scroll-wrap">
    ${appState.targets.map((t, idx) => `
      <button class="pill-tab ${appState.activeTargetIndex === idx ? 'active' : ''}" onclick="selectTargetByRank(${idx})">
        ${idx + 1}순위: ${escapeHtml(t.university)}
      </button>
    `).join('')}
  </div>

  <div class="guide-card" style="background:#ffffff">
    <b style="font-size:16px;color:var(--ink-900)">${escapeHtml(target.university)} · ${escapeHtml(target.unit)}</b>
    <p class="sub" style="margin:4px 0 6px">${escapeHtml(target.year)}학년도 · ${escapeHtml(target.type)}</p>
    <div style="font-size:11.5px;color:var(--primary);word-break:break-all">
      🔗 입학처 공식 링크: <a href="${data.source}" target="_blank" style="color:var(--primary);font-weight:700;text-decoration:underline">${data.source}</a>
    </div>
  </div>

  <p class="sub" style="margin-top:16px">AI 비서가 추출한 세부 기준을 영역별로 확인하세요.</p>

  <div class="tile-grid" style="grid-template-columns:1fr;gap:10px">
    <button class="quick-tile" style="min-height:76px" onclick="openCategoryView('qualification')">
      <div>
        <div class="title">지원 자격·학점</div>
        <div class="desc">수료 학점 요건 및 전적대 성적 평점 기준</div>
      </div>
      <div class="arrow">상세 보기 →</div>
    </button>
    <button class="quick-tile" style="min-height:76px" onclick="openCategoryView('exam')">
      <div>
        <div class="title">시험 과목·범위</div>
        <div class="desc">필답고사 과목, 배점 및 전형 방식</div>
      </div>
      <div class="arrow">상세 보기 →</div>
    </button>
    <button class="quick-tile" style="min-height:76px" onclick="openCategoryView('language')">
      <div>
        <div class="title">어학·자격증</div>
        <div class="desc">공인어학성적 요건 및 가산점 인정 기준</div>
      </div>
      <div class="arrow">상세 보기 →</div>
    </button>
    <button class="quick-tile" style="min-height:76px" onclick="openCategoryView('schedule')">
      <div>
        <div class="title">제출 서류·일정</div>
        <div class="desc">원서 접수 기간 및 필수 서류 제출 일정</div>
      </div>
      <div class="arrow">상세 보기 →</div>
    </button>
  </div>

  <div class="card-actions" style="margin-top:20px">
    <button class="btn secondary" onclick="navigateTo('search')">+ 목표 추가</button>
    <button class="btn" onclick="navigateTo('check')">체크리스트 확인 →</button>
  </div>`;
}

/* =========================================================
   4. 세부 기준 상세 화면 (Detail)
   ========================================================= */
function renderDetail() {
  const target = getCurrentTarget();
  if (!target) return navigateTo('home');

  const data = getAdmissionCriteria(target.university, target.unit, target.year, target.type);
  const cat = data[activeCategoryKey];
  const catMap = { 'qualification': 0, 'exam': 1, 'language': 2, 'schedule': 3 };
  const currentIdx = catMap[activeCategoryKey];
  const userNote = target.notes[currentIdx] || '';

  return `
  ${createTitlebar(cat.title, '3 / 4', true)}
  <div class="progress-track" style="margin-bottom:14px"><div class="progress-fill" style="width:75%"></div></div>
  
  <p class="sub">${escapeHtml(target.university)} · ${escapeHtml(target.unit)} (${escapeHtml(target.type)})</p>
  <span class="brand-pill" style="display:inline-block;margin-bottom:8px">AI EXTRACTED CRITERIA</span>
  <h2>${cat.title}</h2>

  <div class="guide-card">
    ${cat.list.map(item => `
      <div class="guide-item">
        <strong>• ${escapeHtml(item.label)}</strong>
        <p>${escapeHtml(item.text)}</p>
      </div>
    `).join('')}
  </div>

  <div class="tip-box">
    💡 입학처 공식 공지를 토대로 추출된 기준입니다. 특이 변동 사항은 입학처 원문 공지를 확인하세요.
  </div>

  <label for="memoBox">나만의 확인 메모</label>
  <input type="text" id="memoBox" placeholder="예: 전적대 68학점 충족 완료 / 서류 발급 신청" value="${escapeHtml(userNote)}">
  
  <div class="card-actions" style="margin-top:14px">
    <button class="btn secondary" onclick="navigateTo('list')">목록으로</button>
    <button class="btn" onclick="saveActiveCategoryMemo(${currentIdx})">메모 저장</button>
  </div>

  <div class="section-title-row" style="margin-top:16px">
    <button class="btn secondary small" onclick="shiftCategory(-1)">← 이전 항목</button>
    <button class="btn secondary small" onclick="shiftCategory(1)">다음 항목 →</button>
  </div>
  <button class="btn ghost" style="margin-top:10px" onclick="navigateTo('check')">체크리스트로 이동 →</button>`;
}

function shiftCategory(dir) {
  const keys = ['qualification', 'exam', 'language', 'schedule'];
  let idx = keys.indexOf(activeCategoryKey);
  idx = (idx + dir + keys.length) % keys.length;
  activeCategoryKey = keys[idx];
  renderScreen();
}

function saveActiveCategoryMemo(catIdx) {
  const target = getCurrentTarget();
  if (target) {
    target.notes[catIdx] = document.getElementById('memoBox').value.trim();
    persist();
    showToast('메모가 저장되었습니다.');
  }
}

/* =========================================================
   5. 대학별 독립 체크리스트 (Checklist)
   ========================================================= */
function renderCheck() {
  const target = getCurrentTarget();
  if (!target) {
    return `<div class="guide-card"><p>등록된 목표 대학이 없습니다.</p><button class="btn" onclick="navigateTo('search')">+ 목표 대학 추가</button></div>`;
  }

  const completed = target.checks.filter(Boolean).length;
  const targetIdx = appState.activeTargetIndex;

  return `
  ${createTitlebar('내 준비 체크리스트', '4 / 4', true)}
  <div class="progress-track" style="margin-bottom:14px"><div class="progress-fill" style="width:100%"></div></div>

  <div class="tab-scroll-wrap">
    ${appState.targets.map((t, idx) => `
      <button class="pill-tab ${appState.activeTargetIndex === idx ? 'active' : ''}" onclick="selectTargetByRank(${idx})">
        ${idx + 1}순위: ${escapeHtml(t.university)}
      </button>
    `).join('')}
  </div>

  <div class="guide-card" style="background:#ffffff">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <b style="font-size:16px;color:var(--ink-900)">${targetIdx + 1}순위: ${escapeHtml(target.university)}</b>
      <span style="font-size:12px;font-weight:700;color:var(--primary)">${completed} / 4 완료</span>
    </div>
    <div style="font-size:26px;font-weight:800;color:var(--primary);margin:6px 0">${Math.round(completed / 4 * 100)}%</div>
    <div class="progress-track"><div class="progress-fill" style="width:${completed / 4 * 100}%"></div></div>
  </div>

  ${[
    '지원 자격 및 이수 학점 요건 확인 완료',
    '필답고사 출제 범위 및 배점 비율 숙지',
    '공인영어성적 기준 및 가산점 충족 확인',
    '필수 제출 서류 발급 및 원서 접수 일정 점검'
  ].map((text, i) => `
    <label class="check-item">
      <input type="checkbox" ${target.checks[i] ? 'checked' : ''} onchange="toggleCheckState(${targetIdx}, ${i}, this.checked)">
      <div>
        ${text}
        <small>${target.checks[i] ? '✓ 확인 완료' : '미확인 (터치하여 체크)'}</small>
      </div>
    </label>
  `).join('')}

  <div class="tip-box">
    💡 체크리스트 상태는 대학별로 독립 보관됩니다. 상단 탭을 전환하여 대학별 준비 상태를 점검해 보세요.
  </div>

  <div class="card-actions" style="margin-top:16px">
    <button class="btn secondary" onclick="navigateTo('list')">준비사항 보기</button>
    <button class="btn" onclick="navigateTo('home')">홈으로</button>
  </div>
  <button class="btn ghost" style="margin-top:8px" onclick="resetChecklistForTarget(${targetIdx})">이 대학 체크 초기화</button>`;
}

function toggleCheckState(targetIdx, checkIdx, checked) {
  appState.targets[targetIdx].checks[checkIdx] = checked;
  persist();
  renderScreen();
  showToast('체크 상태가 저장되었습니다.');
}

function resetChecklistForTarget(targetIdx) {
  if (confirm(`'${appState.targets[targetIdx].university}' 체크 상태를 초기화하시겠습니까?`)) {
    appState.targets[targetIdx].checks = [false, false, false, false];
    persist();
    renderScreen();
    showToast('체크가 초기화되었습니다.');
  }
}

/* =========================================================
   6. 설정 및 1순위 대표 엠블럼 워터마크 (Profile)
   ========================================================= */
function renderProfile() {
  const top1Target = appState.targets[0] || null;
  const uniName = top1Target ? top1Target.university : '미지정';
  const emblemSvg = getEmblemSvg(uniName);

  return `
  ${createTitlebar('설정 및 계정 관리', '', false)}
  <h1 style="font-size:21px">내 정보와 저장 데이터</h1>
  <p class="sub">등록한 목표 대학과 개인 메모는 기기 브라우저 및 계정에 보관됩니다.</p>
  
  <div class="emblem-showcase-card">
    <div class="emblem-watermark">${emblemSvg}</div>
    <div class="emblem-content">
      <span class="priority-tag p1" style="display:inline-block;margin-bottom:8px">🥇 1순위 대표 목표 대학교</span>
      <h2 style="font-size:22px;margin:2px 0 6px;color:var(--ink-900)">${escapeHtml(uniName)}</h2>
      <p style="font-size:13px;color:var(--ink-700)">
        ${top1Target ? `${escapeHtml(top1Target.year)}학년도 · ${escapeHtml(top1Target.type)}<br><b>${escapeHtml(top1Target.unit)}</b>` : '홈에서 1순위 목표 대학을 설정하세요.'}
      </p>
    </div>
  </div>

  <div class="section-title-row" style="margin-top:24px"><h3>계정 상태</h3></div>
  <div class="guide-card" style="margin:0 0 14px">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div>
        <b style="font-size:14px;color:var(--ink-900)">${appState.user && appState.user.isLoggedIn ? escapeHtml(appState.user.name) : '비로그인 사용자'}</b>
        <p style="font-size:12px;color:var(--ink-500);margin-top:2px">${appState.user && appState.user.isLoggedIn ? `계정 ID: ${escapeHtml(appState.user.id)} (동기화 완료)` : '로그인하고 목표 데이터를 계정에 보관하세요.'}</p>
      </div>
      ${appState.user && appState.user.isLoggedIn 
        ? `<button class="btn small danger" onclick="handleUserLogoutPrompt()">로그아웃</button>`
        : `<button class="btn small" onclick="openLoginModal()">로그인</button>`
      }
    </div>
  </div>

  <div class="section-title-row" style="margin-top:20px"><h3>데이터 백업 및 복원</h3></div>
  <button class="btn secondary" onclick="exportAppData()">내 데이터 백업하기 (JSON)</button>
  
  <label for="fileBackup" style="margin-top:14px">백업 파일 불러오기</label>
  <input type="file" id="fileBackup" accept=".json,application/json">
  <button class="btn secondary" style="margin-top:10px" onclick="importAppData()">백업 데이터 복원</button>
  <button class="btn ghost danger" style="margin-top:16px" onclick="resetAllAppData()">설정 초기화 (전체 데이터 삭제)</button>

  <div class="tip-box" style="margin-top:16px">
    💡 <strong>프로토타입 v2.3:</strong> data/universities.json 연동, 오버플로우 계정 연동, 개인정보 처리약관, 26개교 전용 엠블럼, 입학처 직통 링크가 모두 탑재되었습니다.
  </div>

  <!-- 설정 화면 하단 개인정보 처리약관 안내 -->
  <div class="privacy-terms-card">
    <h4>개인정보 처리방침 안내</h4>
    <p>1. <strong>수집 항목</strong>: 목표 대학 설정 내역, 전형별 체크리스트 상태, 사용자 입력 메모, 계정 식별자(아이디)</p>
    <p>2. <strong>이용 목적</strong>: AI 비서 기반 편입 요강 맞춤 추천 및 학습 진도 저장, 다중 목표 대학 우선순위 관리</p>
    <p>3. <strong>보유 및 이용 기간</strong>: 브라우저 캐시 삭제 또는 설정 메뉴 내 '설정 초기화' 시 즉시 영구 파기</p>
    <p style="margin-top:6px;color:var(--ink-400)">본 서비스는 수험생의 학습 보조를 목적으로 하며, 사전 동의 없이 개인정보를 제3자에게 제공하거나 상업적 용도로 활용하지 않습니다.</p>
  </div>`;
}

function exportAppData() {
  const blob = new Blob([JSON.stringify(appState, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '편입준비_프로토타입_백업.json';
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('백업 파일이 생성되었습니다.');
}

function importAppData() {
  const input = document.getElementById('fileBackup');
  const file = input.files[0];
  if (!file) { showToast('백업 파일을 먼저 선택해주세요.'); return; }
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      appState = { ...defaultState, ...data };
      persist();
      navigateTo('home');
      showToast('데이터가 성공적으로 복원되었습니다.');
    } catch (e) {
      showToast('올바른 백업 파일 형식이 아닙니다.');
    }
  };
  reader.readAsText(file);
}

function resetAllAppData() {
  if (confirm('저장된 모든 목표 대학 정보와 체크 상태를 초기화하시겠습니까?')) {
    appState = { ...defaultState };
    persist();
    navigateTo('home');
    showToast('전체 데이터가 초기화되었습니다.');
  }
}

document.querySelectorAll('.nav-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => navigateTo(btn.dataset.page));
});

// JSON 데이터 로드 후 초기 화면 렌더링
fetchUniversityData();
