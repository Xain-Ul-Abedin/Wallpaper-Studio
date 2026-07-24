# Visual Design & Micro-Motion Specification (Design_Spec) — WallpaperStudio

## 1. Design Philosophy & Aesthetic Identity

WallpaperStudio follows the **Dark Luxury & Minimalist Glass** aesthetic system. Designed to impress users at first glance, the interface fuses deep OLED blacks (`zinc-950`), frosted glassmorphism control panels, crisp typography, subtle micro-spring physics, and high-contrast Emerald `#10B981` / Terracotta `#F97316` interactive accents.

---

## 2. Color Palette & Token Registry

### 2.1. Dark Luxury Base Tokens
* **Canvas Background (OLED Black):** `HSL(240, 10%, 4%)` (`#09090B` / `zinc-950`).
* **Surface Containers (Glass Sheet):** `HSL(240, 6%, 10%, 0.65)` (`rgba(24, 24, 27, 0.65)` with `backdrop-filter: blur(16px)`).
* **Card Borders (Subtle Glass Stroke):** `HSL(240, 4%, 16%)` (`#27272A` / `zinc-800`).
* **Primary Text:** `HSL(0, 0%, 98%)` (`#FAFAFA` / `zinc-50`).
* **Muted Body Text:** `HSL(240, 5%, 65%)` (`#A1A1AA` / `zinc-400`).

### 2.2. High-Contrast Accent Tokens
* **Primary Interactive Accent (Emerald):** `HSL(158, 64%, 52%)` (`#10B981` / `emerald-500`).
* **Secondary Accent (Terracotta):** `HSL(20, 90%, 54%)` (`#F97316` / `orange-500`).
* **Warning Accent (Amber):** `HSL(38, 92%, 50%)` (`#F59E0B` / `amber-500`).

---

## 3. Typography Hierarchy & Rules

* **Font Family:** Inter or Outfit (Google Fonts) for UI controls, and Fira Code / JetBrains Mono for telemetry metrics.
* **Header Scale:**
  * `h1` (Logo / App Title): `text-2xl font-semibold tracking-tight text-zinc-50`.
  * `h2` (Section Titles): `text-lg font-medium text-zinc-200`.
  * `h3` (Card Headers): `text-sm font-medium text-zinc-300`.
* **Eyebrow Label Restraint:** Small uppercase tracking labels (e.g. `WALLPAPER STUDIO`) are limited to **1 instance per screen section**.
* **Strict Em-dash (`—`) Ban:** Em-dashes are strictly forbidden across all UI copy, buttons, tooltips, and presets. Use regular hyphens `-` or colons `:`.

---

## 4. Interactive Micro-States & Spring Physics

### 4.1. Tactile Click Scale (`0.97`)
All interactive control buttons, color swatches, resolution preset pills, and action cards must scale down to `0.97` on click (`:active` state) and spring back to `1.0` on release using spring physics (`damping: 20`, `stiffness: 300`):

```tsx
<motion.button
  whileTap={{ scale: 0.97 }}
  whileHover={{ y: -2 }}
  transition={{ type: "spring", stiffness: 300, damping: 20 }}
  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium rounded-lg shadow-lg shadow-emerald-500/10"
>
  Generate 4K Wallpaper
</motion.button>
```

### 4.2. Glassmorphism Panel Blur
Control sidebars and floating editor toolbars utilize frosted glassmorphism:
```css
.glass-panel {
  background: rgba(24, 24, 27, 0.65);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

### 4.3. Sprite & Preview Boundary Padding Rule
When rendering custom icons, floating shapes, or canvas preview graphics, all active object masks must enforce a minimum **1-pixel boundary padding** ($x \in [1, \text{Width}-2]$ and $y \in [1, \text{Height}-2]$) to prevent clipped outlines on container edges.

---

## 5. Screen Layout & Responsive Grid

* **Desktop Viewport (>= 1024px):** Dual-pane layout. Left side: Interactive Canvas Preview (with 4K Desktop / iPhone / iPad Frame Switcher). Right side: Tabbed Editor Control Panels (Mesh Gradient, Grain Noise, Glass Shapes, Typography, AI Prompts).
* **Mobile Viewport (< 600px):** Single-column stacked layout with a fixed bottom action sheet for canvas controls and **16px viewport margins**.
* **No Nested Cards:** Maximum 1 card depth to prevent visual clutter on compact displays.
