# Phase 15: Progressive Web App (PWA) Functionality

## Date / Session
- Timestamp: 2026-09-09
- Status: Completed

---

## 1. PWA Specifications Configured
1. **Web App Manifest (`public/manifest.json`)**:
   - `name`: "Taekwondo Club Attendance & Fees PWA"
   - `short_name`: "TKD Club"
   - `start_url`: "/"
   - `display`: "standalone" (launches as a full-screen mobile app without URL bars)
   - `theme_color`: "#0f172a"
   - `background_color`: "#020617"
   - `icons`: 192x192 and 512x512 maskable PNG icons.
2. **Service Worker (`public/sw.js`)**:
   - Pre-caches core application shell assets (`/`, `/login`, `/manifest.json`, icon assets).
   - Network-first navigation strategy with instant cache fallback.
   - Background stale-while-revalidate for static style and script bundles.
3. **Registration Lifecycle (`src/components/pwa/register-sw.tsx`)**:
   - Embedded cleanly inside the root layout to automatically register the service worker upon page load in modern browsers (Chrome, Edge, Safari).
