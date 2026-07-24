# Wallpaper Studio

Procedural minimalist wallpaper editor driven by vector mathematics and HTML5 Canvas. Clean, stateless, and fully offline-capable.

Production URL: https://wallpaper-studio-xain.vercel.app
Source Code: https://github.com/Xain-Ul-Abedin/Wallpaper-Studio

---

## Technical Overview

Wallpaper Studio generates vector-like art directly on the client browser utilizing procedural equations drawn onto A4, Desktop 4K, Tablet, and Mobile viewport aspects. By bypassing raster image hosting, the application holds a lightweight footprint under 100KB, utilizing CPU/GPU math transformations to render complex geometric layers at 60FPS.

---

## Architectural Highlights

### 1. Mathematical Pattern Generation
The application utilizes four core parametric equations to create organic, minimalist designs:

*   **Arcos (Pattern 0 - Arches):** Renders cascading overlapping layers of bezier curves, creating archway and architectural depth effects.
*   **Colinas (Pattern 1 - Mountains):** Employs multi-octave sine wave superposition offsets to draw ridge silhouettes and topographic depth.
*   **Dunas (Pattern 2 - Waves):** Utilizes frequency modulation loops across diagonal coordinate grids, generating rhythmic, sand-dune-like contours.
*   **Rabisco (Pattern 3 - Scribbles):** Generates organic, continuous random walks and orbital loops, giving a hand-sketched modern art texture.

### 2. Device Canvas Alignment & Safety Padding
In accordance with pixel art and border render specifications, Wallpaper Studio enforces strict padding bounds. All procedural elements are rendered within $x \in [1, \text{Width}-2]$ and $y \in [1, \text{Height}-2]$ to preserve outline continuity on high-DPI device screens, completely avoiding edge-clipping.

### 3. Curated Themes & Color Blending
The Custom Palette Studio generates smooth 10-shade tonal progressions using dynamic RGB color interpolation. Developers and users can inputs dark, mid, and accent hex codes to create custom, non-destructive HSL palettes instantly.

---

## Project Structure

```
WallpaperStudio/
├── Docs/                     - Product Requirements, Design Specs, and Handoff Docs
│   ├── BRD.md
│   ├── SRS.md
│   └── Test_Plan.md
├── src-tauri/                - Tauri Desktop client configuration (Rust)
│   ├── src/main.rs
│   └── tauri.conf.json
├── public/                   - Web application distribution folder
│   ├── index.html            - Entry layout & modular view router
│   ├── styles.css            - Bento design system, animations, custom hover video controls
│   ├── js/
│   │   ├── ui.js             - SPA view controller, comparison slider events, custom video controls
│   │   ├── patterns.js       - Math vector draw functions
│   │   ├── state.js          - Global session variables (seed, zoom, crop modes)
│   │   ├── color.js          - RGB/Hex color math & interpolation
│   │   └── constants.js      - Device resolution presets & predefined palettes
├── vercel.json               - Static routing rules for Washington D.C. server edge
└── package.json              - Development scripts & packaging tools
```

---

## Installation & Local Development

### Prerequisites
*   Node.js (v18 or higher)
*   npm

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/Xain-Ul-Abedin/Wallpaper-Studio.git
   cd Wallpaper-Studio
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Build the application:
   ```bash
   npm run build
   ```

---

## Deployment Strategy

*   **Vercel Web Server:** Standard static pipeline utilizing `.vercelignore` to bypass heavy offline asset uploads. Large screen recording video assets are hosted separately via GitHub Release CDN downloads to bypass Vercel's 100MB static upload limits.
*   **Desktop App client:** Compiles with Rust-based Tauri into standalone light MSI binaries for Windows/macOS execution.
