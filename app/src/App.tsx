import { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import {
  DESKTOP_W,
  DESKTOP_H,
  TABLET_W,
  TABLET_H,
  MOBILE_W,
  MOBILE_H,
  PALETTES,
  PATTERNS,
  PATTERN_LABELS
} from './utils/constants';
import type { Palette, PatternType } from './utils/constants';
import { drawPattern } from './utils/patterns';

export default function App() {
  // ── CORE STATE ──
  const [pattern, setPattern] = useState<PatternType>('flowing-hills');
  const [paletteIdx, setPaletteIdx] = useState<number>(0);
  const [seed, setSeed] = useState<number>(12345);
  const [zoom, setZoom] = useState<number>(100);
  const [fitMode, setFitMode] = useState<'crop' | 'fit'>('crop');
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isInverted, setIsInverted] = useState<boolean>(false);
  const [isLightTheme, setIsLightTheme] = useState<boolean>(false);
  
  // Custom palettes state loaded from localStorage
  const [customPalettes, setCustomPalettes] = useState<Palette[]>(() => {
    try {
      const saved = localStorage.getItem('ws_custom_palettes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

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

  // ── THEME SWITCHER ──
  const toggleTheme = () => {
    const newTheme = !isLightTheme;
    setIsLightTheme(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    showToast(`Switched to ${newTheme ? 'Light' : 'Dark'} Theme`);
  };

  // ── CANVAS REFERENCE & DRAWING ──
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Retrieve width and height based on device mode
  const getDimensions = () => {
    switch (deviceMode) {
      case 'desktop':
        return { w: DESKTOP_W, h: DESKTOP_H };
      case 'tablet':
        return { w: TABLET_W, h: TABLET_H };
      case 'mobile':
        return { w: MOBILE_W, h: MOBILE_H };
    }
  };

  const { w: nativeW, h: nativeH } = getDimensions();

  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resolve active palette colors (custom or preset)
    const activePalette = paletteIdx >= PALETTES.length
      ? customPalettes[paletteIdx - PALETTES.length]
      : PALETTES[paletteIdx];

    if (!activePalette) return;

    drawPattern(
      ctx,
      nativeW,
      nativeH,
      pattern,
      activePalette,
      seed,
      zoom,
      fitMode,
      isInverted,
      customPalettes
    );
  };

  useEffect(() => {
    redraw();
  }, [pattern, paletteIdx, seed, zoom, fitMode, deviceMode, isInverted, customPalettes]);

  // ── HOTKEYS ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space to randomize seed
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        randomizeSeed();
      }
      // Ctrl+S / Cmd+S to export
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        exportPNG();
      }
      // Ctrl+D / Cmd+D to toggle theme
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        toggleTheme();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [seed, isLightTheme]);

  // ── ACTIONS ──
  const randomizeSeed = () => {
    const nextSeed = Math.floor(Math.random() * 9999999);
    setSeed(nextSeed);
    showToast("Procedural seed randomized!");
  };

  const applyWallpaper = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const base64Data = canvas.toDataURL('image/png');

    // Safe execution block checks for Tauri environment
    const isTauriEnv = (window as any).__TAURI_INTERNALS__ !== undefined || (window as any).__TAURI__ !== undefined;

    if (isTauriEnv) {
      try {
        showToast("Setting wallpaper...");
        await invoke<string>('set_desktop_wallpaper', { base64Data });
        showToast("Wallpaper successfully set!");
      } catch (err) {
        showToast("Error setting wallpaper: " + err);
      }
    } else {
      showToast("Native system actions require the desktop app!");
    }
  };

  const exportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `Wallpaper-${pattern}-${seed}.png`;
    link.href = url;
    link.click();
    showToast("Wallpaper PNG exported successfully!");
  };

  const copyBase64 = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    navigator.clipboard.writeText(url)
      .then(() => showToast("Base64 string copied to clipboard!"))
      .catch(() => showToast("Failed to copy string."));
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
    showToast("Custom palette added successfully!");
  };

  // ── VIEWPORT SIZE SCALE CALCULATION ──
  const viewportStyle = () => {
    const maxViewportW = 680;
    const maxViewportH = 460;
    const ratio = nativeW / nativeH;
    
    let displayW = maxViewportW;
    let displayH = displayW / ratio;

    if (displayH > maxViewportH) {
      displayH = maxViewportH;
      displayW = displayH * ratio;
    }

    return {
      width: `${Math.round(displayW)}px`,
      height: `${Math.round(displayH)}px`
    };
  };

  return (
    <div className="desktop-layout">
      {/* ── COLUMN 1: LEFT CONTROLS ── */}
      <aside className="sidebar sidebar-left">
        <div className="sidebar-header">
          <svg className="logo-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"></rect>
            <path d="M12 3v18"></path>
            <path d="M3 12h18"></path>
          </svg>
          <h1 className="logo-title">Wallpaper Studio</h1>
          <span className="logo-badge">App</span>
        </div>

        <div className="sidebar-content">
          {/* Pattern Picker */}
          <div className="control-group">
            <label className="control-label">Pattern Style</label>
            <select
              className="select-input"
              value={pattern}
              onChange={(e) => setPattern(e.target.value as PatternType)}
            >
              {PATTERNS.map(p => (
                <option key={p} value={p}>{PATTERN_LABELS[p]}</option>
              ))}
            </select>
          </div>

          {/* Seed Input */}
          <div className="control-group">
            <label className="control-label">Procedural Seed</label>
            <input
              type="text"
              className="text-input"
              value={seed}
              onChange={(e) => {
                const parsed = parseInt(e.target.value);
                setSeed(isNaN(parsed) ? 0 : parsed);
              }}
            />
          </div>

          {/* Zoom Level */}
          <div className="control-group">
            <label className="control-label">Zoom Scale</label>
            <div className="slider-container">
              <input
                type="range"
                className="range-input"
                min="40"
                max="180"
                value={zoom}
                onChange={(e) => setZoom(parseInt(e.target.value))}
              />
              <span className="slider-val">{zoom}%</span>
            </div>
          </div>

          {/* Fit Mode */}
          <div className="control-group">
            <label className="control-label">Fit Mode</label>
            <select
              className="select-input"
              value={fitMode}
              onChange={(e) => setFitMode(e.target.value as 'crop' | 'fit')}
            >
              <option value="crop">Crop Fill (Full bleed)</option>
              <option value="fit">Scale to Fit</option>
            </select>
          </div>

          {/* Color Modifiers */}
          <div className="control-group">
            <label className="control-label">Invert Palette Direction</label>
            <button
              className={`btn-action btn-secondary ${isInverted ? 'active' : ''}`}
              onClick={() => setIsInverted(!isInverted)}
              style={{
                borderColor: isInverted ? 'var(--accent)' : '',
                color: isInverted ? 'var(--text-h)' : ''
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12A9 9 0 0 1 12 21a9.003 9.003 0 0 1-8.31-5.5"></path>
                <path d="M22 2v6h-6"></path>
                <path d="M21.26 15A9 9 0 0 0 12 3a9.003 9.003 0 0 0-8.31 5.5"></path>
                <path d="M2 22v-6h6"></path>
              </svg>
              <span>{isInverted ? "Inverted Colors" : "Invert Palette"}</span>
            </button>
          </div>

          {/* Dark / Light Mode Switcher */}
          <div className="control-group" style={{ marginTop: 'auto' }}>
            <label className="control-label">Appearance</label>
            <button className="btn-action btn-secondary" onClick={toggleTheme}>
              {isLightTheme ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="4"></circle>
                    <path d="M12 2v2"></path>
                    <path d="M12 20v2"></path>
                    <path d="M4.93 4.93l1.41 1.41"></path>
                    <path d="M17.66 17.66l1.41 1.41"></path>
                    <path d="M2 12h2"></path>
                    <path d="M20 12h2"></path>
                    <path d="M6.34 17.66l-1.41 1.41"></path>
                    <path d="M19.07 4.93l-1.41 1.41"></path>
                  </svg>
                  <span>Light Theme</span>
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                  </svg>
                  <span>Dark Theme</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* ── COLUMN 2: CENTER VIEWPORT WORKSPACE ── */}
      <main className="workspace">
        <div className="workspace-header">
          <div className="tabs-container">
            <button
              className={`tab-btn ${deviceMode === 'desktop' ? 'active' : ''}`}
              onClick={() => setDeviceMode('desktop')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
              <span>Desktop</span>
            </button>
            <button
              className={`tab-btn ${deviceMode === 'tablet' ? 'active' : ''}`}
              onClick={() => setDeviceMode('tablet')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                <line x1="12" y1="18" x2="12.01" y2="18"></line>
              </svg>
              <span>Tablet</span>
            </button>
            <button
              className={`tab-btn ${deviceMode === 'mobile' ? 'active' : ''}`}
              onClick={() => setDeviceMode('mobile')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                <line x1="12" y1="18" x2="12.01" y2="18"></line>
              </svg>
              <span>iPhone</span>
            </button>
          </div>

          <span className="resolution-indicator">{nativeW} × {nativeH} px</span>
        </div>

        <div className="viewport-area">
          <div className="preview-wrapper" style={viewportStyle()}>
            <canvas
              ref={canvasRef}
              className="preview-canvas"
              width={nativeW}
              height={nativeH}
            />
          </div>
        </div>
      </main>

      {/* ── COLUMN 3: RIGHT PANEL (PALETTES & CTAS) ── */}
      <aside className="sidebar sidebar-right">
        <div className="sidebar-header">
          <svg className="logo-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.03345 19.1766 5.09705 19.4312 5.02102 19.6724C4.81232 20.3344 4.54228 20.9575 4.21857 21.5323C4.05315 21.826 4.29828 22 4.63673 22H12Z"></path>
            <circle cx="7.5" cy="10.5" r="1.5" fill="currentColor"></circle>
            <circle cx="11.5" cy="7.5" r="1.5" fill="currentColor"></circle>
            <circle cx="16.5" cy="9.5" r="1.5" fill="currentColor"></circle>
            <circle cx="15.5" cy="14.5" r="1.5" fill="currentColor"></circle>
          </svg>
          <h2 className="logo-title" style={{ fontSize: '1rem' }}>Aesthetics</h2>
        </div>

        <div className="sidebar-content">
          {/* Preset Palettes */}
          <div className="control-group">
            <label className="control-label">Color Swatches</label>
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

              <button
                className="palette-swatch-add"
                onClick={addCustomPalette}
                title="Add Custom Palette"
              >
                +
              </button>
            </div>
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Seed Randomizer */}
            <button className="btn-action btn-secondary" onClick={randomizeSeed}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
              </svg>
              <span>Randomize (Space)</span>
            </button>

            {/* Copy base64 string */}
            <button className="btn-action btn-secondary" onClick={copyBase64}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>Copy Base64 URL</span>
            </button>

            {/* Export Wallpaper file */}
            <button className="btn-action btn-secondary" onClick={exportPNG}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Export PNG (Ctrl+S)</span>
            </button>

            {/* Apply active wallpaper natively */}
            <button className="btn-action" onClick={applyWallpaper}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
                <line x1="15" y1="3" x2="15" y2="21"></line>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="3" y1="15" x2="21" y2="15"></line>
              </svg>
              <span>Set Active Wallpaper</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── TOAST TO NOTIFY NATIVE ACTIONS ── */}
      <div className={`toast-notification ${isToastVisible ? 'visible' : ''}`}>
        <svg className="toast-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>{toastMessage}</span>
      </div>
    </div>
  );
}
