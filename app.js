// 1151123 投中304 流程圖 - 系統主程式 (密碼已解除・全班17份手稿獨立程式完全實作)
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initFlowchartsCatalog();
  initProgramEngine();
  initStudio();
  initMatrix();
});

/* ================== TAB 導覽切換 ================== */
function initTabs() {
  const tabBtns = document.querySelectorAll('.nav-tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.tab;

      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add('active');
      }

      if (targetId === 'tab-studio') {
        renderCanvas();
      }
    });
  });
}

/* ================== TAB 1: 手稿分類互動查詢 ================== */
let currentCategoryFilter = 'all';
let currentStepFilter = 'all';
let currentSearchQuery = '';

function initFlowchartsCatalog() {
  const searchInput = document.getElementById('searchInput');
  const stepBtns = document.querySelectorAll('[data-step-filter]');
  const catBtns = document.querySelectorAll('[data-cat-filter]');

  // Search input
  searchInput.addEventListener('input', (e) => {
    currentSearchQuery = e.target.value.trim().toLowerCase();
    renderFlowchartCards();
  });

  // Step filter
  stepBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      stepBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentStepFilter = btn.dataset.stepFilter;
      renderFlowchartCards();
    });
  });

  // Category filter
  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      catBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategoryFilter = btn.dataset.catFilter;
      renderFlowchartCards();
    });
  });

  renderFlowchartCards();
  initModal();
}

function renderFlowchartCards() {
  const grid = document.getElementById('flowchartsGrid');
  const statsCount = document.getElementById('statsCount');
  if (!grid || !window.FLOWCHARTS_DATA) return;

  const filtered = window.FLOWCHARTS_DATA.filter(item => {
    // 1. Step filter
    if (currentStepFilter !== 'all') {
      if (item.step_count !== parseInt(currentStepFilter)) return false;
    }

    // 2. Category filter
    if (currentCategoryFilter !== 'all') {
      const cats = currentCategoryFilter.split(',');
      if (!cats.includes(item.category)) return false;
    }

    // 3. Search query
    if (currentSearchQuery) {
      const q = currentSearchQuery;
      const matchName = item.student_name.toLowerCase().includes(q);
      const matchAuthor = item.display_author.toLowerCase().includes(q);
      const matchTheme = item.theme.toLowerCase().includes(q);
      const matchRaw = item.raw_text.toLowerCase().includes(q);
      const matchTags = item.tags.some(t => t.toLowerCase().includes(q));
      if (!matchName && !matchAuthor && !matchTheme && !matchRaw && !matchTags) return false;
    }

    return true;
  });

  statsCount.innerHTML = `顯示 <strong>${filtered.length}</strong> / ${window.FLOWCHARTS_DATA.length} 份學生流程圖手稿（各附獨立實作程式）`;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem; color: #64748b;">
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">🔍</div>
        <h3>查無符合條件的手稿提案</h3>
        <p>請嘗試更換搜尋關鍵字或清除篩選條件</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(item => {
    const stepsPreview = item.steps.slice(0, 3).map(s => `
      <div class="card-step-item">
        <span class="card-step-num">${s.step}.</span>
        <span>${escapeHtml(s.name)}</span>
      </div>
    `).join('');

    const moreSteps = item.steps.length > 3 ? `<div style="font-size: 0.75rem; color: #94a3b8; text-align: right;">...共 ${item.step_count} 個步驟</div>` : '';

    const tagsHtml = item.tags.slice(0, 4).map(t => `<span class="card-tag">#${escapeHtml(t)}</span>`).join('');

    return `
      <div class="flow-card" data-id="${item.id}">
        <div class="card-top">
          <img src="${item.image}" alt="${escapeHtml(item.display_author)}" class="card-img-thumb" onclick="openFlowchartModal('${item.id}')" title="點擊檢視高解析原稿">
          <div class="card-header-info">
            <div>
              <div class="card-badge-row">
                <span class="seat-badge">${item.seat_no ? `座號 ${item.seat_no < 10 ? '0' + item.seat_no : item.seat_no}` : '全班統整'}</span>
                <span class="steps-count-badge">${item.step_count} 步驟</span>
              </div>
              <h3 class="card-title">${escapeHtml(item.theme)}</h3>
              <div class="card-author">${escapeHtml(item.display_author)}</div>
            </div>
            <div style="font-size: 0.78rem; color: #2563eb; font-weight: 600;">🏷️ ${escapeHtml(item.category)}</div>
          </div>
        </div>

        <div class="card-body">
          <div class="card-steps-preview">
            <div style="font-size: 0.75rem; font-weight: 700; color: #64748b; margin-bottom: 0.2rem;">流程步驟：</div>
            ${stepsPreview}
            ${moreSteps}
          </div>

          <div class="card-tags">
            ${tagsHtml}
          </div>
        </div>

        <div class="card-footer">
          <button class="btn-card-action" onclick="openFlowchartModal('${item.id}')">
            <span>🔍</span> 詳情原稿
          </button>
          <button class="btn-card-action primary" onclick="launchDedicatedProgram('${item.id}')">
            <span>🎮</span> 執行專屬獨立程式
          </button>
        </div>
      </div>
    `;
  }).join('');
}

/* ================== MODAL: 手稿詳情視窗 ================== */
let activeModalItemId = null;

function initModal() {
  const modal = document.getElementById('detailModal');
  const closeBtn = document.getElementById('btnModalClose');
  const footerCloseBtn = document.getElementById('btnModalCloseFooter');
  const launchBtn = document.getElementById('btnModalLaunchProgram');

  const closeModal = () => modal.classList.remove('active');

  closeBtn.addEventListener('click', closeModal);
  footerCloseBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  launchBtn.addEventListener('click', () => {
    if (activeModalItemId) {
      launchDedicatedProgram(activeModalItemId);
      closeModal();
    }
  });
}

function openFlowchartModal(id) {
  const item = window.FLOWCHARTS_DATA.find(d => d.id === id);
  if (!item) return;

  activeModalItemId = id;
  const modal = document.getElementById('detailModal');
  document.getElementById('modalAuthor').innerText = `${item.display_author} — ${item.theme}`;
  document.getElementById('modalCategory').innerText = `分類領域：${item.category}　｜　總步數：${item.step_count} 步驟　｜　專屬程式：${item.program_title}`;
  document.getElementById('modalImg').src = item.image;
  document.getElementById('modalRawText').innerText = item.raw_text;

  const stepsList = document.getElementById('modalStepsList');
  stepsList.innerHTML = item.steps.map(s => `
    <div style="display: flex; gap: 0.5rem; background: #fff; padding: 0.4rem 0.6rem; border-radius: 4px; border: 1px solid #e2e8f0; font-size: 0.85rem;">
      <span style="font-weight: 700; color: #2563eb; min-width: 45px;">Step ${s.step}</span>
      <strong style="color: #0f172a;">${escapeHtml(s.name)}：</strong>
      <span style="color: #64748b;">${escapeHtml(s.desc)}</span>
    </div>
  `).join('');

  const featList = document.getElementById('modalFeaturesList');
  featList.innerHTML = item.features.map(f => `<div style="margin-bottom: 0.2rem;">✨ <strong>${escapeHtml(f)}</strong></div>`).join('');

  modal.classList.add('active');
}

/* ================== TAB 2: 全班 17 份學生獨立程式引擎架構 ================== */
const programState = {
  currentProgramId: 'p17', // default to flagship
  currentProgram: null,
  currentStep: 1,
  totalSteps: 6,
  
  // Universal Image & Slogan
  userImage: null,
  customSlogan: '漫步世界，定格每一抹屬於你的燦爛光景',
  
  // Custom states for each student's dedicated program
  militaryRank: 'captain',
  militaryGear: 'helmet',
  militaryBg: 'base',
  militarySlogan: '同島一命，衛我壯麗河山',
  
  seaLandAirEnv: 'sea',
  seaLandAirLoc: 'taipei101',
  seaLandAirGear: 'diving',
  seaLandAirRole: 'captain',
  
  festivalType: 'cny',
  festivalShape: 'heart',
  festivalLoc: 'home',
  
  gameStyle: 'battlefield',
  gameQuote: '「全軍出擊，這局勝利由我們拿下！」',
  
  nbaPlayerId: 'curry',
  nbaArena: 'chase',
  nbaPose: 'dunk',
  
  weddingCompareRatio: 100, // 0 to 100
  
  // Flagship 10x10 states
  selectedStyle: 'realistic',
  selectedLocation: 'taiwan',
  selectedTask: 'travel',
  selectedBackground: 'sunset',
  
  webcamStream: null
};

