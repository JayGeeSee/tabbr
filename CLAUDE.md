# TABBR — briefing for Claude Code

Read this at the start of every session. Update the **Status** and **Open issues** sections whenever something changes, and add a dated line to **Decision log** for any decision Justin makes.

## Who you're working with

- **Justin** owns TABBR. He's a former Coldstream Guards soldier (including a regimental recruitment team) and a **complete beginner at coding**. He built the app with Claude in chat up to November 2026, then moved to Claude Code.
- Explain things in plain British English. Say what a command does before running it. Give one step at a time when he has to do something himself (Xcode, App Store Connect, Play Console, his iPhone).
- He works on a **Mac**, tests on an **iPhone**, and has GitHub, Vercel and Claude Pro accounts. He has **not yet paid** for the Apple Developer Program ($99/year) or Google Play Console ($25 one-off). Don't assume he has.
- When he asks for something big or ambiguous, ask one short question first. Otherwise just do it and tell him what changed.

## What TABBR is

A fitness tracker built around British Army **tabbing** (loaded marching), now also covering **runs**. Gamified with XP, a 20-rank ladder (Recruit to Field Marshal, with NATO grades and lore), badges, missions, daily and weekly challenges, test-prep training programmes, GPS route tracking with maps and splits, and spoken km cues. Scope is all British Armed Forces branches, not just infantry. Visual identity: dark background, NVG green, reticle motifs; three themes (Clean, Military, TABBR).

It ships two ways from one codebase:
1. **Web app (PWA)**: GitHub repo `tabbr`, auto-deployed by Vercel on every push to `main`. Installed on iPhone with Safari → Share → Add to Home Screen.
2. **Native iPhone and Android apps** via **Capacitor 7**: the `ios/` and `android/` folders. They exist so GPS and voice cues keep working with the screen locked, which iOS web apps can't do.

## Commands

```bash
npm install          # once, and after package.json changes
npm run dev          # local preview at http://localhost:5173
npm run build        # web build into dist/ (what Vercel runs)
npm run ios          # native build + cap sync + open Xcode
npm run android      # native build + cap sync + open Android Studio
npm run build:native # vite build --mode native && cap sync (no service worker in native builds)
```

There is no automated test suite in the repo. Before saying something works: run `npm run build`, run `npm run dev` and check the affected screens in the browser preview, and for native changes run `npm run build:native`. Never tell Justin a feature works on his phone unless it has been run on his phone.

## Project layout

| Path | What it is |
|---|---|
| `src/App.jsx` | The whole app in one file (~2,500 lines): constants, rules, helpers, and the `TabApp` component with every screen. |
| `src/native.js` | Phone-only features behind `isNative`: background GPS, native text-to-speech, haptics, native share sheet, Preferences storage mirror, status bar. The web build falls back to browser APIs. |
| `src/main.jsx` | Entry point. Fonts are bundled with `@fontsource` (Latin subsets only), not loaded from Google. |
| `public/privacy.html` | Privacy policy both stores require. Contact email added (Nov 2026). |
| `vite.config.js` | Vite + `vite-plugin-pwa`. The PWA plugin is skipped when `mode === 'native'`. OpenStreetMap tiles are cached by the service worker. |
| `capacitor.config.json` | App ID `com.tabbr.fitness`, app name TABBR, `android.adjustMarginsForEdgeToEdge: "force"`, `android.useLegacyBridge: true`. |
| `ios/` | Xcode project, **Swift Package Manager** (no CocoaPods). iPhone only (`TARGETED_DEVICE_FAMILY = 1`), portrait. `Info.plist` has the location usage strings, `UIBackgroundModes` location + audio, and `ITSAppUsesNonExemptEncryption = false`. |
| `android/` | Android Studio project. `compileSdk`/`targetSdk` **36** (Google Play requires API 36 for new apps from 31 Aug 2026), AGP **8.10.1**, Gradle 8.11.1, portrait. |
| `assets/` | Source images for icons and splash; regenerate with `npx @capacitor/assets generate` (see README). |

