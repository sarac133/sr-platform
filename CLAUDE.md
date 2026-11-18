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
| sales/index.html | Sales dashboard, a separate page shown in an iframe. About 9,500 lines. Saves through `SR.salesStore` (Supabase) in the parent app. |
| supabase/ | Supabase config |
| gads-task-list.md | Google Ads task list reference |

## Screens and navigation
Home, Overview (constellation hub), Sales (iframe), Clients, Finance, Drive. Shortcuts: `G then H/M/S/O` go to Home, Missions, Sales, Overview. The screen is saved in localStorage key `sr_screen` and restored on refresh. Opening `sales/index.html` on its own redirects to `../?screen=sales` unless `?standalone=1`.

## Overview hub (build 1105b)
Interactive canvas "constellation": each battlefront is a planet in a tilted elliptical orbit, missions are moons, the eclipse orb in the middle shows overall progress. Drag planets (positions saved in `SR.uiprefs.hub`), pan, wheel zoom, click to focus, side panel lists missions. Code: `SR.hubEngine` (canvas engine) and `SR.Hub` (React) in screens2.js. Progress comes from `SR.missionProg`. Missions are stored in `SR.uiprefs.goals.missions`. Right-click on a mission opens a menu (1105a).

## Storage (important)
- `SR.uiprefs` is synced (Supabase when signed in, else localStorage).
- Sales page data (since 1105d) lives in Supabase table `sales_rows`, behind the Eclipse login. Code: `SR.salesStore` in data.js; the Sales iframe uses it through `window.parent.SR.salesStore`.
  - Data is cut into rows by path: one per lead (`crmData/<region>/<lead id>`, value `{g: group, i: position, v: lead}`), per Apollo contact, per call week (`callingByCampaign/<campaign>/<person_week>`), per cbDone entry and so on. `SPEC` in data.js says how each key is cut; other keys are one row. Keys ending `/~` mark containers. `_meta/migrated` marks the one-time copy from Firebase.
  - Each device sends only rows it changed; live updates from other devices are merged row by row. A lead keeps its position value unless it moves, so a move changes 1 row.
  - View settings (filters, sort order, open panels: `VIEW` in data.js) are per device in localStorage `sr_sales_view`, never shared.
  - Backups: table `sales_snapshots`, newest 40.
  - localStorage: cache `sr_dashboard_v2` (instant paint only), unsaved rows `sr_pending_rows`.
  - Old Firebase (`sales-dashboard-90e7f`, `dashboard/data` + 40 snapshots in `dashboard/history`) is no longer read or written by the app, only once by the migration. Keep it as a backup. Its rules allow unauthenticated read and write: never test against it.
  - Testing: 2-device test with a fake Supabase (Playwright, `window.__SR_SALES_SB` and `window.__SR_SALES_FIREBASE` test hooks), never against the real database.

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
- 1105d: Sales moved from Firebase to Supabase (`sales_rows`), saved row by row with live merge between devices. Needs the "Sales page data (build 1105d)" SQL from supabase/schema.sql run in Supabase BEFORE the push. The first device to open Sales after the push copies the Firebase data once.
- 1105e: hide the second "Powered by Netlify" badge inside the Sales iframe (CSS on `#nl-badge-frame`, `#nl-hud-frame` in sales/index.html). Netlify injects the badge on every HTML page on the free plan.
- Folders `sales-dashboard` and `seo-platform` were removed and merged here. `seo-platform` can be restored with `git clone https://github.com/sarac133/seo-platform.git`. The old standalone sales-dashboard was never in git; this repo's `sales/` is the newer version.

## Testing notes
- Use Playwright (Chromium). Log in on the first screen with name "Matt". Test Sales with `sales/index.html?standalone=1` or through the Sales tab.
- Test Firebase behavior against a temp node, never `dashboard/`. Test offline with `context.set_offline(True)`.
- Check JS with `node --check file.js` before delivering.

## Ideas not built yet
- Recreated standalone sales folder (low value).
- Further Overview hub polish.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- When graphify-out/graph.json exists, run `graphify query "<question>"` before your first grep, search or source-file read for a codebase question, and put this rule in every subagent prompt that explores code. Read raw files only for lines the graph or an earlier read already located. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. When the answer is under a Markdown heading, `graphify section "<heading>"` prints that section's text, so the .md need not be opened. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost). Then run `$(cat graphify-out/.graphify_python) .claude/graphify_sr.py && graphify cluster-only . --no-label`: graphify cannot see functions inside the `(function (SR) {...})` wrappers in the root .js files, so this add-on adds them. The local git hooks run both after each commit. `.graphifyignore` keeps `.claude/` out of the graph.
- A committed graphify-out/graph.json is rewritten whole on every build, so a large diff to it in a pull request is expected. Do not flag it as churn or suggest skipping the graph rebuild or its hooks.