function initProgramEngine() {
  const select = document.getElementById('programSelect');
  if (!select || !window.FLOWCHARTS_DATA) return;

  // Populate dropdown with all 17 flowcharts
  select.innerHTML = window.FLOWCHARTS_DATA.map(item => `
    <option value="${item.id}">
      ${item.seat_no ? `座號 ${item.seat_no < 10 ? '0' + item.seat_no : item.seat_no} ${item.student_name}` : '全班統整'}：${item.theme} (${item.step_count}步)
    </option>
  `).join('');

  select.value = 'p17';
  loadProgram('p17');

  select.addEventListener('change', (e) => {
    loadProgram(e.target.value);
  });

  // Compare slider for 17 羅O鈞
  const compSlider = document.getElementById('compareSlider');
  compSlider.addEventListener('input', (e) => {
    programState.weddingCompareRatio = parseInt(e.target.value);
    renderCanvas();
  });
}

function launchDedicatedProgram(id) {
  const select = document.getElementById('programSelect');
  if (select) select.value = id;
  loadProgram(id);

  // Switch to Tab 2
  const studioTabBtn = document.querySelector('[data-tab="tab-studio"]');
  if (studioTabBtn) studioTabBtn.click();

  showToast(`已成功載入【${programState.currentProgram.student_name}】之專屬獨立程式！`, '🎮');
}

function loadProgram(id) {
  const prog = window.FLOWCHARTS_DATA.find(d => d.id === id);
  if (!prog) return;

  programState.currentProgramId = id;
  programState.currentProgram = prog;
  programState.currentStep = 1;
  programState.totalSteps = prog.step_count;

  // Update header info
  document.getElementById('currentAppTitle').innerText = `🎮 ${prog.program_title}`;
  document.getElementById('currentAppAuthor').innerText = `目前運作：${prog.display_author}（${prog.step_count} 步驟專屬流程・${prog.category}）`;
  document.getElementById('canvasPreviewTitle').innerText = `${prog.student_name} 專屬程式：${prog.theme} 成品預覽`;

  // Toggle compare slider visibility (only for 羅O鈞 wedding compare)
  const compareBox = document.getElementById('compareSliderBox');
  compareBox.style.display = (prog.program_type === 'wedding_compare') ? 'block' : 'none';

  // Render Stepper nodes for this student's step count
  renderStepperNodes();

  // Render Step 1
  renderCurrentStepPane();

  // Update Slogan
  updateContextualSlogan();

  // Render Canvas
  renderCanvas();
}

function renderStepperNodes() {
  const nav = document.getElementById('stepperNav');
  const prog = programState.currentProgram;
  const fill = document.getElementById('stepperProgressFill');

  let nodesHtml = `<div class="stepper-progress-fill" id="stepperProgressFill"></div>`;
  prog.steps.forEach((s) => {
    nodesHtml += `
      <button class="step-node ${s.step === programState.currentStep ? 'active' : ''}" data-step="${s.step}" onclick="goToStep(${s.step})">
        <div class="step-circle">${s.step}</div>
        <div class="step-text">${escapeHtml(s.name)}</div>
      </button>
    `;
  });

  nav.innerHTML = nodesHtml;
  updateStepperProgress();
}

function updateStepperProgress() {
  const fill = document.getElementById('stepperProgressFill');
  const total = programState.totalSteps;
  const cur = programState.currentStep;
  if (fill) {
    fill.style.width = `${((cur - 1) / (total - 1)) * 100}%`;
  }

  document.querySelectorAll('.step-node').forEach(node => {
    const s = parseInt(node.dataset.step);
    node.classList.toggle('active', s === cur);
    node.classList.toggle('completed', s < cur);
  });

  document.getElementById('btnPrevStep').disabled = (cur === 1);
  const btnNext = document.getElementById('btnNextStep');
  btnNext.innerText = (cur === total) ? '完成並預覽 🎉' : '下一步 →';
}

function goToStep(step) {
  if (step < 1 || step > programState.totalSteps) return;
  programState.currentStep = step;
  updateStepperProgress();
  renderCurrentStepPane();
  renderCanvas();
}

/* ================== 動態渲染學生專屬步驟面板 ================== */
function renderCurrentStepPane() {
  const container = document.getElementById('dynamicStepContainer');
  const prog = programState.currentProgram;
  const stepIdx = programState.currentStep;
  const stepObj = prog.steps.find(s => s.step === stepIdx);

  const title = stepObj ? stepObj.name : `步驟 ${stepIdx}`;
  const desc = stepObj ? stepObj.desc : '';

  let bodyHtml = '';

  // Step 1 is always Photo input / Webcam / Sample Avatars across all programs
  if (stepIdx === 1) {
    bodyHtml = renderStep1PhotoInput();
  } else if (prog.program_type === 'military') {
    // 14 姚O城 國防軍事
    bodyHtml = renderMilitaryStep(stepIdx);
  } else if (prog.program_type === 'festival_shape') {
    // 15 許O崴 節慶與形狀裁切
    bodyHtml = renderFestivalShapeStep(stepIdx);
  } else if (prog.program_type === 'gaming_story') {
    // 13 林O羽 遊戲電競對話
    bodyHtml = renderGamingStep(stepIdx);
  } else if (prog.program_type === 'sea_land_air') {
    // 16 蔡O緯 海陸空多維
    bodyHtml = renderSeaLandAirStep(stepIdx);
  } else if (prog.program_type === 'nba_first_step' || prog.program_type === 'nba_card_studio') {
    // 18 鄧O康 & 20 王O NBA 系列
    bodyHtml = renderNbaStep(stepIdx);
  } else if (prog.program_type === 'wedding_compare') {
    // 17 羅O鈞 婚紗前後對比
    bodyHtml = renderWeddingCompareStep(stepIdx);
  } else if (prog.program_type === 'seven_steps') {
    // 06 謝O倢 7 步驟工坊
    bodyHtml = renderSevenStepsStep(stepIdx);
  } else {
    // Default Flagship 10x10 (王O億, 翁O涵, 胡O紜, 黃O芳, 藍O媗, 林O妮, 王O茹, 鍾O洧, 全班整合)
    bodyHtml = renderFlagshipStep(stepIdx);
  }

  container.innerHTML = `
    <div class="step-header">
      <h3>步驟 ${stepIdx}：${escapeHtml(title)}</h3>
      <p>${escapeHtml(desc)}</p>
    </div>
    ${bodyHtml}
  `;

  // Re-bind listeners for step 1 upload if on step 1
  if (stepIdx === 1) {
    bindStep1Events();
  }
}

/* --- STEP 1: 照片輸入與相機 --- */
function renderStep1PhotoInput() {
  return `
    <div class="upload-mode-toggle">
      <button class="mode-btn active" id="btnModeUpload">📁 檔案拖曳 / 上傳</button>
      <button class="mode-btn" id="btnModeWebcam">📷 開啟視訊鏡頭 (Webcam)</button>
    </div>

    <!-- 檔案上傳模式 -->
    <div id="uploadContainer">
      <div class="drop-zone" id="dropZone">
        <div class="drop-icon">📸</div>
        <h4>點擊上傳或將照片拖曳至此處</h4>
        <p style="font-size: 0.85rem; color: #64748b; margin-top: 0.25rem;">支援 JPG、PNG、WEBP 等人像照片</p>
        <input type="file" id="fileInput" accept="image/*" style="display: none;">
      </div>
    </div>

    <!-- 視訊相機拍照模式 -->
    <div id="webcamContainer" class="webcam-container">
      <video id="webcamVideo" autoplay playsinline></video>
      <div style="display: flex; gap: 0.5rem; justify-content: center; width: 100%;">
        <button type="button" class="btn-action btn-primary" id="btnSnapPhoto">📸 立即拍攝</button>
        <button type="button" class="btn-action" id="btnCloseCamera">❌ 關閉相機</button>
      </div>
    </div>

    <!-- 快速測試用示範人物選單 -->
    <div class="sample-avatars-row">
      <div class="sample-avatars-title">⚡ 快速測試體驗（點擊直接套用示範照片）：</div>
      <div class="avatar-chips">
        <button class="avatar-chip" data-sample="traveler">🎒 活力旅人</button>
        <button class="avatar-chip" data-sample="student">🎓 投中學子</button>
        <button class="avatar-chip" data-sample="retro">🎨 藝文創作者</button>
      </div>
    </div>
  `;
}

