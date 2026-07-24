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

export default function App() {
  // ── CORE STATE ──
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

  // ── CUSTOM MODAL STATE ──
  const [isCustomModalActive, setIsCustomModalActive] = useState<boolean>(false);
  const [modalCategory, setModalCategory] = useState<string>('desktop');
  const [modalPresetIdx, setModalPresetIdx] = useState<number>(0);
  const [customWidth, setCustomWidth] = useState<number>(3840);
  const [customHeight, setCustomHeight] = useState<number>(2160);

  // ── TOAST NOTIFICATIONS ──
  const [toastMessage, setToastMessage] = useState<string>('');
  const [isToastVisible, setIsToastVisible] = useState<boolean>(false);
  const toastTimeoutRef = useRef<number | null>(null);

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
    if (!activePalette) return;

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
  }, [currentPattern, paletteIdx, seed, zoomLevel, fitMode, deviceMode, isInverted, customPalettes]);

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
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        randomizeSeed();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        downloadWallpaper(3840, 2160, `Wallpaper-Desktop-${PATTERNS[currentPattern]}.png`);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPattern, paletteIdx, seed, zoomLevel, fitMode, isInverted]);

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

  // Dropdown states for each category
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  // Manage preset selections inside the modal
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

  return (
    <main className="view-container active" id="viewStudio" style={{ padding: 0 }}>
      <div className="main-layout">
        
        {/* ── LEFT PREVIEW AREA ── */}
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

          {/* Previews container */}
          <div className={`preview-container mode-${deviceMode}`}>
            {(deviceMode === 'all' || deviceMode === 'desktop') && (
              <div className="preview-desktop-wrap device-preview-card">
                <div className="preview-label">Desktop 4K</div>
                <canvas ref={desktopCanvasRef} width="960" height="540" />
              </div>
            )}

            {(deviceMode === 'all' || deviceMode === 'tablet' || deviceMode === 'mobile') && (
              <div className="preview-secondary-group">
                {(deviceMode === 'all' || deviceMode === 'tablet') && (
                  <div className="preview-tablet-wrap device-preview-card">
                    <div className="preview-label">Tablet</div>
                    <canvas ref={tabletCanvasRef} width="600" height="800" />
                  </div>
                )}

                {(deviceMode === 'all' || deviceMode === 'mobile') && (
                  <div className="preview-mobile-wrap device-preview-card">
                    <div className="preview-label">Mobile</div>
                    <canvas ref={mobileCanvasRef} width="290" height="628" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Palettes Bar */}
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

              {/* Swatches ribbon grid */}
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

        {/* ── RIGHT CONTROLS SIDEBAR ── */}
        <div className="controls">
          <div className="control-group">
            <div className="control-label">Pattern</div>
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
            <div className="control-label">Mode</div>
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

          {/* Color Invert option */}
          <div className="control-group">
            <div className="control-label">Direction</div>
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

          {/* Native apply desktop active wallpaper wrapper */}
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

          {/* Export resolutions dropdown selectors */}
          <div className="control-group export-group" style={{ marginTop: '20px' }}>
            <div className="control-label">Export Resolutions</div>
            <button className="btn-custom-export-prominent" onClick={() => setIsCustomModalActive(true)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              <span>Custom Resolution & Units...</span>
            </button>

            {/* Desktop dropdown */}
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
                  <button onClick={() => downloadWallpaper(5760, 3240, `wallpaper-desktop-5760x3240-${seed}.png`)}>5760 x 3240 (1.5x 4K)</button>
                  <button onClick={() => downloadWallpaper(3840, 2160, `wallpaper-desktop-3840x2160-${seed}.png`)}>3840 x 2160 (4K UHD)</button>
                  <button onClick={() => downloadWallpaper(2560, 1440, `wallpaper-desktop-2560x1440-${seed}.png`)}>2560 x 1440 (2K QHD)</button>
                  <button onClick={() => downloadWallpaper(1920, 1080, `wallpaper-desktop-1920x1080-${seed}.png`)}>1920 x 1080 (FHD)</button>
                </div>
              )}
              <div className="size-hint">5760 x 3240 px (1.5x 4K)</div>
            </div>

            {/* Tablet dropdown */}
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
                  <button onClick={() => downloadWallpaper(3096, 4128, `wallpaper-tablet-3096x4128-${seed}.png`)}>3096 x 4128 (1.5x Tablet)</button>
                  <button onClick={() => downloadWallpaper(2064, 2752, `wallpaper-tablet-2064x2752-${seed}.png`)}>2064 x 2752 (iPad Pro 13")</button>
                  <button onClick={() => downloadWallpaper(1640, 2360, `wallpaper-tablet-1640x2360-${seed}.png`)}>1640 x 2360 (iPad Air 11")</button>
                </div>
              )}
              <div className="size-hint">3096 x 4128 px (1.5x Tablet)</div>
            </div>

            {/* Mobile dropdown */}
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
                  <button onClick={() => downloadWallpaper(1935, 4194, `wallpaper-mobile-1935x4194-${seed}.png`)}>1935 x 4194 (1.5x Mobile)</button>
                  <button onClick={() => downloadWallpaper(1290, 2796, `wallpaper-mobile-1290x2796-${seed}.png`)}>1290 x 2796 (iPhone 16 Pro Max)</button>
                  <button onClick={() => downloadWallpaper(1179, 2556, `wallpaper-mobile-1179x2556-${seed}.png`)}>1179 x 2556 (iPhone 16 Pro)</button>
                </div>
              )}
              <div className="size-hint">1935 x 4194 px (1.5x Mobile)</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── DEVICE-BASED CUSTOM RESOLUTION GENERATOR MODAL ── */}
      {isCustomModalActive && (
        <div className="modal-overlay active" id="customModal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

      {/* ── TOAST NOTIFICATIONS ── */}
      <div className={`toast-notification ${isToastVisible ? 'visible' : ''}`}>
        <svg className="toast-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>{toastMessage}</span>
      </div>
    </main>
  );
}
