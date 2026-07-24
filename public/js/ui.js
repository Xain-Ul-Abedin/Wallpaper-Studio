import { DESKTOP_W, DESKTOP_H, TABLET_W, TABLET_H, MOBILE_W, MOBILE_H, PALETTES, PATTERNS, PATTERN_LABELS } from './constants.js';
import { currentPattern, currentPalette, seed, isInverted, fitMode, zoomLevel, setCurrentPattern, setCurrentPalette, setSeed, setInverted, setFitMode, setZoomLevel } from './state.js';
import { getBgColor, setCustomPalettes } from './color.js';
import { drawPattern } from './patterns.js';

let activePalettes = [...PALETTES];
setCustomPalettes(activePalettes);

// HIGH-PERFORMANCE RAF SCHEDULER (60FPS BUTTERY SMOOTH)
let isRenderScheduled = false;
function scheduleRender() {
  if (isRenderScheduled) return;
  isRenderScheduled = true;
  requestAnimationFrame(() => {
    performRender();
    isRenderScheduled = false;
  });
}

function drawClockOverlay(ctx, w, h, type) {
  const bg = getBgColor(currentPalette);
  const r = parseInt(bg.slice(1,3), 16), g = parseInt(bg.slice(3,5), 16), b = parseInt(bg.slice(5,7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  ctx.fillStyle = brightness > 125 ? 'rgba(0, 0, 0, 0.75)' : 'rgba(255, 255, 255, 0.9)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (type === 'desktop') {
    ctx.font = '300 13px Lexend, sans-serif';
    ctx.fillText('Sunday, June 14', w / 2, h * 0.22);
    ctx.font = '600 54px Lexend, sans-serif';
    ctx.fillText('09:41', w / 2, h * 0.30);
  } else if (type === 'tablet') {
    ctx.font = '400 20px Lexend, sans-serif';
    ctx.fillText('Sunday, June 14', w / 2, h * 0.18);
    ctx.font = '600 72px Lexend, sans-serif';
    ctx.fillText('09:41', w / 2, h * 0.27);
  } else if (type === 'mobile') {
    ctx.font = '500 12px Lexend, sans-serif';
    ctx.fillText('SUNDAY, JUNE 14', w / 2, h * 0.16);
    ctx.font = '700 64px Lexend, sans-serif';
    ctx.fillText('09:41', w / 2, h * 0.26);
  }
}

function updateBadges() {
  const badge = document.getElementById('zoomPercentageBadge');
  const modalBadge = document.getElementById('modalZoomBadge');
  if (badge) badge.textContent = `${zoomLevel}%`;
  if (modalBadge) modalBadge.textContent = `${zoomLevel}%`;
}

function performRender() {
  const featCanvas = document.getElementById('featuredCanvas');
  if (featCanvas && document.getElementById('viewGallery')?.classList.contains('active')) {
    const fCtx = featCanvas.getContext('2d');
    const prevInverted = isInverted;
    setInverted(true);
    drawPattern(fCtx, featCanvas.width, featCanvas.height, 0, activePalettes[2] || activePalettes[0], 555, 100, 'crop');
    setInverted(prevInverted);
  }

  // RENDER DUAL-CLIP SPLIT CANVAS FOR THE MARKETING COMPARISON SLIDER
  const sliderCanvas = document.getElementById('sliderCanvas');
  if (sliderCanvas && document.getElementById('viewProduct')?.classList.contains('active')) {
    const ctx = sliderCanvas.getContext('2d');
    const w = sliderCanvas.width;
    const h = sliderCanvas.height;
    const mid = w * sliderPosition;

    // LEFT SIDE: DARK MODE EDITION (isInverted = false)
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, mid, h);
    ctx.clip();
    const prevInvertedLeft = isInverted;
    setInverted(false);
    // Render Dunas (Pattern 2) in Stone (Palette 2) with Seed 888
    drawPattern(ctx, w, h, 2, activePalettes[2], 888, 100, 'crop');
    setInverted(prevInvertedLeft);
    ctx.restore();

    // RIGHT SIDE: LIGHT MODE EDITION (isInverted = true)
    ctx.save();
    ctx.beginPath();
    ctx.rect(mid, 0, w - mid, h);
    ctx.clip();
    const prevInvertedRight = isInverted;
    setInverted(true);
    // Render Dunas (Pattern 2) in Stone (Palette 2) with Seed 888
    drawPattern(ctx, w, h, 2, activePalettes[2], 888, 100, 'crop');
    setInverted(prevInvertedRight);
    ctx.restore();
  }

  const dCanvas = document.getElementById('previewDesktop');
  const tCanvas = document.getElementById('previewTablet');
  const mCanvas = document.getElementById('previewMobile');

  if (dCanvas && document.getElementById('viewStudio')?.classList.contains('active')) {
    const dCtx = dCanvas.getContext('2d');
    drawPattern(dCtx, dCanvas.width, dCanvas.height, currentPattern, currentPalette, seed, zoomLevel, fitMode);
    drawClockOverlay(dCtx, dCanvas.width, dCanvas.height, 'desktop');
  }

  if (tCanvas && document.getElementById('viewStudio')?.classList.contains('active')) {
    const tCtx = tCanvas.getContext('2d');
    drawPattern(tCtx, tCanvas.width, tCanvas.height, currentPattern, currentPalette, seed, zoomLevel, fitMode);
    drawClockOverlay(tCtx, tCanvas.width, tCanvas.height, 'tablet');
  }

  if (mCanvas && document.getElementById('viewStudio')?.classList.contains('active')) {
    const mCtx = mCanvas.getContext('2d');
    drawPattern(mCtx, mCanvas.width, mCanvas.height, currentPattern, currentPalette, seed, zoomLevel, fitMode);
    drawClockOverlay(mCtx, mCanvas.width, mCanvas.height, 'mobile');
  }

  updateBadges();

  const customModal = document.getElementById('customModal');
  if (customModal && customModal.classList.contains('active')) {
    renderCustomPreview();
  }

  const addPaletteModal = document.getElementById('addPaletteModal');
  if (addPaletteModal && addPaletteModal.classList.contains('active')) {
    renderPaletteStudioPreview();
  }

  const fullscreenModal = document.getElementById('fullscreenPreviewModal');
  if (fullscreenModal && fullscreenModal.classList.contains('active')) {
    renderFullscreenCanvas();
  }

  updateStyleGridMiniCanvases();
}