function bindStep1Events() {
  const btnModeUpload = document.getElementById('btnModeUpload');
  const btnModeWebcam = document.getElementById('btnModeWebcam');
  const uploadContainer = document.getElementById('uploadContainer');
  const webcamContainer = document.getElementById('webcamContainer');
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');

  if (btnModeUpload) {
    btnModeUpload.addEventListener('click', () => {
      btnModeUpload.classList.add('active');
      btnModeWebcam.classList.remove('active');
      uploadContainer.style.display = 'block';
      webcamContainer.classList.remove('active');
      stopWebcam();
    });
  }

  if (btnModeWebcam) {
    btnModeWebcam.addEventListener('click', () => {
      btnModeWebcam.classList.add('active');
      btnModeUpload.classList.remove('active');
      uploadContainer.style.display = 'none';
      webcamContainer.classList.add('active');
      startWebcam();
    });
  }

  if (dropZone && fileInput) {
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) handleImageFile(file);
    });

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file) handleImageFile(file);
    });
  }

  const snapBtn = document.getElementById('btnSnapPhoto');
  if (snapBtn) snapBtn.addEventListener('click', snapWebcamPhoto);
  const closeCamBtn = document.getElementById('btnCloseCamera');
  if (closeCamBtn) closeCamBtn.addEventListener('click', () => btnModeUpload.click());

  document.querySelectorAll('[data-sample]').forEach(btn => {
    btn.addEventListener('click', () => loadSampleAvatar(btn.dataset.sample));
  });
}

