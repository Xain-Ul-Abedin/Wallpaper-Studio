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
import { StorageService } from './utils/storageService';
import type { SavedState } from './utils/storageService';
import { generate10ShadePalette } from './utils/color';

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

// ── DEFERRED GALLERY CARD CANVAS COMPONENT ──
interface GalleryCardCanvasProps {
  pattern: PatternType;
  palette: Palette;
  customPalettes: Palette[];
}

function GalleryCardCanvas({ pattern, palette, customPalettes }: GalleryCardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    setIsLoaded(false);
    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      drawPattern(ctx, 280, 180, pattern, palette, 888, 100, 'crop', false, customPalettes);
      setIsLoaded(true);
    }, Math.random() * 150 + 50);

    return () => clearTimeout(timer);
  }, [pattern, palette, customPalettes]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '180px', background: 'var(--hover-bg)', borderRadius: '12px 12px 0 0', overflow: 'hidden' }}>
      {!isLoaded && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="startup-spinner" style={{ width: '24px', height: '24px', borderWidth: '2px' }}></div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={280}
        height={180}
        style={{
          width: '100%',
          height: '180px',
          display: 'block',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
      />
    </div>
  );
}

// ── CUSTOM CREATIONS GALLERY CANVAS COMPONENT ──
interface CustomCreationCanvasProps {
  pattern: PatternType;
  palette: Palette;
  seed: number;
  zoomLevel: number;
  fitMode: 'crop' | 'fit';
  isInverted: boolean;
  customPalettes: Palette[];
}

function CustomCreationCanvas({ pattern, palette, seed, zoomLevel, fitMode, isInverted, customPalettes }: CustomCreationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    setIsLoaded(false);
    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      drawPattern(ctx, 280, 180, pattern, palette, seed, zoomLevel, fitMode, isInverted, customPalettes);
      setIsLoaded(true);
    }, Math.random() * 150 + 50);

    return () => clearTimeout(timer);
  }, [pattern, palette, seed, zoomLevel, fitMode, isInverted, customPalettes]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '180px', background: 'var(--hover-bg)', borderRadius: '12px 12px 0 0', overflow: 'hidden' }}>
      {!isLoaded && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="startup-spinner" style={{ width: '24px', height: '24px', borderWidth: '2px' }}></div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={280}
        height={180}
        style={{
          width: '100%',
          height: '180px',
          display: 'block',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
      />
    </div>
  );
}

// ── FEATURED HERO CANVAS COMPONENT (STONE LIGHT SYSTEM) ──
interface FeaturedCanvasProps {
  palette: Palette;
  customPalettes: Palette[];
}

function FeaturedCanvas({ palette, customPalettes }: FeaturedCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    setIsLoaded(false);
    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      drawPattern(ctx, 1920, 1080, 'flowing-hills', palette, 555, 100, 'crop', true, customPalettes);
      setIsLoaded(true);
    }, 80);

    return () => clearTimeout(timer);
  }, [palette, customPalettes]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: 'var(--hover-bg)', overflow: 'hidden', borderRadius: '16px' }}>
      {!isLoaded && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="startup-spinner" style={{ width: '32px', height: '32px', borderWidth: '3.5px' }}></div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={1920}
        height={1080}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.4s ease'
        }}
      />
    </div>
  );
}

// ── STUDIO HISTORY MINI CANVAS COMPONENT ──
interface HistoryCardCanvasProps {
  pattern: PatternType;
  palette: Palette;
  seed: number;
  zoomLevel: number;
  fitMode: 'crop' | 'fit';
  isInverted: boolean;
  customPalettes: Palette[];
}

function HistoryCardCanvas({ pattern, palette, seed, zoomLevel, fitMode, isInverted, customPalettes }: HistoryCardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawPattern(ctx, 120, 80, pattern, palette, seed, zoomLevel, fitMode, isInverted, customPalettes);
  }, [pattern, palette, seed, zoomLevel, fitMode, isInverted, customPalettes]);

  return <canvas ref={canvasRef} width={120} height={80} style={{ width: '120px', height: '80px', display: 'block', borderRadius: '6px' }} />;
}

// ── FULLSCREEN LIGHTBOX CANVAS COMPONENT ──
interface FullscreenCanvasProps {
  pattern: number;
  palette: Palette;
  seed: number;
  zoomLevel: number;
  fitMode: 'crop' | 'fit';
  isInverted: boolean;
  device: 'desktop' | 'tablet' | 'mobile';
  customPalettes: Palette[];
}