## How the code works (rules to keep)

- **Storage:** everything is device-local. Keys: `tt_theme`, `tt_onboarded`, `tt_profile`, `tt_logs`, `tt_completed`, `tt_bw`, `tt_remDays`, `tt_timer`, `tt_routes`. Web uses localStorage; native also mirrors to Capacitor Preferences and reads it as a fallback (`store` in App.jsx). Backup/restore exports and imports all `tt_` keys as JSON.
- **XP is never stored.** `computeXP(logs)` derives it from the session log every time (sessions + missions + daily + weekly challenges). Deleting a session must remove its XP. Don't add a stored XP counter back.
- **Dates** on sessions are `dd/mm/yyyy` strings. Always use `parseDate()` / `weekKey()`; never sort them as text. Weeks run Monday to Sunday.
- **Units:** everything is stored metric (km, kg, minutes). `makeUnits()` only converts for display and input. Pace displays as `m:ss /km` or `/mi`.
- **Session types:** `type: "run"` or tab (missing type = tab, for older data). Use `isRun`, `tabsOf`, `runsOf`, `paceOf`. Tabbing badges, missions and records count tabs only; running ones count runs only.
- **Time** is stored as minutes with decimals (seconds precision). The log form accepts `105`, `24:30` or `1:45:00` via `parseDuration()`.
- **Calories:** tabs use a load-adjusted MET formula; runs use the ACSM running equation, blended with the walking equation below 134 m/min.
- **Programmes:** `TESTS` defines targets; `getProgramme(test, level)` returns 8 weeks × 3 sessions. The beginner TABBR 10-miler is the original hand-written plan; others come from `generateProgramme` (tabs) and `generateRunProgramme` (runs). Progress keys are `"<programmeId>|<week>-<session>"`, so each programme keeps its own progress.
- **GPS:** fixes worse than ±35m are ignored, jitter under 5m is ignored, and jumps faster than 7 m/s are treated as glitches. Routes are segments of `[lat, lon, secondsIntoTab]`, downsampled to ~800 points on save, stored in `tt_routes` by session id.
- **Navigation:** bottom tabs Home / Train (Timer, Programme) / Log / Progress (Records, Missions, Honours) / More (Settings, Training days, Calorie calculator, Tips). Use `go("<screen>")` to navigate.
- **Style:** inline style objects built from theme tokens (`T.accent`, `T.onAccent`, `T.dangerBg`…). Icons come from `lucide-react` via the `I(Icon, size)` helper; no emoji in the UI. Keep tap targets at least 44px and respect safe areas.

## Facts and standards

Military standards in the app were checked against sources in October 2026. Re-check before changing them, cite where they came from, and tell Justin when something is unofficial.

| Test | Standard used | Source / confidence |
|---|---|---|
| Army Role Fitness Test, Ground Close Combat | 4km with 40kg in 50 min, then 2km with 25kg in 15 min | Forces News — official |
| Army 8-miler (Annual Fitness Test) | 8 miles (12.9km) under 2 hours; 25kg infantry, 20kg combat support arms, 15kg combat service support | Wikipedia — legacy test, largely replaced by the Role Fitness Test |
| P Company 10-miler | 10 miles, 35lb (16kg) bergen plus weapon and water, 1h50 regulars (2h reservists); app trains at 20kg | Forces News |
| Royal Marines 9-mile speed march | 9 miles, ~32lb fighting order plus rifle, 90 min; app trains at 19kg | Wikipedia |
| Royal Marines pre-joining runs | 2 × 2.4km on a treadmill at 2%: under 12:30, 1-minute rest, under 10:00 | Royal Navy website — official |
| Army 2km run | 800m warm-up, then 2km flat. Level targets 11:15 / 10:00 / 8:15 | **Unconfirmed.** 11:15 is a reported lowest entry standard (Forces News). 8:15 is a soldier's answer on the Army Jobs Q&A site. Justin is to ask his recruiter. |
| TABBR 10-miler, TABBR 5K | TABBR's own goals | Not official; the app says so |

