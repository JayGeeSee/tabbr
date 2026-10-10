# TABBR

A loaded-march (tabbing) fitness tracker that installs on an iPhone as a home-screen app.

## What's in this folder

| File / folder | What it is |
|---|---|
| `src/App.jsx` | The whole app |
| `src/main.jsx` | Starts the app |
| `index.html` | The page the app loads into |
| `public/` | App icons |
| `package.json`, `package-lock.json` | The list of building blocks (packages) the app needs |
| `vite.config.js` | Build settings, including offline support |
| `.gitignore` | Tells GitHub which files to skip (hidden on a Mac — that's normal) |

## Getting it on your iPhone (no installs needed)

1. **GitHub:** create a new repository, then *Add file → Upload files* and drag in **everything inside** this folder (not the folder itself). Commit.
2. **Vercel:** *Add New → Project*, import the repository, leave every setting as it is, click **Deploy**.
3. **iPhone:** open your Vercel link in **Safari** → Share → **Add to Home Screen**.

The full step-by-step guide was given to you separately.

## Updating

Upload the changed files to the same GitHub repository (same places, replace when asked) and commit. Vercel rebuilds automatically in about a minute. On the iPhone, close TABBR fully and reopen it — sometimes twice — to get the new version.

## Optional: running it on a Mac

Only needed if you want to try changes before uploading. Install Node.js (LTS) from nodejs.org, then in Terminal inside this folder:

```bash
npm install      # once, and after package.json changes
npm run dev      # opens a local preview at http://localhost:5173
```

Press Ctrl + C to stop it.

---

## GPS tracking

GPS needs HTTPS, which Vercel provides automatically. On your Mac, `localhost` also counts as secure, but a laptop's location is only rough Wi-Fi positioning. Test GPS properly on your iPhone using your Vercel URL.

How it works:
1. On **Train → Timer**, choose **📡 GPS** (the default) or **✍️ Manual** before you start.
2. Press **Start TAB**. The first time, Safari asks for your location. Tap **Allow**.
3. The status strip shows the signal: green means locked, amber means waiting for a better fix.
4. When you pause, you can correct the distance before saving.

**Important on iPhone:** keep TABBR open on screen while you tab. iOS pauses location for home-screen web apps when the screen locks or you switch apps. TABBR asks the phone to keep the screen awake where it can. The timer always keeps correct time, even if the phone locks or the app is closed and reopened. If GPS was paused, TABBR adds the straight-line distance between where you stopped and where you resumed. Winding routes will under-count, so check the number before saving.

If you denied location by mistake: Settings → Privacy & Security → Location Services → Safari Websites → While Using the App.

---

## Route maps, splits and voice cues

- Every GPS-tracked tab saves its route. In the **Log**, sessions with a route show a map pin. Tap any session to see its map, your split for each km (or mile), and its details.
- Maps use OpenStreetMap. Map tiles need a connection the first time you view an area; after that they're cached for offline use. The route line itself always shows, even offline.
- On the timer you can set a **target pace**, or start a programme session, which sets one automatically. While you tab, the timer shows how far ahead of or behind target you are.
- Tap **Voice** on the timer to hear your time, last split and target gap every km (or mile). Keep the app open on screen for cues, the same as for GPS.

---

## Programmes and test prep

Go to **Train → Programme → Change programme** to pick what you're training for, and your level:

- **TABBR 10-Miler.** TABBR's own benchmark. Your original 8-week plan is the beginner version.
- **Army Role Fitness Test (Ground Close Combat):** 4km with 40kg in 50 min, then 2km with 25kg in 15 min.
- **Army 8-Miler (Annual Fitness Test):** 8 miles in under 2 hours, with 25kg for infantry. This test has largely been replaced by the Role Fitness Test.
- **P Company 10-Miler:** 10 miles with a 35lb bergen plus weapon and water, in 1h50.
- **Royal Marines 9-Mile Speed March:** 9 miles in fighting order plus rifle, in 90 min.

Each one comes in Beginner, Intermediate and Advanced. Progress is saved separately for each programme, so switching never loses anything. Official standards change, so always confirm the current test with your unit or recruiter.

---

## Weekly summary

Home shows this week (or last week) at a glance: tabs, distance, time on feet, heaviest load, XP earned and your week streak. **Share this week** makes an image for Instagram, WhatsApp and so on.

---

## Training days (reminders)

Go to **More → Training days** to pick the days you train. On those days, Home shows a "Training day" card until you log a session.

TABBR can't send push notifications yet. That needs a small server, which is a future step. For now, set a repeating alarm on your phone.

---

## Your data

All session logs, rank, badges and settings are stored in your iPhone's localStorage. Nothing is sent to any server. Everything stays on your device.

XP isn't stored as a running total. It's always worked out from your session log, so deleting a session removes its XP, along with any mission or challenge it unlocked. If you used an earlier version, your XP may change the first time you open this one. That's the old double-counting being corrected.

If you ever clear Safari's website data, your TABBR data will be erased. To protect it, go to **More → Settings → Save backup** now and then, and save the file somewhere safe (iCloud Drive works well). **Restore backup** on the same screen brings it all back, on this phone or a new one.

---

## Troubleshooting

**Vercel says the build failed** — open the failed deployment, click **Building**, copy the red error lines and ask for help with them. The most common cause is files uploaded to the wrong place: `App.jsx` and `main.jsx` must be inside `src/`, icons inside `public/`, everything else at the top level.

**Blank screen on the iPhone** — check the address starts with `https://` and ends in `.vercel.app`. Then remove the home-screen icon and add it again from Safari.

**Old version still showing after an update** — close TABBR fully (swipe it away) and reopen it, twice if needed.

**GPS not working** — tap Allow when asked for location. If you said no: Settings → Privacy & Security → Location Services → Safari Websites → While Using the App. Keep TABBR open on screen while tabbing. If GPS still won't lock, switch the Timer to Manual.