function exportImage(w, h, filename, customPatternIdx = currentPattern, customPaletteIdx = currentPalette) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  drawPattern(c.getContext('2d'), w, h, customPatternIdx, activePalettes[customPaletteIdx] || currentPalette, seed, zoomLevel, fitMode);
  c.toBlob(function(blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
  }, 'image/png');
}

// ROUTER: SILKY-SMOOTH ANIMATED PAGE TRANSITIONS WITH LOADING DOTS
let isTransitioning = false;
function openView(targetViewName) {
  const productBtn = document.getElementById('navProductBtn');
  const homeBtn = document.getElementById('navHomeBtn');
  const studioBtn = document.getElementById('navStudioBtn');
  const loader = document.getElementById('pageTransitionLoader');

  const productView = document.getElementById('viewProduct');
  const galleryView = document.getElementById('viewGallery');
  const studioView = document.getElementById('viewStudio');

  if (isTransitioning) return;

  let targetView, currentView;
  if (targetViewName === 'product') {
    targetView = productView;
  } else if (targetViewName === 'gallery') {
    targetView = galleryView;
  } else {
    targetView = studioView;
  }

  if (productView.classList.contains('active')) currentView = productView;
  else if (galleryView.classList.contains('active')) currentView = galleryView;
  else currentView = studioView;

  if (targetView === currentView) return;

  isTransitioning = true;
  if (loader) loader.classList.add('active');

  if (productBtn && homeBtn && studioBtn) {
    productBtn.classList.remove('active');
    homeBtn.classList.remove('active');
    studioBtn.classList.remove('active');

    if (targetViewName === 'product') productBtn.classList.add('active');
    else if (targetViewName === 'gallery') homeBtn.classList.add('active');
    else studioBtn.classList.add('active');
  }

  // PHASE 1: FADE OUT CURRENT VIEW
  currentView.classList.add('fade-out');

  setTimeout(() => {
    currentView.classList.remove('active', 'fade-out');

    // PHASE 2: FADE IN TARGET VIEW WITH SLIDE-UP ANIMATION
    targetView.classList.add('active', 'fade-in');
    scheduleRender();

    setTimeout(() => {
      targetView.classList.remove('fade-in');
      if (loader) loader.classList.remove('active');
      isTransitioning = false;
    }, 350);
  }, 200);
}

function setupViewNavigation() {
  const productBtn = document.getElementById('navProductBtn');
  const homeBtn = document.getElementById('navHomeBtn');
  const studioBtn = document.getElementById('navStudioBtn');
  const featuredStudioBtn = document.getElementById('btnFeaturedStudio');
  const featuredFullscreenBtn = document.getElementById('btnFeaturedFullscreen');

  if (productBtn) productBtn.onclick = () => openView('product');
  if (homeBtn) homeBtn.onclick = () => openView('gallery');
  if (studioBtn) studioBtn.onclick = () => openView('studio');
  
  if (featuredStudioBtn) {
    featuredStudioBtn.onclick = () => {
      openStudioWithPattern(0, 2);
    };
  }

  if (featuredFullscreenBtn) {
    featuredFullscreenBtn.onclick = () => {
      setCurrentPattern(0);
      setCurrentPalette(2);
      setInverted(true);
      openFullscreen('desktop');
    };
  }

  // BIND HERO BRANDING CTA BUTTONS
  const heroLaunchBtn = document.getElementById('btnHeroLaunchStudio');
  const heroExploreBtn = document.getElementById('btnHeroExploreGallery');

  if (heroLaunchBtn) {
    heroLaunchBtn.onclick = () => {
      openStudioWithPattern(0, 2);
    };
  }

  if (heroExploreBtn) {
    heroExploreBtn.onclick = () => {
      openView('gallery');
    };
  }

  // SYNCHRONIZED STUDIO OPENER: ALIGNS ALL CONTROLS (PATTERN, PALETTE, MODE) RESPECTIVELY!
  window.openStudioWithPattern = (patternIdx, paletteIdx) => {
    setCurrentPattern(patternIdx);
    setCurrentPalette(paletteIdx);
    setInverted(true); // Default Light Mode for Studio
    buildStyleGrid();   // Update Pattern Grid active state
    buildPaletteRow();  // Update Palette Row active state

    const btnDark = document.getElementById('btnDark');
    const btnLight = document.getElementById('btnLight');
    if (btnDark && btnLight) {
      btnLight.classList.add('active');
      btnDark.classList.remove('active');
    }

    openView('studio');
  };
}

