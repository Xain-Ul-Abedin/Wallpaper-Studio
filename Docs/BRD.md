# Business Requirements Document (BRD) — WallpaperStudio

## 1. Project Overview & Vision
**WallpaperStudio** is a high-performance, studio-grade generative AI and procedural wallpaper platform. Designed for desktop, tablet, and mobile displays, WallpaperStudio empowers digital creators, designers, and enthusiasts to synthesize 4K/8K minimal wallpapers, procedural mesh gradients, grain textures, floating glassmorphism shapes, custom typography, and AI-prompted artwork.

The platform operates at **$0.00 / month infrastructure cost** using lifetime free-tier services (Vercel, Convex DB, Clerk Auth, Google Gemini Free API) while delivering a luxury dark-mode interface built on Next.js 15, React 19, Tailwind CSS v4, and Shadcn UI.

---

## 2. Target Audience & Portfolio Value Proposition
* **Portfolio Showcase Value:** Demonstrates advanced web technology integration (Next.js 15 App Router, React 19 Server/Client Components, HTML5 Canvas 2D / WebGL Shader compilation, Convex reactive WebSockets, Clerk Auth, Pydantic/Zod schemas, and AI API integrations).
* **Target Users:** Designers, developers, content creators, and minimalist aesthetic enthusiasts seeking high-resolution custom wallpapers for multi-device setups.

---

## 3. High-Level Requirements & Feature Matrix

### 3.1. Procedural Engine Tier
* **Parametric Mesh Gradients:** Multi-point color interpolation with organic wave animation and angle controls.
* **Perlin/Simplex Grain Noise:** Adjustable noise opacity, scale, and monochromatic/chromatic grain blending.
* **Geometric & Floating Glassmorphism Shapes:** Customizable blur overlays, frosted glass panels, floating geometric solids, and depth shadows.

### 3.2. AI Prompt & Pattern Synthesis Tier
* **Generative AI Wallpaper Prompts:** Integration with Google Gemini API / Pollinations AI for synthesizing abstract minimal wallpaper prompts and direct image outputs.
* **Style Transfer Filters:** Post-processing shaders (Vignette, Chromatic Aberration, Scanlines, Duotone, Retro Pixel).

### 3.3. Multi-Device Export & Live Mockup Suite
* **Preset Resolution Targets:**
  * Desktop 4K (3840 x 2160, 16:9).
  * Ultrawide 5K (5120 x 2160, 21:9).
  * iPhone 16 Pro Max (1320 x 2868, 19.5:9).
  * iPad Pro 13" (2064 x 2752, 4:3).
  * Apple Watch Ultra (410 x 502, 1:1).
* **Real-Time Device Frame Mockup Preview:** Live preview inside subtle 3D device bezels (MacBook Pro, iPhone 16 Pro, iPad).

### 3.4. Preset Gallery & Color Palette Extractor
* **Curated Preset Catalog:** Pre-built minimalist wallpaper templates (OLED Midnight, Terracotta Clay, Emerald Slate, Cyberpunk Neon).
* **Image Color Extractor:** Drag-and-drop any photo to extract dominant HSL/HEX color palettes automatically.

### 3.5. Typography & Widget Overlays
* **Minimalist Clock & Quote Widgets:** Customizable fonts, clock widget positioning, quote overlays (line-height >= 1.4, zero em-dashes).

---

## 4. Platform Target Matrix & System Boundaries
* **Web Client:** Next.js 15 App Router + React 19 + Tailwind CSS v4 + Motion.
* **Backend Cloud ($0/mo):** Convex DB (WebSocket reactive subscriptions) + Clerk Auth (10,000 MAUs free).
* **AI Provider ($0/mo):** Google AI Studio Gemini API Free Tier (15 RPM / 1,500 RPD).
* **Deployment ($0/mo):** Vercel Hobby Tier (100 GB bandwidth/mo, auto git deploy).

---

## 5. Success Metrics & Compliance
* **Performance:** 60 FPS Canvas/WebGL render loop on 4K preview displays.
* **Build Validation:** Zero TypeScript (`tsc --noEmit`) and zero ESLint errors.
* **Anti-Slop Compliance:** Strict adherence to zero-emoji rule, Slate HSL off-black canvas (`#0F172A`), zero em-dashes in text, and 16px viewport margins.