/* --- 14 姚O城 國防軍事專屬步驟 --- */
function renderMilitaryStep(step) {
  const m = window.DIMENSIONS_DATA.military;
  if (step === 2) {
    // Military Styles
    const styles = [
      { id: 'camo', name: '野戰迷彩', desc: '綠褐相間經典作戰迷彩' },
      { id: 'brave', name: '英勇寫真', desc: '高對比單眼戰士英姿寫真' },
      { id: 'metal', name: '鋼鐵硬派', desc: '金屬質感冷光工業風' },
      { id: 'ink_war', name: '威武水墨', desc: '大氣磅礡黑白水墨風骨' }
    ];
    return `
      <div class="options-grid">
        ${styles.map(s => `
          <div class="select-card ${s.id === programState.selectedStyle ? 'selected' : ''}" onclick="selectStyle('${s.id}')">
            <div class="select-icon-circle">🎖️</div>
            <div class="select-card-title">${s.name}</div>
            <div class="select-card-sub">${s.desc}</div>
          </div>
        `).join('')}
      </div>
    `;
  } else if (step === 3) {
    // Military Rank & Gear
    return `
      <div>
        <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 0.5rem;">⭐ 選擇軍官階級：</div>
        <div class="options-grid" style="margin-bottom: 1.25rem;">
          ${m.ranks.map(r => `
            <div class="select-card ${r.id === programState.militaryRank ? 'selected' : ''}" onclick="programState.militaryRank='${r.id}'; renderCurrentStepPane(); renderCanvas();">
              <div class="select-icon-circle">${r.icon}</div>
              <div class="select-card-title">${r.name}</div>
              <div class="select-card-sub">${r.desc}</div>
            </div>
          `).join('')}
        </div>

        <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 0.5rem;">🛡️ 選擇專屬裝備：</div>
        <div class="options-grid">
          ${m.gears.map(g => `
            <div class="select-card ${g.id === programState.militaryGear ? 'selected' : ''}" onclick="programState.militaryGear='${g.id}'; renderCurrentStepPane(); renderCanvas();">
              <div class="select-icon-circle">${g.icon}</div>
              <div class="select-card-title">${g.name}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (step === 4) {
    // Military Bgs
    return `
      <div class="options-grid">
        ${m.bgs.map(b => `
          <div class="select-card ${b.id === programState.militaryBg ? 'selected' : ''}" onclick="programState.militaryBg='${b.id}'; renderCurrentStepPane(); renderCanvas();">
            <div class="select-icon-circle">${b.icon}</div>
            <div class="select-card-title">${b.name}</div>
            <div class="select-card-sub">${b.desc}</div>
          </div>
        `).join('')}
      </div>
    `;
  } else if (step === 5) {
    // Military Slogans
    return `
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        ${m.slogans.map(s => `
          <div class="select-card ${s === programState.customSlogan ? 'selected' : ''}" style="text-align: left; align-items: flex-start;" onclick="programState.customSlogan='${s}'; document.getElementById('sloganTextInput').value='${s}'; renderCurrentStepPane(); renderCanvas();">
            <div style="font-weight: 700; color: #1e3a8a; font-size: 1rem;">“ ${s} ”</div>
          </div>
        `).join('')}
      </div>
    `;
  } else {
    // Step 6 Output
    return `
      <div style="background: #f0fdf4; padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid #bbf7d0;">
        <h4 style="color: #166534; font-size: 1.1rem; margin-bottom: 0.5rem;">🎖️ 國防軍事英姿特戰卡已合成完畢！</h4>
        <p style="color: #15803d; font-size: 0.9rem;">
          已將您的軍階（${m.ranks.find(r=>r.id===programState.militaryRank)?.name}）、裝備（${m.gears.find(g=>g.id===programState.militaryGear)?.name}）與國防標語注入右側畫布中，請點擊「一鍵下載此學生專屬成品」保存！
        </p>
      </div>
    `;
  }
}

/* --- 15 許O崴 節慶與形狀裁切專屬步驟 --- */
function renderFestivalShapeStep(step) {
  const fs = window.DIMENSIONS_DATA.festival_shape;
  if (step === 2) {
    return `
      <div class="options-grid">
        <div class="select-card ${programState.selectedStyle==='realistic'?'selected':''}" onclick="selectStyle('realistic')">
          <div class="select-icon-circle">📷</div>
          <div class="select-card-title">寫真清爽</div>
        </div>
        <div class="select-card ${programState.selectedStyle==='anime'?'selected':''}" onclick="selectStyle('anime')">
          <div class="select-icon-circle">🎨</div>
          <div class="select-card-title">日系動漫</div>
        </div>
        <div class="select-card ${programState.selectedStyle==='illustration'?'selected':''}" onclick="selectStyle('illustration')">
          <div class="select-icon-circle">📔</div>
          <div class="select-card-title">手札手繪</div>
        </div>
      </div>
    `;
  } else if (step === 3) {
    return `
      <div class="options-grid">
        ${fs.festivals.map(f => `
          <div class="select-card ${f.id === programState.festivalType ? 'selected' : ''}" onclick="programState.festivalType='${f.id}'; updateContextualSlogan(); renderCurrentStepPane(); renderCanvas();">
            <div class="select-icon-circle">${f.icon}</div>
            <div class="select-card-title">${f.name}</div>
            <div class="select-card-sub">${f.desc}</div>
          </div>
        `).join('')}
      </div>
    `;
  } else if (step === 4) {
    return `
      <div class="options-grid">
        ${fs.locations.map(l => `
          <div class="select-card ${l.id === programState.festivalLoc ? 'selected' : ''}" onclick="programState.festivalLoc='${l.id}'; renderCurrentStepPane(); renderCanvas();">
            <div class="select-icon-circle">${l.icon}</div>
            <div class="select-card-title">${l.name}</div>
          </div>
        `).join('')}
      </div>
    `;
  } else if (step === 5) {
    // Shapes
    return `
      <div class="options-grid">
        ${fs.shapes.map(s => `
          <div class="select-card ${s.id === programState.festivalShape ? 'selected' : ''}" onclick="programState.festivalShape='${s.id}'; renderCurrentStepPane(); renderCanvas();">
            <div class="select-icon-circle">${s.icon}</div>
            <div class="select-card-title">${s.name}</div>
            <div class="select-card-sub">${s.desc}</div>
          </div>
        `).join('')}
      </div>
    `;
  } else {
    return `
      <div style="background: #fdf2f8; padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid #fbcfe8;">
        <h4 style="color: #9d174d; font-size: 1.1rem; margin-bottom: 0.5rem;">🏮 節慶形狀裁切賀卡已合成！</h4>
        <p style="color: #be185d; font-size: 0.9rem;">
          已套用【${fs.festivals.find(f=>f.id===programState.festivalType)?.name}】節慶氛圍與【${fs.shapes.find(s=>s.id===programState.festivalShape)?.name}】裁切遮罩！
        </p>
      </div>
    `;
  }
}

/* --- 13 林O羽 遊戲電競對話專屬步驟 --- */
function renderGamingStep(step) {
  const g = window.DIMENSIONS_DATA.gaming_story;
  if (step === 2) {
    return `
      <div class="options-grid">
        ${g.styles.map(s => `
          <div class="select-card ${s.id === programState.gameStyle ? 'selected' : ''}" onclick="programState.gameStyle='${s.id}'; renderCurrentStepPane(); renderCanvas();">
            <div class="select-icon-circle">${s.icon}</div>
            <div class="select-card-title">${s.name}</div>
            <div class="select-card-sub">${s.desc}</div>
          </div>
        `).join('')}
      </div>
    `;
  } else if (step === 3) {
    // Game Quotes
    return `
      <div>
        <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 0.5rem;">💬 選擇角色經典台詞：</div>
        <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem;">
          ${g.quotes.map(q => `
            <div class="select-card ${q === programState.gameQuote ? 'selected' : ''}" style="text-align: left; align-items: flex-start; padding: 0.6rem 0.85rem;" onclick="programState.gameQuote='${q}'; renderCurrentStepPane(); renderCanvas();">
              <span style="font-weight: 600; color: #0f172a;">${q}</span>
            </div>
          `).join('')}
        </div>
        <div style="font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem;">或自由輸入自訂對白台詞：</div>
        <input type="text" class="slogan-input" value="${escapeHtml(programState.gameQuote)}" oninput="programState.gameQuote=this.value; renderCanvas();">
      </div>
    `;
  } else if (step === 4) {
    return `
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        ${g.slogans.map(s => `
          <div class="select-card ${s === programState.customSlogan ? 'selected' : ''}" style="text-align: left; align-items: flex-start;" onclick="programState.customSlogan='${s}'; document.getElementById('sloganTextInput').value='${s}'; renderCurrentStepPane(); renderCanvas();">
            <div style="font-weight: 700; color: #7c3aed;">“ ${s} ”</div>
          </div>
        `).join('')}
      </div>
    `;
  } else {
    return `
      <div style="background: #f5f3ff; padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid #ddd6fe;">
        <h4 style="color: #6d28d9; font-size: 1.1rem; margin-bottom: 0.5rem;">🎮 遊戲封面電競卡已合成完畢！</h4>
        <p style="color: #7c3aed; font-size: 0.9rem;">
          已將角色台詞「${escapeHtml(programState.gameQuote)}」與電競 HUD 邊框融入海報，請於右方預覽並下載！
        </p>
      </div>
    `;
  }
}

/* --- 16 蔡O緯 海陸空多維冒險 --- */
function renderSeaLandAirStep(step) {
  const sla = window.DIMENSIONS_DATA.sea_land_air;
  if (step === 2) {
    return `
      <div class="options-grid">
        ${sla.environments.map(e => `
          <div class="select-card ${e.id === programState.seaLandAirEnv ? 'selected' : ''}" onclick="programState.seaLandAirEnv='${e.id}'; updateContextualSlogan(); renderCurrentStepPane(); renderCanvas();">
            <div class="select-icon-circle">${e.icon}</div>
            <div class="select-card-title">${e.name}</div>
            <div class="select-card-sub">${e.desc}</div>
          </div>
        `).join('')}
      </div>
    `;
  } else if (step === 3) {
    return `
      <div class="options-grid">
        ${sla.locations.map(l => `
          <div class="select-card ${l.id === programState.seaLandAirLoc ? 'selected' : ''}" onclick="programState.seaLandAirLoc='${l.id}'; renderCurrentStepPane(); renderCanvas();">
            <div class="select-icon-circle">${l.icon}</div>
            <div class="select-card-title">${l.name}</div>
          </div>
        `).join('')}
      </div>
    `;
  } else if (step === 4) {
    return `
      <div class="options-grid">
        ${sla.gears.map(g => `
          <div class="select-card ${g.id === programState.seaLandAirGear ? 'selected' : ''}" onclick="programState.seaLandAirGear='${g.id}'; renderCurrentStepPane(); renderCanvas();">
            <div class="select-icon-circle">${g.icon}</div>
            <div class="select-card-title">${g.name}</div>
          </div>
        `).join('')}
      </div>
    `;
  } else if (step === 5) {
    return `
      <div class="options-grid">
        ${sla.roles.map(r => `
          <div class="select-card ${r.id === programState.seaLandAirRole ? 'selected' : ''}" onclick="programState.seaLandAirRole='${r.id}'; renderCurrentStepPane(); renderCanvas();">
            <div class="select-icon-circle">${r.icon}</div>
            <div class="select-card-title">${r.name}</div>
          </div>
        `).join('')}
      </div>
    `;
  } else {
    return `
      <div style="background: #f0f9ff; padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid #bae6fd;">
        <h4 style="color: #0369a1; font-size: 1.1rem; margin-bottom: 0.5rem;">🌊 海陸空探險紀念卡已生成！</h4>
        <p style="color: #0284c7; font-size: 0.9rem;">
          已將探索空間、極限裝備與角色身分結合座標羅盤合成高畫質圖卡！
        </p>
      </div>
    `;
  }
}

/* --- 18 鄧O康 & 20 王O NBA 系列 --- */
function renderNbaStep(step) {
  const nba = window.DIMENSIONS_DATA.nba_players;
  if (step === 2 || step === 3) {
    return `
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 0.5rem;">🏀 挑選要同框的 NBA 巨星：</div>
      <div class="options-grid">
        ${nba.map(p => `
          <div class="select-card ${p.id === programState.nbaPlayerId ? 'selected' : ''}" onclick="programState.nbaPlayerId='${p.id}'; updateContextualSlogan(); renderCurrentStepPane(); renderCanvas();">
            <div style="font-size: 1.2rem; font-weight: 800; color: #ea580c;">#${p.no}</div>
            <div class="select-card-title">${p.name.split(' (')[0]}</div>
            <div class="select-card-sub">${p.nickname}</div>
          </div>
        `).join('')}
      </div>
    `;
  } else if (step === 4) {
    const arenas = [
      { id: 'chase', name: '金州勇士大通中心', icon: '🌉' },
      { id: 'crypto', name: '洛杉磯湖人主場', icon: '🌴' },
      { id: 'united', name: '芝加哥公牛聯合中心', icon: '🐂' },
      { id: 'td', name: '波士頓塞爾提克花園', icon: '🍀' },
      { id: 'street', name: '紐約洛克公園街頭', icon: '🗽' }
    ];
    return `
      <div class="options-grid">
        ${arenas.map(a => `
          <div class="select-card ${a.id === programState.nbaArena ? 'selected' : ''}" onclick="programState.nbaArena='${a.id}'; renderCurrentStepPane(); renderCanvas();">
            <div class="select-icon-circle">${a.icon}</div>
            <div class="select-card-title">${a.name}</div>
          </div>
        `).join('')}
      </div>
    `;
  } else if (step === 5) {
    const poses = [
      { id: 'dunk', name: '暴扣灌籃同框', icon: '💥' },
      { id: 'highfive', name: '雙人默契擊掌', icon: '🙌' },
      { id: 'defense', name: '鐵血雙人防守', icon: '🛡️' }
    ];
    return `
      <div class="options-grid">
        ${poses.map(pos => `
          <div class="select-card ${pos.id === programState.nbaPose ? 'selected' : ''}" onclick="programState.nbaPose='${pos.id}'; renderCurrentStepPane(); renderCanvas();">
            <div class="select-icon-circle">${pos.icon}</div>
            <div class="select-card-title">${pos.name}</div>
          </div>
        `).join('')}
      </div>
    `;
  } else {
    return `
      <div style="background: #fffbeb; padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid #fde68a;">
        <h4 style="color: #b45309; font-size: 1.1rem; margin-bottom: 0.5rem;">🏀 NBA 巨星珍藏同框卡已完成！</h4>
        <p style="color: #92400e; font-size: 0.9rem;">
          已將巨星背號、主場球場與熱血同框標章印製於專屬球員卡中！
        </p>
      </div>
    `;
  }
}

/* --- 17 羅O鈞 婚紗前後對比 --- */
function renderWeddingCompareStep(step) {
  if (step === 2) {
    const styles = [
      { id: 'romantic', name: '唯美寫真', desc: '柔焦光影仙氣十足' },
      { id: 'watercolor', name: '浪漫水彩', desc: '暈染夢幻彩繪質感' },
      { id: 'oil_painting', name: '古典油畫', desc: '典雅巴洛克宮廷感' },
      { id: 'anime', name: '青春漫畫', desc: '熱血二次元甜蜜風格' }
    ];
    return `
      <div class="options-grid">
        ${styles.map(s => `
          <div class="select-card ${s.id === programState.selectedStyle ? 'selected' : ''}" onclick="selectStyle('${s.id}')">
            <div class="select-icon-circle">💍</div>
            <div class="select-card-title">${s.name}</div>
            <div class="select-card-sub">${s.desc}</div>
          </div>
        `).join('')}
      </div>
    `;
  } else if (step === 3) {
    return renderLocationsStep();
  } else if (step === 4) {
    return renderBackgroundsStep();
  } else {
    return `
      <div style="background: #fff1f2; padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid #fecdd3;">
        <h4 style="color: #be123c; font-size: 1.1rem; margin-bottom: 0.5rem;">👰 浪漫婚紗旅拍海報與前後對比已啟用！</h4>
        <p style="color: #9f1239; font-size: 0.9rem;">
          請至右側檢視海報成果，並可透過下方的<strong>「左右對比滑桿」</strong>即時拖曳檢視羅O鈞同學原創之【原圖 vs 婚紗成品】前後視覺差異！
        </p>
      </div>
    `;
  }
}

/* --- 06 謝O倢 7 步驟工坊 --- */
function renderSevenStepsStep(step) {
  if (step === 2) return renderStylesStep();
  if (step === 3) return renderLocationsStep();
  if (step === 4) return renderTasksStep();
  if (step === 5) return renderBackgroundsStep();
  if (step === 6) {
    return `
      <div class="filter-card">
        <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 0.5rem;">✍️ 步驟 6 獨立生成之旅行宣傳標語：</div>
        <div class="slogan-input-wrapper">
          <input type="text" class="slogan-input" id="step6SloganInput" value="${escapeHtml(programState.customSlogan)}" oninput="programState.customSlogan=this.value; renderCanvas();">
          <button type="button" class="btn-action" onclick="updateContextualSlogan(true); document.getElementById('step6SloganInput').value=programState.customSlogan; renderCanvas();">🎲 換一句</button>
        </div>
      </div>
    `;
  }
  return `
    <div style="background: #f0fdf4; padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid #bbf7d0;">
      <h4 style="color: #166534; font-size: 1.1rem; margin-bottom: 0.5rem;">🎉 步驟 7：全尺寸高畫質旅程照片生成完畢！</h4>
      <p style="color: #15803d; font-size: 0.9rem;">
        已依謝O倢同學構思之 7 步驟工序全流程完成渲染！
      </p>
    </div>
  `;
}

/* --- 標準 6 步驟旗艦版輔助 --- */
function renderFlagshipStep(step) {
  if (step === 2) return renderStylesStep();
  if (step === 3) return renderLocationsStep();
  if (step === 4) return renderTasksStep();
  if (step === 5) return renderBackgroundsStep();
  return `
    <div style="background: #eff6ff; padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid #bfdbfe;">
      <h4 style="color: #1e3a8a; font-size: 1.1rem; margin-bottom: 0.5rem;">🎉 恭喜！已完成所有步驟</h4>
      <p style="color: #1e40af; font-size: 0.9rem;">
        您所挑選的風格、地點、情境與背景已成功匯入右側 HTML5 Canvas 畫布，請檢視右方即時海報預覽，並點擊「一鍵下載」保存成果！
      </p>
    </div>
  `;
}

function renderStylesStep() {
  const styles = window.DIMENSIONS_DATA.styles;
  return `
    <div class="options-grid">
      ${styles.map(s => `
        <div class="select-card ${s.id === programState.selectedStyle ? 'selected' : ''}" onclick="selectStyle('${s.id}')">
          <div class="select-icon-circle" style="border: 2px solid ${s.color};">🎨</div>
          <div class="select-card-title">${s.name}</div>
          <div class="select-card-sub">${s.desc}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderLocationsStep() {
  const locs = window.DIMENSIONS_DATA.locations;
  return `
    <div class="options-grid">
      ${locs.map(l => `
        <div class="select-card ${l.id === programState.selectedLocation ? 'selected' : ''}" onclick="selectLocation('${l.id}')">
          <div class="select-icon-circle">${l.symbol}</div>
          <div class="select-card-title">${l.name}</div>
          <div class="select-card-sub">${l.desc}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderTasksStep() {
  const tasks = window.DIMENSIONS_DATA.tasks;
  return `
    <div class="options-grid">
      ${tasks.map(t => `
        <div class="select-card ${t.id === programState.selectedTask ? 'selected' : ''}" onclick="selectTask('${t.id}')">
          <div class="select-icon-circle">${t.icon}</div>
          <div class="select-card-title">${t.name}</div>
          <div class="select-card-sub">${t.desc}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderBackgroundsStep() {
  const bgs = window.DIMENSIONS_DATA.backgrounds;
  return `
    <div class="options-grid">
      ${bgs.map(b => `
        <div class="select-card ${b.id === programState.selectedBackground ? 'selected' : ''}" onclick="selectBackground('${b.id}')">
          <div class="select-icon-circle">${b.icon}</div>
          <div class="select-card-title">${b.name}</div>
          <div class="select-card-sub">${b.desc}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function selectStyle(id) {
  programState.selectedStyle = id;
  renderCurrentStepPane();
  renderCanvas();
}

function selectLocation(id) {
  programState.selectedLocation = id;
  updateContextualSlogan();
  renderCurrentStepPane();
  renderCanvas();
}

function selectTask(id) {
  programState.selectedTask = id;
  updateContextualSlogan();
  renderCurrentStepPane();
  renderCanvas();
}

function selectBackground(id) {
  programState.selectedBackground = id;
  updateContextualSlogan();
  renderCurrentStepPane();
  renderCanvas();
}

/* ================== PHOTO & WEBCAM UTILS ================== */
function handleImageFile(file) {
  if (!file.type.startsWith('image/')) {
    showToast('請上傳正確的圖片格式檔案！', '⚠️');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      programState.userImage = img;
      renderCanvas();
      showToast('照片上傳成功！', '✅');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function startWebcam() {
  const video = document.getElementById('webcamVideo');
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showToast('您的瀏覽器不支援相機或處於非安全性連線', '⚠️');
    return;
  }

  navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 } } })
    .then(stream => {
      programState.webcamStream = stream;
      video.srcObject = stream;
      showToast('攝影機已開啟', '📷');
    })
    .catch(err => {
      console.error(err);
      showToast('無法存取攝影機，請檢查權限設定', '❌');
    });
}

function stopWebcam() {
  if (programState.webcamStream) {
    programState.webcamStream.getTracks().forEach(track => track.stop());
    programState.webcamStream = null;
  }
}

function snapWebcamPhoto() {
  const video = document.getElementById('webcamVideo');
  if (!programState.webcamStream) {
    showToast('攝影機尚未啟動', '⚠️');
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const img = new Image();
  img.onload = () => {
    programState.userImage = img;
    renderCanvas();
    showToast('照片拍攝成功！已套用至專屬畫布', '📸');
    stopWebcam();
    const btn = document.getElementById('btnModeUpload');
    if (btn) btn.click();
  };
  img.src = canvas.toDataURL('image/png');
}

function loadSampleAvatar(type) {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 500;
  const ctx = canvas.getContext('2d');

  if (type === 'traveler') {
    const grad = ctx.createLinearGradient(0, 0, 400, 500);
    grad.addColorStop(0, '#38bdf8');
    grad.addColorStop(1, '#6366f1');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 500);

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(200, 200, 70, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(110, 400);
    ctx.quadraticCurveTo(200, 260, 290, 400);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(165, 190, 30, 16);
    ctx.fillRect(205, 190, 30, 16);
    ctx.fillRect(195, 195, 10, 4);

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(150, 300);
    ctx.lineTo(150, 450);
    ctx.moveTo(250, 300);
    ctx.lineTo(250, 450);
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎒 活力旅人 (示範)', 200, 460);

  } else if (type === 'student') {
    const grad = ctx.createLinearGradient(0, 0, 400, 500);
    grad.addColorStop(0, '#10b981');
    grad.addColorStop(1, '#0284c7');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 500);

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(200, 190, 65, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(200, 95);
    ctx.lineTo(270, 130);
    ctx.lineTo(200, 165);
    ctx.lineTo(130, 130);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.moveTo(120, 410);
    ctx.quadraticCurveTo(200, 250, 280, 410);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎓 投中學子 (示範)', 200, 460);

  } else {
    const grad = ctx.createLinearGradient(0, 0, 400, 500);
    grad.addColorStop(0, '#ec4899');
    grad.addColorStop(1, '#8b5cf6');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 500);

    ctx.fillStyle = '#ffedd5';
    ctx.beginPath();
    ctx.arc(200, 190, 65, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#be185d';
    ctx.beginPath();
    ctx.ellipse(200, 140, 75, 30, -0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(120, 410);
    ctx.quadraticCurveTo(200, 250, 280, 410);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎨 藝文創作者 (示範)', 200, 460);
  }

  const img = new Image();
  img.onload = () => {
    programState.userImage = img;
    renderCanvas();
  };
  img.src = canvas.toDataURL('image/png');
}

/* ================== SLOGAN UPDATE ================== */
function updateContextualSlogan(forceRandom = false) {
  const progType = programState.currentProgram?.program_type;
  const dims = window.DIMENSIONS_DATA;

  if (progType === 'military') {
    const pool = dims.military.slogans;
    programState.customSlogan = pool[Math.floor(Math.random() * pool.length)];
  } else if (progType === 'festival_shape') {
    const festName = dims.festival_shape.festivals.find(f => f.id === programState.festivalType)?.name || '佳節';
    const pool = [
      `歡度${festName}，福星高照事事順心`,
      `佳節團聚，定格家人溫馨歡笑時光`,
      `祈福平安，願歲月靜好常伴左右`,
      `節慶喜樂，把最美好的祝福送給您`
    ];
    programState.customSlogan = pool[Math.floor(Math.random() * pool.length)];
  } else if (progType === 'gaming_story') {
    const pool = dims.gaming_story.slogans;
    programState.customSlogan = pool[Math.floor(Math.random() * pool.length)];
  } else if (progType === 'sea_land_air') {
    const pool = [
      '穿梭海陸空，探索世界極限壯麗',
      '馳騁天涯，每一步都是冒險傳奇',
      '無所畏懼，挑戰天地之間的極致美景',
      '探索未至之境，勇者無界自由起航'
    ];
    programState.customSlogan = pool[Math.floor(Math.random() * pool.length)];
  } else if (progType === 'nba_first_step' || progType === 'nba_card_studio') {
    const nba = dims.nba_players.find(p => p.id === programState.nbaPlayerId);
    const nbaName = nba ? nba.name.split(' (')[0] : 'NBA巨星';
    const pool = [
      `同框 ${nbaName}，燃爆球場傳奇時刻！`,
      `熱血青春無極限，與 ${nbaName} 傲視群雄！`,
      `超越顛峰，在球場與 ${nbaName} 夢幻聯手！`,
      `球魂永不熄滅，定格與 ${nbaName} 榮耀瞬間！`
    ];
    programState.customSlogan = pool[Math.floor(Math.random() * pool.length)];
  } else if (progType === 'wedding_compare') {
    const pool = [
      '執子之手，定格此生最浪漫的誓約',
      '浪漫跨國旅拍，在世界天涯銘記幸福',
      '繁華落盡，唯願與你相伴共度永恆',
      '光影唯美，寫下我們最動人的愛情故事'
    ];
    programState.customSlogan = pool[Math.floor(Math.random() * pool.length)];
  } else {
    const loc = dims.locations.find(l => l.id === programState.selectedLocation)?.name || '世界';
    const pool = [
      `漫步${loc}，定格每一抹屬於你的燦爛光景`,
      `馳騁世界天涯，遇見最自由真實的自己`,
      `光影流轉${loc}，在時光裡收藏浪漫記憶`,
      `此生必訪之境，開啟屬於你的壯麗旅程`,
      `逐光而行，在${loc}寫下最動人的生命章節`
    ];
    programState.customSlogan = pool[Math.floor(Math.random() * pool.length)];
  }

  const input = document.getElementById('sloganTextInput');
  if (input) input.value = programState.customSlogan;
}

/* ================== HTML5 CANVAS 專屬合成繪製引擎 ================== */
function renderCanvas() {
  const canvas = document.getElementById('posterCanvas');
  if (!canvas || !programState.currentProgram) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const progType = programState.currentProgram.program_type;

  ctx.clearRect(0, 0, width, height);

  // 1. Draw Specialized Background Scene
  drawCustomBackground(ctx, width, height, progType);

  // 2. Poster Container Frame
  const cardX = 30;
  const cardY = 30;
  const cardW = width - 60;
  const cardH = height - 60;
  const cardR = 16;

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 10;
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardR, 'rgba(255, 255, 255, 0.95)', '#e2e8f0', 2);
  ctx.restore();

  // 3. Header inside card
  ctx.fillStyle = '#1e3a8a';
  ctx.font = 'bold 18px "PingFang TC", "Microsoft JhengHei", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(programState.currentProgram.program_title.toUpperCase(), cardX + 24, cardY + 38);

  ctx.fillStyle = '#64748b';
  ctx.font = '11px sans-serif';
  ctx.fillText(`投中 304 班 ${programState.currentProgram.display_author} 專屬實作程式`, cardX + 24, cardY + 54);

  // Badge on top right
  const badgeText = getTopRightBadgeText(progType);
  ctx.fillStyle = '#eff6ff';
  drawRoundedRect(ctx, cardX + cardW - 150, cardY + 24, 126, 28, 14, '#eff6ff', '#3b82f6', 1);
  ctx.fillStyle = '#1e40af';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(badgeText, cardX + cardW - 87, cardY + 42);

  // 4. Photo Area
  const imgBoxX = cardX + 20;
  const imgBoxY = cardY + 70;
  const imgBoxW = cardW - 40;
  const imgBoxH = 430;
  const imgR = 12;

  ctx.save();
  // Shape clipping if 許O崴 festival shape
  if (progType === 'festival_shape') {
    clipFestivalShape(ctx, imgBoxX, imgBoxY, imgBoxW, imgBoxH, programState.festivalShape);
  } else {
    drawRoundedPath(ctx, imgBoxX, imgBoxY, imgBoxW, imgBoxH, imgR);
    ctx.clip();
  }

  // Draw photo with filter
  if (programState.userImage) {
    if (progType === 'wedding_compare' && programState.weddingCompareRatio < 100) {
      // Draw Before / After split
      drawBeforeAfterSplit(ctx, imgBoxX, imgBoxY, imgBoxW, imgBoxH, programState.weddingCompareRatio);
    } else {
      applyProgramFilter(ctx, progType);
      drawImageCover(ctx, programState.userImage, imgBoxX, imgBoxY, imgBoxW, imgBoxH);
      ctx.filter = 'none';
    }
  } else {
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(imgBoxX, imgBoxY, imgBoxW, imgBoxH);
    ctx.fillStyle = '#64748b';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('📸 尚未載入相片，請於步驟 1 上傳或拍照', imgBoxX + imgBoxW / 2, imgBoxY + imgBoxH / 2);
  }

  // Overlays (NBA badges, Military gear, Gaming dialog)
  drawProgramOverlays(ctx, imgBoxX, imgBoxY, imgBoxW, imgBoxH, progType);

  ctx.restore();

  // Photo border
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, imgBoxX, imgBoxY, imgBoxW, imgBoxH, imgR, 'transparent', 'rgba(0,0,0,0.08)', 2);

  // 5. Metadata Badges under photo
  drawBottomBadges(ctx, cardX + 24, imgBoxY + imgBoxH + 16, progType);

  // 6. Slogan
  const sloganY = imgBoxY + imgBoxH + 74;
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 18px "PingFang TC", "Microsoft JhengHei", sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 2;
  
  const slogan = programState.customSlogan || '漫步世界，定格每一抹屬於你的燦爛光景';
  ctx.fillText(`“ ${slogan} ”`, width / 2, sloganY);
  ctx.shadowColor = 'transparent';

  // 7. Footer Watermark
  const footerY = cardY + cardH - 20;
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cardX + 24, footerY - 14);
  ctx.lineTo(cardX + cardW - 24, footerY - 14);
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`🏛️ 南投縣立南投國民中學 304 班 • ${programState.currentProgram.student_name} 提案`, cardX + 24, footerY);

  ctx.textAlign = 'right';
  ctx.fillText('2026.11.24 • VERIFIED APP ENGINE', cardX + cardW - 24, footerY);
}

