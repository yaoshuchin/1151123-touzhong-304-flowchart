// 1151123 投中304 流程圖 - 系統主程式
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initTabs();
  initFlowchartsCatalog();
  initStudio();
  initMatrix();
});

/* ================== 通行碼管制 (密碼 049) ================== */
const CORRECT_PASS = '049';

function initAuth() {
  const overlay = document.getElementById('authOverlay');
  const input = document.getElementById('authInput');
  const lockBtn = document.getElementById('lockBtn');

  // Check if authenticated
  if (sessionStorage.getItem('auth_pass_304') === CORRECT_PASS) {
    overlay.classList.add('hidden');
  } else {
    overlay.classList.remove('hidden');
    setTimeout(() => input.focus(), 100);
  }

  lockBtn.addEventListener('click', () => {
    sessionStorage.removeItem('auth_pass_304');
    overlay.classList.remove('hidden');
    input.value = '';
    input.focus();
    showToast('系統已鎖定', '🔒');
  });
}

function handleAuthSubmit() {
  const input = document.getElementById('authInput');
  const overlay = document.getElementById('authOverlay');
  const val = input.value.trim();

  if (val === CORRECT_PASS) {
    sessionStorage.setItem('auth_pass_304', CORRECT_PASS);
    overlay.classList.add('hidden');
    showToast('通行驗證成功！歡迎進入投中304成果系統', '🎉');
  } else {
    input.classList.add('error');
    showToast('密碼錯誤！提示：南投電話區碼（049）', '❌');
    setTimeout(() => input.classList.remove('error'), 600);
    input.select();
  }
}

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
  const grid = document.getElementById('flowchartsGrid');
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

  statsCount.innerHTML = `顯示 <strong>${filtered.length}</strong> / ${window.FLOWCHARTS_DATA.length} 份學生流程圖手稿提案`;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem; color: #64748b;">
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">🔍</div>
        <h3>查無符合條件的手稿提案</h3>
        <p>請嘗試更換搜尋關鍵字或清除篩選器</p>
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
                <span class="seat-badge">座號 ${item.seat_no}</span>
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
            <div style="font-size: 0.75rem; font-weight: 700; color: #64748b; margin-bottom: 0.2rem;">流程綱要預覽：</div>
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
          <button class="btn-card-action primary" onclick="applyFlowchartToStudio('${item.id}')">
            <span>🚀</span> 套用生成器
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
  const okBtn = document.getElementById('btnModalOk');
  const applyBtn = document.getElementById('btnModalApply');

  const closeModal = () => modal.classList.remove('active');

  closeBtn.addEventListener('click', closeModal);
  okBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  applyBtn.addEventListener('click', () => {
    if (activeModalItemId) {
      applyFlowchartToStudio(activeModalItemId);
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
  document.getElementById('modalCategory').innerText = `分類領域：${item.category}　｜　總步數：${item.step_count} 步驟`;
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

function applyFlowchartToStudio(id) {
  const item = window.FLOWCHARTS_DATA.find(d => d.id === id);
  if (!item) return;

  // Adapt options based on student submission
  if (item.theme.includes('NBA') || item.category.includes('NBA')) {
    studioState.isNbaMode = true;
    const nbaToggleBtn = document.getElementById('btnToggleNba');
    const nbaContainer = document.getElementById('nbaContainer');
    if (nbaToggleBtn && nbaContainer) {
      nbaToggleBtn.innerText = '關閉 NBA 模式';
      nbaToggleBtn.classList.add('active');
      nbaContainer.style.display = 'block';
    }
    studioState.selectedTask = 'nba';
    studioState.selectedNbaPlayer = 'curry';
  } else if (item.theme.includes('婚紗')) {
    studioState.selectedTask = 'wedding';
    studioState.selectedStyle = 'romantic';
  } else if (item.theme.includes('國防') || item.theme.includes('軍事')) {
    studioState.selectedStyle = 'realistic';
    studioState.selectedBackground = 'mountain';
  } else if (item.theme.includes('水彩')) {
    studioState.selectedStyle = 'watercolor';
  } else if (item.theme.includes('動漫')) {
    studioState.selectedStyle = 'anime';
  }

  // Switch to Tab 2
  const studioTabBtn = document.querySelector('[data-tab="tab-studio"]');
  if (studioTabBtn) studioTabBtn.click();

  // Jump to step 2 or 6
  goToStep(2);
  renderCanvas();
  showToast(`已成功套用【${item.student_name}】之創意參數！`, '🚀');
}

/* ================== TAB 2: AI 旅程照片生成器 (STEPPER & CANVAS) ================== */
const studioState = {
  currentStep: 1,
  userImage: null, // Image object or canvas
  selectedStyle: 'realistic',
  selectedLocation: 'taiwan',
  selectedTask: 'travel',
  selectedBackground: 'sunset',
  isNbaMode: false,
  selectedNbaPlayer: 'curry',
  customSlogan: '漫步世界，定格每一抹屬於你的燦爛光景',
  webcamStream: null
};

function initStudio() {
  renderStudioOptions();
  initStepper();
  initPhotoInputs();
  initSloganControls();
  initPosterActions();

  // Load default sample photo
  loadSampleAvatar('traveler');
}

function renderStudioOptions() {
  const dims = window.DIMENSIONS_DATA;
  if (!dims) return;

  // Step 2: Styles
  const stylesGrid = document.getElementById('stylesGrid');
  stylesGrid.innerHTML = dims.styles.map(s => `
    <div class="select-card ${s.id === studioState.selectedStyle ? 'selected' : ''}" data-style-id="${s.id}" onclick="selectStyle('${s.id}')">
      <div class="select-icon-circle" style="border: 2px solid ${s.color};">🎨</div>
      <div class="select-card-title">${escapeHtml(s.name)}</div>
      <div class="select-card-sub">${escapeHtml(s.en)}</div>
      <div style="font-size: 0.72rem; color: #64748b; margin-top: 0.35rem;">${escapeHtml(s.desc)}</div>
    </div>
  `).join('');

  // Step 3: Locations
  const locationsGrid = document.getElementById('locationsGrid');
  locationsGrid.innerHTML = dims.locations.map(loc => `
    <div class="select-card ${loc.id === studioState.selectedLocation ? 'selected' : ''}" data-location-id="${loc.id}" onclick="selectLocation('${loc.id}')">
      <div class="select-icon-circle">${loc.symbol}</div>
      <div class="select-card-title">${escapeHtml(loc.name)}</div>
      <div style="font-size: 0.72rem; color: #64748b; margin-top: 0.35rem;">${escapeHtml(loc.desc)}</div>
    </div>
  `).join('');

  // Step 4: Tasks / Scenarios
  const tasksGrid = document.getElementById('tasksGrid');
  tasksGrid.innerHTML = dims.tasks.map(t => `
    <div class="select-card ${t.id === studioState.selectedTask ? 'selected' : ''}" data-task-id="${t.id}" onclick="selectTask('${t.id}')">
      <div class="select-icon-circle">${t.icon}</div>
      <div class="select-card-title">${escapeHtml(t.name)}</div>
      <div style="font-size: 0.72rem; color: #64748b; margin-top: 0.35rem;">${escapeHtml(t.desc)}</div>
    </div>
  `).join('');

  // Step 4 (NBA Players)
  const nbaGrid = document.getElementById('nbaPlayersGrid');
  nbaGrid.innerHTML = dims.nba_players.map(p => `
    <div class="select-card ${p.id === studioState.selectedNbaPlayer ? 'selected' : ''}" data-nba-id="${p.id}" onclick="selectNbaPlayer('${p.id}')">
      <div style="font-size: 1.2rem; font-weight: 800; color: #ea580c;">#${p.no}</div>
      <div class="select-card-title" style="font-size: 0.85rem;">${escapeHtml(p.name.split(' (')[0])}</div>
      <div style="font-size: 0.72rem; color: #854d0e;">${escapeHtml(p.nickname)}</div>
    </div>
  `).join('');

  // Step 5: Backgrounds
  const bgGrid = document.getElementById('backgroundsGrid');
  bgGrid.innerHTML = dims.backgrounds.map(bg => `
    <div class="select-card ${bg.id === studioState.selectedBackground ? 'selected' : ''}" data-bg-id="${bg.id}" onclick="selectBackground('${bg.id}')">
      <div class="select-icon-circle">${bg.icon}</div>
      <div class="select-card-title">${escapeHtml(bg.name)}</div>
      <div style="font-size: 0.72rem; color: #64748b; margin-top: 0.35rem;">${escapeHtml(bg.desc)}</div>
    </div>
  `).join('');
}

function selectStyle(id) {
  studioState.selectedStyle = id;
  document.querySelectorAll('[data-style-id]').forEach(el => {
    el.classList.toggle('selected', el.dataset.styleId === id);
  });
  renderCanvas();
}

function selectLocation(id) {
  studioState.selectedLocation = id;
  document.querySelectorAll('[data-location-id]').forEach(el => {
    el.classList.toggle('selected', el.dataset.locationId === id);
  });
  generateContextualSlogan();
  renderCanvas();
}

function selectTask(id) {
  studioState.selectedTask = id;
  document.querySelectorAll('[data-task-id]').forEach(el => {
    el.classList.toggle('selected', el.dataset.taskId === id);
  });
  generateContextualSlogan();
  renderCanvas();
}

function selectNbaPlayer(id) {
  studioState.selectedNbaPlayer = id;
  document.querySelectorAll('[data-nba-id]').forEach(el => {
    el.classList.toggle('selected', el.dataset.nbaId === id);
  });
  generateContextualSlogan();
  renderCanvas();
}

function selectBackground(id) {
  studioState.selectedBackground = id;
  document.querySelectorAll('[data-bg-id]').forEach(el => {
    el.classList.toggle('selected', el.dataset.bgId === id);
  });
  generateContextualSlogan();
  renderCanvas();
}

/* ================== STEPPER CONTROLS ================== */
function initStepper() {
  const stepNodes = document.querySelectorAll('.step-node');
  const btnPrev = document.getElementById('btnPrevStep');
  const btnNext = document.getElementById('btnNextStep');

  stepNodes.forEach(node => {
    node.addEventListener('click', () => {
      const step = parseInt(node.dataset.step);
      goToStep(step);
    });
  });

  btnPrev.addEventListener('click', () => {
    if (studioState.currentStep > 1) {
      goToStep(studioState.currentStep - 1);
    }
  });

  btnNext.addEventListener('click', () => {
    if (studioState.currentStep < 6) {
      goToStep(studioState.currentStep + 1);
    } else {
      // Completed, trigger download or summary
      showToast('海報已合成完畢，請點擊「下載高畫質海報」！', '✨');
    }
  });
}

function goToStep(step) {
  studioState.currentStep = step;

  // Update Stepper Nav
  const stepNodes = document.querySelectorAll('.step-node');
  stepNodes.forEach(node => {
    const s = parseInt(node.dataset.step);
    node.classList.toggle('active', s === step);
    node.classList.toggle('completed', s < step);
  });

  // Progress line
  const fill = document.getElementById('stepperProgressFill');
  fill.style.width = `${((step - 1) / 5) * 100}%`;

  // Panes
  document.querySelectorAll('.step-content-pane').forEach((pane, idx) => {
    pane.classList.toggle('active', idx + 1 === step);
  });

  // Buttons
  document.getElementById('btnPrevStep').disabled = (step === 1);
  const btnNext = document.getElementById('btnNextStep');
  btnNext.innerText = (step === 6) ? '完成並預覽 🎉' : '下一步 →';

  renderCanvas();
}

/* ================== PHOTO INPUT (UPLOAD & WEBCAM) ================== */
function initPhotoInputs() {
  const btnModeUpload = document.getElementById('btnModeUpload');
  const btnModeWebcam = document.getElementById('btnModeWebcam');
  const uploadContainer = document.getElementById('uploadContainer');
  const webcamContainer = document.getElementById('webcamContainer');
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');

  // Toggle modes
  btnModeUpload.addEventListener('click', () => {
    btnModeUpload.classList.add('active');
    btnModeWebcam.classList.remove('active');
    uploadContainer.style.display = 'block';
    webcamContainer.classList.remove('active');
    stopWebcam();
  });

  btnModeWebcam.addEventListener('click', () => {
    btnModeWebcam.classList.add('active');
    btnModeUpload.classList.remove('active');
    uploadContainer.style.display = 'none';
    webcamContainer.classList.add('active');
    startWebcam();
  });

  // File upload click & drag
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

  // Webcam actions
  document.getElementById('btnSnapPhoto').addEventListener('click', snapWebcamPhoto);
  document.getElementById('btnCloseCamera').addEventListener('click', () => {
    btnModeUpload.click();
  });

  // Sample avatar buttons
  document.querySelectorAll('[data-sample]').forEach(btn => {
    btn.addEventListener('click', () => {
      loadSampleAvatar(btn.dataset.sample);
    });
  });

  // NBA toggle
  const btnToggleNba = document.getElementById('btnToggleNba');
  const nbaContainer = document.getElementById('nbaContainer');
  btnToggleNba.addEventListener('click', () => {
    studioState.isNbaMode = !studioState.isNbaMode;
    btnToggleNba.classList.toggle('active', studioState.isNbaMode);
    btnToggleNba.innerText = studioState.isNbaMode ? '關閉 NBA 模式' : '開啟 NBA 模式';
    nbaContainer.style.display = studioState.isNbaMode ? 'block' : 'none';
    generateContextualSlogan();
    renderCanvas();
  });
}

function handleImageFile(file) {
  if (!file.type.startsWith('image/')) {
    showToast('請上傳正確的圖片格式檔案！', '⚠️');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      studioState.userImage = img;
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
      studioState.webcamStream = stream;
      video.srcObject = stream;
      showToast('攝影機已開啟', '📷');
    })
    .catch(err => {
      console.error(err);
      showToast('無法存取攝影機，請檢查權限設定', '❌');
    });
}

function stopWebcam() {
  if (studioState.webcamStream) {
    studioState.webcamStream.getTracks().forEach(track => track.stop());
    studioState.webcamStream = null;
  }
}

function snapWebcamPhoto() {
  const video = document.getElementById('webcamVideo');
  if (!studioState.webcamStream) {
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
    studioState.userImage = img;
    renderCanvas();
    showToast('照片拍攝成功！已套用至海報畫布', '📸');
    stopWebcam();
    document.getElementById('btnModeUpload').click();
  };
  img.src = canvas.toDataURL('image/png');
}

// Preset artistic avatars for quick testing
function loadSampleAvatar(type) {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 500;
  const ctx = canvas.getContext('2d');

  if (type === 'traveler') {
    // Warm gradient background
    const grad = ctx.createLinearGradient(0, 0, 400, 500);
    grad.addColorStop(0, '#38bdf8');
    grad.addColorStop(1, '#6366f1');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 500);

    // Cute stylized traveler silhouette
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(200, 200, 70, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.beginPath();
    ctx.moveTo(110, 400);
    ctx.quadraticCurveTo(200, 260, 290, 400);
    ctx.fill();

    // Sunglasses
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(165, 190, 30, 16);
    ctx.fillRect(205, 190, 30, 16);
    ctx.fillRect(195, 195, 10, 4);

    // Backpack strap
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(150, 300);
    ctx.lineTo(150, 450);
    ctx.moveTo(250, 300);
    ctx.lineTo(250, 450);
    ctx.stroke();

    // Badge text
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

    // Graduation cap
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(200, 95);
    ctx.lineTo(270, 130);
    ctx.lineTo(200, 165);
    ctx.lineTo(130, 130);
    ctx.closePath();
    ctx.fill();

    // Body
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
    // Artist
    const grad = ctx.createLinearGradient(0, 0, 400, 500);
    grad.addColorStop(0, '#ec4899');
    grad.addColorStop(1, '#8b5cf6');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 500);

    ctx.fillStyle = '#ffedd5';
    ctx.beginPath();
    ctx.arc(200, 190, 65, 0, Math.PI * 2);
    ctx.fill();

    // Beret
    ctx.fillStyle = '#be185d';
    ctx.beginPath();
    ctx.ellipse(200, 140, 75, 30, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // Body
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
    studioState.userImage = img;
    renderCanvas();
  };
  img.src = canvas.toDataURL('image/png');
}

/* ================== SLOGAN CONTROLS ================== */
function initSloganControls() {
  const input = document.getElementById('sloganTextInput');
  const btnRandom = document.getElementById('btnRandomSlogan');

  input.value = studioState.customSlogan;

  input.addEventListener('input', (e) => {
    studioState.customSlogan = e.target.value;
    renderCanvas();
  });

  btnRandom.addEventListener('click', () => {
    generateContextualSlogan(true);
    input.value = studioState.customSlogan;
    renderCanvas();
    showToast('已換上一句專屬創意標語！', '🎲');
  });
}

function generateContextualSlogan(forceRandom = false) {
  const dims = window.DIMENSIONS_DATA;
  if (!dims) return;

  const loc = dims.locations.find(l => l.id === studioState.selectedLocation)?.name || '世界';
  const task = dims.tasks.find(t => t.id === studioState.selectedTask)?.name || '旅程';

  if (studioState.isNbaMode) {
    const nba = dims.nba_players.find(p => p.id === studioState.selectedNbaPlayer);
    const nbaName = nba ? nba.name.split(' (')[0] : 'NBA巨星';
    const nbaSlogans = [
      `同框 ${nbaName}，燃爆球場傳奇時刻！`,
      `熱血青春無極限，與 ${nbaName} 傲視群雄！`,
      `超越顛峰，在 ${loc} 與 ${nbaName} 夢幻聯手！`,
      `球魂永不熄滅，定格與 ${nbaName} 榮耀瞬間！`
    ];
    studioState.customSlogan = nbaSlogans[Math.floor(Math.random() * nbaSlogans.length)];
  } else {
    const pool = [
      `漫步${loc}，定格每一抹屬於你的燦爛光景`,
      `馳騁世界天涯，遇見最自由真實的自己`,
      `光影流轉${loc}，在時光裡收藏浪漫記憶`,
      `此生必訪之境，開啟屬於你的壯麗旅程`,
      `逐光而行，在${loc}寫下最動人的生命章節`,
      `浪漫誓約，在世界角落銘記此生永恆之美`,
      `璀璨風景與夢想同在，每一步都是心靈奇蹟`
    ];
    studioState.customSlogan = pool[Math.floor(Math.random() * pool.length)];
  }

  const input = document.getElementById('sloganTextInput');
  if (input) input.value = studioState.customSlogan;
}

/* ================== CANVAS POSTER RENDERING ENGINE ================== */
function renderCanvas() {
  const canvas = document.getElementById('posterCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);

  // 1. Draw Background Gradient according to selectedBackground
  drawBackgroundScene(ctx, width, height, studioState.selectedBackground);

  // 2. Poster Container Frame (White card with drop shadow effect)
  const cardX = 30;
  const cardY = 30;
  const cardW = width - 60;
  const cardH = height - 60;
  const cardR = 16;

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 10;
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardR, 'rgba(255, 255, 255, 0.94)', '#e2e8f0', 2);
  ctx.restore();

  // 3. Draw Header Title inside poster
  ctx.fillStyle = '#1e3a8a';
  ctx.font = 'bold 20px "PingFang TC", "Microsoft JhengHei", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('AI JOURNEY POSTER', cardX + 24, cardY + 40);

  ctx.fillStyle = '#64748b';
  ctx.font = '12px sans-serif';
  ctx.fillText('投中 304 班・AI旅程照片生成器成果典藏', cardX + 24, cardY + 58);

  // Decorative Step Badges on top right
  const locObj = window.DIMENSIONS_DATA?.locations.find(l => l.id === studioState.selectedLocation);
  const locName = locObj ? `${locObj.symbol} ${locObj.name}` : '探索旅程';

  ctx.fillStyle = '#eff6ff';
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, cardX + cardW - 140, cardY + 28, 116, 30, 15, '#eff6ff', '#3b82f6', 1);
  ctx.fillStyle = '#1e40af';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(locName, cardX + cardW - 82, cardY + 48);

  // 4. Central Image Area
  const imgBoxX = cardX + 20;
  const imgBoxY = cardY + 76;
  const imgBoxW = cardW - 40;
  const imgBoxH = 430;
  const imgR = 12;

  // Clip rounded rect for the photo
  ctx.save();
  drawRoundedPath(ctx, imgBoxX, imgBoxY, imgBoxW, imgBoxH, imgR);
  ctx.clip();

  if (studioState.userImage) {
    // Apply artistic style filter
    applyStyleFilter(ctx, studioState.selectedStyle);

    // Draw user image covering the box
    drawImageCover(ctx, studioState.userImage, imgBoxX, imgBoxY, imgBoxW, imgBoxH);

    // Reset filter
    ctx.filter = 'none';

    // Style texture overlay if applicable
    drawStyleTextureOverlay(ctx, imgBoxX, imgBoxY, imgBoxW, imgBoxH, studioState.selectedStyle);

  } else {
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(imgBoxX, imgBoxY, imgBoxW, imgBoxH);
    ctx.fillStyle = '#64748b';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('📸 尚未載入相片，請於步驟 1 上傳或拍照', imgBoxX + imgBoxW / 2, imgBoxY + imgBoxH / 2);
  }

  // If NBA Mode: Draw NBA Player Badge
  if (studioState.isNbaMode) {
    const nbaObj = window.DIMENSIONS_DATA?.nba_players.find(p => p.id === studioState.selectedNbaPlayer);
    if (nbaObj) {
      drawNbaSticker(ctx, imgBoxX + imgBoxW - 130, imgBoxY + imgBoxH - 120, nbaObj);
    }
  }

  ctx.restore();

  // Photo border
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, imgBoxX, imgBoxY, imgBoxW, imgBoxH, imgR, 'transparent', 'rgba(0,0,0,0.08)', 2);

  // 5. Metadata Tag Pills under the photo
  const metaY = imgBoxY + imgBoxH + 20;
  const styleObj = window.DIMENSIONS_DATA?.styles.find(s => s.id === studioState.selectedStyle);
  const taskObj = window.DIMENSIONS_DATA?.tasks.find(t => t.id === studioState.selectedTask);
  const bgObj = window.DIMENSIONS_DATA?.backgrounds.find(b => b.id === studioState.selectedBackground);

  let curX = cardX + 24;
  const tags = [
    { label: styleObj ? styleObj.name : '風格', bg: '#fef3c7', text: '#92400e' },
    { label: taskObj ? taskObj.name : '情境', bg: '#ecfdf5', text: '#065f46' },
    { label: bgObj ? bgObj.name : '場景', bg: '#f3e8ff', text: '#6b21a8' }
  ];

  tags.forEach(t => {
    ctx.font = 'bold 11px sans-serif';
    const tagW = ctx.measureText(t.label).width + 20;
    drawRoundedRect(ctx, curX, metaY, tagW, 22, 11, t.bg, 'transparent', 0);
    ctx.fillStyle = t.text;
    ctx.textAlign = 'left';
    ctx.fillText(t.label, curX + 10, metaY + 15);
    curX += tagW + 8;
  });

  // 6. Draw 8~15 Character Slogan
  const sloganY = metaY + 54;
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 20px "PingFang TC", "Microsoft JhengHei", sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 2;
  
  const slogan = studioState.customSlogan || '漫步世界，定格每一抹屬於你的燦爛光景';
  ctx.fillText(`“ ${slogan} ”`, width / 2, sloganY);
  ctx.shadowColor = 'transparent';

  // 7. Footer Stamp / Date Watermark
  const footerY = cardY + cardH - 24;
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cardX + 24, footerY - 16);
  ctx.lineTo(cardX + cardW - 24, footerY - 16);
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('🏛️ 南投縣立南投國民中學 304 班 資訊科技成果', cardX + 24, footerY);

  ctx.textAlign = 'right';
  ctx.fillText('2026.11.23 • VERIFIED ARCHIVE', cardX + cardW - 24, footerY);
}

