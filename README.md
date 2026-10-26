# Sarac Ramsay — Client Dashboard

An internal client dashboard: Home task list, a Clients hub, a step-by-step
new-client onboarding flow, a per-client page (tasks, roadmap, account) and a
Results tracker. It is a **static site** — no build step — so it hosts on
GitHub Pages as-is.

## Run it locally

Because it loads several script files, open it through a tiny local server
(opening `index.html` directly with `file://` can block the scripts):

```bash
# any one of these, from this folder:
python3 -m http.server 8000      # then open http://localhost:8000
npx serve .
```

## Host it on GitHub Pages

1. Create a new GitHub repository and push these files to it (keep the folder
   structure — `index.html` must be at the repo root, or set Pages to the
   folder it lives in).
2. In the repo: **Settings → Pages → Build and deployment → Source: Deploy
   from a branch**, pick your branch and `/ (root)`, save.
3. Wait a minute; your site is live at `https://<you>.github.io/<repo>/`.

React, ReactDOM and htm load from a CDN (unpkg), so an internet connection is
needed. To remove that dependency later, download those three files into the
folder and point the `<script src>` tags at the local copies.

## Saving data, login and live Google Calendar (Supabase + Netlify)

Out of the box the dashboard saves in your own browser. To share it between
you and Josh, keep it saved, and sync with Google Calendar, set up the three
pieces below once. Nothing needs a build step.

### 1. Supabase (storage, accounts, live updates)

1. Create a project at supabase.com.
2. **SQL Editor**: paste the whole of `supabase/schema.sql` and run it (it is safe to run again after updates).
   Before running, set who may sign in, near the top: either exact emails in
   `allowed_users`, or a whole company domain in `allowed_domains`
   (uncomment that line and put your domain). Everyone else is locked out by the database itself.
3. **Authentication, Providers, Email**: leave email sign in on. You can keep "Confirm email" on
   (people click a link after creating the account) or turn it off for a faster start.
4. **Authentication, URL configuration**: set Site URL to your Netlify address
   (and add `http://localhost:8000` to Redirect URLs for local testing).
5. **Project settings, API**: copy the Project URL and the `anon` key into
   `index.html`, in the `SR_CONFIG` block. The anon key is safe to commit,
   the row level security rules protect the data.

How people get in: open the site, **Create account** with a work email and password,
then pick a username and a photo. The username is what teammates see and what `@mentions` use,
so pick whatever you like. The sign up screen also lets you take over the starter tasks that are assigned to the placeholder names `Matt` or `Josh`. "Keep me signed in on this device"
is ticked by default; untick it on a shared computer. "Forgot your password" sends a reset link.

Optional, one click sign in with Google (this also connects the calendar):
Authentication, Providers, Google: paste the same Google client ID and secret as step 3 below,
and add the callback URL Supabase shows to the Google OAuth client's redirect URIs.

When `SR_CONFIG` is filled in, the dashboard shows a sign in page, saves every
change, and shows each other's changes live. Left empty, it keeps working on
this browser only.

### 2. Netlify (hosting + the Google Calendar functions)

GitHub Pages cannot run the sync functions, so host on Netlify (it deploys
straight from the GitHub repo, `netlify.toml` is already set up).

Site settings, Environment variables (see `.env.example`):

| Variable | Where it comes from |
|---|---|
| `SUPABASE_URL` | Supabase, Project settings, API |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page, `service_role` (secret, never put it in index.html) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Step 3 |
| `SITE_URL` | Your Netlify address, no trailing slash |

### 3. Google Calendar

1. console.cloud.google.com: create a project, enable **Google Calendar API**.
2. **APIs and services, OAuth consent screen**: user type External, add your
   and Josh's Google emails as test users.
3. **Credentials, Create credentials, OAuth client ID, Web application**.
   Authorised redirect URI: `https://YOUR-SITE.netlify.app/.netlify/functions/gcal-callback`
4. Copy the client ID and secret into the Netlify variables above, redeploy.
5. In the dashboard: avatar, **Settings**, Integrations, **Connect** (or Calendar, Accounts, Connect Google Calendar).

How the sync works: a second after any change in the dashboard, and every minute as a safety net,
the dashboard calls `netlify/functions/gcal-sync.js`. Changes made in Google reach the dashboard
within seconds, because Google pings `gcal-webhook.js` (the watch is renewed automatically while you use the app). Tasks that are assigned to
you and have a date and time, plus calendar events, are written to your
Google Calendar. Events you create or move in Google come back in. If both
sides change the same item, Google wins. Finished, unscheduled or deleted
tasks are removed from Google. Logic lives in `netlify/lib/gcal.js`.

### Files added for this

| Path | What it is |
|---|---|
| `supabase/schema.sql` | Tables, security rules, live updates |
| `netlify/lib/gcal.js` | The two way sync logic |
| `netlify/lib/http.js` | Supabase and Google API helpers |
| `netlify/functions/gcal-connect.js`, `gcal-callback.js`, `gcal-sync.js` | Google sign in and sync |
| `netlify/functions/gcal-webhook.js` | Google tells us a calendar changed |
| `netlify/functions/gcal-disconnect.js` | Settings, Disconnect: stops the watch and forgets the token |
| `netlify/functions/gcal-store-token.js` | Saves the token when someone uses "Continue with Google" |
| `.env.example` | The variables to set on Netlify |

## Go live checklist

1. Push this folder to GitHub.
2. Supabase: new project, run `supabase/schema.sql`, add your emails or domain, copy URL and anon key into `index.html`.
3. Supabase, Authentication, URL configuration: Site URL = your Netlify address.
4. Netlify: Add new site, Import from Git, pick the repo (no build command, publish directory `.`).
5. Netlify, Environment variables: the 5 in step 2, then redeploy.
6. Google Cloud: enable Calendar API, OAuth client with the `gcal-callback` redirect URI.
7. Open the site, create your account, then Settings, Integrations, Connect.
8. Optional: add your own domain in Netlify, Domain management, and use it as `SITE_URL` and in Supabase.

Settings (avatar, top right): theme, sound, time zone (automatic by default), Google Calendar, sign out.

## Where things live

| File          | What it holds |
|---------------|---------------|
| `index.html`  | Page shell, loads the libraries and scripts in order |
| `styles.css`  | Reset + base; colours are CSS variables set from JS |
| `data.js`     | **Edit this first** — clients, project templates, project-math, seed tasks |
| `ui.js`       | Theme, task row, task drawer, the shared task list |
| `screens.js`  | Home, Clients cards, Onboarding (stepper) |
| `screens2.js` | Client page (tasks / roadmap / account) and Results tracker |
| `app.js`      | App state, routing and the sidebar |

Nothing is saved between refreshes yet — it all lives in memory. Adding
`localStorage` is a small change in `app.js` when you want it to stick.

## Editing tips

- Change clients, retainers and promises in `SEED_CLIENTS` (data.js).
- The Google Ads / Meta / AEO checklists are `TEMPLATES` in data.js: each
  phase has steps, each step lists the tasks it creates.
- `projectMath()` in data.js turns the promise into clicks-a-day and budget.
- Colours for light and dark mode are `THEMES` in ui.js.

## Sales dashboard (one folder)

The Sales dashboard lives in `sales/`. The switch in each sidebar or header links the two.
- Clients: `/` (index.html)
- Sales: `/sales/`
- Apollo calls use `netlify/functions/apollo.js`, so Sales data from Apollo only works on Netlify. The rest works on any static host.