function getTopRightBadgeText(progType) {
  if (progType === 'military') return '🪖 國防特戰卡';
  if (progType === 'festival_shape') return '🏮 節慶賀卡';
  if (progType === 'gaming_story') return '⚡ 電競封面';
  if (progType === 'sea_land_air') return '🌊 海陸空探險';
  if (progType === 'nba_first_step' || progType === 'nba_card_studio') return '🏀 NBA 球星卡';
  if (progType === 'wedding_compare') return '👰 浪漫婚紗照';
  return '✈️ 旅程照片生成器';
}

function drawCustomBackground(ctx, w, h, progType) {
  const grad = ctx.createLinearGradient(0, 0, w, h);
  if (progType === 'military') {
    grad.addColorStop(0, '#1c1917');
    grad.addColorStop(0.5, '#292524');
    grad.addColorStop(1, '#1e3a1e');
  } else if (progType === 'festival_shape') {
    grad.addColorStop(0, '#991b1b');
    grad.addColorStop(0.5, '#b91c1c');
    grad.addColorStop(1, '#7f1d1d');
  } else if (progType === 'gaming_story') {
    grad.addColorStop(0, '#2e1065');
    grad.addColorStop(0.5, '#3b0764');
    grad.addColorStop(1, '#0284c7');
  } else if (progType === 'sea_land_air') {
    grad.addColorStop(0, '#0369a1');
    grad.addColorStop(0.5, '#0284c7');
    grad.addColorStop(1, '#0f766e');
  } else if (progType === 'nba_first_step' || progType === 'nba_card_studio') {
    grad.addColorStop(0, '#c2410c');
    grad.addColorStop(0.5, '#ea580c');
    grad.addColorStop(1, '#9a3412');
  } else if (progType === 'wedding_compare') {
    grad.addColorStop(0, '#fda4af');
    grad.addColorStop(0.5, '#f43f5e');
    grad.addColorStop(1, '#9f1239');
  } else {
    // Flagship default
    grad.addColorStop(0, '#1e3a8a');
    grad.addColorStop(0.5, '#2563eb');
    grad.addColorStop(1, '#1d4ed8');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function applyProgramFilter(ctx, progType) {
  if (progType === 'military') {
    ctx.filter = 'contrast(1.3) saturate(0.9) brightness(0.95)';
  } else if (progType === 'festival_shape') {
    ctx.filter = 'saturate(1.35) contrast(1.15) brightness(1.05)';
  } else if (progType === 'gaming_story') {
    ctx.filter = 'contrast(1.4) saturate(1.6) brightness(1.1)';
  } else if (progType === 'wedding_compare') {
    ctx.filter = 'contrast(1.05) saturate(1.2) brightness(1.08) sepia(0.1)';
  } else if (progType === 'nba_first_step' || progType === 'nba_card_studio') {
    ctx.filter = 'contrast(1.35) saturate(1.4) brightness(1.05)';
  } else {
    // Apply selectedStyle
    applyStyleFilter(ctx, programState.selectedStyle);
  }
}

function applyStyleFilter(ctx, styleId) {
  switch (styleId) {
    case 'realistic':
      ctx.filter = 'contrast(1.15) saturate(1.2) brightness(1.02)';
      break;
    case 'japanese':
      ctx.filter = 'sepia(0.2) contrast(1.2) brightness(1.1) saturate(1.1)';
      break;
    case '3d_cartoon':
      ctx.filter = 'saturate(1.6) contrast(1.25) brightness(1.05)';
      break;
    case 'illustration':
      ctx.filter = 'sepia(0.35) contrast(1.1) brightness(1.05)';
      break;
    case 'watercolor':
      ctx.filter = 'saturate(1.3) brightness(1.12) contrast(0.95)';
      break;
    case 'ink_wash':
      ctx.filter = 'grayscale(1) contrast(1.5) brightness(1.05)';
      break;
    case 'anime':
      ctx.filter = 'contrast(1.3) saturate(1.5) brightness(1.08)';
      break;
    case 'cyberpunk':
      ctx.filter = 'hue-rotate(180deg) saturate(1.8) contrast(1.4)';
      break;
    case 'oil_painting':
      ctx.filter = 'sepia(0.4) contrast(1.35) saturate(1.2)';
      break;
    case 'american_comic':
      ctx.filter = 'contrast(1.6) saturate(1.7) brightness(1.05)';
      break;
    default:
      ctx.filter = 'none';
  }
}

function clipFestivalShape(ctx, x, y, w, h, shape) {
  ctx.beginPath();
  const cx = x + w / 2;
  const cy = y + h / 2;

  if (shape === 'circle') {
    const r = Math.min(w, h) / 2 - 10;
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
  } else if (shape === 'heart') {
    const scale = Math.min(w, h) / 32;
    ctx.moveTo(cx, cy + 10 * scale);
    ctx.bezierCurveTo(cx - 15 * scale, cy - 2 * scale, cx - 18 * scale, cy - 12 * scale, cx, cy - 6 * scale);
    ctx.bezierCurveTo(cx + 18 * scale, cy - 12 * scale, cx + 15 * scale, cy - 2 * scale, cx, cy + 10 * scale);
  } else if (shape === 'star') {
    const spikes = 5;
    const outerR = Math.min(w, h) / 2 - 15;
    const innerR = outerR / 2;
    let rot = Math.PI / 2 * 3;
    let step = Math.PI / spikes;

    ctx.moveTo(cx, cy - outerR);
    for (let i = 0; i < spikes; i++) {
      let sx = cx + Math.cos(rot) * outerR;
      let sy = cy + Math.sin(rot) * outerR;
      ctx.lineTo(sx, sy);
      rot += step;

      sx = cx + Math.cos(rot) * innerR;
      sy = cy + Math.sin(rot) * innerR;
      ctx.lineTo(sx, sy);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerR);
  } else {
    // Square / Polaroid default
    drawRoundedPath(ctx, x + 10, y + 10, w - 20, h - 20, 10);
  }
  ctx.closePath();
  ctx.clip();
}

function drawBeforeAfterSplit(ctx, x, y, w, h, ratio) {
  const splitX = x + (w * ratio / 100);

  // 1. Draw Original on left side
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, splitX - x, h);
  ctx.clip();
  ctx.filter = 'none';
  drawImageCover(ctx, programState.userImage, x, y, w, h);
  ctx.restore();

  // 2. Draw Filtered on right side
  ctx.save();
  ctx.beginPath();
  ctx.rect(splitX, y, x + w - splitX, h);
  ctx.clip();
  ctx.filter = 'contrast(1.1) saturate(1.25) brightness(1.08) sepia(0.15)';
  drawImageCover(ctx, programState.userImage, x, y, w, h);
  ctx.restore();

  // 3. Draw Split Line
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(splitX, y);
  ctx.lineTo(splitX, y + h);
  ctx.stroke();

  // Text labels
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(x + 10, y + 10, 60, 24);
  ctx.fillRect(x + w - 70, y + 10, 60, 24);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('原圖', x + 40, y + 26);
  ctx.fillText('婚紗合成', x + w - 40, y + 26);
}

function drawProgramOverlays(ctx, x, y, w, h, progType) {
  if (progType === 'military') {
    // Military rank watermark & camo HUD
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    drawRoundedRect(ctx, x + 16, y + h - 50, 150, 36, 6, 'rgba(20, 40, 20, 0.85)', '#4ade80', 1);
    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    const rankName = window.DIMENSIONS_DATA.military.ranks.find(r=>r.id===programState.militaryRank)?.name || '軍官';
    ctx.fillText(`🎖️ 國軍軍階：${rankName}`, x + 91, y + h - 28);
    ctx.restore();

  } else if (progType === 'gaming_story') {
    // Gaming Dialogue bubble
    ctx.save();
    drawRoundedRect(ctx, x + 20, y + h - 70, w - 40, 52, 8, 'rgba(15, 23, 42, 0.9)', '#818cf8', 2);
    ctx.fillStyle = '#a5b4fc';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🎮 角色台詞對白：', x + 32, y + h - 52);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(programState.gameQuote, x + 32, y + h - 30);
    ctx.restore();

  } else if (progType === 'nba_first_step' || progType === 'nba_card_studio') {
    const nbaObj = window.DIMENSIONS_DATA.nba_players.find(p => p.id === programState.nbaPlayerId);
    if (nbaObj) {
      drawNbaSticker(ctx, x + w - 120, y + h - 120, nbaObj);
    }
  }
}

function drawNbaSticker(ctx, x, y, player) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 4;

  const r = 48;
  ctx.beginPath();
  ctx.arc(x + r, y + r, r, 0, Math.PI * 2);
  const grad = ctx.createLinearGradient(x, y, x + r * 2, y + r * 2);
  grad.addColorStop(0, '#f59e0b');
  grad.addColorStop(1, '#b45309');
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`#${player.no}`, x + r, y + r);

  ctx.font = 'bold 10px sans-serif';
  ctx.fillText(player.name.split(' ')[0], x + r, y + r + 20);

  ctx.restore();
}