function drawBackgroundScene(ctx, w, h, bgId) {
  const grad = ctx.createLinearGradient(0, 0, w, h);
  switch (bgId) {
    case 'sunset':
      grad.addColorStop(0, '#f97316');
      grad.addColorStop(0.5, '#ea580c');
      grad.addColorStop(1, '#7c2d12');
      break;
    case 'ocean':
      grad.addColorStop(0, '#0ea5e9');
      grad.addColorStop(0.5, '#0284c7');
      grad.addColorStop(1, '#0369a1');
      break;
    case 'capital':
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(0.6, '#312e81');
      grad.addColorStop(1, '#4338ca');
      break;
    case 'mountain':
      grad.addColorStop(0, '#0f766e');
      grad.addColorStop(0.6, '#115e59');
      grad.addColorStop(1, '#134e4a');
      break;
    case 'grassland':
      grad.addColorStop(0, '#16a34a');
      grad.addColorStop(0.6, '#15803d');
      grad.addColorStop(1, '#166534');
      break;
    case 'amusement':
      grad.addColorStop(0, '#ec4899');
      grad.addColorStop(0.5, '#8b5cf6');
      grad.addColorStop(1, '#6366f1');
      break;
    default:
      grad.addColorStop(0, '#1e3a8a');
      grad.addColorStop(1, '#3b82f6');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Subtle circular ambient glow
  const glow = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, w / 1.5);
  glow.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
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

function drawStyleTextureOverlay(ctx, x, y, w, h, styleId) {
  if (styleId === 'cyberpunk') {
    // Neon grid vignette
    const grad = ctx.createLinearGradient(x, y, x + w, y + h);
    grad.addColorStop(0, 'rgba(236, 72, 153, 0.15)');
    grad.addColorStop(1, 'rgba(6, 182, 212, 0.2)');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);
  } else if (styleId === 'oil_painting' || styleId === 'illustration') {
    // Vintage paper vignette
    const grad = ctx.createRadialGradient(x + w / 2, y + h / 2, w / 4, x + w / 2, y + h / 2, w / 1.5);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(1, 'rgba(120, 53, 15, 0.18)');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);
  }
}