function FullscreenCanvas({ pattern, palette, seed, zoomLevel, fitMode, isInverted, device, customPalettes }: FullscreenCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 1920, h = 1080;
    if (device === 'tablet') {
      w = 1200; h = 1600;
    } else if (device === 'mobile') {
      w = 1080; h = 2340;
    }

    drawPattern(ctx, w, h, PATTERNS[pattern], palette, seed, zoomLevel, fitMode, isInverted, customPalettes);
    
    // Clock Overlay logic
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 12;
    ctx.textAlign = 'center';
    
    if (device === 'desktop') {
      ctx.font = '300 68px Lexend, sans-serif';
      ctx.fillText('10:42', w - 240, 160);
      ctx.font = '400 24px Lexend, sans-serif';
      ctx.fillText('Saturday, July 25', w - 240, 210);
    } else if (device === 'tablet') {
      ctx.font = '300 88px Lexend, sans-serif';
      ctx.fillText('10:42', w / 2, 280);
      ctx.font = '400 26px Lexend, sans-serif';
      ctx.fillText('Saturday, July 25', w / 2, 340);
    } else {
      ctx.font = '300 120px Lexend, sans-serif';
      ctx.fillText('10:42', w / 2, 420);
      ctx.font = '400 32px Lexend, sans-serif';
      ctx.fillText('Saturday, July 25', w / 2, 500);
    }
    ctx.restore();
  }, [pattern, palette, seed, zoomLevel, fitMode, isInverted, device, customPalettes]);

  return (
    <canvas 
      ref={canvasRef} 
      width={device === 'tablet' ? 1200 : device === 'mobile' ? 1080 : 1920} 
      height={device === 'tablet' ? 1600 : device === 'mobile' ? 2340 : 1080} 
      style={{ 
        maxWidth: '100%', 
        maxHeight: '65vh', 
        objectFit: 'contain', 
        borderRadius: '10px', 
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)', 
        display: 'block' 
      }} 
    />
  );
}