// INTERACTIVE COMPARISON SLIDER DRAGGING CONTROLLER
let sliderPosition = 0.5; // Starts in dead-center
function setupComparisonSlider() {
  const wrapper = document.getElementById('sliderWrapper');
  const bar = document.getElementById('sliderBar');

  if (!wrapper || !bar) return;

  let isDragging = false;

  function updateSlider(clientX) {
    const rect = wrapper.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    sliderPosition = x / rect.width;
    bar.style.left = `${sliderPosition * 100}%`;
    scheduleRender();
  }

  wrapper.onmousedown = (e) => {
    isDragging = true;
    updateSlider(e.clientX);
  };

  window.onmousemove = (e) => {
    if (!isDragging) return;
    updateSlider(e.clientX);
  };

  window.onmouseup = () => {
    isDragging = false;
  };

  // TOUCH SUPPORT FOR PHONES & TABLETS
  wrapper.ontouchstart = (e) => {
    isDragging = true;
    if (e.touches ?.[0]) updateSlider(e.touches[0].clientX);
  };

  window.ontouchmove = (e) => {
    if (!isDragging) return;
    if (e.touches ?.[0]) updateSlider(e.touches[0].clientX);
  };

  window.ontouchend = () => {
    isDragging = false;
  };
}

// FAQ ACCORDION EXPANSIONS
function setupFaqAccordion() {
  const triggers = document.querySelectorAll('.faq-trigger');
  triggers.forEach(trig => {
    trig.onclick = () => {
      const item = trig.closest('.faq-item');
      const isActive = item.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    };
  });
}

// POPULATE CATEGORY CAROUSEL ROWS WITH CONTEXT-AWARE DEVICE RESOLUTION DOWNLOADS
const CATEGORIES_DATA = [
  {
    title: 'Arcos',
    sub: 'Concentric circles, soft arches, and smooth gradient waves',
    patternIdx: 4
  },
  {
    title: 'Colinas',
    sub: 'Soft terrain, rolling hill horizons, and pine tree silhouettes',
    patternIdx: 0
  },
  {
    title: 'Dunas',
    sub: 'Organic wavy textures and smooth flowing sands',
    patternIdx: 2
  },
  {
    title: 'Rabisco',
    sub: 'Abstract organic lines, scribble strokes, and freehand curves',
    patternIdx: 5
  }
];

function buildGalleryCategories() {
  const container = document.getElementById('galleryCategories');
  if (!container) return;
  container.innerHTML = '';

  const isMobileView = window.innerWidth < 768;
  const isTabletView = window.innerWidth >= 768 && window.innerWidth <= 1024;
  
  const downloadLabel = isMobileView ? 'Download Mobile' : (isTabletView ? 'Download Tablet' : 'Download 4K');

  CATEGORIES_DATA.forEach((cat, catIdx) => {
    const section = document.createElement('section');
    section.className = 'category-section';
    section.setAttribute('data-category', cat.title);

    const headerRow = document.createElement('div');
    headerRow.className = 'category-header';
    headerRow.innerHTML = `
      <div>
        <div class="category-title">${cat.title}</div>
        <div class="category-sub">${cat.sub}</div>
      </div>
      <div class="carousel-controls">
        <button class="btn-carousel-nav nav-prev" title="Scroll Left">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <button class="btn-carousel-nav nav-next" title="Scroll Right">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </button>
      </div>
    `;

    const scrollBox = document.createElement('div');
    scrollBox.className = 'category-cards-scroll-box';

    activePalettes.slice(0, 5).forEach((pal, palIdx) => {
      const card = document.createElement('div');
      card.className = 'gallery-card';
      const canvas = document.createElement('canvas');
      canvas.width = 280;
      canvas.height = 180;
      card.appendChild(canvas);

      const info = document.createElement('div');
      info.className = 'gallery-card-info';
      info.innerHTML = `
        <div class="gallery-card-name">${cat.title} • ${pal.name}</div>
        <div class="card-quick-actions">
          <button class="card-action-btn btn-card-edit">Customize</button>
          <button class="card-action-btn btn-card-download">${downloadLabel}</button>
        </div>
      `;
      card.appendChild(info);

      const ctx = canvas.getContext('2d');
      drawPattern(ctx, 280, 180, cat.patternIdx, pal, 100 + catIdx * 10 + palIdx, 100, 'crop');

      info.querySelector('.btn-card-edit').onclick = (e) => {
        e.stopPropagation();
        if (window.openStudioWithPattern) {
          window.openStudioWithPattern(cat.patternIdx, palIdx);
        }
      };

      info.querySelector('.btn-card-download').onclick = (e) => {
        e.stopPropagation();
        if (window.innerWidth < 768) {
          exportImage(MOBILE_W, MOBILE_H, `wallpaper-${cat.title.toLowerCase()}-mobile.png`, cat.patternIdx, palIdx);
        } else if (window.innerWidth <= 1024) {
          exportImage(TABLET_W, TABLET_H, `wallpaper-${cat.title.toLowerCase()}-tablet.png`, cat.patternIdx, palIdx);
        } else {
          exportImage(DESKTOP_W, DESKTOP_H, `wallpaper-${cat.title.toLowerCase()}-4k.png`, cat.patternIdx, palIdx);
        }
      };

      card.onclick = () => {
        if (window.openStudioWithPattern) {
          window.openStudioWithPattern(cat.patternIdx, palIdx);
        }
      };

      scrollBox.appendChild(card);
    });

    const prevBtn = headerRow.querySelector('.nav-prev');
    const nextBtn = headerRow.querySelector('.nav-next');
    if (prevBtn) prevBtn.onclick = () => scrollBox.scrollBy({ left: -320, behavior: 'smooth' });
    if (nextBtn) nextBtn.onclick = () => scrollBox.scrollBy({ left: 320, behavior: 'smooth' });

    section.appendChild(headerRow);
    section.appendChild(scrollBox);
    container.appendChild(section);
  });
}