function drawBottomBadges(ctx, startX, y, progType) {
  let curX = startX;
  const badges = [];

  if (progType === 'military') {
    badges.push({ text: `軍階: ${programState.militaryRank}`, bg: '#dcfce7', color: '#166534' });
    badges.push({ text: `裝備: ${programState.militaryGear}`, bg: '#fef3c7', color: '#92400e' });
    badges.push({ text: `背景: ${programState.militaryBg}`, bg: '#e0e7ff', color: '#3730a3' });
  } else if (progType === 'festival_shape') {
    badges.push({ text: `節慶: ${programState.festivalType}`, bg: '#fee2e2', color: '#991b1b' });
    badges.push({ text: `裁切: ${programState.festivalShape}`, bg: '#fef3c7', color: '#92400e' });
  } else if (progType === 'gaming_story') {
    badges.push({ text: `樣式: ${programState.gameStyle}`, bg: '#f3e8ff', color: '#6b21a8' });
    badges.push({ text: `電競金句`, bg: '#dbeafe', color: '#1e40af' });
  } else if (progType === 'sea_land_air') {
    badges.push({ text: `空間: ${programState.seaLandAirEnv}`, bg: '#e0f2fe', color: '#0369a1' });
    badges.push({ text: `角色: ${programState.seaLandAirRole}`, bg: '#fef3c7', color: '#92400e' });
  } else {
    badges.push({ text: `風格: ${programState.selectedStyle}`, bg: '#fef3c7', color: '#92400e' });
    badges.push({ text: `地點: ${programState.selectedLocation}`, bg: '#ecfdf5', color: '#065f46' });
    badges.push({ text: `情境: ${programState.selectedTask}`, bg: '#f3e8ff', color: '#6b21a8' });
  }

  badges.forEach(b => {
    ctx.font = 'bold 11px sans-serif';
    const tagW = ctx.measureText(b.text).width + 18;
    drawRoundedRect(ctx, curX, y, tagW, 20, 10, b.bg, 'transparent', 0);
    ctx.fillStyle = b.color;
    ctx.textAlign = 'left';
    ctx.fillText(b.text, curX + 9, y + 14);
    curX += tagW + 8;
  });
}

