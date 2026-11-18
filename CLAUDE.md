# Sarac Ramsay Eclipse

Internal operating dashboard for the Sarac Ramsay marketing/SEO agency. Owner: Matt (matt@welcometoimf.com, Oslo, Europe/Oslo).
Live site: https://saracramsay-os.netlify.app
Repo: github.com/sarac133/sr-platform (private). Netlify site: saracramsay-os. Supabase project: sr-platform.

## Working rules (read first)
- Netlify credits are scarce (about 15 per production deploy). Batch changes, test locally, push ONCE.
- Never lose data. No change may risk deleting or overwriting saved data.
- Edit existing files. Do not create new files, zips or copies unless asked.
- Matt pushes to GitHub himself. Commit locally, then tell him the push command: `git push origin main`.
- Bump the build label on every delivery (format 1105c, then 1105d). It lives in `app.js` and `index.html`; update both with sed.
- Writing style with Matt: short, simple language, no em dashes, numerals not words, short paragraphs then bullets, tables for comparisons, answers in chat not documents.
- Show design ideas as images or interactive previews, not text descriptions.
- Commit messages end with: Co-Authored-By: Claude <noreply@anthropic.com>

## Stack
- No build step. React 18 + htm loaded in the browser, global `window.SR`.
- Run locally: `python3 -m http.server 8765` in this folder, open http://localhost:8765
- Hosting: Netlify (static). `netlify/functions/apollo.js` is a serverless function for Apollo contacts.
- Eclipse login and data storage: Supabase (when signed in), otherwise localStorage.

## Files
| File | Purpose |
|---|---|
| index.html | Entry page, loads scripts, holds the build label |
| data.js | Static data, fronts (battlefronts), task lists |
| ui.js | Shared UI pieces, shortcuts list |
| screens.js | Main screens (Home, Clients, Finance etc.) |
| screens2.js | More screens: Goals/Missions, Overview hub (constellation) |
| app.js | App shell, navigation, routing, command palette, shortcuts |
| styles.css | All styles |
| drive.js, grid.js | Drive screen and grid helpers |
| sales/index.html | Sales dashboard, a separate page shown in an iframe. About 8,000 lines. Uses Firebase. |
| supabase/ | Supabase config |
| gads-task-list.md | Google Ads task list reference |

## Screens and navigation
Home, Overview (constellation hub), Sales (iframe), Clients, Finance, Drive. Shortcuts: `G then H/M/S/O` go to Home, Missions, Sales, Overview. The screen is saved in localStorage key `sr_screen` and restored on refresh. Opening `sales/index.html` on its own redirects to `../?screen=sales` unless `?standalone=1`.

## Overview hub (build 1105b)
Interactive canvas "constellation": each battlefront is a planet in a tilted elliptical orbit, missions are moons, the eclipse orb in the middle shows overall progress. Drag planets (positions saved in `SR.uiprefs.hub`), pan, wheel zoom, click to focus, side panel lists missions. Code: `SR.hubEngine` (canvas engine) and `SR.Hub` (React) in screens2.js. Progress comes from `SR.missionProg`. Missions are stored in `SR.uiprefs.goals.missions`. Right-click on a mission opens a menu (1105a).

## Storage (important)
- `SR.uiprefs` is synced (Supabase when signed in, else localStorage).
- Sales page uses Firebase Realtime Database: `https://sales-dashboard-90e7f-default-rtdb.europe-west1.firebasedatabase.app`
  - `dashboard/data` is the live document (about 1.4MB: apolloContactsData, crmData, cbDone, callingByCampaign, etc.).
  - `dashboard/history/<timestamp>` holds snapshots (kept to the newest 40, each a JSON string).
  - Rules allow unauthenticated read and write. Do not test against `dashboard/`. Use a temp node such as `dashboard_t/` and delete it afterwards.
  - localStorage cache key `sr_dashboard_v2`. Pending-save marker key `sr_pending`.

## Sales save logic (fixed in 1105c)
Problem: dials and pipeline did not stay saved on the live site after refresh. Causes found and fixed:
- Whole 1.6MB document was written on every change and the history prune downloaded 66MB. Now only changed top-level keys are sent with `update()` (about 8KB), and the prune uses a shallow REST key list.
- If a save failed, the next load let the old server copy overwrite local edits. Now `sr_pending` marks unsaved edits and they are restored on top of the server copy at load.
- Added a visible status chip `#sr-savestat` in the Sales header: "Saved HH:MM:SS", "Saving...", "NOT SAVED: <reason>", or "waiting for connection".
Main functions in sales/index.html: `componentDidUpdate` (builds the save payload), `_writeNow`, `_partsOf`, `_saveStat`, `_saveFailed`, `_maybeSnapshot`, `_initFirebase`, `_startRealtimeListener`. Writes are gated on `_fbLoaded`. A shrink guard sets `syncBlocked` if a change would remove most data.
If saving fails again, ask Matt for the chip text and the browser console error before changing code.

## History
- 1104k to 1104z: earlier dashboard work.
- 1105a: mission right-click menu.
- 1105b: Overview constellation hub (live).
- 1105c: Sales save fix and stay-on-page after refresh. Committed locally as f0b69a2. Matt pushes it.
- Folders `sales-dashboard` and `seo-platform` were removed and merged here. `seo-platform` can be restored with `git clone https://github.com/sarac133/seo-platform.git`. The old standalone sales-dashboard was never in git; this repo's `sales/` is the newer version.

## Testing notes
- Use Playwright (Chromium). Log in on the first screen with name "Matt". Test Sales with `sales/index.html?standalone=1` or through the Sales tab.
- Test Firebase behavior against a temp node, never `dashboard/`. Test offline with `context.set_offline(True)`.
- Check JS with `node --check file.js` before delivering.

## Ideas not built yet
- Recreated standalone sales folder (low value).
- Further Overview hub polish.