// SETUP HOME CATEGORY FILTER BAR
function setupHomeFilterBar() {
  const bar = document.getElementById('homeFilterBar');
  if (!bar) return;

  bar.querySelectorAll('.filter-pill').forEach(pill => {
    pill.onclick = () => {
      bar.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const targetFilter = pill.getAttribute('data-filter');

      document.querySelectorAll('.category-section').forEach(sec => {
        const catName = sec.getAttribute('data-category');
        if (targetFilter === 'all' || catName === targetFilter) {
          sec.style.display = 'flex';
          sec.style.opacity = '1';
        } else {
          sec.style.display = 'none';
          sec.style.opacity = '0';
        }
      });
    };
  });
}

// BUILD DOM ONCE FOR PATTERNS & PALETTES
let styleCanvases = [];
function buildStyleGrid() {
  const grid = document.getElementById('styleGrid');
  if (!grid) return;
  grid.innerHTML = '';
  styleCanvases = [];

  PATTERNS.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.className = 'style-btn' + (i === currentPattern ? ' active' : '');
    btn.title = PATTERN_LABELS[i] || `Pattern ${i+1}`;
    const c = document.createElement('canvas');
    c.width = 70; c.height = 70;
    btn.appendChild(c);
    grid.appendChild(btn);
    styleCanvases.push({ canvas: c, patternIdx: i, btn });

    btn.onclick = () => {
      setCurrentPattern(i);
      grid.querySelectorAll('.style-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      scheduleRender();
    };
  });

  updateStyleGridMiniCanvases();
}

function updateStyleGridMiniCanvases() {
  styleCanvases.forEach(item => {
    const ctx = item.canvas.getContext('2d');
    drawPattern(ctx, 70, 70, item.patternIdx, currentPalette, 42, 100, 'crop');
  });
}

function buildPaletteRow() {
  const row = document.getElementById('paletteRow');
  if (!row) return;
  row.innerHTML = '';

  activePalettes.forEach((pal, i) => {
    const swatch = document.createElement('button');
    swatch.className = 'palette-swatch' + (i === currentPalette ? ' active' : '');
    swatch.title = pal.name;
    const show = [pal.colors[0], pal.colors[Math.floor(pal.colors.length/2)], pal.colors[pal.colors.length-1]];
    show.forEach(c => {
      const s = document.createElement('span');
      s.style.background = c;
      swatch.appendChild(s);
    });
    row.appendChild(swatch);

    swatch.onclick = () => {
      setCurrentPalette(i);
      row.querySelectorAll('.palette-swatch').forEach(b => b.classList.remove('active'));
      swatch.classList.add('active');
      scheduleRender();
    };
  });

  const addBtn = document.createElement('button');
  addBtn.className = 'palette-swatch-add';
  addBtn.title = 'Add Your Own Custom Palette';
  addBtn.innerHTML = '+';
  addBtn.onclick = () => {
    const addModal = document.getElementById('addPaletteModal');
    if (addModal) {
      addModal.classList.add('active');
      renderPaletteStudioPreview();
    }
  };
  row.appendChild(addBtn);
}

// DATA-PRESETS FOR DEBOUNCED CUSTOM RESOLUTION
function setupDeviceTabs() {
  const tabs = [
    { id: 'tabAll', mode: 'mode-all' },
    { id: 'tabDesktop', mode: 'mode-desktop' },
    { id: 'tabTablet', mode: 'mode-tablet' },
    { id: 'tabMobile', mode: 'mode-mobile' }
  ];

  const container = document.getElementById('previewContainer');

  function enforceMobileDefault() {
    if (window.innerWidth < 768) {
      if (!container || container.classList.contains('mode-all')) {
        tabs.forEach(x => {
          const el = document.getElementById(x.id);
          if (el) el.classList.remove('active');
        });
        const mobileBtn = document.getElementById('tabMobile');
        if (mobileBtn) mobileBtn.classList.add('active');
        if (container) container.className = 'preview-container mode-mobile';
      }
    }
  }

  enforceMobileDefault();
  window.addEventListener('resize', enforceMobileDefault);

  tabs.forEach(t => {
    const btn = document.getElementById(t.id);
    if (btn) {
      btn.onclick = () => {
        tabs.forEach(x => {
          const el = document.getElementById(x.id);
          if (el) el.classList.remove('active');
        });
        btn.classList.add('active');
        if (container) container.className = 'preview-container ' + t.mode;
      };
    }
  });
}

// CROP / FIT / ZOOM CONTROLS SETUP
function setupZoomCropControls() {
  const btnCrop = document.getElementById('btnModeCrop');
  const btnFit = document.getElementById('btnModeFit');
  const btnZoomIn = document.getElementById('btnZoomIn');
  const btnZoomOut = document.getElementById('btnZoomOut');

  const modalBtnCrop = document.getElementById('modalBtnCrop');
  const modalBtnFit = document.getElementById('modalBtnFit');
  const modalBtnZoomIn = document.getElementById('modalBtnZoomIn');
  const modalBtnZoomOut = document.getElementById('modalBtnZoomOut');

  function updateFitState(mode) {
    setFitMode(mode);
    if (mode === 'crop') {
      if (btnCrop) btnCrop.classList.add('active');
      if (btnFit) btnFit.classList.remove('active');
      if (modalBtnCrop) modalBtnCrop.classList.add('active');
      if (modalBtnFit) modalBtnFit.classList.remove('active');
    } else {
      if (btnFit) btnFit.classList.add('active');
      if (btnCrop) btnCrop.classList.remove('active');
      if (modalBtnFit) modalBtnFit.classList.add('active');
      if (modalBtnCrop) modalBtnCrop.classList.remove('active');
    }
    scheduleRender();
  }

  function adjustZoom(delta) {
    setZoomLevel(zoomLevel + delta);
    scheduleRender();
  }

  if (btnCrop) btnCrop.onclick = () => updateFitState('crop');
  if (btnFit) btnFit.onclick = () => updateFitState('fit');
  if (modalBtnCrop) modalBtnCrop.onclick = () => updateFitState('crop');
  if (modalBtnFit) modalBtnFit.onclick = () => updateFitState('fit');

  if (btnZoomIn) btnZoomIn.onclick = () => adjustZoom(10);
  if (btnZoomOut) btnZoomOut.onclick = () => adjustZoom(-10);
  if (modalBtnZoomIn) modalBtnZoomIn.onclick = () => adjustZoom(10);
  if (modalBtnZoomOut) modalBtnZoomOut.onclick = () => adjustZoom(-10);
}

