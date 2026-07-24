# QA Strategy & Test Plan (Test_Plan) — WallpaperStudio

## 1. Quality Assurance Overview & Mandate
This document defines the automated testing protocols, linter rules, canvas export checks, and coverage targets required for **WallpaperStudio**.

All code must achieve a minimum unit test coverage threshold of **80%** (`vitest --coverage`) and pass static analysis checks (`npm run lint` and `npx tsc --noEmit`) before deployment to production.

---

## 2. Testing Framework Architecture

* **Unit & Component Testing:** Vitest + React Testing Library (for UI components, Zustand store slices, and color calculation utilities).
* **Canvas Render Verification:** HTML5 Canvas Offscreen Canvas export verification tests (validating PNG blob generation and resolution output).
* **End-to-End Testing:** Playwright (simulating wallpaper generation, preset selection, color extraction, and download triggers).
* **CI Automation:** GitHub Actions workflow executing lints, typechecks, and unit test suites on every pull request.

---

## 3. Unit & Component Test Blueprints

### 3.1. Color Palette Extractor Test (`tests/unit/palette.test.ts`)
```typescript
import { describe, it, expect } from "vitest";
import { extractDominantColors } from "../../lib/canvas/palette_extractor";

describe("extractDominantColors", () => {
  it("should return array of HSL colors from valid image data", () => {
    const mockImageData = new ImageData(new Uint8ClampedArray([
      255, 0, 0, 255,    // Red
      0, 255, 0, 255,    // Green
      0, 0, 255, 255,    // Blue
      255, 255, 255, 255 // White
    ]), 2, 2);

    const colors = extractDominantColors(mockImageData, 3);
    expect(colors).toHaveLength(3);
    expect(colors[0]).toHaveProperty("hsl");
    expect(colors[0]).toHaveProperty("hex");
  });
});
```

### 3.2. Offscreen Canvas Export Test (`tests/unit/export.test.ts`)
```typescript
import { describe, it, expect } from "vitest";
import { generateOffscreenWallpaper } from "../../lib/canvas/export_engine";

describe("generateOffscreenWallpaper", () => {
  it("should render 4K resolution canvas blob (3840x2160)", async () => {
    const config = {
      gradient: { colors: ["#10B981", "#09090B"], type: "mesh" },
      noise: { opacity: 0.05, scale: 1 },
      aspectRatio: "16:9"
    };

    const blob = await generateOffscreenWallpaper(config, 3840, 2160);
    expect(blob).not.isNull();
    expect(blob?.type).toBe("image/png");
  });
});
```

---

## 4. Visual Golden Sweep & Layout Testing

Visual golden tests verify responsive scaling across target viewports:

| Viewport Target | Dimensions | Verification Checks |
|---|---|---|
| **Mobile Phone** | 375px x 812px | Fixed bottom action bar, 16px screen margins, zero horizontal scrollbar. |
| **Tablet Viewport** | 768px x 1024px | Dual-column responsive layout, touch-friendly 48px controls. |
| **Desktop 4K** | 1920px x 1080px | Side-by-side preview and tabbed editor panels, 60 FPS Canvas render. |

### Zero Layout Overflow Policy
Any horizontal scrollbar overflow or text wrapping defect on standard screens fails CI validation immediately.

---

## 5. Security & Rate Limit Verification
* **Clerk Auth Protection:** Verify authenticated mutation routes reject requests missing valid JWT tokens.
* **Gemini API Rate Limiting:** Verify client handles HTTP 429 rate limit responses gracefully with an informative toast alert.