function drawNbaSticker(ctx, x, y, player) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 4;

  // Golden circular badge
  const r = 50;
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

  // Number
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`#${player.no}`, x + r, y + r + 2);

  // Name
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText(player.name.split(' ')[0], x + r, y + r + 22);

  ctx.restore();
}

// Draw helper: cover canvas area keeping aspect ratio
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

/* ================== POSTER ACTIONS (DOWNLOAD / RESET / COPY) ================== */
function initPosterActions() {
  const btnDownload = document.getElementById('btnDownloadPoster');
  const btnReset = document.getElementById('btnResetStudio');
  const btnCopy = document.getElementById('btnCopySlogan');

  btnDownload.addEventListener('click', () => {
    const canvas = document.getElementById('posterCanvas');
    const link = document.createElement('a');
    link.download = `1151123投中304_AI旅程海報_${studioState.selectedLocation}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('海報圖片已成功開始下載！', '📥');
  });

  btnReset.addEventListener('click', () => {
    studioState.selectedStyle = 'realistic';
    studioState.selectedLocation = 'taiwan';
    studioState.selectedTask = 'travel';
    studioState.selectedBackground = 'sunset';
    studioState.isNbaMode = false;
    document.getElementById('btnToggleNba').classList.remove('active');
    document.getElementById('btnToggleNba').innerText = '開啟 NBA 模式';
    document.getElementById('nbaContainer').style.display = 'none';

    renderStudioOptions();
    loadSampleAvatar('traveler');
    goToStep(1);
    showToast('工作台已重設為預設值', '🔄');
  });

  btnCopy.addEventListener('click', () => {
    const text = studioState.customSlogan;
    navigator.clipboard.writeText(text).then(() => {
      showToast('標語文案已成功複製至剪貼簿！', '📋');
    }).catch(() => {
      showToast('複製失敗，請手動複製', '⚠️');
    });
  });
}

/* ================== TAB 3: MATRIX OVERVIEW ================== */
function initMatrix() {
  const dims = window.DIMENSIONS_DATA;
  if (!dims) return;

  // Styles
  const mStyles = document.getElementById('matrixStylesGrid');
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

  // Locations
  const mLocs = document.getElementById('matrixLocationsGrid');
  mLocs.innerHTML = dims.locations.map(l => `
    <div class="dim-info-card">
      <div class="dim-info-title">
        <span>${l.symbol}</span>
        <span>${escapeHtml(l.name)}</span>
      </div>
      <div class="dim-info-desc">${escapeHtml(l.desc)}</div>
    </div>
  `).join('');

  // Tasks
  const mTasks = document.getElementById('matrixTasksGrid');
  mTasks.innerHTML = dims.tasks.map(t => `
    <div class="dim-info-card">
      <div class="dim-info-title">
        <span>${t.icon}</span>
        <span>${escapeHtml(t.name)}</span>
      </div>
      <div class="dim-info-desc">${escapeHtml(t.desc)}</div>
    </div>
  `).join('');

  // Backgrounds
  const mBgs = document.getElementById('matrixBackgroundsGrid');
  mBgs.innerHTML = dims.backgrounds.map(b => `
    <div class="dim-info-card">
      <div class="dim-info-title">
        <span>${b.icon}</span>
        <span>${escapeHtml(b.name)}</span>
      </div>
      <div class="dim-info-desc">${escapeHtml(b.desc)}</div>
    </div>
  `).join('');

  // NBA
  const mNba = document.getElementById('matrixNbaGrid');
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