// THEME-ADAPTIVE FULLSCALE LIGHTBOX PREVIEW
let activeFullscreenDevice = 'desktop';

function renderFullscreenCanvas() {
  const canvas = document.getElementById('fullscreenCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  if (activeFullscreenDevice === 'tablet') {
    canvas.width = 1200;
    canvas.height = 1600;
    drawPattern(ctx, 1200, 1600, currentPattern, currentPalette, seed, zoomLevel, fitMode);
    drawClockOverlay(ctx, 1200, 1600, 'tablet');
  } else if (activeFullscreenDevice === 'mobile') {
    canvas.width = 1080;
    canvas.height = 2340;
    drawPattern(ctx, 1080, 2340, currentPattern, currentPalette, seed, zoomLevel, fitMode);
    drawClockOverlay(ctx, 1080, 2340, 'mobile');
  } else {
    canvas.width = 1920;
    canvas.height = 1080;
    drawPattern(ctx, 1920, 1080, currentPattern, currentPalette, seed, zoomLevel, fitMode);
    drawClockOverlay(ctx, 1920, 1080, 'desktop');
  }
}

function openFullscreen(deviceType = 'desktop') {
  activeFullscreenDevice = deviceType;
  const modal = document.getElementById('fullscreenPreviewModal');
  const title = document.getElementById('fullscreenTitle');
  const sub = document.getElementById('fullscreenSub');

  if (title) {
    if (deviceType === 'tablet') title.textContent = 'Tablet Fullscale Preview';
    else if (deviceType === 'mobile') title.textContent = 'Mobile Fullscale Preview';
    else title.textContent = 'Desktop 4K Fullscale Preview';
  }

  if (sub) {
    sub.textContent = `Interactive theme-adaptive ${deviceType} wallpaper preview.`;
  }

  if (modal) {
    modal.classList.add('active');
    renderFullscreenCanvas();
  }
}

function setupFullscreenPreview() {
  const btn = document.getElementById('btnEnlargePreview');
  const modal = document.getElementById('fullscreenPreviewModal');
  const closeBtn = document.getElementById('fullscreenClose');

  const wrapDesktop = document.getElementById('wrapDesktop');
  const wrapTablet = document.getElementById('wrapTablet');
  const wrapMobile = document.getElementById('wrapMobile');

  if (btn) btn.onclick = () => openFullscreen('desktop');

  if (wrapDesktop) wrapDesktop.onclick = () => openFullscreen('desktop');
  if (wrapTablet) wrapTablet.onclick = () => openFullscreen('tablet');
  if (wrapMobile) wrapMobile.onclick = () => openFullscreen('mobile');

  if (closeBtn && modal) {
    closeBtn.onclick = () => modal.classList.remove('active');
  }
}

// DROPDOWN MENUS SETUP
function setupDropdownMenus() {
  const dropdowns = [
    { arrow: 'arrowDesktop', menu: 'menuDesktop' },
    { arrow: 'arrowTablet', menu: 'menuTablet' },
    { arrow: 'arrowMobile', menu: 'menuMobile' }
  ];

  dropdowns.forEach(d => {
    const arrow = document.getElementById(d.arrow);
    const menu = document.getElementById(d.menu);

    if (arrow && menu) {
      arrow.onclick = (e) => {
        e.stopPropagation();
        const isOpen = menu.classList.contains('active');
        document.querySelectorAll('.ratio-menu').forEach(m => m.classList.remove('active'));
        if (!isOpen) menu.classList.add('active');
      };

      menu.querySelectorAll('button').forEach(b => {
        b.onclick = (e) => {
          e.stopPropagation();
          const w = parseInt(b.getAttribute('data-w'), 10);
          const h = parseInt(b.getAttribute('data-h'), 10);
          const filename = b.getAttribute('data-name');
          exportImage(w, h, filename);
          menu.classList.remove('active');
        };
      });
    }
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.ratio-menu').forEach(m => m.classList.remove('active'));
  });
}

