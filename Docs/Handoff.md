# Operational Handoff & Deployment Guide (Handoff) — WallpaperStudio

## 1. Executive Operational Summary
**WallpaperStudio** is fully configured for continuous deployment on **Vercel Hobby Tier** ($0/mo) integrated with **Convex DB** ($0/mo), **Clerk Auth** ($0/mo), and **Google Gemini Free API** ($0/mo).

---

## 2. Environment Variables Registry (`.env.local`)

Copy `.env.example` to `.env.local` and inject the required keys:

```bash
# Convex Reactive Backend Database
NEXT_PUBLIC_CONVEX_URL="https://your-convex-instance.convex.cloud"

# Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# Google Gemini API Key (Generative AI Wallpaper Prompts)
GEMINI_API_KEY="AIzaSy..."
```

---

## 3. Local Development & Deployment Commands

### 3.1. Development Server Startup
```bash
# Install dependencies
npm install

# Run Convex local dev backend
npx convex dev

# Run Next.js 15 dev server (in a separate terminal)
npm run dev
```

### 3.2. Pre-Flight Validation Checks
```bash
# Run ESLint check
npm run lint

# Run TypeScript strict type check
npx tsc --noEmit

# Run Pytest / Vitest test suite
npm run test
```

### 3.3. Production Build & Deployment to Vercel
```bash
# Build production Next.js bundle
npm run build

# Deploy to Vercel (or push to main branch for automated CI/CD)
npx vercel --prod
```

---

## 4. Maintenance & Support Contacts
* **Project Lead:** Siesta (PM / Orchestrator)
* **Lead Architect:** Kisuke Urahara
* **Backend & Security:** Diablo & Riza Hawkeye
* **UI/UX & Taste System:** Nico Robin & Mayuri Kurotsuchi
