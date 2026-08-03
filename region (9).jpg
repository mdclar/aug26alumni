# In the Steps of the Master — deploy guide

Study & journal companion for the BYU Jerusalem Alumni Tour (Aug 2–10, 2026).
Static PWA. All user data stays on each person's device (IndexedDB). No accounts, no database.

## Deploy to Netlify (2 minutes)

Option A — drag & drop (no OCR):
1. Go to https://app.netlify.com/drop
2. Drag the `site/` folder onto the page. Done — you get a live URL.
   (Functions don't deploy via drag-drop, so the Transcribe buttons will show
   "service unavailable" until you use Option B.)

Option B — full deploy with OCR:
1. Push this whole folder to a GitHub repo (or use `netlify deploy` CLI).
2. In Netlify: Add new site -> Import from Git -> pick the repo.
   Build settings are read from netlify.toml (publish `site/`, functions `netlify/functions/`).
3. Site settings -> Environment variables -> add:
      ANTHROPIC_API_KEY = sk-ant-...
   (Set a spend cap on the key in the Anthropic console.)
4. Deploy. The Transcribe handwriting buttons now work.

## Sharing / installing
- Send the Netlify URL. iPhone/iPad: Safari -> Share -> Add to Home Screen.
  Android: menu -> Install app. Desktop: works in any browser.
- Works offline after first load (service worker caches the app + maps).
- Each device keeps its own journal. Clearing browser data erases it — export first.

## Local preview on your network
From this folder:  `python3 -m http.server 8000 -d site`
Then on another device on the same WiFi: `http://<your-computer-ip>:8000`
(OCR needs Netlify; everything else works locally.)

## What's next (Phase 2)
Google Drive sign-in for cross-device sync and saving exports to a Drive folder.
Requires a Google Cloud OAuth client; app code hooks are already in place.