// DEVICE-BASED CUSTOM RESOLUTION PRESET DATA
const DEVICE_PRESETS = {
  desktop: [
    { name: '4K UHD (3840 x 2160 - 16:9)', w: 3840, h: 2160 },
    { name: '5K Retina (5120 x 2880 - 16:9)', w: 5120, h: 2880 },
    { name: '1.5x 4K Master (5760 x 3240 - 16:9)', w: 5760, h: 3240 },
    { name: '2K QHD (2560 x 1440 - 16:9)', w: 2560, h: 1440 },
    { name: 'Ultrawide Monitor (3440 x 1440 - 21:9)', w: 3440, h: 1440 },
    { name: 'FHD Standard (1920 x 1080 - 16:9)', w: 1920, h: 1080 }
  ],
  tablet: [
    { name: '1.5x Tablet Master (3096 x 4128 - 3:4)', w: 3096, h: 4128 },
    { name: 'iPad Pro 13" (2064 x 2752 - 3:4)', w: 2064, h: 2752 },
    { name: 'iPad Air 11" (1640 x 2360 - 1:1.43)', w: 1640, h: 2360 },
    { name: 'Samsung Galaxy Tab S9 (1752 x 2800 - 16:10)', w: 1752, h: 2800 },
    { name: 'Microsoft Surface Pro (1920 x 2880 - 3:2)', w: 1920, h: 2880 }
  ],
  mobile: [
    { name: '1.5x Mobile Master (1935 x 4194 - 9:19.5)', w: 1935, h: 4194 },
    { name: 'iPhone 16 Pro Max (1290 x 2796 - 9:19.5)', w: 1290, h: 2796 },
    { name: 'iPhone 16 Pro / 15 (1179 x 2556 - 9:19.5)', w: 1179, h: 2556 },
    { name: 'Samsung Galaxy S24 Ultra (1440 x 3120 - 9:19.5)', w: 1440, h: 3120 },
    { name: 'Google Pixel 9 Pro (1280 x 2856 - 9:20)', w: 1280, h: 2856 }
  ],
  print: [
    { name: '12" x 8" Canvas Print (3600 x 2400 @ 300 DPI)', w: 3600, h: 2400 },
    { name: 'A4 Poster Print (3508 x 2480 @ 300 DPI)', w: 3508, h: 2480 },
    { name: '4" x 6" Photo Print (1800 x 1200 @ 300 DPI)', w: 1800, h: 1200 }
  ],
  custom: [
    { name: 'Custom User Dimensions', w: 3840, h: 2160 }
  ]
};

