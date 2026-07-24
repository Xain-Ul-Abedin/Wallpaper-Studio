import { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import {
  PALETTES,
  PATTERNS,
  PATTERN_LABELS,
  DEVICE_PRESETS
} from './utils/constants';
import type { Palette, PatternType } from './utils/constants';
import { drawPattern } from './utils/patterns';

// ── TOOLTIP COMPONENT ──
function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <span className="tooltip-container">
      {children}
      <span className="tooltip-text">{text}</span>
    </span>
  );
}

// ── MINI CANVAS PATTERN SELECTOR COMPONENT ──
interface MiniCanvasProps {
  pattern: PatternType;
  palette: Palette;
  customPalettes: Palette[];
}

function MiniCanvas({ pattern, palette, customPalettes }: MiniCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawPattern(ctx, 70, 70, pattern, palette, 42, 100, 'crop', false, customPalettes);
  }, [pattern, palette, customPalettes]);

  return <canvas ref={canvasRef} width={70} height={70} style={{ width: '70px', height: '70px', display: 'block', borderRadius: '4px' }} />;
}

// ── GALLERY CARD CANVAS COMPONENT ──
interface GalleryCardCanvasProps {
  pattern: PatternType;
  palette: Palette;
  customPalettes: Palette[];
}

function GalleryCardCanvas({ pattern, palette, customPalettes }: GalleryCardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawPattern(ctx, 280, 180, pattern, palette, 888, 100, 'crop', false, customPalettes);
  }, [pattern, palette, customPalettes]);

  return <canvas ref={canvasRef} width={280} height={180} style={{ width: '100%', height: '180px', display: 'block', borderRadius: '12px 12px 0 0' }} />;
}

// ── FEATURED HERO CANVAS COMPONENT ──
interface FeaturedCanvasProps {
  palette: Palette;
  customPalettes: Palette[];
}

function FeaturedCanvas({ palette, customPalettes }: FeaturedCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawPattern(ctx, 1920, 1080, 'flowing-hills', palette, 555, 100, 'crop', false, customPalettes);
  }, [palette, customPalettes]);

  return <canvas ref={canvasRef} width={1920} height={1080} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />;
}

