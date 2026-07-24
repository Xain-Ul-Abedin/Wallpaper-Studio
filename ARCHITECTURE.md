# Architecture Map & Development — WallpaperStudio

This document serves as the active architectural specification for **WallpaperStudio**, instantiated from our master Web SaaS Architecture template (`Brain/07_Templates/Architecture.md`). It maps out the exact native stack used to build the original WLLPR app (**Vanilla HTML5 + CSS3 + ES Modules + HTML5 2D Canvas + Tauri Desktop Wrapper**) operating at **$0.00 / month infrastructure cost**.

---

## 1. Two-Phase Implementation Strategy

```
  +-------------------------------------------------------+
  | Phase 1: 100% Exact 1:1 Working Base Replica           |
  | (Vanilla HTML5 + CSS3 + ES Modules + Canvas + Tauri)  |
  +---------------------------+---------------------------+
                              |
                              v
  +-------------------------------------------------------+
  | Phase 2: Feature Expansion & Visual Upgrades          |
  | (Mesh Gradients, Perlin Noise, Glass, AI Integration) |
  +-------------------------------------------------------+
```

* **Phase 1 (1:1 Base Replica):** Replicate the exact working base project using Vanilla HTML5, CSS3, ES Modules (`js/ui.js`, `js/patterns.js`, `js/constants.js`, `js/color.js`, `js/state.js`), dual 2D Canvas preview (`#previewDesktop`, `#previewMobile`), clock overlay typography, palette swatches, and PNG export.
* **Phase 2 (Custom Feature Enhancements):** Incrementally add parametric mesh gradients, grain noise sliders, glassmorphism shapes, drag-and-drop color palette extraction, and AI prompt synthesis.

---

## 2. Native Stack Matrix & Zero-Cost Infrastructure ($0/mo)

| Layer | Native Technology | License / Free Tier | Cost |
|---|---|---|---|
| **Core Web App** | Vanilla HTML5 + CSS3 + ES Modules (`ui.js`, `patterns.js`) | Open Source (MIT) | $0 |
| **Graphics Engine** | HTML5 2D Canvas Context (`ctx.getContext('2d')`) | Native Browser API | $0 |
| **Desktop App Wrapper** | Tauri v2 (Rust + Native Webview) | Open Source (MIT / Apache-2.0) | $0 |
| **Web Hosting & CI/CD** | Vercel / GitHub Pages | Free Hobby Tier | $0 |
| **AI Integration (Phase 2)** | Google Gemini API (`gemini-2.0-flash`) | Free Tier (15 RPM / 1,500 RPD) | $0 |

---

## 3. Project Directory Structure

```
WallpaperStudio/
src-tauri/                # Tauri v2 Rust desktop application wrapper
  src/
    main.rs               # Tauri app window entry point
  Cargo.toml              # Rust crate dependencies
  tauri.conf.json         # Window size (1280x800), title, and icon settings
public/                   # Static Web frontend root (for browser & Tauri)
  index.html              # Main Studio UI & Canvas DOM container
  styles.css              # Dark mode glassmorphism layout styles
  js/                     # ES Modules codebase
    ui.js                 # Event listeners, preview renderer, clock overlays, PNG export
    patterns.js           # 12 procedural canvas pattern algorithms & PRNG
    constants.js          # Resolution constants (3840x2160, 1290x2796) & palettes
    color.js              # HSL/RGB space conversions & dark/light theme inverter
    state.js              # Active pattern index, palette index, PRNG seed state
docs/                     # Vault documentation (BRD.md, SRS.md, Design_Spec.md, etc.)
```

---

## 4. Visual Anti-Slop Guardrails
* **DESIGN_VARIANCE:** `8` (Asymmetric layout, glassmorphism control sidebar).
* **MOTION_INTENSITY:** `7` (Tactile button scaling `0.97`, smooth theme transitions).
* **VISUAL_DENSITY:** `5` (High-contrast OLED `#09090B` background, clear canvas viewport).
* **Strict Em-dash Ban:** Banned across all UI copy. Use hyphens `-` or colons `:`.
* **Zero Emoji Rule:** Emojis are strictly banned from code, system outputs, and files.

---

## 5. QA/QC & Automated Test Protocols
* **Browser Test:** 60 FPS rendering on `#previewDesktop` ($960 \times 540$) and `#previewMobile` ($290 \times 628$).
* **Export Test:** Offscreen $3840 \times 2160$ Desktop PNG blob and $1290 \times 2796$ iPhone PNG blob generation.
* **Tauri Desktop Build:** `cargo tauri build` generating lightweight ~2 MB Windows executable.
