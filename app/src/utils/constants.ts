export const DESKTOP_W = 5760;
export const DESKTOP_H = 3240;
export const TABLET_W = 3096;
export const TABLET_H = 4128;
export const MOBILE_W = 1935;
export const MOBILE_H = 4194;

export interface Palette {
  name: string;
  colors: string[];
}

export const PALETTES: Palette[] = [
  { name: 'Nordic Snow', colors: ['#f8fafc','#e2e8f0','#cbd5e1','#94a3b8','#64748b','#475569','#334155','#1e293b','#0f172a','#020617'] },
  { name: 'Charcoal',    colors: ['#000000','#141414','#2a2a2a','#404040','#595959','#737373','#8c8c8c','#b3b3b3','#d9d9d9','#ffffff'] },
  { name: 'Stone',       colors: ['#1a1714','#2c2825','#3e3a35','#534e47','#6b655c','#857d72','#9f9688','#b8b0a3','#d1c9bd','#ece6dc'] },
  { name: 'Ocean Blue',  colors: ['#01052b','#04137a','#0825c7','#0d39ff','#1552ff','#2f73ff','#58a3ff','#7dc3ff','#aedfff','#edf8ff'] },
  { name: 'Sunrise',     colors: ['#031c35','#05284a','#063862','#0b4b7a','#ff5b40','#ff7240','#ff9438','#ffb33f','#ffd064','#fff0c8'] },
  { name: 'Fire',        colors: ['#1a0000','#450000','#7a0000','#b30000','#e63900','#ff6a00','#ff9500','#ffb700','#ffd166','#fff1c2'] },
  { name: 'Cyber Purple',colors: ['#100014','#22002e','#3f005a','#5c0085','#7a00b3','#9b1fff','#b84dff','#cf88ff','#e4c2ff','#f7ebff'] },
  { name: 'Toxic Glow',  colors: ['#050807','#0c1410','#14221a','#1e3325','#2a4d2e','#3f6b2f','#5f8a2c','#86b326','#b9e83f','#f6ffe0'] },
  { name: 'Arctic Winter', colors: ['#081018','#112131','#1d3348','#33516a','#55768f','#7d9eb5','#a7c2d3','#cfe0ea','#e8f0f5','#ffffff']},
  { name: 'Neon Horizon', colors: ['#13051a','#290d3a','#3c1259','#3b2285','#2b42b0','#1d6cd4','#2ca1e8','#59cef2','#94f2f7','#e0fbfd'] },
  { name: 'Terracotta',  colors: ['#1f0505','#3a0d0d','#611111','#871c26','#ab3037','#cb4f41','#e6744a','#f79d5c','#fcc579','#fdf2a6'] },
  { name: 'Deep Forest', colors: ['#051214','#0b2426','#123a39','#18524c','#226b5d','#32856c','#49a07a','#68ba89','#91d49d','#c3ebd0'] }
];

export const PATTERNS = [
  'flowing-hills',
  'smooth-wave',
  'sand-dunes',
  'mountains',
  'concentric-arcs',
  'desert-dunes'
] as const;

export type PatternType = typeof PATTERNS[number];

export const PATTERN_LABELS: Record<PatternType, string> = {
  'flowing-hills': 'Flowing Hills',
  'smooth-wave': 'Smooth Waves',
  'sand-dunes': 'Sand Dunes',
  'mountains': 'Mountain Ranges',
  'concentric-arcs': 'Concentric Arcs',
  'desert-dunes': 'Desert Dunes'
};

export interface DevicePresetItem {
  name: string;
  w: number;
  h: number;
}

export const DEVICE_PRESETS: Record<string, DevicePresetItem[]> = {
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