// ── MAIN APPLICATION COMPONENT ──
export default function App() {
  // ── ROUTING & NAVIGATION ──
  const [activeTab, setActiveTab] = useState<'gallery' | 'studio' | 'help'>('gallery');

  // ── CORE STUDIO STATE ──
  const [currentPattern, setCurrentPattern] = useState<number>(0);
  const [paletteIdx, setPaletteIdx] = useState<number>(0);
  const [seed, setSeed] = useState<number>(12345);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [fitMode, setFitMode] = useState<'crop' | 'fit'>('crop');
  const [deviceMode, setDeviceMode] = useState<'all' | 'desktop' | 'tablet' | 'mobile'>('all');
  const [isInverted, setIsInverted] = useState<boolean>(false);
  const [isLightTheme, setIsLightTheme] = useState<boolean>(true); // default matching body.site-light
  
  // Custom palettes loaded from localStorage
  const [customPalettes, setCustomPalettes] = useState<Palette[]>(() => {
    try {
      const saved = localStorage.getItem('ws_custom_palettes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // ── ONBOARDING STATE ──
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('ws_onboarding_completed') !== 'true';
  });
  const [onboardingStep, setOnboardingStep] = useState<number>(0);

  // ── CUSTOM RESOLUTION MODAL STATE ──
  const [isCustomModalActive, setIsCustomModalActive] = useState<boolean>(false);
  const [modalCategory, setModalCategory] = useState<string>('desktop');
  const [modalPresetIdx, setModalPresetIdx] = useState<number>(0);
  const [customWidth, setCustomWidth] = useState<number>(3840);
  const [customHeight, setCustomHeight] = useState<number>(2160);

  // ── TOAST NOTIFICATIONS ──
  const [toastMessage, setToastMessage] = useState<string>('');
  const [isToastVisible, setIsToastVisible] = useState<boolean>(false);
  const toastTimeoutRef = useRef<number | null>(null);

  // ── GALLERY FILTER STATE ──
  const [galleryFilter, setGalleryFilter] = useState<string>('all');

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    setIsToastVisible(true);
    toastTimeoutRef.current = window.setTimeout(() => {
      setIsToastVisible(false);
    }, 3000);
  };

  // ── PREVIEW CANVAS REFS ──
  const desktopCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const tabletCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mobileCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const modalCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const activePalette = paletteIdx >= PALETTES.length
    ? customPalettes[paletteIdx - PALETTES.length]
    : PALETTES[paletteIdx];

  // ── THEME MANAGER ──
  useEffect(() => {
    if (isLightTheme) {
      document.body.classList.remove('site-dark');
      document.body.classList.add('site-light');
    } else {
      document.body.classList.remove('site-light');
      document.body.classList.add('site-dark');
    }
  }, [isLightTheme]);

  // ── REDRAW EVENT HOOK ──
  useEffect(() => {
    if (!activePalette || activeTab !== 'studio') return;

    if (deviceMode === 'all' || deviceMode === 'desktop') {
      const canvas = desktopCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawPattern(ctx, 960, 540, PATTERNS[currentPattern], activePalette, seed, zoomLevel, fitMode, isInverted, customPalettes, 'desktop');
        }
      }
    }

    if (deviceMode === 'all' || deviceMode === 'tablet') {
      const canvas = tabletCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawPattern(ctx, 600, 800, PATTERNS[currentPattern], activePalette, seed, zoomLevel, fitMode, isInverted, customPalettes, 'tablet');
        }
      }
    }

    if (deviceMode === 'all' || deviceMode === 'mobile') {
      const canvas = mobileCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawPattern(ctx, 290, 628, PATTERNS[currentPattern], activePalette, seed, zoomLevel, fitMode, isInverted, customPalettes, 'mobile');
        }
      }
    }
  }, [currentPattern, paletteIdx, seed, zoomLevel, fitMode, deviceMode, isInverted, customPalettes, activeTab]);

  // ── MODAL ASPECT PREVIEW CANVAS HOOK ──
  useEffect(() => {
    if (!isCustomModalActive || !activePalette) return;
    const canvas = modalCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 380;
    canvas.height = Math.max(120, Math.round(380 * (customHeight / customWidth))) || 214;
    
    drawPattern(ctx, canvas.width, canvas.height, PATTERNS[currentPattern], activePalette, seed, zoomLevel, fitMode, isInverted, customPalettes);
  }, [isCustomModalActive, customWidth, customHeight, currentPattern, paletteIdx, seed, zoomLevel, fitMode, isInverted]);

  // ── KEYBOARD SHORTCUTS ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body && activeTab === 'studio') {
        e.preventDefault();
        randomizeSeed();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && activeTab === 'studio') {
        e.preventDefault();
        downloadWallpaper(3840, 2160, `Wallpaper-Desktop-${PATTERNS[currentPattern]}.png`);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPattern, paletteIdx, seed, zoomLevel, fitMode, isInverted, activeTab]);

  // ── ACTION UTILITIES ──
  const randomizeSeed = () => {
    const nextSeed = Math.floor(Math.random() * 999999);
    setSeed(nextSeed);
    showToast("Seed variation randomized!");
  };

  const runRandomizer = () => {
    const nextPat = Math.floor(Math.random() * PATTERNS.length);
    const nextPal = Math.floor(Math.random() * (PALETTES.length + customPalettes.length));
    const nextInverted = Math.random() > 0.5;
    const nextTheme = Math.random() > 0.5;

    setCurrentPattern(nextPat);
    setPaletteIdx(nextPal);
    setIsInverted(nextInverted);
    setIsLightTheme(nextTheme);
    showToast("Complete layout randomized!");
  };

  const applyWallpaper = async () => {
    const offscreen = document.createElement('canvas');
    offscreen.width = 3840;
    offscreen.height = 2160;
    const ctx = offscreen.getContext('2d');
    if (!ctx || !activePalette) return;

    drawPattern(ctx, 3840, 2160, PATTERNS[currentPattern], activePalette, seed, zoomLevel, fitMode, isInverted, customPalettes);
    const base64Data = offscreen.toDataURL('image/png');

    const electronAPI = (window as any).electronAPI;
    const isTauriEnv = (window as any).__TAURI_INTERNALS__ !== undefined || (window as any).__TAURI__ !== undefined;

    if (electronAPI && typeof electronAPI.setWallpaper === 'function') {
      try {
        showToast("Applying wallpaper...");
        await electronAPI.setWallpaper(base64Data);
        showToast("Wallpaper successfully set!");
      } catch (err) {
        showToast("Error setting wallpaper: " + err);
      }
    } else if (isTauriEnv) {
      try {
        showToast("Applying wallpaper...");
        await invoke<string>('set_desktop_wallpaper', { base64Data });
        showToast("Wallpaper successfully set!");
      } catch (err) {
        showToast("Error setting wallpaper: " + err);
      }
    } else {
      showToast("Native system actions require the desktop app!");
    }
  };

  const downloadWallpaper = (w: number, h: number, fileName: string) => {
    if (!activePalette) return;
    const offscreen = document.createElement('canvas');
    offscreen.width = w;
    offscreen.height = h;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return;

    drawPattern(ctx, w, h, PATTERNS[currentPattern], activePalette, seed, zoomLevel, fitMode, isInverted, customPalettes);
    const url = offscreen.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = fileName;
    link.href = url;
    link.click();
    showToast(`Downloaded: ${fileName}`);
  };

  const addCustomPalette = () => {
    const hexInput = prompt("Enter a custom color palette (comma-separated hex codes, min 2 colors):", "#0f172a, #38bdf8, #f43f5e");
    if (!hexInput) return;

    const colors = hexInput.split(',')
      .map(c => c.trim())
      .filter(c => /^#[0-9A-F]{6}$/i.test(c));

    if (colors.length < 2) {
      alert("Invalid format! Please enter at least 2 valid hex codes starting with # (e.g. #000000).");
      return;
    }

    const newPalette: Palette = {
      name: `Custom Palette ${customPalettes.length + 1}`,
      colors
    };

    const updated = [...customPalettes, newPalette];
    setCustomPalettes(updated);
    localStorage.setItem('ws_custom_palettes', JSON.stringify(updated));
    setPaletteIdx(PALETTES.length + updated.length - 1);
    showToast("Custom palette added!");
  };

  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const handleCategoryChange = (cat: string) => {
    setModalCategory(cat);
    setModalPresetIdx(0);
    const list = DEVICE_PRESETS[cat] || DEVICE_PRESETS.desktop;
    setCustomWidth(list[0].w);
    setCustomHeight(list[0].h);
  };

  const handlePresetChange = (idx: number) => {
    setModalPresetIdx(idx);
    const list = DEVICE_PRESETS[modalCategory] || DEVICE_PRESETS.desktop;
    setCustomWidth(list[idx].w);
    setCustomHeight(list[idx].h);
  };

  // ── ONBOARDING TOURS SLIDES DATA ──
  const onboardingSlides = [
    {
      title: "Welcome to WallpaperStudio!",
      desc: "Create high-resolution procedural minimalist wallpapers locally. Generate beautiful flowing structures based on noise fields and vectors.",
      button: "Next"
    },
    {
      title: "Real-time Multi-Device View",
      desc: "Simulate and preview layouts on Desktop 4K, Tablet, and Mobile viewport frames simultaneously to make sure cropping and ratios are perfect.",
      button: "Next"
    },
    {
      title: "Apply Active Wallpaper Natively",
      desc: "Apply your created artwork directly as your active Windows desktop background with a single click. No config or file copy needed!",
      button: "Get Started"
    }
  ];

  const handleOnboardingNext = () => {
    if (onboardingStep < onboardingSlides.length - 1) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      localStorage.setItem('ws_onboarding_completed', 'true');
      setShowOnboarding(false);
      showToast("Tutorial finished! Enjoy WPS!");
    }
  };

  const replayOnboarding = () => {
    setOnboardingStep(0);
    setShowOnboarding(true);
  };

  // ── GALLERY DATA ROWS ──
  const galleryRows = [
    { title: "Arcos", sub: "Concentric curves and geometric arcs", patternIdx: 4 },
    { title: "Colinas", sub: "Terrain horizons and mountain ranges", patternIdx: 0 },
    { title: "Dunas", sub: "Organic waves and moving sand fields", patternIdx: 2 },
    { title: "Rabisco", sub: "Abstract organic line strokes and curves", patternIdx: 5 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      
      {/* ── STICKY TOP APP HEADER ── */}
      <header className="app-header">
        <div className="header-left">
          <nav className="nav-pill-group">
            <button
              className={`nav-icon-btn ${activeTab === 'gallery' ? 'active' : ''}`}
              title="Gallery Home"
              onClick={() => setActiveTab('gallery')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="9"></rect>
                <rect x="14" y="3" width="7" height="5"></rect>
                <rect x="14" y="12" width="7" height="9"></rect>
                <rect x="3" y="16" width="7" height="5"></rect>
              </svg>
            </button>
            <button
              className={`nav-icon-btn ${activeTab === 'studio' ? 'active' : ''}`}
              title="Open Studio Editor"
              onClick={() => setActiveTab('studio')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <button
              className={`nav-icon-btn ${activeTab === 'help' ? 'active' : ''}`}
              title="Help & Shortcuts"
              onClick={() => setActiveTab('help')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </button>
          </nav>

          <div className="logo">
            <span className="logo-mark">WPS</span>
            <h1>Wallpaper Studio <span style={{ fontSize: '0.65rem', padding: '2px 6px', background: 'var(--border)', borderRadius: '4px', marginLeft: '6px', color: 'var(--text-muted)' }}>Desktop</span></h1>
          </div>
        </div>

        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Quick Onboarding Button */}
          <button className="site-theme-btn" onClick={replayOnboarding} title="Replay Walkthrough Tour" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 4v6h6M23 20v-6h-6"></path>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
            </svg>
          </button>

          {/* Theme Toggler */}
          <button className="site-theme-btn" onClick={() => setIsLightTheme(!isLightTheme)} title="Toggle Site Theme">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </header>

      {/* ── WORKSPACE CONTENT SWITCHER ── */}
      <div style={{ flex: 1, overflowY: activeTab === 'studio' ? 'hidden' : 'auto', overflowX: 'hidden' }}>

        {/* ── VIEW 1: GALLERY VIEW ── */}
        {activeTab === 'gallery' && (
          <main className="view-container active" id="viewGallery" style={{ padding: '0 0 40px 0' }}>
            
            {/* Featured Hero Art Section */}
            <section className="featured-hero-banner" style={{ minHeight: '380px', height: '380px' }}>
              <FeaturedCanvas palette={PALETTES[1] || PALETTES[0]} customPalettes={customPalettes} />
              <div className="featured-overlay-content">
                <div className="featured-tag-pill">
                  FEATURED PIECE
                </div>
                <h2 className="featured-title">Flowing Hills — Charcoal</h2>
                <p className="featured-sub">Curated Procedural Vector Art • Light Edition (16:9 4K resolution)</p>
                
                <div className="featured-cta-group">
                  <button
                    className="btn-open-in-studio"
                    onClick={() => {
                      setCurrentPattern(0); // Flowing Hills
                      setPaletteIdx(1); // Charcoal
                      setFitMode('crop');
                      setActiveTab('studio');
                    }}
                  >
                    <span>Customize in Studio</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            </section>

            {/* Gallery Category filter bar */}
            <div className="home-filter-bar" style={{ marginTop: '24px' }}>
              <span className="filter-label">Filter Styles:</span>
              <button
                className={`filter-pill ${galleryFilter === 'all' ? 'active' : ''}`}
                onClick={() => setGalleryFilter('all')}
              >
                All Styles
              </button>
              {galleryRows.map(row => (
                <button
                  key={row.title}
                  className={`filter-pill ${galleryFilter === row.title ? 'active' : ''}`}
                  onClick={() => setGalleryFilter(row.title)}
                >
                  {row.title}
                </button>
              ))}
            </div>

            {/* Category lists */}
            <div className="gallery-categories-wrapper">
              {galleryRows
                .filter(row => galleryFilter === 'all' || galleryFilter === row.title)
                .map((row) => (
                  <section key={row.title} className="category-section">
                    <div className="category-header">
                      <div>
                        <div className="category-title">{row.title}</div>
                        <div className="category-sub">{row.sub}</div>
                      </div>
                    </div>

                    <div className="category-cards-scroll-box" style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '12px' }}>
                      {PALETTES.slice(0, 5).map((pal, palIdx) => (
                        <div key={palIdx} className="gallery-card" style={{ flexShrink: 0, width: '280px' }}>
                          <GalleryCardCanvas pattern={PATTERNS[row.patternIdx]} palette={pal} customPalettes={customPalettes} />
                          
                          <div className="gallery-card-info">
                            <div className="gallery-card-name">{row.title} • {pal.name}</div>
                            <div className="card-quick-actions">
                              <button
                                className="card-action-btn btn-card-edit"
                                onClick={() => {
                                  setCurrentPattern(row.patternIdx);
                                  setPaletteIdx(palIdx);
                                  setFitMode('crop');
                                  setActiveTab('studio');
                                }}
                              >
                                Customize
                              </button>
                              <button
                                className="card-action-btn btn-card-download"
                                onClick={() => downloadWallpaper(3840, 2160, `${row.title}-${pal.name}-4K.png`)}
                              >
                                Download 4K
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
            </div>
          </main>
        )}

        {/* ── VIEW 2: STUDIO EDITOR VIEW ── */}
        {activeTab === 'studio' && (
          <main className="view-container active" id="viewStudio" style={{ padding: 0 }}>
            <div className="main-layout">
              
              {/* Left Preview Workspace */}
              <div className="preview-area">
                <div className="preview-top-toolbar">
                  <div className="device-segmented-control">
                    <button
                      className={`device-tab ${deviceMode === 'all' ? 'active' : ''}`}
                      onClick={() => setDeviceMode('all')}
                    >
                      All Devices
                    </button>
                    <button
                      className={`device-tab ${deviceMode === 'desktop' ? 'active' : ''}`}
                      onClick={() => setDeviceMode('desktop')}
                    >
                      Desktop
                    </button>
                    <button
                      className={`device-tab ${deviceMode === 'tablet' ? 'active' : ''}`}
                      onClick={() => setDeviceMode('tablet')}
                    >
                      Tablet
                    </button>
                    <button
                      className={`device-tab ${deviceMode === 'mobile' ? 'active' : ''}`}
                      onClick={() => setDeviceMode('mobile')}
                    >
                      Mobile
                    </button>
                  </div>

                  <div className="toolbar-right-actions">
                    <div className="zoom-crop-toolbar">
                      <button
                        className={`action-pill-btn ${fitMode === 'crop' ? 'active' : ''}`}
                        onClick={() => setFitMode('crop')}
                      >
                        Crop
                      </button>
                      <button
                        className={`action-pill-btn ${fitMode === 'fit' ? 'active' : ''}`}
                        onClick={() => setFitMode('fit')}
                      >
                        Fit
                      </button>
                      <div className="divider-v"></div>
                      <button
                        className="icon-zoom-btn"
                        onClick={() => setZoomLevel(Math.max(40, zoomLevel - 10))}
                      >
                        -
                      </button>
                      <span className="zoom-percentage-badge">{zoomLevel}%</span>
                      <button
                        className="icon-zoom-btn"
                        onClick={() => setZoomLevel(Math.min(180, zoomLevel + 10))}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className={`preview-container mode-${deviceMode}`}>
                  {(deviceMode === 'all' || deviceMode === 'desktop') && (
                    <div className="preview-desktop-wrap device-preview-card">
                      <div className="preview-label">
                        Desktop 4K
                        <Tooltip text="Draws a standard 16:9 canvas preset matching monitor resolutions.">
                          <span className="info-icon">i</span>
                        </Tooltip>
                      </div>
                      <canvas ref={desktopCanvasRef} width="960" height="540" />
                    </div>
                  )}

                  {(deviceMode === 'all' || deviceMode === 'tablet' || deviceMode === 'mobile') && (
                    <div className="preview-secondary-group">
                      {(deviceMode === 'all' || deviceMode === 'tablet') && (
                        <div className="preview-tablet-wrap device-preview-card">
                          <div className="preview-label">
                            Tablet
                            <Tooltip text="Draws a standard 3:4 canvas preset matching iPad/Tablet aspect ratios.">
                              <span className="info-icon">i</span>
                            </Tooltip>
                          </div>
                          <canvas ref={tabletCanvasRef} width="600" height="800" />
                        </div>
                      )}

                      {(deviceMode === 'all' || deviceMode === 'mobile') && (
                        <div className="preview-mobile-wrap device-preview-card">
                          <div className="preview-label">
                            Mobile
                            <Tooltip text="Draws a standard 9:19.5 viewport matching newer smartphones.">
                              <span className="info-icon">i</span>
                            </Tooltip>
                          </div>
                          <canvas ref={mobileCanvasRef} width="290" height="628" />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Color palettes row */}
                <div className="bottom-palette-bar">
                  <div className="control-group width-full">
                    <div className="control-header-row">
                      <div className="header-title-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="control-label">Curated Color Palettes</div>
                        <button className="btn-create-palette-header" onClick={addCustomPalette}>
                          + Add Palette
                        </button>
                      </div>

                      <div className="variation-actions">
                        <button className="btn-action simple-randomizer-btn" onClick={runRandomizer}>
                          <svg className="black-dice-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="4" ry="4"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"></circle>
                            <circle cx="15.5" cy="8.5" r="1.5" fill="currentColor"></circle>
                            <circle cx="12" cy="12" r="1.5" fill="currentColor"></circle>
                            <circle cx="8.5" cy="15.5" r="1.5" fill="currentColor"></circle>
                            <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor"></circle>
                          </svg>
                          <span className="randomizer-text">Randomizer</span>
                        </button>

                        <button className="btn-action btn-variation" onClick={randomizeSeed}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 4 23 10 17 10"></polyline>
                            <polyline points="1 20 1 14 7 14"></polyline>
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                          </svg>
                          <span>Variation</span>
                        </button>
                      </div>
                    </div>

                    <div className="palette-grid">
                      {PALETTES.map((p, idx) => (
                        <button
                          key={idx}
                          className={`palette-swatch ${paletteIdx === idx ? 'active' : ''}`}
                          onClick={() => setPaletteIdx(idx)}
                          title={p.name}
                        >
                          {p.colors.slice(0, 4).map((c, cidx) => (
                            <span key={cidx} style={{ backgroundColor: c }} />
                          ))}
                        </button>
                      ))}

                      {customPalettes.map((p, idx) => {
                        const globalIdx = PALETTES.length + idx;
                        return (
                          <button
                            key={globalIdx}
                            className={`palette-swatch ${paletteIdx === globalIdx ? 'active' : ''}`}
                            onClick={() => setPaletteIdx(globalIdx)}
                            title={p.name}
                          >
                            {p.colors.slice(0, 4).map((c, cidx) => (
                              <span key={cidx} style={{ backgroundColor: c }} />
                            ))}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Sidebar Controls */}
              <div className="controls">
                <div className="control-group">
                  <div className="control-label">
                    Pattern
                    <Tooltip text="Select the mathematical algorithm that generates the shapes.">
                      <span className="info-icon">i</span>
                    </Tooltip>
                  </div>
                  <div className="style-grid">
                    {PATTERNS.map((p, idx) => (
                      <button
                        key={p}
                        className={`style-btn ${currentPattern === idx ? 'active' : ''}`}
                        onClick={() => setCurrentPattern(idx)}
                        title={PATTERN_LABELS[p]}
                      >
                        <MiniCanvas pattern={p} palette={activePalette} customPalettes={customPalettes} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="control-group">
                  <div className="control-label">
                    Mode
                    <Tooltip text="Toggle theme colors to fit bright or low light conditions.">
                      <span className="info-icon">i</span>
                    </Tooltip>
                  </div>
                  <div className="mode-toggle">
                    <button
                      className={`mode-btn ${!isLightTheme ? 'active' : ''}`}
                      onClick={() => setIsLightTheme(false)}
                    >
                      <span className="mode-icon mode-icon-dark"></span>
                      Dark
                    </button>
                    <button
                      className={`mode-btn ${isLightTheme ? 'active' : ''}`}
                      onClick={() => setIsLightTheme(true)}
                    >
                      <span className="mode-icon mode-icon-light"></span>
                      Light
                    </button>
                  </div>
                </div>

                <div className="control-group">
                  <div className="control-label">
                    Direction
                    <Tooltip text="Swaps background and foreground colors inside the design layers.">
                      <span className="info-icon">i</span>
                    </Tooltip>
                  </div>
                  <div className="mode-toggle">
                    <button
                      className={`mode-btn ${!isInverted ? 'active' : ''}`}
                      onClick={() => setIsInverted(false)}
                    >
                      Normal
                    </button>
                    <button
                      className={`mode-btn ${isInverted ? 'active' : ''}`}
                      onClick={() => setIsInverted(true)}
                    >
                      Inverted
                    </button>
                  </div>
                </div>

                <div className="control-group native-wallpaper-group" style={{ display: 'block', marginTop: '10px' }}>
                  <div className="control-label">Desktop Wallpaper</div>
                  <button className="btn-custom-export-prominent text-center w-full" onClick={applyWallpaper} style={{ background: 'var(--accent)', color: 'var(--bg)', border: '1.5px solid var(--accent)' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="12" rx="2" ry="2"></rect>
                      <line x1="12" y1="15" x2="12" y2="21"></line>
                      <line x1="8" y1="21" x2="16" y2="21"></line>
                    </svg>
                    <span>Apply as Active Wallpaper</span>
                  </button>
                </div>

                <div className="control-group export-group" style={{ marginTop: '20px' }}>
                  <div className="control-label">Export Resolutions</div>
                  <button className="btn-custom-export-prominent" onClick={() => setIsCustomModalActive(true)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                    <span>Custom Resolution & Units...</span>
                  </button>

                  {/* Desktop Dropdown */}
                  <div className="export-dropdown-wrapper">
                    <div className="split-export-btn">
                      <button
                        className="btn-export btn-main"
                        onClick={() => downloadWallpaper(5760, 3240, `wallpaper-desktop-5760x3240-${seed}.png`)}
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M8 2v8M5 7l3 3 3-3M3 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Download Desktop
                      </button>
                      <button
                        className={`btn-export-arrow ${dropdownOpen === 'desktop' ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDropdownOpen(dropdownOpen === 'desktop' ? null : 'desktop');
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                    {dropdownOpen === 'desktop' && (
                      <div className="ratio-menu active" style={{ display: 'block' }}>
                        <button onClick={() => { downloadWallpaper(5760, 3240, `wallpaper-desktop-5760x3240-${seed}.png`); setDropdownOpen(null); }}>5760 x 3240 (1.5x 4K)</button>
                        <button onClick={() => { downloadWallpaper(3840, 2160, `wallpaper-desktop-3840x2160-${seed}.png`); setDropdownOpen(null); }}>3840 x 2160 (4K UHD)</button>
                        <button onClick={() => { downloadWallpaper(2560, 1440, `wallpaper-desktop-2560x1440-${seed}.png`); setDropdownOpen(null); }}>2560 x 1440 (2K QHD)</button>
                        <button onClick={() => { downloadWallpaper(1920, 1080, `wallpaper-desktop-1920x1080-${seed}.png`); setDropdownOpen(null); }}>1920 x 1080 (FHD)</button>
                      </div>
                    )}
                    <div className="size-hint">5760 x 3240 px (1.5x 4K)</div>
                  </div>

                  {/* Tablet Dropdown */}
                  <div className="export-dropdown-wrapper">
                    <div className="split-export-btn">
                      <button
                        className="btn-export btn-main"
                        onClick={() => downloadWallpaper(3096, 4128, `wallpaper-tablet-3096x4128-${seed}.png`)}
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M8 2v8M5 7l3 3 3-3M3 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Download Tablet
                      </button>
                      <button
                        className={`btn-export-arrow ${dropdownOpen === 'tablet' ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDropdownOpen(dropdownOpen === 'tablet' ? null : 'tablet');
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                    {dropdownOpen === 'tablet' && (
                      <div className="ratio-menu active" style={{ display: 'block' }}>
                        <button onClick={() => { downloadWallpaper(3096, 4128, `wallpaper-tablet-3096x4128-${seed}.png`); setDropdownOpen(null); }}>3096 x 4128 (1.5x Tablet)</button>
                        <button onClick={() => { downloadWallpaper(2064, 2752, `wallpaper-tablet-2064x2752-${seed}.png`); setDropdownOpen(null); }}>iPad Pro 13" (2064x2752)</button>
                        <button onClick={() => { downloadWallpaper(1640, 2360, `wallpaper-tablet-1640x2360-${seed}.png`); setDropdownOpen(null); }}>iPad Air 11" (1640x2360)</button>
                      </div>
                    )}
                    <div className="size-hint">3096 x 4128 px (1.5x Tablet)</div>
                  </div>

                  {/* Mobile Dropdown */}
                  <div className="export-dropdown-wrapper">
                    <div className="split-export-btn">
                      <button
                        className="btn-export btn-main"
                        onClick={() => downloadWallpaper(1935, 4194, `wallpaper-mobile-1935x4194-${seed}.png`)}
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M8 2v8M5 7l3 3 3-3M3 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Download Mobile
                      </button>
                      <button
                        className={`btn-export-arrow ${dropdownOpen === 'mobile' ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDropdownOpen(dropdownOpen === 'mobile' ? null : 'mobile');
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                    {dropdownOpen === 'mobile' && (
                      <div className="ratio-menu active" style={{ display: 'block' }}>
                        <button onClick={() => { downloadWallpaper(1935, 4194, `wallpaper-mobile-1935x4194-${seed}.png`); setDropdownOpen(null); }}>1935 x 4194 (1.5x Mobile)</button>
                        <button onClick={() => { downloadWallpaper(1290, 2796, `wallpaper-mobile-1290x2796-${seed}.png`); setDropdownOpen(null); }}>iPhone 16 Pro Max</button>
                        <button onClick={() => { downloadWallpaper(1179, 2556, `wallpaper-mobile-1179x2556-${seed}.png`); setDropdownOpen(null); }}>iPhone 16 Pro</button>
                      </div>
                    )}
                    <div className="size-hint">1935 x 4194 px (1.5x Mobile)</div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* ── VIEW 3: HELP & SHORTCUTS VIEW ── */}
        {activeTab === 'help' && (
          <main className="view-container active" style={{ padding: '40px 24px', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '16px' }}>Offline Help & Shortcut Center</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '1.05rem', lineHeight: '1.6' }}>
              Welcome to the local desktop environment dashboard. Here you can review hotkeys, re-run onboarding guides, and manage offline preferences.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
              
              {/* Keyboard shortcuts card */}
              <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--card-shadow)' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '16px' }}>Keyboard Shortcuts</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <li style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Randomize Seed</span>
                    <kbd style={{ background: 'var(--hover-bg)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>Spacebar</kbd>
                  </li>
                  <li style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>High-Res PNG Export</span>
                    <kbd style={{ background: 'var(--hover-bg)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>Ctrl + S</kbd>
                  </li>
                </ul>
              </div>

              {/* Onboarding replay card */}
              <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--card-shadow)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px' }}>Interactive Guide</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                    Replay the introduction tour popup to review how to use custom multi-device viewports.
                  </p>
                </div>
                <button
                  className="modal-download-btn-fixed"
                  style={{ width: '100%', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  onClick={replayOnboarding}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 4v6h6M23 20v-6h-6"></path>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                  </svg>
                  <span>Launch Walkthrough Tour</span>
                </button>
              </div>
            </div>

            {/* Offline Engine details */}
            <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--card-shadow)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '12px' }}>Procedural Vector Math Engine</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '12px' }}>
                WPS Desktop runs completely offline. It creates layout contours using seed-based fractional Brownian noise matrices combined with cubic math interpolation functions.
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'var(--hover-bg)', border: '1px solid var(--border)', borderRadius: '100px', color: 'var(--text-muted)' }}>Local Win32 APIs</span>
                <span style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'var(--hover-bg)', border: '1px solid var(--border)', borderRadius: '100px', color: 'var(--text-muted)' }}>Offline Math Rendering</span>
                <span style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'var(--hover-bg)', border: '1px solid var(--border)', borderRadius: '100px', color: 'var(--text-muted)' }}>Zero Cloud Latency</span>
              </div>
            </div>
          </main>
        )}
      </div>

      {/* ── DEVICE-BASED CUSTOM RESOLUTION GENERATOR MODAL ── */}
      {isCustomModalActive && (
        <div className="modal-overlay active" id="customModal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110 }}>
          <div className="custom-modal-card-lg">
            <button className="modal-close" onClick={() => setIsCustomModalActive(false)}>&times;</button>
            <h3>Device-Based Custom Resolution Generator</h3>
            <p className="custom-modal-sub">Select your target device category or input custom dimensions.</p>

            <div className="custom-modal-body">
              <div className="custom-inputs-column">
                <div className="input-group">
                  <label>Target Device Category</label>
                  <select
                    className="custom-select"
                    value={modalCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                  >
                    <option value="desktop">Desktop Monitors & Displays</option>
                    <option value="tablet">Tablets & iPads</option>
                    <option value="mobile">Mobile Devices & Smartphones</option>
                    <option value="print">Print & Physical Media (300 DPI)</option>
                    <option value="custom">Custom Dimensions</option>
                  </select>
                </div>

                {modalCategory !== 'custom' && (
                  <div className="input-group" id="devicePresetGroup">
                    <label>Device Preset</label>
                    <select
                      className="custom-select"
                      value={modalPresetIdx}
                      onChange={(e) => handlePresetChange(parseInt(e.target.value))}
                    >
                      {(DEVICE_PRESETS[modalCategory] || DEVICE_PRESETS.desktop).map((p, idx) => (
                        <option key={idx} value={idx}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="input-row">
                  <div className="input-group">
                    <label id="widthLabel">Width (px)</label>
                    <input
                      type="number"
                      value={customWidth}
                      onChange={(e) => {
                        setCustomWidth(parseInt(e.target.value) || 100);
                        setModalCategory('custom');
                      }}
                      min="100"
                      max="10000"
                      className="custom-input"
                    />
                  </div>
                  <div className="input-group">
                    <label id="heightLabel">Height (px)</label>
                    <input
                      type="number"
                      value={customHeight}
                      onChange={(e) => {
                        setCustomHeight(parseInt(e.target.value) || 100);
                        setModalCategory('custom');
                      }}
                      min="100"
                      max="10000"
                      className="custom-input"
                    />
                  </div>
                </div>

                <div className="calculated-info">
                  Target Output: {customWidth} x {customHeight} pixels
                </div>

                <button
                  className="modal-download-btn-fixed"
                  onClick={() => {
                    downloadWallpaper(customWidth, customHeight, `wallpaper-custom-${customWidth}x${customHeight}-${seed}.png`);
                    setIsCustomModalActive(false);
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2v8M5 7l3 3 3-3M3 12h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Download Custom Device Wallpaper</span>
                </button>
              </div>

              <div className="custom-preview-column">
                <div className="preview-label">Live Device Aspect Preview</div>
                <div className="custom-canvas-box">
                  <canvas ref={modalCanvasRef} width="380" height="214" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── INTERACTIVE ONBOARDING WALKTHROUGH POPUP ── */}
      {showOnboarding && (
        <div className="modal-overlay active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120 }}>
          <div className="onboarding-card">
            <div className="onboarding-slides">
              <div className="logo-mark" style={{ margin: '0 auto 8px auto', float: 'none', background: 'var(--accent)', color: 'var(--bg)' }}>WPS</div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 600 }}>{onboardingSlides[onboardingStep].title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5', margin: '8px 0' }}>
                {onboardingSlides[onboardingStep].desc}
              </p>
            </div>

            <div className="onboarding-step-indicator">
              {onboardingSlides.map((_, idx) => (
                <span
                  key={idx}
                  className={`onboarding-dot ${onboardingStep === idx ? 'active' : ''}`}
                />
              ))}
            </div>

            <div className="onboarding-buttons">
              <button
                className="onboarding-btn skip"
                onClick={() => {
                  localStorage.setItem('ws_onboarding_completed', 'true');
                  setShowOnboarding(false);
                  showToast("Tutorial skipped.");
                }}
              >
                Skip
              </button>
              <button
                className="onboarding-btn next"
                onClick={handleOnboardingNext}
              >
                {onboardingSlides[onboardingStep].button}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST NOTIFICATIONS ── */}
      <div className={`toast-notification ${isToastVisible ? 'visible' : ''}`}>
        <svg className="toast-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>{toastMessage}</span>
      </div>
    </div>
  );
}