function drawImageCover(ctx, img, x, y, w, h) {
  const imgRatio = img.width / img.height;
  const boxRatio = w / h;
  let sWidth, sHeight, sx, sy;

  if (imgRatio > boxRatio) {
    sHeight = img.height;
    sWidth = img.height * boxRatio;
    sx = (img.width - sWidth) / 2;
    sy = 0;
  } else {
    sWidth = img.width;
    sHeight = img.width / boxRatio;
    sx = 0;
    sy = (img.height - sHeight) / 2;
  }
  ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
}

function drawRoundedRect(ctx, x, y, w, h, r, fill, stroke, strokeWidth = 1) {
  ctx.beginPath();
  drawRoundedPath(ctx, x, y, w, h, r);
  if (fill && fill !== 'transparent') {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke && stroke !== 'transparent' && strokeWidth > 0) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
  }
}

function drawRoundedPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/* ================== STUDIO BUTTONS (DOWNLOAD / RESET / SLOGAN) ================== */
function initStudio() {
  const btnPrev = document.getElementById('btnPrevStep');
  const btnNext = document.getElementById('btnNextStep');
  const btnDownload = document.getElementById('btnDownloadPoster');
  const btnReset = document.getElementById('btnResetStudio');
  const btnCopy = document.getElementById('btnCopySlogan');
  const btnRandom = document.getElementById('btnRandomSlogan');
  const sloganInput = document.getElementById('sloganTextInput');

  btnPrev.addEventListener('click', () => {
    if (programState.currentStep > 1) {
      goToStep(programState.currentStep - 1);
    }
  });

  btnNext.addEventListener('click', () => {
    if (programState.currentStep < programState.totalSteps) {
      goToStep(programState.currentStep + 1);
    } else {
      showToast('成品已生成完畢，請點擊「一鍵下載此學生專屬成品」！', '🎉');
    }
  });

  btnDownload.addEventListener('click', () => {
    const canvas = document.getElementById('posterCanvas');
    const link = document.createElement('a');
    const p = programState.currentProgram;
    const authorTag = p.seat_no ? `304_${p.seat_no < 10 ? '0' + p.seat_no : p.seat_no}號${p.student_name}` : '304全班整合代表';
    link.download = `${authorTag}_${p.theme}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast(`已成功下載【${p.student_name}】專屬作品！`, '📥');
  });

  btnReset.addEventListener('click', () => {
    loadProgram(programState.currentProgramId);
    showToast('已重設為此程式初始設定', '🔄');
  });

  btnCopy.addEventListener('click', () => {
    navigator.clipboard.writeText(programState.customSlogan).then(() => {
      showToast('標語文案已成功複製至剪貼簿！', '📋');
    });
  });

  btnRandom.addEventListener('click', () => {
    updateContextualSlogan(true);
    renderCanvas();
    showToast('已換上一句專屬創意標語！', '🎲');
  });

  sloganInput.addEventListener('input', (e) => {
    programState.customSlogan = e.target.value;
    renderCanvas();
  });

  // Load default traveler photo
  loadSampleAvatar('traveler');
}

/* ================== TAB 3: MATRIX OVERVIEW ================== */
function initMatrix() {
  const dims = window.DIMENSIONS_DATA;
  if (!dims) return;

  const mStyles = document.getElementById('matrixStylesGrid');
  if (mStyles) {
    mStyles.innerHTML = dims.styles.map(s => `
      <div class="dim-info-card">
        <div class="dim-info-title">
          <span style="color: ${s.color};">●</span>
          <span>${escapeHtml(s.name)}</span>
          <span style="font-size: 0.75rem; color: #94a3b8; font-weight: normal;">(${escapeHtml(s.en)})</span>
        </div>
        <div class="dim-info-desc">${escapeHtml(s.desc)}</div>
      </div>
    `).join('');
  }

  const mLocs = document.getElementById('matrixLocationsGrid');
  if (mLocs) {
    mLocs.innerHTML = dims.locations.map(l => `
      <div class="dim-info-card">
        <div class="dim-info-title">
          <span>${l.symbol}</span>
          <span>${escapeHtml(l.name)}</span>
        </div>
        <div class="dim-info-desc">${escapeHtml(l.desc)}</div>
      </div>
    `).join('');
  }

  const mTasks = document.getElementById('matrixTasksGrid');
  if (mTasks) {
    mTasks.innerHTML = dims.tasks.map(t => `
      <div class="dim-info-card">
        <div class="dim-info-title">
          <span>${t.icon}</span>
          <span>${escapeHtml(t.name)}</span>
        </div>
        <div class="dim-info-desc">${escapeHtml(t.desc)}</div>
      </div>
    `).join('');
  }

  const mBgs = document.getElementById('matrixBackgroundsGrid');
  if (mBgs) {
    mBgs.innerHTML = dims.backgrounds.map(b => `
      <div class="dim-info-card">
        <div class="dim-info-title">
          <span>${b.icon}</span>
          <span>${escapeHtml(b.name)}</span>
        </div>
        <div class="dim-info-desc">${escapeHtml(b.desc)}</div>
      </div>
    `).join('');
  }

  const mNba = document.getElementById('matrixNbaGrid');
  if (mNba) {
    mNba.innerHTML = dims.nba_players.map(p => `
      <div class="dim-info-card">
        <div class="dim-info-title" style="color: #c2410c;">
          <span>🏀 #${p.no}</span>
          <span>${escapeHtml(p.name)}</span>
        </div>
        <div class="dim-info-desc">綽號：<strong>${escapeHtml(p.nickname)}</strong></div>
      </div>
    `).join('');
  }
}

/* ================== UTILITIES ================== */
function showToast(msg, icon = 'ℹ️') {
  const toast = document.getElementById('toast');
  const msgEl = document.getElementById('toastMsg');
  const iconEl = document.getElementById('toastIcon');

  msgEl.innerText = msg;
  iconEl.innerText = icon;
  toast.classList.add('show');

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}