// ── MAIN APPLICATION COMPONENT ──
export default function App() {
  // ── ROUTING & PAGE TRANSITION STATE ──
  const [activeTab, setActiveTab] = useState<'gallery' | 'studio' | 'help'>('gallery');
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // ── CORE STUDIO STATE ──
  const [currentPattern, setCurrentPattern] = useState<number>(0);
  const [paletteIdx, setPaletteIdx] = useState<number>(0);
  const [seed, setSeed] = useState<number>(12345);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [fitMode, setFitMode] = useState<'crop' | 'fit'>('crop');
  const [deviceMode, setDeviceMode] = useState<'all' | 'desktop' | 'tablet' | 'mobile'>(() => {
    return (typeof window !== 'undefined' && window.innerWidth < 768) ? 'mobile' : 'all';
  });
  const [isInverted, setIsInverted] = useState<boolean>(false); // Wallpaper inversion
  const [isLightTheme, setIsLightTheme] = useState<boolean>(true); // App color scheme
  const [isFullscreenActive, setIsFullscreenActive] = useState<boolean>(false);
  const [fullscreenDevice, setFullscreenDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  // Custom palettes loaded from independent StorageService layer
  const [customPalettes, setCustomPalettes] = useState<Palette[]>(() => StorageService.getCustomPalettes());

  // ── LOCAL DATABASE STATES (HISTORY & PAGINATED CUSTOM GALLERY CREATIONS) ──
  const [history, setHistory] = useState<SavedState[]>(() => StorageService.getHistory());
  const [creationsCount, setCreationsCount] = useState<number>(0); // force reload trigger

  // Paginated search parameters for custom creations list
  const [creationsSearch, setCreationsSearch] = useState<string>('');
  const [creationsPage, setCreationsPage] = useState<number>(0);
  const creationsLimit = 4;

  const { items: paginatedCreations, total: creationsTotal } = StorageService.getCreations(
    creationsSearch,
    creationsLimit,
    creationsPage * creationsLimit
  );
  void creationsCount;

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

  // ── CUSTOM PALETTE STUDIO MODAL STATE ──
  const [isPaletteModalActive, setIsPaletteModalActive] = useState<boolean>(false);
  const [customPaletteName, setCustomPaletteName] = useState<string>("My Custom Palette");
  const [colorPicker1, setColorPicker1] = useState<string>("#0f172a");
  const [colorPicker2, setColorPicker2] = useState<string>("#334155");
  const [colorPicker3, setColorPicker3] = useState<string>("#10b981");

  const tempPaletteColors = generate10ShadePalette(colorPicker1, colorPicker2, colorPicker3);

  // File input ref for restore backup uploads
  const backupInputRef = useRef<HTMLInputElement | null>(null);

  // ── TOAST NOTIFICATIONS ──
  const [toastMessage, setToastMessage] = useState<string>('');
  const [isToastVisible, setIsToastVisible] = useState<boolean>(false);
  const toastTimeoutRef = useRef<number | null>(null);

  // ── GALLERY FILTER STATE ──
  const [galleryFilter, setGalleryFilter] = useState<string>('all');

  const navigateToTab = (tab: 'gallery' | 'studio' | 'help') => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTab(tab);
      setIsTransitioning(false);
    }, 250);
  };

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
  const palettePreviewCanvasRef = useRef<HTMLCanvasElement | null>(null);

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
    if (!activePalette || activeTab !== 'studio' || isTransitioning) return;

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
  }, [currentPattern, paletteIdx, seed, zoomLevel, fitMode, deviceMode, isInverted, customPalettes, activeTab, isTransitioning]);

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

  // ── PALETTE MODAL PREVIEW HOOK ──
  useEffect(() => {
    if (!isPaletteModalActive) return;
    const canvas = palettePreviewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const tempPaletteObj: Palette = {
      name: customPaletteName,
      colors: tempPaletteColors
    };

    drawPattern(ctx, 360, 200, PATTERNS[currentPattern], tempPaletteObj, seed, 100, 'crop', isInverted, customPalettes);
  }, [isPaletteModalActive, customPaletteName, colorPicker1, colorPicker2, colorPicker3, currentPattern, seed, isInverted]);

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
    addToHistoryDirectly(currentPattern, paletteIdx, nextSeed, zoomLevel, fitMode, isInverted);
  };

  const runRandomizer = () => {
    const nextPat = Math.floor(Math.random() * PATTERNS.length);
    const nextPal = Math.floor(Math.random() * (PALETTES.length + customPalettes.length));
    const nextInverted = Math.random() > 0.5;
    const nextSeed = Math.floor(Math.random() * 999999);

    setCurrentPattern(nextPat);
    setPaletteIdx(nextPal);
    setIsInverted(nextInverted);
    setSeed(nextSeed);
    showToast("Pattern, palette & mode randomized!");
    addToHistoryDirectly(nextPat, nextPal, nextSeed, zoomLevel, fitMode, nextInverted);
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

  // ── PALETTE CRUD DELETION ──
  const deleteSelectedPalette = () => {
    if (paletteIdx < PALETTES.length) return;
    const indexToDelete = paletteIdx - PALETTES.length;
    const updated = StorageService.deleteCustomPalette(indexToDelete);
    setCustomPalettes(updated);
    setPaletteIdx(0); // fallback to snow
    showToast("Custom palette deleted successfully.");
  };

  const saveCustomPalette = () => {
    const updated = StorageService.saveCustomPalette({
      name: customPaletteName,
      colors: tempPaletteColors
    });
    setCustomPalettes(updated);
    setPaletteIdx(PALETTES.length + updated.length - 1);
    setIsPaletteModalActive(false);
    showToast("Custom palette added!");
  };

  // ── HISTORY ACTIONS ──
  const addToHistoryDirectly = (pat: number, pal: number, sd: number, zoom: number, fit: 'crop' | 'fit', inverted: boolean) => {
    const updated = StorageService.addHistoryItem({
      patternIdx: pat,
      paletteIdx: pal,
      seed: sd,
      zoomLevel: zoom,
      fitMode: fit,
      isInverted: inverted
    });
    setHistory(updated);
  };

  const addToHistoryCurrent = () => {
    addToHistoryDirectly(currentPattern, paletteIdx, seed, zoomLevel, fitMode, isInverted);
    showToast("Added current layout to recent variations!");
  };

  const loadHistoryItem = (item: SavedState) => {
    setCurrentPattern(item.patternIdx);
    setPaletteIdx(item.paletteIdx);
    setSeed(item.seed);
    setZoomLevel(item.zoomLevel);
    setFitMode(item.fitMode);
    setIsInverted(item.isInverted);
    showToast("Workspace restored from history card.");
  };

  const deleteHistoryItem = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = StorageService.deleteHistoryItem(id);
    setHistory(updated);
    showToast("Variation removed from history.");
  };

  // ── GALLERY ACTIONS (MY CUSTOM CREATIONS) ──
  const addCurrentToGallery = () => {
    const name = prompt("Enter a name for your custom wallpaper creation:", `My Creation #${creationsTotal + 1}`);
    if (name === null) return; // cancelled

    StorageService.addCreation({
      name: name.trim(),
      patternIdx: currentPattern,
      paletteIdx,
      seed,
      zoomLevel,
      fitMode,
      isInverted
    });
    setCreationsCount(prev => prev + 1); // trigger reload
    showToast("Wallpaper successfully added to Gallery catalog!");
  };

  const addHistoryItemToGallery = (item: SavedState, e: React.MouseEvent) => {
    e.stopPropagation();
    const name = prompt("Enter a name for your custom wallpaper creation:", `My Creation #${creationsTotal + 1}`);
    if (name === null) return; // cancelled

    StorageService.addCreation({
      ...item,
      name: name.trim()
    });
    setCreationsCount(prev => prev + 1); // trigger reload
    showToast("Variation added to Gallery catalog!");
  };

  const deleteFromGallery = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    StorageService.deleteCreation(id);
    setCreationsCount(prev => prev + 1); // trigger reload
    // If the active page is suddenly out of items, shift back
    if (creationsPage > 0 && paginatedCreations.length <= 1) {
      setCreationsPage(creationsPage - 1);
    }
    showToast("Creation removed from gallery.");
  };

  const loadGalleryCreation = (item: SavedState) => {
    setCurrentPattern(item.patternIdx);
    setPaletteIdx(item.paletteIdx);
    setSeed(item.seed);
    setZoomLevel(item.zoomLevel);
    setFitMode(item.fitMode);
    setIsInverted(item.isInverted);
    setActiveTab('studio');
    showToast(`Loaded "${item.name}" in Studio editor.`);
  };

  // ── PORTABILITY & SYNC BACKUP UTILITIES ──
  const exportDataBackup = () => {
    const backupStr = StorageService.exportBackup();
    const blob = new Blob([backupStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `WPS_Backup_${Date.now()}.json`;
    link.href = url;
    link.click();
    showToast("Workspace configuration backup exported!");
  };

  const importDataBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        const success = StorageService.importBackup(result);
        if (success) {
          setCustomPalettes(StorageService.getCustomPalettes());
          setHistory(StorageService.getHistory());
          setCreationsCount(prev => prev + 1); // force page updates
          setCreationsPage(0);
          showToast("Backup configuration successfully imported!");
        } else {
          showToast("Failed to parse backup file. Invalid format.");
        }
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = ''; // reset selection
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
              onClick={() => navigateToTab('gallery')}
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
              onClick={() => navigateToTab('studio')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <button
              className={`nav-icon-btn ${activeTab === 'help' ? 'active' : ''}`}
              title="Help & Shortcuts"
              onClick={() => navigateToTab('help')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </button>
          </nav>

          <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="./logo.png" alt="WPS Logo" style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border)' }} />
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
      <div style={{ flex: 1, overflowY: activeTab === 'studio' ? 'hidden' : 'auto', overflowX: 'hidden', position: 'relative' }}>

        {/* ── TAB TRANSITION LOADER ── */}
        {isTransitioning && (
          <div className="page-transition-loader active" style={{ zIndex: 1000 }}>
            <div className="transition-dots">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>
        )}

        {/* ── VIEW 1: GALLERY VIEW ── */}
        {activeTab === 'gallery' && !isTransitioning && (
          <main className="view-container active" id="viewGallery" style={{ padding: '0 0 40px 0' }}>
            
            {/* Gallery Page Content Wrapper (with responsive lateral spacing gap) */}
            <div className="gallery-content-wrap">
              
              {/* Featured Hero Art Section (Stone Light version, rounded inside padding wrapper) */}
              <section className="featured-hero-banner" style={{ minHeight: '380px', height: '380px', marginTop: '24px', borderRadius: '16px', overflow: 'hidden' }}>
                <FeaturedCanvas palette={PALETTES[2] || PALETTES[0]} customPalettes={customPalettes} />
                <div className="featured-overlay-content">
                  <div className="featured-tag-pill">
                    FEATURED PIECE
                  </div>
                  <h2 className="featured-title">Flowing Hills — Stone (Light)</h2>
                  <p className="featured-sub">Curated Procedural Vector Art • Light Edition (16:9 4K resolution)</p>
                  
                  <div className="featured-cta-group">
                    <button
                      className="btn-open-in-studio"
                      onClick={() => {
                        setCurrentPattern(0);
                        setPaletteIdx(2);
                        setIsInverted(true); // Light mode wallpaper
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

              {/* ── MY CUSTOM CREATIONS GALLERY SECTION (PAGINATED & SEARCHABLE) ── */}
              {(creationsTotal > 0 || creationsSearch !== '') && (
                <section className="category-section" style={{ marginTop: '32px' }}>
                  <div className="category-header" style={{ padding: '0 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div className="category-title">My Custom Creations</div>
                      <div className="category-sub">Your personal procedural configurations saved from the studio</div>
                    </div>
                    {/* Real-time Search Box */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <input
                        type="text"
                        placeholder="Search your creations..."
                        value={creationsSearch}
                        onChange={(e) => {
                          setCreationsSearch(e.target.value);
                          setCreationsPage(0); // reset page on search query change
                        }}
                        className="custom-input"
                        style={{ maxWidth: '240px', height: '36px', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  {paginatedCreations.length === 0 ? (
                    <div className="history-empty-placeholder" style={{ padding: '40px 0' }}>
                      No creations matching "{creationsSearch}".
                    </div>
                  ) : (
                    <>
                      <div className="category-cards-scroll-box" style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '12px' }}>
                        {paginatedCreations.map((item) => {
                          const pal = item.paletteIdx >= PALETTES.length
                            ? customPalettes[item.paletteIdx - PALETTES.length]
                            : PALETTES[item.paletteIdx];

                          if (!pal) return null;

                          return (
                            <div key={item.id} className="gallery-card" style={{ flexShrink: 0, width: '280px' }}>
                              <CustomCreationCanvas
                                pattern={PATTERNS[item.patternIdx]}
                                palette={pal}
                                seed={item.seed}
                                zoomLevel={item.zoomLevel}
                                fitMode={item.fitMode}
                                isInverted={item.isInverted}
                                customPalettes={customPalettes}
                              />
                              
                              <div className="gallery-card-info">
                                <div className="gallery-card-name" style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                  {item.name || "Untitled Creation"}
                                </div>
                                <div className="card-quick-actions">
                                  <button
                                    className="card-action-btn btn-card-edit"
                                    onClick={() => loadGalleryCreation(item)}
                                    title="Edit creation in studio"
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}
                                  >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M12 20h9"></path>
                                      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
                                    </svg>
                                  </button>
                                  <button
                                    className="card-action-btn btn-card-download"
                                    style={{ background: '#ef4444', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}
                                    onClick={(e) => deleteFromGallery(item.id, e)}
                                    title="Delete creation"
                                  >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="3 6 5 6 21 6"></polyline>
                                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Pagination Controls */}
                      {creationsTotal > creationsLimit && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', padding: '0 4px' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Showing {creationsPage * creationsLimit + 1} - {Math.min((creationsPage + 1) * creationsLimit, creationsTotal)} of {creationsTotal} creations
                          </span>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="nav-icon-btn"
                              style={{ padding: '6px 12px', fontSize: '0.8rem', opacity: creationsPage === 0 ? 0.5 : 1, pointerEvents: creationsPage === 0 ? 'none' : 'auto' }}
                              onClick={() => setCreationsPage(creationsPage - 1)}
                            >
                              Prev
                            </button>
                            <button
                              className="nav-icon-btn"
                              style={{ padding: '6px 12px', fontSize: '0.8rem', opacity: (creationsPage + 1) * creationsLimit >= creationsTotal ? 0.5 : 1, pointerEvents: (creationsPage + 1) * creationsLimit >= creationsTotal ? 'none' : 'auto' }}
                              onClick={() => setCreationsPage(creationsPage + 1)}
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </section>
              )}

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
                      <div className="category-header" style={{ padding: '0 4px' }}>
                        <div>
                          <div className="category-title">{row.title}</div>
                          <div className="category-sub">{row.sub}</div>
                        </div>
                      </div>

                      <div className="category-cards-scroll-box" style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '12px' }}>
                        {PALETTES.slice(0, 6).map((pal, palIdx) => (
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
                                    setIsInverted(false);
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
            </div>
          </main>
        )}

        {/* ── VIEW 2: STUDIO EDITOR VIEW ── */}
        {activeTab === 'studio' && !isTransitioning && (
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

                    <button
                      className="btn-enlarge-preview"
                      title="Fullscale Fullscreen Lightbox"
                      onClick={() => {
                        setFullscreenDevice(deviceMode === 'all' ? 'desktop' : deviceMode);
                        setIsFullscreenActive(true);
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <polyline points="9 21 3 21 3 15"></polyline>
                        <line x1="21" y1="3" x2="14" y2="10"></line>
                        <line x1="3" y1="21" x2="10" y2="14"></line>
                      </svg>
                      <span>Fullscreen</span>
                    </button>
                  </div>
                </div>

                <div className={`preview-container mode-${deviceMode}`}>
                  {(deviceMode === 'all' || deviceMode === 'desktop') && (
                    <div 
                      className="preview-desktop-wrap device-preview-card"
                      onClick={() => {
                        setFullscreenDevice('desktop');
                        setIsFullscreenActive(true);
                      }}
                      title="Click to view Desktop preview in Fullscale"
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="preview-label">
                        Desktop 4K
                        <Tooltip text="Draws a standard 16:9 canvas preset matching monitor resolutions.">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="info-icon-svg">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                          </svg>
                        </Tooltip>
                      </div>
                      <canvas ref={desktopCanvasRef} width="960" height="540" />
                    </div>
                  )}

                  {(deviceMode === 'all' || deviceMode === 'tablet' || deviceMode === 'mobile') && (
                    <div className="preview-secondary-group">
                      {(deviceMode === 'all' || deviceMode === 'tablet') && (
                        <div 
                          className="preview-tablet-wrap device-preview-card"
                          onClick={() => {
                            setFullscreenDevice('tablet');
                            setIsFullscreenActive(true);
                          }}
                          title="Click to view Tablet preview in Fullscale"
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="preview-label">
                            Tablet
                            <Tooltip text="Draws a standard 3:4 canvas preset matching iPad/Tablet aspect ratios.">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="info-icon-svg">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                              </svg>
                            </Tooltip>
                          </div>
                          <canvas ref={tabletCanvasRef} width="600" height="800" />
                        </div>
                      )}

                      {(deviceMode === 'all' || deviceMode === 'mobile') && (
                        <div 
                          className="preview-mobile-wrap device-preview-card"
                          onClick={() => {
                            setFullscreenDevice('mobile');
                            setIsFullscreenActive(true);
                          }}
                          title="Click to view Mobile preview in Fullscale"
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="preview-label">
                            Mobile
                            <Tooltip text="Draws a standard 9:19.5 viewport matching newer smartphones.">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="info-icon-svg">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                              </svg>
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
                        <button className="btn-create-palette-header" onClick={() => setIsPaletteModalActive(true)}>
                          + Add Palette
                        </button>
                        {paletteIdx >= PALETTES.length && (
                          <button
                            className="btn-create-palette-header"
                            style={{ background: '#ef4444', color: 'white', borderColor: '#ef4444' }}
                            onClick={deleteSelectedPalette}
                          >
                            Delete Selected
                          </button>
                        )}
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

                  {/* ── RECENT WORKSPACE HISTORY SECTION ── */}
                  <div className="history-section">
                    <div className="control-header-row">
                      <div className="header-title-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="control-label">Recent Variations History</div>
                        <button className="btn-create-palette-header" onClick={addToHistoryCurrent}>
                          + Save Snapshot
                        </button>
                      </div>
                    </div>

                    {history.length === 0 ? (
                      <div className="history-empty-placeholder">
                        No variations recorded. Click "+ Save Snapshot" or generate a random layout to save history states.
                      </div>
                    ) : (
                      <div className="history-grid">
                        {history.map((item) => {
                          const pal = item.paletteIdx >= PALETTES.length
                            ? customPalettes[item.paletteIdx - PALETTES.length]
                            : PALETTES[item.paletteIdx];

                          if (!pal) return null;

                          return (
                            <div
                              key={item.id}
                              className="history-card"
                              onClick={() => loadHistoryItem(item)}
                              title="Click to restore this variation snapshot"
                            >
                              <HistoryCardCanvas
                                pattern={PATTERNS[item.patternIdx]}
                                palette={pal}
                                seed={item.seed}
                                zoomLevel={item.zoomLevel}
                                fitMode={item.fitMode}
                                isInverted={item.isInverted}
                                customPalettes={customPalettes}
                              />
                              <div className="history-card-actions">
                                <button
                                  className="history-card-btn"
                                  title="Add variation to Gallery catalog"
                                  onClick={(e) => addHistoryItemToGallery(item, e)}
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="12" y1="8" x2="12" y2="16"></line>
                                    <line x1="8" y1="12" x2="16" y2="12"></line>
                                  </svg>
                                </button>
                                <button
                                  className="history-card-btn"
                                  title="Remove from history"
                                  style={{ color: '#ef4444' }}
                                  onClick={(e) => deleteHistoryItem(item.id, e)}
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                  </svg>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Sidebar Controls */}
              <div className="controls">
                <div className="control-group" style={{ gap: '12px' }}>
                  <div className="control-label">
                    Pattern
                    <Tooltip text="Select the mathematical algorithm that generates the shapes.">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="info-icon-svg">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
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

                <div className="control-group" style={{ gap: '12px' }}>
                  <div className="control-label">
                    Wallpaper Mode
                    <Tooltip text="Changes the wallpaper design appearance between light (inverted tones) and dark (normal tones).">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="info-icon-svg">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                    </Tooltip>
                  </div>
                  <div className="mode-toggle">
                    <button
                      className={`mode-btn ${!isInverted ? 'active' : ''}`}
                      onClick={() => setIsInverted(false)}
                    >
                      <span className="mode-icon mode-icon-dark"></span>
                      Dark Wallpaper
                    </button>
                    <button
                      className={`mode-btn ${isInverted ? 'active' : ''}`}
                      onClick={() => setIsInverted(true)}
                    >
                      <span className="mode-icon mode-icon-light"></span>
                      Light Wallpaper
                    </button>
                  </div>
                </div>

                <div className="control-group native-wallpaper-group" style={{ display: 'block', marginTop: '10px' }}>
                  <div className="control-label">Workspace Integrations</div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      className="btn-custom-export-prominent text-center"
                      onClick={addCurrentToGallery}
                      style={{ flex: 1, background: 'var(--card-bg)', color: 'var(--text)', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 8px', fontSize: '0.78rem' }}
                      title="Save this wallpaper configuration to your creations catalog"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      <span>Save Gallery</span>
                    </button>
                    <button
                      className="btn-custom-export-prominent text-center"
                      onClick={applyWallpaper}
                      style={{ flex: 1, background: 'var(--accent)', color: 'var(--bg)', border: '1.5px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 8px', fontSize: '0.78rem' }}
                      title="Set this pattern as your native desktop wallpaper background"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="12" rx="2" ry="2"></rect>
                        <line x1="12" y1="15" x2="12" y2="21"></line>
                        <line x1="8" y1="21" x2="16" y2="21"></line>
                      </svg>
                      <span>Set Wallpaper</span>
                    </button>
                  </div>
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
        {activeTab === 'help' && !isTransitioning && (
          <main className="view-container active" style={{ padding: '48px 24px', maxWidth: '960px', margin: '0 auto' }}>
            <div style={{ marginBottom: '40px', borderBottom: '1.5px solid var(--border)', paddingBottom: '24px' }}>
              <span className="section-tag" style={{ marginBottom: '8px', display: 'inline-block' }}>OFFLINE HUB</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0, color: 'var(--text)' }}>Desktop Support & Shortcut Center</h2>
              <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '0.98rem', lineHeight: '1.6', maxWidth: '600px' }}>
                Review interactive keyboard layouts, manage offline backups, and inspect local math noise matrix parameters.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '24px', marginBottom: '24px' }}>
              
              {/* Keyboard Shortcuts Card */}
              <div className="bento-card" style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border)', borderRadius: '16px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: 'var(--card-shadow)' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
                      <line x1="6" y1="8" x2="6" y2="8"></line>
                      <line x1="10" y1="8" x2="10" y2="8"></line>
                      <line x1="14" y1="8" x2="14" y2="8"></line>
                      <line x1="18" y1="8" x2="18" y2="8"></line>
                      <line x1="6" y1="12" x2="6" y2="12"></line>
                      <line x1="18" y1="12" x2="18" y2="12"></line>
                      <line x1="7" y1="16" x2="17" y2="16"></line>
                      <line x1="10" y1="12" x2="14" y2="12"></line>
                    </svg>
                    Keyboard Controls Map
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '6px', margin: 0 }}>Use hotkeys to quickly navigate and control the wallpaper engine.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>Randomize Seed</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Generate new design variations</span>
                    </div>
                    <kbd style={{ background: 'var(--hover-bg)', border: '1.5px solid var(--border)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>Spacebar</kbd>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>High-Res PNG Export</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Save current canvas preset</span>
                    </div>
                    <kbd style={{ background: 'var(--hover-bg)', border: '1.5px solid var(--border)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>Ctrl + S</kbd>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>Change Views</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Navigate main tabs instantly</span>
                    </div>
                    <kbd style={{ background: 'var(--hover-bg)', border: '1.5px solid var(--border)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>Tab</kbd>
                  </div>
                </div>
              </div>

              {/* Onboarding Replay Card */}
              <div className="bento-card" style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border)', borderRadius: '16px', padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px', boxShadow: 'var(--card-shadow)' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    Interactive Guide Tour
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5', marginTop: '8px' }}>
                    Replay the introduction walkthrough to review canvas crop controls, custom resolutions, and multi-device presets.
                  </p>
                </div>
                <button
                  className="modal-download-btn-fixed"
                  style={{ width: '100%', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}
                  onClick={replayOnboarding}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path>
                  </svg>
                  <span>Launch Walkthrough</span>
                </button>
              </div>
            </div>

            {/* Offline Data Portability & Sync Backup Card */}
            <div className="bento-card" style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border)', borderRadius: '16px', padding: '28px', marginBottom: '24px', boxShadow: 'var(--card-shadow)' }}>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Data Backup & Portability
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5', marginTop: '6px' }}>
                  Export your saved creations, custom color palettes, and editor history items, or load an existing config file to synchronize devices.
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  className="card-action-btn btn-card-edit"
                  onClick={exportDataBackup}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '40px', padding: '0 18px', background: 'var(--hover-bg)', border: '1.5px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  <span>Export Backup Config</span>
                </button>

                <button
                  className="card-action-btn btn-card-edit"
                  onClick={() => backupInputRef.current?.click()}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '40px', padding: '0 18px', background: 'var(--hover-bg)', border: '1.5px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <span>Upload & Restore Backup</span>
                </button>
                <input
                  type="file"
                  ref={backupInputRef}
                  style={{ display: 'none' }}
                  accept=".json"
                  onChange={importDataBackup}
                />
              </div>
            </div>

            {/* Procedural Engine details */}
            <div className="bento-card" style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border)', borderRadius: '16px', padding: '28px', boxShadow: 'var(--card-shadow)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                Procedural Vector Math Engine
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', lineHeight: '1.6', marginBottom: '16px', margin: '8px 0 16px 0' }}>
                WallpaperStudio runs entirely offline. Layout contours and vector lines are generated via local math interpolation functions combined with fractional Brownian noise matrices, ensuring zero cloud dependencies and immediate, pixel-perfect rendering outputs.
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.72rem', padding: '6px 12px', background: 'var(--hover-bg)', border: '1px solid var(--border)', borderRadius: '100px', color: 'var(--text-muted)', fontWeight: 500 }}>Local Electron & Win32 APIs</span>
                <span style={{ fontSize: '0.72rem', padding: '6px 12px', background: 'var(--hover-bg)', border: '1px solid var(--border)', borderRadius: '100px', color: 'var(--text-muted)', fontWeight: 500 }}>Procedural Noise Calculations</span>
                <span style={{ fontSize: '0.72rem', padding: '6px 12px', background: 'var(--hover-bg)', border: '1px solid var(--border)', borderRadius: '100px', color: 'var(--text-muted)', fontWeight: 500 }}>Zero Cloud Bandwidth</span>
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

      {/* ── CUSTOM PALETTE STUDIO MODAL ── */}
      {isPaletteModalActive && (
        <div className="modal-overlay active" id="addPaletteModal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 115 }}>
          <div className="custom-modal-card-lg">
            <button className="modal-close" onClick={() => setIsPaletteModalActive(false)}>&times;</button>
            <h3>Custom Palette Studio</h3>
            <p className="custom-modal-sub">Pick your Base, Mid, and Accent colors to generate a smooth 10-shade palette.</p>

            <div className="custom-modal-body">
              <div className="custom-inputs-column">
                <div className="input-group">
                  <label>Palette Name</label>
                  <input
                    type="text"
                    value={customPaletteName}
                    onChange={(e) => setCustomPaletteName(e.target.value)}
                    className="custom-input"
                  />
                </div>

                <div className="color-pickers-row" style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <div className="picker-item" style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Base / Dark Tone</label>
                    <input
                      type="color"
                      value={colorPicker1}
                      onChange={(e) => setColorPicker1(e.target.value)}
                      className="color-wheel-input"
                    />
                  </div>
                  <div className="picker-item" style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Mid Tone</label>
                    <input
                      type="color"
                      value={colorPicker2}
                      onChange={(e) => setColorPicker2(e.target.value)}
                      className="color-wheel-input"
                    />
                  </div>
                  <div className="picker-item" style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Accent / Highlight</label>
                    <input
                      type="color"
                      value={colorPicker3}
                      onChange={(e) => setColorPicker3(e.target.value)}
                      className="color-wheel-input"
                    />
                  </div>
                </div>

                <div className="palette-preview-strip-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Generated 10-Shade Palette Preview
                </div>
                <div className="palette-preview-strip">
                  {tempPaletteColors.map((color, idx) => (
                    <span key={idx} style={{ backgroundColor: color }} />
                  ))}
                </div>

                <button className="modal-download-btn-fixed" onClick={saveCustomPalette} style={{ width: '100%' }}>
                  Save & Apply Palette
                </button>
              </div>

              <div className="custom-preview-column">
                <div className="preview-label">Live Pattern Canvas Preview</div>
                <div className="custom-canvas-box">
                  <canvas ref={palettePreviewCanvasRef} width="360" height="200" />
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
              <img src="./logo.png" alt="WPS Logo" style={{ width: '40px', height: '40px', borderRadius: '8px', display: 'block', margin: '0 auto 8px auto', border: '1px solid var(--border)', objectFit: 'cover' }} />
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

      {/* ── INTERACTIVE FULLSCALE LIGHTBOX PREVIEW MODAL ── */}
      {isFullscreenActive && activePalette && (
        <div className="modal-overlay active" id="fullscreenPreviewModal" onClick={() => setIsFullscreenActive(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110 }}>
          <div className="custom-modal-card-lg fullscreen-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsFullscreenActive(false)}>&times;</button>
            <div className="fullscreen-header-bar">
              <div>
                <h3>{fullscreenDevice === 'tablet' ? 'Tablet' : fullscreenDevice === 'mobile' ? 'Mobile' : 'Desktop 4K'} Fullscale Preview</h3>
                <p className="custom-modal-sub">Live interactive preview with zoom and crop controls.</p>
              </div>

              <div className="fullscreen-toolbar">
                <button className={`action-pill-btn ${fitMode === 'crop' ? 'active' : ''}`} onClick={() => setFitMode('crop')}>Crop</button>
                <button className={`action-pill-btn ${fitMode === 'fit' ? 'active' : ''}`} onClick={() => setFitMode('fit')}>Fit</button>
                <div className="divider-v"></div>
                <button className="icon-zoom-btn" onClick={() => setZoomLevel(Math.max(40, zoomLevel - 10))}>-</button>
                <span className="zoom-percentage-badge">{zoomLevel}%</span>
                <button className="icon-zoom-btn" onClick={() => setZoomLevel(Math.min(180, zoomLevel + 10))}>+</button>
              </div>
            </div>

            <div className="fullscreen-view-box">
              <FullscreenCanvas
                pattern={currentPattern}
                palette={activePalette}
                seed={seed}
                zoomLevel={zoomLevel}
                fitMode={fitMode}
                isInverted={isInverted}
                device={fullscreenDevice}
                customPalettes={customPalettes}
              />
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