## Native app notes (read before touching ios/ or android/)

- **Capacitor is pinned to 7** because `@capacitor-community/background-geolocation@1.2.26` lists support up to Capacitor 7 and its Swift package requires `capacitor-swift-pm` 7.x. `@capacitor-community/text-to-speech` is pinned to **6.1.0**, the version built for Capacitor 7. Don't upgrade to Capacitor 8 without checking both plugins.
- The native apps were **generated and configured but never compiled** before the move to Claude Code; there was no Xcode or Android SDK in the chat workspace. Expect first-build issues, and fix them with Justin.
- The app ID `com.tabbr.fitness` becomes permanent once registered with Apple or Google. Confirm with Justin before registering. For free personal-team testing in Xcode he may need `com.tabbr.fitness.justin`.
- Free Apple ID signing: apps expire after 7 days (re-run from Xcode).
- iOS location: "Allow While Using App" plus the background mode should keep tracking when locked (blue indicator). This is unverified on his phone.
- Android shows a foreground notification ("TABBR is tracking your tab") during background GPS.
- Vercel only needs the web files, but pushing `ios/` and `android/` to the same repo is fine; Vercel ignores them.

## Status (as of 7 November 2026)

- Done: bug fixes; UX redesign; add-ons (GPS route maps, splits, voice cues, weekly summary, test-prep programmes, backup); running (run sessions, 0kg bergen, run programmes, badges, missions, records); Capacitor projects.
- Waiting on Justin: deploy the latest web version; **first free iPhone test of the native app through Xcode**; open the Apple and Google developer accounts; confirm the app ID; line up **12 Android testers** for Google's required 14-day closed test; ask his recruiter for the exact infantry 2km run time.
- Next for the store (when his accounts are open): register the bundle ID, archive and upload through Xcode, TestFlight, App Store Connect listing (screenshots, privacy URL, "Data Not Collected" label), review. On Google: create the app, signed `.aab`, closed test (12 testers × 14 days), Data safety form, foreground-service location declaration.

## Open issues (agreed priority order)

1. **High — native apps never built or run.** Do the free iPhone test first: it decides whether the store apps are worth paying for.
2. **High — storage will fill.** Each GPS route is about 20KB and localStorage holds about 5MB: roughly 200 GPS sessions. `store.set` swallows quota errors, so saves would fail silently. Fix: warn when space runs low, and move routes to the Capacitor Filesystem in native (and IndexedDB on web).
3. **Medium — training-day reminders** are an in-app card only. Add `@capacitor/local-notifications` for real reminders in the native apps (check the Capacitor 7 version).
4. **Medium — no guided two-part test mode** for the Royal Marines runs (2.4km, 1-minute rest, 2.4km) or the Army Ground Close Combat march (4km/40kg then 2km/25kg).
5. **Medium — no interval rep timer.** Run programmes prescribe reps and rests, but the timer can't count reps or cue rests.
6. **Low — badge and mission rule wording** is always metric, even when Imperial is selected.
7. **Later — squad leaderboards and group challenges.** These need user accounts and a backend (for example Supabase or Firebase) and privacy decisions. Set aside deliberately.

## Decision log

- Oct 2026: XP derived from logs, never stored (stops farming by deleting and re-logging).
- Oct 2026: Programme distances are km everywhere; the original plan was written in miles and is converted.
- Oct 2026: Fonts bundled locally; the app makes no Google Fonts requests.
- Oct 2026: Native apps via Capacitor 7 rather than a rewrite, keeping one codebase for web and stores.
- Oct 2026: Android targets API 36; iPhone-only on iOS (no iPad screenshots needed).
- Oct 2026: Runs are a session type (Tab/Run toggle), not just a 0kg tab, so tabbing rewards stay tab-only.
- Nov 2026: Moved from Claude chat to Claude Code (desktop app, Code tab) on Justin's Mac.
