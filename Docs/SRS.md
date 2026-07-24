# Software Requirements Specification (SRS) — WallpaperStudio

## 1. System Architecture & Tech Stack (Scale 3.5 Preset)

WallpaperStudio is built on **Scale 3.5: Reactive Serverless SaaS Architecture**, leveraging:
* **Frontend Framework:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Motion (animations), Lucide Icons, Shadcn UI.
* **Canvas Render Engine:** Dual HTML5 Canvas 2D + WebGL Shader engine (`@webgl/canvas` / custom shaders) rendering at up to 8K resolution.
* **Reactive Backend & Database:** Convex DB (Real-time WebSockets, TypeScript mutation & query functions, 1M calls/mo free).
* **Authentication:** Clerk Auth (Social OAuth, Passkeys, Magic Links; SMS OTP disabled to prevent fees).
* **AI Model Gateway:** Google Gemini API (`gemini-2.0-flash` for prompt expansion and wallpaper style parameters).
* **State Management:** Zustand (local editor parameters) + Convex (cloud synced wallpapers & public gallery).

---

## 2. Directory Structure Blueprint

```
WallpaperStudio/
.github/
  workflows/
    deploy.yml            # Vercel deployment & lint check workflow
app/                      # Next.js 15 App Router pages & API routes
  layout.tsx              # Root layout with ClerkProvider & ConvexProvider
  page.tsx                # Main Studio Canvas Editor page
  gallery/
    page.tsx              # Community Wallpaper Gallery page
  api/
    generate-ai/
      route.ts            # Serverless route executing Gemini API prompt expansion
components/
  canvas/                 # Canvas render viewport components
    WallpaperCanvas.tsx   # Dual 2D/WebGL rendering canvas
    DeviceMockupFrame.tsx # Interactive 3D/2D frame preview (MacBook, iPhone, iPad)
  editor/                 # Editor control panels
    GradientPicker.tsx    # Multi-point mesh gradient controller
    NoiseControl.tsx      # Perlin grain noise slider panel
    GlassmorphismPanel.py # Floating glass shapes & blur controls
    PaletteExtractor.tsx  # Image drag-and-drop color extractor
    TypographyWidget.tsx  # Clock & minimal text overlay panel
    AIStudioPrompt.tsx    # AI prompt generation control panel
    ExportModal.tsx       # 4K/8K multi-resolution exporter modal
  ui/                     # Atomic Shadcn UI components
convex/                   # Convex Reactive Backend Database
  schema.ts               # Database table schemas (wallpapers, profiles, likes)
  wallpapers.ts           # Query & Mutation functions
  auth.config.ts          # Clerk authentication provider configuration
lib/
  canvas/
    mesh_gradient.ts      # Parametric mesh gradient math calculations
    perlin_noise.ts       # Simplex/Perlin noise generator
    export_engine.ts      # Multi-device canvas offscreen resolution exporter
  utils.ts                # General helpers & color space conversions
public/
  presets/                # Static thumbnail image previews for pre-built presets
```

---

## 3. Convex Database Schema (`convex/schema.ts`)

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  wallpapers: defineTable({
    userId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    aspectRatio: v.string(), // "16:9", "21:9", "19.5:9", "4:3", "1:1"
    configJson: v.string(),  # Serialized mesh, noise, glass, and palette JSON
    thumbnailUrl: v.string(),
    isPublic: v.boolean(),
    likesCount: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_public", ["isPublic", "createdAt"])
    .index("by_likes", ["isPublic", "likesCount"]),

  profiles: defineTable({
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),
});
```

---

## 4. Hardware-Accelerated Canvas Rendering Specifications

### 4.1. Parametric Mesh Gradient Engine
* Renders continuous smooth gradients between $N$ user-defined color stops ($N \in [2, 6]$).
* Integrates an organic time-based wave offset:
  $$P(x, y, t) = \sin(x \cdot \omega_1 + t) \cdot \cos(y \cdot \omega_2 + t)$$

### 4.2. Perlin / Simplex Grain Noise Overlay
* Generates monochromatic or chromatic noise matrices applied to the Canvas context using `ctx.putImageData` or WebGL Fragment Shaders.
* Includes opacity sliders ($0.0 \to 0.3$), scale sliders ($1 \to 4$), and blend mode selection (`overlay`, `soft-light`, `multiply`).

### 4.3. Device Resolution Offscreen Exporter
Uses `OffscreenCanvas` (or hidden high-res canvas elements) to render clean images at exact target pixel dimensions without scaling artifacts:
* Desktop 4K: $3840 \times 2160 \text{ px}$
* Ultrawide 5K: $5120 \times 2160 \text{ px}$
* iPhone 16 Pro Max: $1320 \times 2868 \text{ px}$
* iPad Pro 13": $2064 \times 2752 \text{ px}$
* Apple Watch: $410 \times 502 \text{ px}$

### 4.4. Reverse-Engineered WLLPR Pattern Engine Integration
Ported and upgraded all 12 core WLLPR 2D canvas pattern algorithms (`constants.js`, `color.js`, `patterns.js`, `ui.js`) into TypeScript (`lib/canvas/wllpr_patterns.ts`):
* **Seeded PRNG (`sfc32` / `splitmix32`):** Deterministic seed generator (`setSeed(number)`) ensuring 100% reproducible wallpaper renders across Desktop 4K and iPhone viewports.
* **Clock & Date Overlay Engine:** Real-time lock-screen overlay previewing desktop (`Domingo, 14 de Junho`, `09:41`) and mobile clock typography with dynamic HSL background brightness detection (`brightness = (r*299 + g*587 + b*114)/1000`).
* **Dark/Light Theme Inversion:** Instant inverted color palette scheme toggle preserving mathematical contrast ratios.

---

## 5. Security & Authentication Requirements
* **Clerk Integration:** JWT authentication passed automatically in HTTP headers to Convex WebSocket subscriptions.
* **SMS OTP Ban:** SMS authentication is strictly disabled in Clerk Dashboard to prevent telephony costs.
* **Input Validation:** User prompts, text overlay strings, and custom filenames are sanitized to prevent XSS injection.