function renderCustomPreview() {
  const canvas = document.getElementById('customPreviewCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = parseInt(document.getElementById('inputWidth')?.value || '3840', 10);
  const h = parseInt(document.getElementById('inputHeight')?.value || '2160', 10);
  canvas.width = 380;
  canvas.height = Math.max(120, Math.round(380 * (h / w))) || 214;
  drawPattern(ctx, canvas.width, canvas.height, currentPattern, currentPalette, seed, zoomLevel, fitMode);
}

function setupCustomModal() {
  const openBtn = document.getElementById('btnCustomModal');
  const modal = document.getElementById('customModal');
  const closeBtn = document.getElementById('customModalClose');
  const categorySelector = document.getElementById('deviceCategorySelector');
  const presetSelector = document.getElementById('devicePresetSelector');
  const inputWidth = document.getElementById('inputWidth');
  const inputHeight = document.getElementById('inputHeight');
  const calcText = document.getElementById('calculatedResolutionText');
  const downloadBtn = document.getElementById('btnDownloadCustom');

  function populatePresets(categoryKey) {
    if (!presetSelector) return;
    const presets = DEVICE_PRESETS[categoryKey] || DEVICE_PRESETS.desktop;
    presetSelector.innerHTML = '';
    presets.forEach((p, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = p.name;
      presetSelector.appendChild(opt);
    });
    applyPreset(presets[0]);
  }

  function applyPreset(preset) {
    if (!preset) return;
    if (inputWidth) inputWidth.value = preset.w;
    if (inputHeight) inputHeight.value = preset.h;
    if (calcText) {
      calcText.textContent = `Target Output: ${preset.w} x ${preset.h} pixels (${preset.name})`;
    }
    renderCustomPreview();
  }

  if (openBtn && modal) {
    openBtn.onclick = () => {
      modal.classList.add('active');
      populatePresets('desktop');
    };
  }

  if (closeBtn && modal) {
    closeBtn.onclick = () => modal.classList.remove('active');
  }

  if (categorySelector) {
    categorySelector.onchange = () => {
      populatePresets(categorySelector.value);
    };
  }

  if (presetSelector) {
    presetSelector.onchange = () => {
      const categoryKey = categorySelector?.value || 'desktop';
      const presets = DEVICE_PRESETS[categoryKey] || DEVICE_PRESETS.desktop;
      const selectedPreset = presets[parseInt(presetSelector.value, 10)] || presets[0];
      applyPreset(selectedPreset);
    };
  }

  if (inputWidth) inputWidth.oninput = () => {
    if (calcText) calcText.textContent = `Target Output: ${inputWidth.value} x ${inputHeight.value} pixels (Custom)`;
    renderCustomPreview();
  };

  if (inputHeight) inputHeight.oninput = () => {
    if (calcText) calcText.textContent = `Target Output: ${inputWidth.value} x ${inputHeight.value} pixels (Custom)`;
    renderCustomPreview();
  };

  if (downloadBtn) {
    downloadBtn.onclick = () => {
      const w = parseInt(inputWidth?.value || '3840', 10);
      const h = parseInt(inputHeight?.value || '2160', 10);
      exportImage(w, h, `wallpaper-device-${w}x${h}.png`);
      if (modal) modal.classList.remove('active');
    };
  }
}

// ROCK-SOLID CUSTOM PALETTE GENERATOR (BASE, MID, ACCENT -> 10 SHADES)
function generate10ShadePalette(c1, c2, c3) {
  const hexToRgb = (hex) => [
    parseInt(hex.slice(1,3), 16),
    parseInt(hex.slice(3,5), 16),
    parseInt(hex.slice(5,7), 16)
  ];

  const rgbToHex = (r, g, b) => `#${[r,g,b].map(x => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0')).join('')}`;

  const blend = (colorA, colorB, factor) => {
    const a = hexToRgb(colorA);
    const b = hexToRgb(colorB);
    return rgbToHex(
      a[0] + (b[0] - a[0]) * factor,
      a[1] + (b[1] - a[1]) * factor,
      a[2] + (b[2] - a[2]) * factor
    );
  };

  return [
    c1,
    blend(c1, c2, 0.35),
    blend(c1, c2, 0.70),
    c2,
    blend(c2, c3, 0.35),
    blend(c2, c3, 0.70),
    c3,
    blend(c3, '#ffffff', 0.35),
    blend(c3, '#ffffff', 0.70),
    '#ffffff'
  ];
}

function renderPaletteStudioPreview() {
  const strip = document.getElementById('customPalettePreviewStrip');
  const canvas = document.getElementById('palettePreviewCanvas');
  if (!strip || !canvas) return;

  const c1 = document.getElementById('colorPicker1')?.value || '#0f172a';
  const c2 = document.getElementById('colorPicker2')?.value || '#334155';
  const c3 = document.getElementById('colorPicker3')?.value || '#10b981';

  const paletteColors = generate10ShadePalette(c1, c2, c3);

  strip.innerHTML = '';
  paletteColors.forEach(c => {
    const s = document.createElement('span');
    s.style.background = c;
    strip.appendChild(s);
  });

  const tempPaletteObj = { name: 'Preview', colors: paletteColors };
  const ctx = canvas.getContext('2d');
  canvas.width = 360;
  canvas.height = 200;
  drawPattern(ctx, canvas.width, canvas.height, currentPattern, tempPaletteObj, seed, 100, 'crop');
}

function setupAddPaletteModal() {
  const modal = document.getElementById('addPaletteModal');
  const closeBtn = document.getElementById('addPaletteModalClose');
  const saveBtn = document.getElementById('btnSaveCustomPalette');
  const headerCreateBtn = document.getElementById('btnHeaderCreatePalette');
  const p1 = document.getElementById('colorPicker1');
  const p2 = document.getElementById('colorPicker2');
  const p3 = document.getElementById('colorPicker3');

  if (headerCreateBtn && modal) {
    headerCreateBtn.onclick = () => {
      modal.classList.add('active');
      renderPaletteStudioPreview();
    };
  }

  if (closeBtn && modal) {
    closeBtn.onclick = () => modal.classList.remove('active');
  }

  if (p1) p1.oninput = scheduleRender;
  if (p2) p2.oninput = scheduleRender;
  if (p3) p3.oninput = scheduleRender;

  if (saveBtn) {
    saveBtn.onclick = () => {
      const name = document.getElementById('customPaletteName')?.value || 'Custom Studio';
      const c1 = p1?.value || '#0f172a';
      const c2 = p2?.value || '#334155';
      const c3 = p3?.value || '#10b981';

      const customColors = generate10ShadePalette(c1, c2, c3);

      activePalettes.push({ name, colors: customColors });
      setCustomPalettes(activePalettes);
      setCurrentPalette(activePalettes.length - 1);
      buildPaletteRow();
      buildGalleryCategories();
      scheduleRender();

      if (modal) modal.classList.remove('active');
    };
  }
}

// GENERAL EVENT BINDINGS
const siteThemeBtn = document.getElementById('siteThemeBtn');
if (siteThemeBtn) {
  siteThemeBtn.onclick = () => {
    document.body.classList.toggle('site-dark');
    scheduleRender();
  };
}

// RANDOMIZER: ONLY RANDOMIZES PATTERN, PALETTE, & LIGHT/DARK MODE (SEED/VARIATION IS PRESERVED!)
const btnRandomizer = document.getElementById('btnRandomizer');
if (btnRandomizer) {
  btnRandomizer.onclick = () => {
    const randomPat = Math.floor(Math.random() * PATTERNS.length);
    const randomPal = Math.floor(Math.random() * activePalettes.length);
    const randomInverted = Math.random() > 0.5;

    setCurrentPattern(randomPat);
    setCurrentPalette(randomPal);
    setInverted(randomInverted);

    const btnDark = document.getElementById('btnDark');
    const btnLight = document.getElementById('btnLight');
    if (btnDark && btnLight) {
      if (randomInverted) {
        btnLight.classList.add('active');
        btnDark.classList.remove('active');
      } else {
        btnDark.classList.add('active');
        btnLight.classList.remove('active');
      }
    }

    buildPaletteRow();
    buildStyleGrid();
    scheduleRender();
  };
}

const btnVariation = document.getElementById('btnVariation');
if (btnVariation) {
  btnVariation.onclick = () => {
    setSeed(Math.random() * 100000 | 0);
    scheduleRender();
  };
}

const btnDark = document.getElementById('btnDark');
if (btnDark) {
  btnDark.onclick = () => {
    setInverted(false);
    btnDark.classList.add('active');
    const btnLight = document.getElementById('btnLight');
    if (btnLight) btnLight.classList.remove('active');
    scheduleRender();
  };
}

const btnLight = document.getElementById('btnLight');
if (btnLight) {
  btnLight.onclick = () => {
    setInverted(true);
    btnLight.classList.add('active');
    if (btnDark) btnDark.classList.remove('active');
    scheduleRender();
  };
}

const btnDesktop = document.getElementById('btnDesktop');
if (btnDesktop) {
  btnDesktop.onclick = () => {
    exportImage(DESKTOP_W, DESKTOP_H, 'wallpaper-desktop-5760x3240.png');
  };
}

const btnTablet = document.getElementById('btnTablet');
if (btnTablet) {
  btnTablet.onclick = () => {
    exportImage(TABLET_W, TABLET_H, 'wallpaper-tablet-3096x4128.png');
  };
}

const btnMobile = document.getElementById('btnMobile');
if (btnMobile) {
  btnMobile.onclick = () => {
    exportImage(MOBILE_W, MOBILE_H, 'wallpaper-mobile-1935x4194.png');
  };
}

window.addEventListener('resize', () => {
  buildGalleryCategories();
});

// VIDEO LOADER: SHOW SPINNER UNTIL VIDEO IS READY, HIDE ONCE PLAYING
(function setupDemoVideoLoader() {
  const video  = document.getElementById('demoVideo');
  const loader = document.getElementById('demoVideoLoader');
  const wrapper = document.getElementById('demoVideoWrapper');
  if (!video || !loader) return;

  // Start with video hidden so the loader shows through
  video.classList.add('loading');

  function onCanPlay() {
    loader.classList.add('hidden');
    video.classList.remove('loading');
  }

  function onWaiting() {
    loader.classList.remove('hidden');
    video.classList.add('loading');
  }

  video.addEventListener('canplay',  onCanPlay,  { once: false });
  video.addEventListener('playing',  onCanPlay,  { once: false });
  video.addEventListener('waiting',  onWaiting,  { once: false });
  video.addEventListener('stalled',  onWaiting,  { once: false });

  // If video is already ready (cached), hide the loader immediately
  if (video.readyState >= 3) onCanPlay();

  // CUSTOM INTERACTIVE HOVER CONTROLS
  const playPauseBtn = document.getElementById('videoPlayPauseBtn');
  const muteBtn = document.getElementById('videoMuteBtn');
  const fullscreenBtn = document.getElementById('videoFullscreenBtn');
  const progressContainer = document.getElementById('videoProgressContainer');
  const progressBar = document.getElementById('videoProgressBar');

  if (!playPauseBtn || !muteBtn || !fullscreenBtn || !progressContainer || !progressBar) return;

  // Play / Pause Toggle
  function togglePlay() {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }

  video.onclick = togglePlay;
  playPauseBtn.onclick = (e) => {
    e.stopPropagation();
    togglePlay();
  };

  video.onplay = () => {
    playPauseBtn.querySelector('.icon-play').classList.add('hidden');
    playPauseBtn.querySelector('.icon-pause').classList.remove('hidden');
  };

  video.onpause = () => {
    playPauseBtn.querySelector('.icon-play').classList.remove('hidden');
    playPauseBtn.querySelector('.icon-pause').classList.add('hidden');
  };

  // Mute / Unmute Toggle
  muteBtn.onclick = (e) => {
    e.stopPropagation();
    video.muted = !video.muted;
    if (video.muted) {
      muteBtn.querySelector('.icon-mute').classList.remove('hidden');
      muteBtn.querySelector('.icon-unmute').classList.add('hidden');
    } else {
      muteBtn.querySelector('.icon-mute').classList.add('hidden');
      muteBtn.querySelector('.icon-unmute').classList.remove('hidden');
    }
  };

  // Progress Bar Time Update
  video.addEventListener('timeupdate', () => {
    const percent = (video.currentTime / video.duration) * 100;
    progressBar.style.width = `${percent}%`;
  });

  // Scrubbing Timeline
  progressContainer.onclick = (e) => {
    e.stopPropagation();
    const rect = progressContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    video.currentTime = percentage * video.duration;
  };

  // Fullscreen Toggle
  fullscreenBtn.onclick = (e) => {
    e.stopPropagation();
    if (!document.fullscreenElement) {
      if (wrapper.requestFullscreen) {
        wrapper.requestFullscreen();
      } else if (wrapper.webkitRequestFullscreen) {
        wrapper.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };
})();

function setupCtaScroll() {
  const scrollDownloadBtn = document.getElementById('btnHeroScrollDownload');
  if (scrollDownloadBtn) {
    scrollDownloadBtn.onclick = () => {
      const downloadSection = document.querySelector('.overview-download-section');
      if (downloadSection) {
        downloadSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
  }
}

function checkDesktopRouting() {
  const isDesktop = window.electronAPI && window.electronAPI.isNativeDesktop;
  if (isDesktop) {
    // Hide main landing-page navigation container
    const navPillGroup = document.querySelector('.nav-pill-group');
    if (navPillGroup) {
      navPillGroup.style.display = 'none';
    }

    // Set Workspace View active directly
    const productView = document.getElementById('viewProduct');
    const studioView = document.getElementById('viewStudio');
    const studioBtn = document.getElementById('navStudioBtn');

    if (productView && studioView) {
      productView.classList.remove('active');
      studioView.classList.add('active');
      if (studioBtn) {
        studioBtn.classList.add('active');
      }
    }
  }
}

// INITIALIZATION
setInverted(true);
setupViewNavigation();
checkDesktopRouting();
setupComparisonSlider();
setupFaqAccordion();
setupHomeFilterBar();
setupDeviceTabs();
setupZoomCropControls();
setupFullscreenPreview();
setupDropdownMenus();
setupCtaScroll();
setupCustomModal();
setupAddPaletteModal();
buildStyleGrid();
buildPaletteRow();
buildGalleryCategories();
scheduleRender();

// FADE OUT STARTUP LOADER ONCE EVERYTHING IS INITIALIZED AND RENDERED
(function hideStartupLoader() {
  const startupLoader = document.getElementById('startupLoaderScreen');
  if (startupLoader) {
    // Fade out smoothly
    startupLoader.style.opacity = '0';
    startupLoader.style.pointerEvents = 'none';
    setTimeout(() => {
      startupLoader.style.display = 'none';
    }, 500);
  }
})();
