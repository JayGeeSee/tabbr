import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  House, Footprints, NotebookPen, Trophy, Menu, Play, Pause, RotateCcw, Check, Flame, Satellite, PenLine,
  CalendarDays, Lightbulb, Settings, Target, Medal, Mountain, Dumbbell, Zap, Map, Share2, Download, Upload,
  X, ChevronLeft, ChevronRight, Lock, Backpack, Shield, Crosshair, Swords, Sunrise, Helicopter, Binoculars,
  Hourglass, Gauge, Route, Activity, Heater, Snowflake, CloudRain, Wind, Sun, CloudFog, BicepsFlexed,
  Brain, Utensils, Bandage, Shovel, CircleCheck, Moon, TriangleAlert, Siren, TrendingUp, Flag,
  CalendarCheck, Scale, Calculator, Plus, Award, Timer as TimerIcon, ClipboardList,
  Volume2, VolumeX, MapPinned, Clock,
} from "lucide-react";

// ─── STORAGE HELPERS (localStorage — persistent, device-local) ────────────────
const store = {
  async get(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  async set(key, val) {
    try { localStorage.setItem(key, val); } catch { /* storage full or blocked */ }
  },
};

// ─── THEMES ───────────────────────────────────────────────────────────────────
const THEMES = {
  clean: {
    bg: "#F7F6F2", surface: "#FFFFFF", surfaceAlt: "#EEECE6", border: "#DDD9CF",
    text: "#1A1A1A", textMuted: "#6B6560", accent: "#2D5016", accentLight: "#4A8028",
    accentBg: "#EAF2E0", danger: "#C0392B", warning: "#E67E22", gold: "#B8860B",
    goldBg: "#FFF8E1", cardBg: "#FFFFFF", navBg: "#FFFFFF", timerBg: "#F0EDE6",
    onAccent: "#FFFFFF", dangerBg: "#FDECEA", warningBg: "#FDF1E5", scheme: "light",
    font: "'DM Sans', sans-serif", displayFont: "'DM Serif Display', serif",
  },
  military: {
    bg: "#1A1C14", surface: "#252820", surfaceAlt: "#2E3127", border: "#3D4233",
    text: "#D4CFA8", textMuted: "#7A7D5E", accent: "#8CB43A", accentLight: "#A8D44A",
    accentBg: "#2A3018", danger: "#C0392B", warning: "#D4A017", gold: "#D4A017",
    goldBg: "#2A2510", cardBg: "#252820", navBg: "#1A1C14", timerBg: "#0E0F0A",
    onAccent: "#141610", dangerBg: "#3A1C17", warningBg: "#33290F", scheme: "dark",
    font: "'Share Tech Mono', monospace", displayFont: "'Oswald', sans-serif",
  },
  tabbr: {
    bg: "#0a0c0a", surface: "#0f120f", surfaceAlt: "#141a14", border: "#1f2e1f",
    text: "#e8f5e8", textMuted: "#6f9c6f", accent: "#4ade80", accentLight: "#6ee7a0",
    accentBg: "rgba(74,222,128,0.08)", danger: "#ff4444", warning: "#fbbf24", gold: "#4ade80",
    goldBg: "rgba(74,222,128,0.06)", cardBg: "#0d110d", navBg: "#080a08", timerBg: "#060806",
    onAccent: "#04140a", dangerBg: "rgba(255,68,68,0.10)", warningBg: "rgba(251,191,36,0.10)", scheme: "dark",
    font: "'Share Tech Mono', monospace", displayFont: "'Barlow Condensed', sans-serif",
  },
};

// ─── RANKS ────────────────────────────────────────────────────────────────────
// Full British Army rank structure — Other Ranks → Warrant Officers → Officers → General Officers
// Each rank includes: title, abbreviation, NATO grade, role description, and lore
const RANKS = [
  // ── OTHER RANKS ─────────────────────────────────────────────────────────────
  {
    title: "Recruit",        abbr: "Rec",    nato: "OR-1",  group: "Other Ranks",
    xpRequired: 0,           insignia: "○",  colour: "#9E9E9E",
    role: "Pre-trained soldier undergoing basic training. No stripes, no rank slide — just the bergen and the will to keep going.",
    lore: "Every infantry soldier started here. You've picked up the bergen. Now move.",
    variants: [],
  },
  {
    title: "Private",        abbr: "Pte",   nato: "OR-2",  group: "Other Ranks",
    xpRequired: 150,         insignia: "▪",  colour: "#78909C",
    role: "The backbone of the British Army. Executes orders, maintains equipment, and forms the foundation of every section and platoon.",
    lore: "You've earned your capbadge. Now prove you deserve to keep it.",
    variants: [
      { title: "Guardsman",  abbr: "Gdsm",  unit: "Foot Guards (Grenadier, Coldstream, Scots, Irish, Welsh)" },
      { title: "Trooper",    abbr: "Tpr",   unit: "Cavalry & Armoured regiments (e.g. Household Cavalry, Blues & Royals)" },
      { title: "Gunner",     abbr: "Gnr",   unit: "Royal Artillery & Royal Horse Artillery" },
      { title: "Sapper",     abbr: "Spr",   unit: "Royal Engineers — origins in military mining and fortification" },
      { title: "Signaller",  abbr: "Sig",   unit: "Royal Corps of Signals" },
      { title: "Fusilier",   abbr: "Fus",   unit: "Royal Regiment of Fusiliers, Royal Welsh, Royal Highland Fusiliers" },
      { title: "Rifleman",   abbr: "Rfn",   unit: "Rifles regiment — descended from Light Infantry tradition" },
      { title: "Kingsman",   abbr: "Kgsm",  unit: "Duke of Lancaster's Regiment" },
      { title: "Ranger",     abbr: "Rgr",   unit: "Royal Irish Regiment" },
      { title: "Craftsman",  abbr: "Cfn",   unit: "Royal Electrical and Mechanical Engineers (REME)" },
      { title: "Driver",     abbr: "Dvr",   unit: "Royal Logistic Corps (RLC) — vehicle operators" },
    ],
  },
  {
    title: "Lance Corporal",  abbr: "LCpl",  nato: "OR-3",  group: "Other Ranks",
    xpRequired: 400,          insignia: "▲",  colour: "#66BB6A",
    role: "First step into leadership. Commands and administers a team of around four soldiers. Often responsible for specialist weapons.",
    lore: "One stripe. You're no longer the new bloke. Lead by example.",
    variants: [
      { title: "Lance Bombardier", abbr: "LBdr", unit: "Royal Artillery — equivalent of Lance Corporal" },
      { title: "Lance Corporal of Horse", abbr: "LCoH", unit: "Household Cavalry — equivalent of Lance Corporal" },
    ],
  },
  {
    title: "Corporal",        abbr: "Cpl",   nato: "OR-4",  group: "Other Ranks",
    xpRequired: 800,          insignia: "▲▲", colour: "#42A5F5",
    role: "Commands a section of 8–10 soldiers. Often responsible for large weapons systems. Can gain trade and instructor qualifications.",
    lore: "Two stripes. Soldiers look to you under load. Don't crack.",
    variants: [
      { title: "Bombardier",         abbr: "Bdr",   unit: "Royal Artillery — equivalent of Corporal" },
      { title: "Lance Sergeant",     abbr: "LSgt",  unit: "Foot Guards — appointment held by Corporals within the Guards" },
      { title: "Corporal of Horse",  abbr: "CoH",   unit: "Household Cavalry — equivalent of Sergeant in most units" },
    ],
  },
  {
    title: "Sergeant",        abbr: "Sgt",   nato: "OR-6",  group: "Other Ranks",
    xpRequired: 1500,         insignia: "▲▲▲", colour: "#AB47BC",
    role: "Typically second-in-command of a platoon of ~30 soldiers. Responsible for administration, tactics, and advising the platoon commander.",
    lore: "Three stripes. You set the pace others break themselves trying to match.",
    variants: [],
  },
  {
    title: "Colour Sergeant", abbr: "CSgt",  nato: "OR-7",  group: "Other Ranks",
    xpRequired: 2500,         insignia: "✦",  colour: "#FF7043",
    role: "Infantry equivalent of Staff Sergeant. A senior role in a sub-unit covering training, equipment, and discipline. The title dates from 1813 — NCOs who carried the regimental colours into battle.",
    lore: "The Colour is the soul of the regiment. You carry its honour now.",
    variants: [
      { title: "Staff Sergeant", abbr: "SSgt", unit: "All non-infantry corps and regiments (equivalent grade, different role)" },
      { title: "Colour Sergeant", abbr: "CSgt", unit: "Infantry battalions — carries the historic prestige of the regimental colours" },
    ],
  },
  // ── WARRANT OFFICERS ────────────────────────────────────────────────────────
  {
    title: "Warrant Officer Class 2", abbr: "WO2", nato: "OR-8", group: "Warrant Officers",
    xpRequired: 4000,         insignia: "⬟",  colour: "#EC407A",
    role: "Company Sergeant Major (CSM) or equivalent. Senior NCO responsible for discipline, welfare, and administration of a company (~100–150 soldiers). Holds rank by Royal Warrant — not by commission.",
    lore: "The CSM is the backbone of a company. Every soldier answers to you first.",
    variants: [
      { title: "Company Sergeant Major", abbr: "CSM", unit: "Infantry — principal WO2 appointment" },
      { title: "Battery Sergeant Major", abbr: "BSM", unit: "Royal Artillery" },
      { title: "Squadron Sergeant Major", abbr: "SSM", unit: "Cavalry / Armoured" },
      { title: "Troop Sergeant Major", abbr: "TSM", unit: "Household Cavalry" },
    ],
  },
  {
    title: "Warrant Officer Class 1", abbr: "WO1", nato: "OR-9", group: "Warrant Officers",
    xpRequired: 6000,         insignia: "⬟⬟", colour: "#FFA726",
    role: "Regimental Sergeant Major (RSM) — the most senior soldier in a battalion. Senior advisor to the Commanding Officer. Holds rank by Royal Warrant. The RSM is the highest non-commissioned rank in the British Army.",
    lore: "RSM. The regiment speaks with your voice. Every soldier respects the warrant.",
    variants: [
      { title: "Regimental Sergeant Major", abbr: "RSM", unit: "Infantry — most senior soldier in a battalion" },
      { title: "Conductor",                  abbr: "Cdt",  unit: "Royal Logistic Corps — specialist WO1 appointment" },
    ],
  },
  // ── OFFICERS ────────────────────────────────────────────────────────────────
  {
    title: "Officer Cadet",   abbr: "OCdt",  nato: "OR-8",  group: "Officers",
    xpRequired: 8500,         insignia: "☆",  colour: "#B8860B",
    role: "Undergoing commissioning training at the Royal Military Academy Sandhurst. Not yet a commissioned officer. The famous 44-week commissioning course forges leaders from civilians.",
    lore: "Sandhurst awaits. Commissioning is earned, not assumed.",
    variants: [],
  },
  {
    title: "2nd Lieutenant",  abbr: "2Lt",   nato: "OF-1",  group: "Officers",
    xpRequired: 11000,        insignia: "★",  colour: "#B8860B",
    role: "Lowest commissioned officer rank. Commands a platoon or troop of ~30 soldiers. Often the youngest officer in the mess — expected to listen and learn.",
    lore: "One pip. The men are watching your every move. Don't hesitate.",
    variants: [],
  },
  {
    title: "Lieutenant",      abbr: "Lt",    nato: "OF-1",  group: "Officers",
    xpRequired: 14000,        insignia: "★★", colour: "#B8860B",
    role: "Commands a platoon or troop with additional responsibilities above a 2nd Lieutenant. Experience begins to show. Often second-in-command of a company.",
    lore: "Two pips. Experience is beginning to show. Lead from the front.",
    variants: [],
  },
  {
    title: "Captain",         abbr: "Capt",  nato: "OF-2",  group: "Officers",
    xpRequired: 18000,        insignia: "★★★", colour: "#B8860B",
    role: "Commands a company or serves as its second-in-command. Typically held for 5–10 years. The workhorse rank of the officer corps.",
    lore: "Three pips. The company relies on your judgement. Don't waste it.",
    variants: [],
  },
  // ── FIELD OFFICERS ──────────────────────────────────────────────────────────
  {
    title: "Major",           abbr: "Maj",   nato: "OF-3",  group: "Field Officers",
    xpRequired: 23000,        insignia: "◆",  colour: "#C0392B",
    role: "Commands a company, squadron, or battery of ~120–200 soldiers. Responsible for training, welfare, and operational readiness. Second only to the Commanding Officer within a battalion.",
    lore: "Field grade. You command the fighting unit. Every decision costs lives if you're wrong.",
    variants: [],
  },
  {
    title: "Lieutenant Colonel", abbr: "Lt Col", nato: "OF-4", group: "Field Officers",
    xpRequired: 30000,        insignia: "◆★",  colour: "#C0392B",
    role: "Commanding Officer of an infantry battalion, artillery regiment, or cavalry regiment — up to 650 soldiers. Known simply as 'the CO'. Typically holds the post for 2.5 years.",
    lore: "Commanding Officer. The regiment is yours. Its reputation rests on your shoulders.",
    variants: [],
  },
  {
    title: "Colonel",         abbr: "Col",   nato: "OF-5",  group: "Field Officers",
    xpRequired: 40000,        insignia: "◆◆",  colour: "#8B0000",
    role: "Primarily a staff rank. Serves as senior staff officer at brigade, division, or army headquarters. Occasionally commands task forces. Not to be confused with the honorary Colonel of the Regiment.",
    lore: "Staff rank. Strategy over tactics now. The whole force watches how you think.",
    variants: [],
  },
  // ── GENERAL OFFICERS ────────────────────────────────────────────────────────
  {
    title: "Brigadier",          abbr: "Brig",    nato: "OF-6 · 1★", group: "General Officers",
    xpRequired: 55000,           insignia: "★",   colour: "#7B1FA2",
    role: "Commands a brigade of ~5,000 soldiers. The one-star rank. Technically not classified as a full general officer rank by the British Army — it sits uniquely between field officers and the generals. Until 1928 the title was Brigadier-General.",
    lore: "One star. You command a brigade. The weight of thousands rests on your orders.",
    variants: [],
  },
  {
    title: "Major General",      abbr: "Maj Gen", nato: "OF-7 · 2★", group: "General Officers",
    xpRequired: 75000,           insignia: "★★",  colour: "#6A1B9A",
    role: "Two-star rank. Commands a division of ~10,000–15,000 soldiers, or holds a senior staff appointment at the Ministry of Defence. Also commands the Royal Military Academy Sandhurst.",
    lore: "Two stars. Division commander. Your decisions shape the entire theatre of operations.",
    variants: [],
  },
  {
    title: "Lieutenant General", abbr: "Lt Gen",  nato: "OF-8 · 3★", group: "General Officers",
    xpRequired: 100000,          insignia: "★★★", colour: "#4527A0",
    role: "Three-star rank. Commands a corps, or holds the most senior command and staff appointments at the MoD and NATO headquarters. Equivalent to a Vice Admiral in the Royal Navy and an Air Marshal in the RAF.",
    lore: "Three stars. Corps commander. Few ever reach this rank. Fewer deserve it.",
    variants: [],
  },
  {
    title: "General",          abbr: "Gen",     nato: "OF-9 · 4★", group: "General Officers",
    xpRequired: 130000,          insignia: "★★★★", colour: "#283593",
    role: "Four-star rank. The most senior active operational rank in the British Army. Holds the highest command and staff appointments — including Chief of the General Staff (head of the entire British Army), Deputy Supreme Allied Commander Europe, or Commander of the Allied Rapid Reaction Corps.",
    lore: "Four stars. Chief of the General Staff. You command the entire British Army.",
    variants: [],
  },
  {
    title: "Field Marshal",      abbr: "FM",      nato: "OF-10 · 5★", group: "General Officers",
    xpRequired: 175000,          insignia: "⚜\uFE0E",   colour: "#B8860B",
    role: "The highest rank in the British Army — five stars. An honorary rank since 1994; no officer has been promoted to it on active service since. Historically awarded for exceptional wartime command. Recipients include the Duke of Wellington, Lord Kitchener, and Field Marshal Montgomery.",
    lore: "Field Marshal. The pinnacle. Those who reach here don't stop — they never did.",
    variants: [],
  },
];

// ─── BADGES ───────────────────────────────────────────────────────────────────
const ALL_BADGES = [
  { id: "bergen_bear",    category: "Weight",      icon: Backpack, title: "Bergen Bear",        desc: "First tab with 10kg+",              check: s => s.some(l => l.bergenKg >= 10) },
  { id: "ironback",       category: "Weight",      icon: Shield, title: "Ironback",            desc: "Tab with 20kg+",                    check: s => s.some(l => l.bergenKg >= 20) },
  { id: "maverick",       category: "Weight",      icon: Swords, title: "Maverick",            desc: "Tab with 25kg+",                    check: s => s.some(l => l.bergenKg >= 25) },
  { id: "warrior",        category: "Weight",      icon: Award, title: "Warrior",             desc: "Tab with 30kg+",                    check: s => s.some(l => l.bergenKg >= 30) },
  { id: "hercules",       category: "Weight",      icon: Dumbbell, title: "Hercules",            desc: "Tab with 35kg+",                    check: s => s.some(l => l.bergenKg >= 35) },
  { id: "first_step",     category: "Distance",    icon: Footprints, title: "First Step",          desc: "Complete your first tab",           check: s => s.length >= 1 },
  { id: "trooper_5k",     category: "Distance",    icon: Flag, title: "5km Trooper",         desc: "Tab 5km in a single session",       check: s => s.some(l => l.distance >= 5) },
  { id: "route_march",    category: "Distance",    icon: Map, title: "Route Marcher",       desc: "Tab 10km in a single session",      check: s => s.some(l => l.distance >= 10) },
  { id: "half_marathon",  category: "Distance",    icon: Medal, title: "Half Marathon",       desc: "Tab 21km in a single session",      check: s => s.some(l => l.distance >= 21) },
  { id: "centurion",      category: "Distance",    icon: Trophy, title: "Centurion",           desc: "100km total logged distance",       check: s => s.reduce((a,l)=>a+parseFloat(l.distance||0),0) >= 100 },
  { id: "cold_aggression",category: "Performance", icon: Snowflake, title: "Cold Aggression",     desc: "Improve pace 3 sessions in a row",  check: s => checkPaceStreak(s,3) },
  { id: "inf_standard",   category: "Performance", icon: Crosshair, title: "Eight-Miler",         desc: "12.9km (8 miles) with 25kg+ — the infantry Annual Fitness Test distance and load", check: s => s.some(l => l.distance>=12.8 && l.bergenKg>=25) },
  { id: "speed_demon",    category: "Performance", icon: Gauge, title: "Speed Demon",          desc: "Pace under 8 min/km with 15kg+",   check: s => s.some(l => l.bergenKg>=15 && (l.time/l.distance)<8) },
  { id: "streak_3",       category: "Consistency", icon: Activity, title: "On Fire",             desc: "3 sessions logged",                 check: s => s.length >= 3 },
  { id: "streak_10",      category: "Consistency", icon: BicepsFlexed, title: "No Quit",             desc: "10 sessions logged",                check: s => s.length >= 10 },
  { id: "streak_25",      category: "Consistency", icon: CalendarCheck, title: "Month of Discipline", desc: "25 sessions logged",                check: s => s.length >= 25 },
  { id: "furnace",        category: "Calorie",     icon: Heater, title: "Human Furnace",       desc: "Burn 1,000 kcal in a single tab",   check: s => s.some(l => (l.calories||0) >= 1000) },
  { id: "ten_k_cals",     category: "Calorie",     icon: Flame, title: "Inferno",             desc: "Burn 10,000 kcal total",            check: s => s.reduce((a,l)=>a+(l.calories||0),0) >= 10000 },
];

function checkPaceStreak(logs, n) {
  if (logs.length < n) return false;
  const paces = logs.map(l => l.distance > 0 ? l.time / l.distance : 999).reverse();
  for (let i = 0; i <= paces.length - n; i++) {
    let ok = true;
    for (let j = 1; j < n; j++) if (paces[i+j] >= paces[i+j-1]) { ok = false; break; }
    if (ok) return true;
  }
  return false;
}

// ─── XP ───────────────────────────────────────────────────────────────────────
function calcSessionXP(log) {
  const dist = parseFloat(log.distance)||0, time = parseFloat(log.time)||0;
  let xp = dist * 10 + (parseFloat(log.bergenKg)||0) * 3;
  if (dist > 0 && time > 0) {
    const pace = time / dist;
    if (pace < 8)  xp += 50;
    if (pace < 10) xp += 25;
  }
  if ((log.calories||0) > 800) xp += 40;
  return Math.round(xp);
}
function getRank(xp)     { let r = RANKS[0]; for (const x of RANKS) { if (xp >= x.xpRequired) r = x; else break; } return r; }
function getNextRank(xp) { for (const r of RANKS) if (xp < r.xpRequired) return r; return null; }

// ─── MISSIONS ────────────────────────────────────────────────────────────────
const MISSIONS = [
  { id:"advance",   title:"Advance to Contact",  icon:Crosshair, desc:"Tab 5km with at least 12kg bergen",              xpReward:120, check:l=>l.some(x=>x.distance>=5&&x.bergenKg>=12) },
  { id:"battle",    title:"Battle Prep",          icon:Shield, desc:"Complete a steady 8km load march with 10kg+",    xpReward:150, check:l=>l.some(x=>x.distance>=8&&x.bergenKg>=10) },
  { id:"extract",   title:"Extraction",           icon:Helicopter, desc:"Tab 3km with 20kg+ (short but heavy)",           xpReward:100, check:l=>l.some(x=>x.distance>=3&&x.bergenKg>=20) },
  { id:"recce",     title:"Recce Patrol",         icon:Binoculars, desc:"Tab 12km with light load (8kg or less)",         xpReward:130, check:l=>l.some(x=>x.distance>=12&&x.bergenKg<=8) },
  { id:"inf10",     title:"The 10-Miler",         icon:Medal, desc:"Tab 16km (10 miles) with 17kg+ in under 2 hours", xpReward:300, check:l=>l.some(x=>x.distance>=16&&x.bergenKg>=17&&x.time<=120) },
  { id:"ironwill",  title:"Iron Will",            icon:Swords, desc:"Tab 10km with 25kg+",                           xpReward:250, check:l=>l.some(x=>x.distance>=10&&x.bergenKg>=25) },
  { id:"dawn",      title:"Dawn Raid",            icon:Sunrise, desc:"Log 5 sessions total",                          xpReward:80, check:l=>l.length>=5 },
  { id:"endurance", title:"Endurance Op",         icon:Hourglass, desc:"Accumulate 50km total distance",                xpReward:200, check:l=>l.reduce((a,x)=>a+parseFloat(x.distance||0),0)>=50 },
];

// Challenge checks receive ONLY the logs from that day / that week.
const DAILY_CHALLENGES = [
  { id:"d1", title:"Quick March",  desc:"Tab 2km with at least 8kg today",   xp:30, check:dayLogs=>dayLogs.some(l=>l.distance>=2&&l.bergenKg>=8) },
  { id:"d2", title:"Load Carry",   desc:"Tab any distance with 15kg+ today", xp:40, check:dayLogs=>dayLogs.some(l=>l.bergenKg>=15) },
  { id:"d3", title:"5k Push",      desc:"Tab 5km today",                     xp:50, check:dayLogs=>dayLogs.some(l=>l.distance>=5) },
];
const WEEKLY_CHALLENGES = [
  { id:"w1", title:"3 Sessions",  desc:"Complete 3 tabs this week (Mon–Sun)",    xp:80,  check:weekLogs=>weekLogs.length>=3 },
  { id:"w2", title:"Load Up",     desc:"Tab with 12kg+ at least once this week", xp:60,  check:weekLogs=>weekLogs.some(l=>l.bergenKg>=12) },
  { id:"w3", title:"20km Week",   desc:"Accumulate 20km this week",              xp:100, check:weekLogs=>weekLogs.reduce((a,l)=>a+(parseFloat(l.distance)||0),0)>=20 },
];

// ─── DATES ───────────────────────────────────────────────────────────────────
// Session dates are stored as "dd/mm/yyyy" strings. Never sort or compare them as text.
function parseDate(str) {
  const [d,m,y] = String(str).split("/").map(Number);
  return new Date(y, m-1, d);
}
function weekKey(str) {               // the Monday that starts this date's week, as a sortable key
  const dt = parseDate(str);
  const offset = (dt.getDay() + 6) % 7; // Mon=0 … Sun=6
  dt.setDate(dt.getDate() - offset);
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`;
}
function groupBy(logs, keyFn) {
  const out = {};
  for (const l of logs) (out[keyFn(l)] ||= []).push(l);
  return out;
}

// ─── XP LEDGER ───────────────────────────────────────────────────────────────
// XP is always worked out from the session log, never stored as a running total.
// Delete a session and its XP (and any mission/challenge it unlocked) goes with it;
// re-logging can't award a mission twice.
function computeXP(logs) {
  const sessions = logs.reduce((a,l)=>a+calcSessionXP(l),0);
  const missionsDone = MISSIONS.filter(m=>m.check(logs));
  const missions = missionsDone.reduce((a,m)=>a+m.xpReward,0);
  let daily = 0, dailyDone = 0;
  for (const dayLogs of Object.values(groupBy(logs, l=>l.date)))
    for (const ch of DAILY_CHALLENGES) if (ch.check(dayLogs)) { daily += ch.xp; dailyDone++; }
  let weekly = 0, weeklyDone = 0;
  for (const weekLogs of Object.values(groupBy(logs, l=>weekKey(l.date))))
    for (const ch of WEEKLY_CHALLENGES) if (ch.check(weekLogs)) { weekly += ch.xp; weeklyDone++; }
  return { total: sessions+missions+daily+weekly, sessions, missions, daily, weekly,
           missionIds: new Set(missionsDone.map(m=>m.id)), dailyDone, weeklyDone };
}

// ─── PROGRAMME ───────────────────────────────────────────────────────────────
// Written in miles (the traditional tabbing unit) and converted to km below, so the
// whole app stores and compares distances in one unit: km.
const MI_TO_KM = 1.609344;
const PROGRAMME_MILES = [
  { week:1, sessions:[
    { day:"Mon", miles:4,  weight:8,  targetTime:52,  type:"March",    notes:"Focus on technique: head up, arms swinging" },
    { day:"Wed", miles:3,  weight:8,  targetTime:39,  type:"March",    notes:"Maintain steady cadence, breathe rhythmically" },
    { day:"Sat", miles:5,  weight:8,  targetTime:65,  type:"March",    notes:"Longer slower effort, build base endurance" },
  ]},
  { week:2, sessions:[
    { day:"Mon", miles:4,  weight:10, targetTime:52,  type:"March",    notes:"Same distance, increase weight by 2kg" },
    { day:"Wed", miles:4,  weight:10, targetTime:52,  type:"March",    notes:"Add the airborne shuffle on flat sections" },
    { day:"Sat", miles:6,  weight:10, targetTime:78,  type:"March",    notes:"First 6-miler (9.7km), keep weight manageable" },
  ]},
  { week:3, sessions:[
    { day:"Mon", miles:5,  weight:12, targetTime:65,  type:"TAB",      notes:"Push pace slightly on flat terrain" },
    { day:"Wed", miles:4,  weight:12, targetTime:48,  type:"TAB",      notes:"Faster target time — work harder" },
    { day:"Sat", miles:7,  weight:12, targetTime:91,  type:"TAB",      notes:"Include some hilly terrain if possible" },
  ]},
  { week:4, sessions:[
    { day:"Mon", miles:4,  weight:10, targetTime:56,  type:"Recovery", notes:"Deload week — lighter weight, easy pace" },
    { day:"Wed", miles:4,  weight:10, targetTime:56,  type:"Recovery", notes:"Focus on bergen fit and pack admin" },
    { day:"Sat", miles:5,  weight:10, targetTime:70,  type:"Recovery", notes:"Easy long effort, enjoy it" },
  ]},
  { week:5, sessions:[
    { day:"Mon", miles:6,  weight:15, targetTime:78,  type:"TAB",      notes:"First session with 15kg — take it steady" },
    { day:"Wed", miles:5,  weight:15, targetTime:65,  type:"TAB",      notes:"Hilly route recommended" },
    { day:"Sat", miles:8,  weight:15, targetTime:104, type:"TAB",      notes:"Longest yet — mental toughness session" },
  ]},
  { week:6, sessions:[
    { day:"Mon", miles:6,  weight:17, targetTime:72,  type:"TAB",      notes:"Increase weight, hold pace" },
    { day:"Wed", miles:5,  weight:17, targetTime:58,  type:"TAB",      notes:"Push hard — test your limits" },
    { day:"Sat", miles:8,  weight:17, targetTime:96,  type:"TAB",      notes:"Target 7:30 min/km (12 min/mile) over the full 12.9km" },
  ]},
  { week:7, sessions:[
    { day:"Mon", miles:6,  weight:17, targetTime:66,  type:"TAB",      notes:"Target 6:50 min/km (11 min/mile)" },
    { day:"Wed", miles:5,  weight:17, targetTime:53,  type:"TAB",      notes:"Interval effort — push hard, recover, push" },
    { day:"Sat", miles:10, weight:17, targetTime:120, type:"TAB",      notes:"First 10-miler (16.1km) — benchmark attempt, sub 2:00" },
  ]},
  { week:8, sessions:[
    { day:"Mon", miles:4,  weight:12, targetTime:52,  type:"Taper",    notes:"Easy taper — legs fresh for test" },
    { day:"Wed", miles:3,  weight:12, targetTime:39,  type:"Taper",    notes:"Short shakeout, stay loose" },
    { day:"Sat", miles:10, weight:17, targetTime:105, type:"TEST",     notes:"10-miler test (16.1km, 17kg) — target sub 1:45!" },
  ]},
];
const PROGRAMME = PROGRAMME_MILES.map(w => ({
  ...w,
  sessions: w.sessions.map(({ miles, ...sess }) => ({ ...sess, distance: Math.round(miles*MI_TO_KM*10)/10 })),
}));

// ─── PROGRAMME LIBRARY ───────────────────────────────────────────────────────
// Test-prep targets. Official figures checked October 2026; standards change, so the
// app always tells users to confirm with their unit or recruiter.
const TESTS = {
  tabbr10: { name:"TABBR 10-Miler", short:"10-Miler", official:false, D:16.1, L:17, T:105, pass:120,
    desc:"TABBR's own benchmark: 10 miles (16.1km) with 17kg. A solid all-round loaded-march goal. Not an official test.",
    testNote:"10-miler test (16.1km, 17kg) — target sub 1:45!" },
  army_gcc: { name:"Army Role Fitness Test — Ground Close Combat", short:"Army GCC RFT", official:true, D:4, L:40, T:50, longMax:8, part2:{ D:2, L:25, T:15 },
    desc:"The loaded march for infantry and armoured roles: 4km with 40kg in 50 min, then 2km with 25kg in 15 min.",
    testNote:"Test: 4km with 40kg in under 50 min. Then drop to 25kg and go best effort for 2km in under 15 min." },
  army_8m: { name:"Army 8-Miler (Annual Fitness Test)", short:"Army 8-Miler", official:true, D:12.9, L:25, T:120,
    desc:"8 miles (12.9km) in under 2 hours. Infantry carry 25kg, combat support arms 20kg, combat service support 15kg. Largely replaced by the Role Fitness Test — check which test your unit uses.",
    testNote:"Test: 8 miles (12.9km) with 25kg in under 2 hours." },
  pcoy10: { name:"P Company 10-Miler", short:"P Coy 10-Miler", official:true, D:16.1, L:20, T:110,
    desc:"10 miles (16.1km) with a 35lb (16kg) bergen plus weapon and water, in 1h50 for regulars (2 hours for reservists). This programme trains at 20kg to cover the weapon and water.",
    testNote:"Test: 10 miles (16.1km) at 20kg in under 1h50." },
  rm9: { name:"Royal Marines 9-Mile Speed March", short:"RM 9-Miler", official:true, D:14.5, L:19, T:90,
    desc:"9 miles (14.5km) in fighting order (about 32lb / 14.5kg) plus rifle, in 90 minutes. This programme trains at 19kg to cover the rifle.",
    testNote:"Test: 9 miles (14.5km) at 19kg in under 90 min." },
};
const LEVEL_INFO = {
  beginner:     { label:"Beginner",     load:0.40, dist:0.45, pace:1.35 },
  intermediate: { label:"Intermediate", load:0.60, dist:0.60, pace:1.20 },
  advanced:     { label:"Advanced",     load:0.78, dist:0.75, pace:1.10 },
};
const r05 = x => Math.max(2, Math.round(x*2)/2);   // distances to the nearest 0.5km, never under 2km

// Builds an 8-week, 3-sessions-a-week plan: build, build, build, deload, build, build, peak, taper + test.
function generateProgramme(testId, level) {
  const t = TESTS[testId], lv = LEVEL_INFO[level];
  const P  = t.T / t.D,              Ps = P * lv.pace;               // min/km: target and starting pace
  const Ls = Math.max(6, Math.round(t.L * lv.load));                  // starting load
  const LD = t.longMax || t.D,       LDs = LD * lv.dist;              // long-tab distance: target and start
  const p2 = t.part2, P2 = p2 && p2.T/p2.D, L2s = p2 && Math.max(6, Math.round(p2.L*lv.load));
  const F  = [0, 0.15, 0.30, null, 0.45, 0.65, 0.85, null];
  const sess = (day, distance, weight, pace, type, notes) => ({ day, distance, weight, targetTime:Math.round(distance*pace), type, notes });
  return F.map((f, wi) => {
    const week = wi + 1;
    if (wi === 7) return { week, sessions:[
      sess("Mon", r05(LD*0.4), Math.round(t.L*0.7), P*1.15, "Taper", "Easy taper — keep the legs fresh for test day."),
      sess("Wed", r05(LD*0.3), Math.round(t.L*0.6), P*1.10, "Taper", "Short shakeout. Check boots, bergen fit and test-day kit."),
      sess("Sat", t.D, t.L, P, "TEST", t.testNote),
    ]};
    if (f === null) {   // deload
      const load = Math.round((Ls + (t.L-Ls)*0.30) * 0.85), long = r05((LDs + (LD-LDs)*0.30) * 0.8);
      return { week, sessions:[
        sess("Mon", r05(long*0.65), load, Ps, "Recovery", "Deload week — lighter and easier so your body adapts."),
        sess("Wed", r05(long*0.5),  load, Ps, "Recovery", "Easy effort. Use it to sort bergen fit and foot admin."),
        sess("Sat", long,           load, Ps, "Recovery", "Easy long effort. Finish feeling you could go again."),
      ]};
    }
    const load = Math.round(Ls + (t.L - Ls)*f), long = r05(LDs + (LD - LDs)*f), pace = Ps + (P - Ps)*f;
    const wed = p2
      ? sess("Wed", r05(p2.D*(0.75+0.25*f)+0.01), Math.round(L2s + (p2.L-L2s)*f), (P2*lv.pace) + (P2 - P2*lv.pace)*f, "Speed", `Best effort at ${Math.round(L2s + (p2.L-L2s)*f)}kg: hard from the start, shuffle the flats.`)
      : sess("Wed", r05(long*0.5), Math.round(load*0.85), pace*0.95, "Speed", "Faster session, lighter load. Push the pace, then hold it.");
    return { week, sessions:[
      sess("Mon", r05(long*0.65), load, pace*1.03, "TAB", "Steady load carry. Settle into a rhythm you could hold for twice as long."),
      wed,
      sess("Sat", long, load, pace, "TAB", f < 0.3 ? "Long tab. Build time on feet: walk the hills, shuffle the flats."
                                    : f >= 0.65 ? "Long tab near test load. Practise test-day pacing, fuelling and admin."
                                    : "Long tab. Hold an even pace from start to finish."),
    ]};
  });
}
const progIdOf = (test, level) => `${test}-${level}`;
const programmeCache = {};
function getProgramme(test="tabbr10", level="beginner") {
  if (!TESTS[test]) test = "tabbr10";
  if (!LEVEL_INFO[level]) level = "beginner";
  const id = progIdOf(test, level);
  if (!programmeCache[id]) programmeCache[id] = {
    id, test, level, name:TESTS[test].name, short:TESTS[test].short,
    // The original hand-written plan stays as the beginner 10-miler.
    weeks: test==="tabbr10" && level==="beginner" ? PROGRAMME : generateProgramme(test, level),
  };
  return programmeCache[id];
}
const getProgrammeById = id => { const i = id.lastIndexOf("-"); return getProgramme(id.slice(0,i), id.slice(i+1)); };
const LEGACY_PROG_ID = "tabbr10-beginner";

const TIPS = [
  { title:"The Airborne Shuffle", category:"Technique", icon:Footprints, content:"The signature infantry movement. Keep your head up, swing your arms aggressively — they set your cadence. The faster your arms move, the faster you move. Lengthen your stride and glide your feet close to the ground. Done right, you maintain a jogging pace while walking." },
  { title:"Bergen Admin",          category:"Kit",       icon:Backpack, content:"Pack heavy items high and close to your shoulders. Tighten all straps so the bergen sits tight on your back — never let it hang low dragging you backwards. A loose bergen bouncing around will destroy your spine and sap your energy." },
  { title:"Arm Drive",             category:"Technique", icon:BicepsFlexed, content:"Swing your arms like you're trying to get rid of them. If tabbing with a rifle, hold it in both hands across your chest and let it act as a 5kg counterweight. Arm swing sets a steady cadence and stops the yo-yo effect." },
  { title:"The First 2 Miles",     category:"Mental",    icon:Brain, content:"The first two miles hurt everyone — shins take time to warm up. This is normal. Keep moving, the pain fades. Every experienced infantry soldier has been through it." },
  { title:"Blister Prevention",    category:"Kit",       icon:Bandage, content:"Good socks are non-negotiable. Double layer anti-blister socks are worth every penny. Make sure boots are properly broken in. Bergan burn is another hazard — keep it tight." },
  { title:"Fuelling & Hydration",  category:"Nutrition", icon:Utensils, content:"Eat a proper breakfast before a tab. Drink water consistently. Piss should run clear once a day as a hydration indicator. Supplement with extra calories and protein to aid recovery." },
  { title:"Downhill Technique",    category:"Technique", icon:Mountain, content:"Double downhill to make time. Keep steps short — big bounding strides waste energy. Your feet only need to lift as far as necessary to clear the terrain." },
  { title:"Mental Approach",       category:"Mental",    icon:Flame, content:"Sign a cold, aggressive mental attitude out from the stores. Lean forwards at all times. That's what separates a TAB from a yomp." },
];

// ─── LOG FORM OPTIONS ────────────────────────────────────────────────────────
const WEATHER = [[Sun,"Dry"],[CloudRain,"Wet"],[Wind,"Windy"],[Snowflake,"Cold"],[CloudFog,"Fog"]];
const FINISH  = [[BicepsFlexed,"Strong"],[CircleCheck,"Solid"],[Shovel,"Dug in"],[Hourglass,"Hanging on"],[X,"DNF"]];
const EFFORT_COLS = ["#5FAF62","#8CB43A","#E59A2B","#E8663F","#C0392B"];

// ─── UTILITIES ───────────────────────────────────────────────────────────────
function calcCalories(bw, bergen, dist, mins) {
  if (!bw || !dist || !mins || bw <= 0) return null;
  return Math.round(6.0 * (1 + (bergen / bw) * 0.6) * bw * (mins / 60));
}

// Everything is STORED in km / kg / minutes. These helpers only change what the user
// sees and types, based on the units they picked.
const KM_TO_MI = 0.621371, KG_TO_LB = 2.20462;
const trim = (n, dp=1) => String(Number((+n).toFixed(dp)));
function makeUnits(units) {
  const imp = units === "imperial";
  return {
    imp,
    dUnit: imp ? "mi" : "km",
    wUnit: imp ? "lb" : "kg",
    dist:  (km, dp=1) => trim(imp ? (parseFloat(km)||0)*KM_TO_MI : (parseFloat(km)||0), dp) + (imp ? " mi" : " km"),
    distNum: (km, dp=2) => +(imp ? (parseFloat(km)||0)*KM_TO_MI : (parseFloat(km)||0)).toFixed(dp),
    toKm:  v => imp ? (parseFloat(v)||0)/KM_TO_MI : (parseFloat(v)||0),
    wt:    kg => imp ? `${Math.round((parseFloat(kg)||0)*KG_TO_LB)} lb` : `${trim(kg)} kg`,
    pace:  minPerKm => (!isFinite(minPerKm) || minPerKm <= 0) ? "--"
                        : `${(imp ? minPerKm/KM_TO_MI : minPerKm).toFixed(1)} min/${imp ? "mi" : "km"}`,
  };
}

// Straight-line distance between two GPS fixes, in metres.
function haversine(a, b) {
  const R = 6371000, rad = x => x*Math.PI/180;
  const dLat = rad(b.lat-a.lat), dLon = rad(b.lon-a.lon);
  const h = Math.sin(dLat/2)**2 + Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(h));
}

// ─── ROUTES, SPLITS, VOICE ───────────────────────────────────────────────────
// A route is a list of segments (a new one starts after every pause); each point is [lat, lon, secondsIntoTab].
const routeKm = route => (route||[]).reduce((a,seg)=>{ for (let i=1;i<seg.length;i++) a += haversine({lat:seg[i-1][0],lon:seg[i-1][1]},{lat:seg[i][0],lon:seg[i][1]})/1000; return a; }, 0);
// Split times for each full km (or mile), plus the final part. Interpolates between GPS points.
function computeSplits(route, unitKm) {
  const out = []; let cum = 0, next = unitKm, lastT = 0;
  for (const seg of route||[]) for (let i=1;i<seg.length;i++) {
    const a = seg[i-1], b = seg[i];
    const d = haversine({lat:a[0],lon:a[1]},{lat:b[0],lon:b[1]})/1000;
    while (d > 0 && cum + d >= next) {
      const tAt = a[2] + (b[2]-a[2]) * ((next-cum)/d);
      out.push({ n:out.length+1, sec:tAt-lastT, full:true }); lastT = tAt; next += unitKm;
    }
    cum += d;
  }
  const lastPt = (route||[]).flat().at(-1);
  const restKm = cum - (next - unitKm);
  if (lastPt && restKm > 0.05*unitKm) out.push({ n:out.length+1, sec:lastPt[2]-lastT, full:false, part:restKm/unitKm });
  return out;
}
// Keep stored routes small: at most ~800 points, always keeping each segment's first and last point.
function downsampleRoute(route, max=800) {
  const total = (route||[]).reduce((a,s)=>a+s.length,0);
  if (total <= max) return route;
  const step = Math.ceil(total/max);
  return route.map(seg => seg.filter((_,i)=> i===0 || i===seg.length-1 || i%step===0));
}
const mmss = sec => { sec = Math.max(0, Math.round(sec)); const h=Math.floor(sec/3600), m=Math.floor((sec%3600)/60), x=sec%60; return h ? `${h}:${String(m).padStart(2,"0")}:${String(x).padStart(2,"0")}` : `${m}:${String(x).padStart(2,"0")}`; };
const spoken = sec => { sec = Math.max(0, Math.round(sec)); const h=Math.floor(sec/3600), m=Math.floor((sec%3600)/60), x=sec%60;
  return [h && `${h} hour${h>1?"s":""}`, m && `${m} minute${m>1?"s":""}`, (x || (!h && !m)) && `${x} second${x===1?"":"s"}`].filter(Boolean).join(" "); };
function say(text) {
  try { if (!("speechSynthesis" in window)) return; const u = new SpeechSynthesisUtterance(text); u.lang = "en-GB"; u.rate = 1; window.speechSynthesis.speak(u); } catch {}
}

// Map of a recorded route. OpenStreetMap tiles need a connection (they're cached once seen);
// the route line itself always draws, even offline.
function RouteMap({ route, T, height=240 }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !route?.length) return;
    const map = L.map(ref.current, { zoomControl:true, attributionControl:true, scrollWheelZoom:false });
    map.attributionControl.setPrefix('<a href="https://leafletjs.com">Leaflet</a>');
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom:19, attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map);
    const all = [];
    route.forEach(seg => { const ll = seg.map(p=>[p[0],p[1]]); all.push(...ll); if (ll.length>1) L.polyline(ll, { color:T.accent, weight:5, opacity:0.95 }).addTo(map); });
    if (all.length) {
      L.circleMarker(all[0], { radius:7, color:"#fff", weight:2, fillColor:"#2e9d4f", fillOpacity:1 }).addTo(map).bindTooltip("Start");
      L.circleMarker(all.at(-1), { radius:7, color:"#fff", weight:2, fillColor:"#c0392b", fillOpacity:1 }).addTo(map).bindTooltip("Finish");
      map.fitBounds(L.latLngBounds(all), { padding:[24,24], maxZoom:17 });
    }
    return () => map.remove();
  }, [route, T.accent]);
  return <div ref={ref} className={T.scheme==="dark"?"tabbr-map dark":"tabbr-map"} style={{ height, borderRadius:"10px", overflow:"hidden", border:`1px solid ${T.border}`, background:T.surfaceAlt }} role="img" aria-label="Map of the route"/>;
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────
function WeightStepper({ value, onChange, min=1, max=45, label, T, s, u }) {
  return (
    <div>
      <label style={s.label}>{label}</label>
      <div style={{ display:"flex", border:`1px solid ${T.border}`, borderRadius:"8px", overflow:"hidden", background:T.surface }}>
        <button onClick={()=>onChange(Math.max(min,value-1))} style={{ padding:"10px 18px", border:"none", background:T.surfaceAlt, color:value<=min?T.textMuted:T.text, cursor:value<=min?"not-allowed":"pointer", fontSize:"1.2rem", fontWeight:700, fontFamily:T.font }}>−</button>
        <div style={{ flex:1, textAlign:"center", fontWeight:700, fontSize:"1.1rem", color:T.accent, fontFamily:T.displayFont, padding:"10px 0" }}>{u.wt(value)}</div>
        <button onClick={()=>onChange(Math.min(max,value+1))} style={{ padding:"10px 18px", border:"none", background:T.surfaceAlt, color:value>=max?T.textMuted:T.text, cursor:value>=max?"not-allowed":"pointer", fontSize:"1.2rem", fontWeight:700, fontFamily:T.font }}>+</button>
      </div>
      <div style={{ height:"4px", background:T.surfaceAlt, borderRadius:"2px", overflow:"hidden", marginTop:"5px" }}>
        <div style={{ height:"100%", width:`${((value-min)/(max-min))*100}%`, background:T.accent, transition:"width 0.15s" }}/>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between" }}>
        <span style={{ fontSize:"0.68rem", color:T.textMuted }}>{u.wt(min)}</span>
        <span style={{ fontSize:"0.68rem", color:T.textMuted }}>{u.wt(max)}</span>
      </div>
    </div>
  );
}

// A number input that shows a stored metric value in the user's units.
// Keeps its own text while typing so "75." or "16" doesn't get rewritten mid-keystroke.
function UnitInput({ valueMetric, onChangeMetric, toDisplay, toMetric, style, placeholder }) {
  const fmt = v => (v === "" || v === null || v === undefined || isNaN(parseFloat(v))) ? "" : trim(toDisplay(parseFloat(v)), 1);
  const [text, setText] = useState(fmt(valueMetric));
  const [focused, setFocused] = useState(false);
  useEffect(() => { if (!focused) setText(fmt(valueMetric)); }, [valueMetric, toDisplay, focused]); // eslint-disable-line
  return (
    <input style={style} type="number" inputMode="decimal" placeholder={placeholder} value={text}
      onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
      onChange={e=>{ setText(e.target.value); onChangeMetric(e.target.value === "" ? "" : toMetric(parseFloat(e.target.value)||0)); }}/>
  );
}
const bwConv = imp => ({ toDisplay: kg => imp ? kg*KG_TO_LB : kg, toMetric: v => imp ? v/KG_TO_LB : v });
const distConv = imp => ({ toDisplay: km => imp ? km*KM_TO_MI : km, toMetric: v => imp ? v/KM_TO_MI : v });

function CalorieBadge({ calories, T }) {
  if (!calories) return null;
  return (
    <div style={{ background:T.accentBg, border:`1px solid ${T.accent}`, borderRadius:"8px", padding:"12px 16px", display:"flex", alignItems:"center", gap:"12px" }}>
      <Flame size={26} color={T.accent} strokeWidth={1.9} aria-hidden="true"/>
      <div>
        <div style={{ fontFamily:T.displayFont, fontSize:"1.5rem", color:T.accent, lineHeight:1 }}>{calories.toLocaleString()} kcal</div>
        <div style={{ fontSize:"0.75rem", color:T.textMuted, marginTop:"2px" }}>estimated calories burned</div>
      </div>
    </div>
  );
}

function XPBar({ xp, T }) {
  const rank = getRank(xp), next = getNextRank(xp);
  const pct = next ? Math.round(((xp-rank.xpRequired)/(next.xpRequired-rank.xpRequired))*100) : 100;
  return (
    <div style={{ background:T.goldBg, border:`1px solid ${T.gold}`, borderRadius:"10px", padding:"12px 16px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"6px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <span style={{ fontSize:"1.1rem", color:rank.colour }}>{rank.insignia}</span>
          <span style={{ fontFamily:T.displayFont, fontSize:"1rem", color:T.gold }}>{rank.title}</span>
        </div>
        <span style={{ fontSize:"0.78rem", color:T.textMuted, fontWeight:700 }}>{xp.toLocaleString()} XP</span>
      </div>
      <div style={{ height:"6px", background:T.surfaceAlt, borderRadius:"3px", overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:T.gold, transition:"width 0.5s" }}/>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:"4px" }}>
        <span style={{ fontSize:"0.68rem", color:T.textMuted }}>{rank.title}</span>
        {next ? <span style={{ fontSize:"0.68rem", color:T.gold }}>{next.title} — {(next.xpRequired-xp).toLocaleString()} XP away</span>
               : <span style={{ fontSize:"0.68rem", color:T.gold }}>Max Rank</span>}
      </div>
    </div>
  );
}

function CalcWidget({ T, s, u, userBodyWeight }) {
  const [dist,setDist]=useState(10); const [time,setTime]=useState(120); const [bergen,setBergen]=useState(17);
  const bw=parseFloat(userBodyWeight); const cals=calcCalories(bw,bergen,dist,time);
  const dc = distConv(u.imp);
  return (
    <div>
      <div style={s.formGrid}>
        <div><label style={s.label}>Distance ({u.dUnit})</label><UnitInput style={s.input} valueMetric={dist} onChangeMetric={v=>setDist(parseFloat(v)||0)} {...dc}/></div>
        <div><label style={s.label}>Duration (minutes)</label><input style={s.input} type="number" inputMode="numeric" value={time} onChange={e=>setTime(parseFloat(e.target.value)||0)}/></div>
      </div>
      <div style={{ marginBottom:"14px" }}><WeightStepper value={bergen} onChange={setBergen} label="Bergen weight" T={T} s={s} u={u}/></div>
      {!bw ? <div style={{ padding:"10px", background:T.surfaceAlt, borderRadius:"8px", color:T.textMuted, fontSize:"0.82rem" }}>Enter your body weight above to see the estimate.</div> : (
        <><CalorieBadge calories={cals} T={T}/>
          {cals && <div style={{ marginTop:"10px", display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"8px" }}>
            {[{label:`Per ${u.dUnit}`,val:Math.round(cals/(u.distNum(dist)||1))},{label:"Per hour",val:Math.round(cals/((time||1)/60))},{label:"Load vs BW",val:`${Math.round((bergen/bw)*100)}%`}].map((x,i)=>(
              <div key={i} style={{ background:T.surfaceAlt, borderRadius:"8px", padding:"10px", textAlign:"center" }}>
                <div style={{ fontFamily:T.displayFont, fontSize:"1.1rem", color:T.accent }}>{x.val}</div>
                <div style={{ fontSize:"0.7rem", color:T.textMuted }}>{x.label}</div>
              </div>
            ))}</div>}
        </>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function TabApp() {
  const [ready, setReady]   = useState(false);   // true once storage loaded
  // Read the theme synchronously so the loading screen and onboarding never flash the wrong colours.
  const [theme, setTheme]   = useState(() => { try { const t = localStorage.getItem("tt_theme"); return THEMES[t] ? t : "clean"; } catch { return "clean"; } });
  // Navigation: 5 bottom tabs, some with sub-views.
  const [tab, setTab]                 = useState("home");       // home | train | log | progress | more
  const [trainView, setTrainView]     = useState("timer");      // timer | programme
  const [progressView, setProgressView] = useState("records");  // records | missions | honours
  const [moreView, setMoreView]       = useState(null);         // null (menu) | settings | calories | tips | days
  const [rankUp, setRankUp]           = useState(null);         // rank object while the promotion screen is showing
  const [picker, setPicker]           = useState(null);
  const [weekOffset, setWeekOffset]   = useState(0);            // weekly summary: 0 = this week, 1 = last week         // programme picker: null (closed) or { test, level }
  const [completedSessions, setCompletedSessions] = useState({});
  const [sessionLogs, setSessionLogs]   = useState([]);
  const [notification, setNotification] = useState(null);
  const [onboarded, setOnboarded]       = useState(false);
  const [onboardStep, setOnboardStep]   = useState(0);
  const [profile, setProfile]           = useState({ name:"", goal:"", fitnessLevel:"", units:"metric" });
  const [reminderDays, setReminderDays] = useState([]);
  const [timerBergenKg, setTimerBergenKg] = useState(17);
  const [timerDistance, setTimerDistance] = useState(10);   // planned km, used in manual mode
  const [selectedTip, setSelectedTip]   = useState(null);
  const isoToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  const BLANK_LOG = () => ({ date:isoToday(), distance:"", time:"", bergenKg:10, terrain:"", weather:"", effort:0, finish:"", freeNotes:"", progKey:null });
  const [logForm, setLogForm]           = useState(BLANK_LOG);
  const [showLogForm, setShowLogForm]   = useState(false);
  const [userBodyWeight, setUserBodyWeight] = useState("");  // always kg
  const [showProfileBanner, setShowProfileBanner] = useState(true);
  const [selectedBadgeCategory, setSelectedBadgeCategory] = useState("All");
  const [expandedRank, setExpandedRank] = useState(null);
  const [isOnline, setIsOnline]         = useState(true);

  // Timer is timestamp-based: elapsed = accumulated seconds + (now − startedAt).
  // That keeps it correct if the phone locks or the app is closed and reopened mid-tab.
  const TIMER_IDLE = { running:false, startedAt:null, accum:0, gpsKm:0, mode:"gps", progKey:null, route:[], cued:0, lastCueSec:0, targetPace:null };
  const [routes, setRoutes]     = useState({});    // session id → recorded GPS route
  const [detailId, setDetailId] = useState(null);  // session open in the detail sheet
  const [timer, setTimer]       = useState(TIMER_IDLE);
  const [, setTick]             = useState(0);
  const [gps, setGps]           = useState({ state:"idle", acc:null });
  const watchIdRef  = useRef(null);
  const lastPtRef   = useRef(null);
  const wakeLockRef = useRef(null);
  const gpsSupported = typeof navigator !== "undefined" && "geolocation" in navigator;

  // ── Load persisted data on mount ───────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const load = async (key, fallback) => { const v = await store.get(key); return v !== null ? v : fallback; };
      const savedTheme      = await load("tt_theme",     "clean");
      const savedOnboarded  = await load("tt_onboarded", "0");
      const savedProfile    = await load("tt_profile",   JSON.stringify({ name:"", goal:"", fitnessLevel:"", units:"metric" }));
      const savedLogs       = await load("tt_logs",      "[]");
      const savedCompleted  = await load("tt_completed", "{}");
      const savedBW         = await load("tt_bw",        "");
      const savedDays       = await load("tt_remDays",   "[]");
      const savedTimer      = await load("tt_timer",     "");
      const savedRoutes     = await load("tt_routes",    "{}");
      try { setRoutes(JSON.parse(savedRoutes)); } catch {}
      try { setTheme(THEMES[savedTheme] ? savedTheme : "clean"); } catch {}
      try { setOnboarded(savedOnboarded === "1"); } catch {}
      try {
        const prof = JSON.parse(savedProfile);
        // Pick a programme for anyone who doesn't have one yet: existing users keep the plan they've been
        // following; everyone else gets the 10-miler at the level they chose in onboarding.
        if (!prof.programme) {
          const hasProgress = Object.keys(JSON.parse(savedCompleted||"{}")).length > 0;
          prof.programme = { test:"tabbr10", level: hasProgress ? "beginner" : (LEVEL_INFO[prof.fitnessLevel] ? prof.fitnessLevel : "beginner") };
        }
        setProfile(p => ({ ...p, ...prof }));
      } catch {}
      // Older versions saved some numbers as text — clean them up on load.
      try { setSessionLogs(JSON.parse(savedLogs).map(l => ({ ...l, distance:parseFloat(l.distance)||0, time:parseFloat(l.time)||0, bergenKg:parseFloat(l.bergenKg)||0,
        progKey: l.progKey && !String(l.progKey).includes("|") ? `${LEGACY_PROG_ID}|${l.progKey}` : l.progKey }))); } catch {}
      // Progress is now stored per programme ("programmeId|week-session"). Older keys belong to the original plan.
      try { setCompletedSessions(Object.fromEntries(Object.entries(JSON.parse(savedCompleted)).map(([k,v]) => [k.includes("|") ? k : `${LEGACY_PROG_ID}|${k}`, v]))); } catch {}
      try { setUserBodyWeight(savedBW); } catch {}
      try { setReminderDays(JSON.parse(savedDays)); } catch {}
      try { if (savedTimer) { const t = JSON.parse(savedTimer); setTimer({ ...TIMER_IDLE, ...t }); if (t.bergenKg) setTimerBergenKg(t.bergenKg); } } catch {}
      setReady(true);
    })();
    const goOn  = () => setIsOnline(true);
    const goOff = () => setIsOnline(false);
    window.addEventListener("online",  goOn);
    window.addEventListener("offline", goOff);
    setIsOnline(navigator.onLine ?? true);
    return () => { window.removeEventListener("online",goOn); window.removeEventListener("offline",goOff); };
  }, []); // eslint-disable-line

  // ── Persist on change ──────────────────────────────────────────────────────
  useEffect(() => { if (ready) store.set("tt_theme",     theme); },             [theme, ready]);
  useEffect(() => { if (ready) store.set("tt_logs",      JSON.stringify(sessionLogs)); },   [sessionLogs, ready]);
  useEffect(() => { if (ready) store.set("tt_completed", JSON.stringify(completedSessions)); }, [completedSessions, ready]);
  useEffect(() => { if (ready) store.set("tt_profile",   JSON.stringify(profile)); }, [profile, ready]);
  useEffect(() => { if (ready) store.set("tt_bw",        userBodyWeight); },     [userBodyWeight, ready]);
  useEffect(() => { if (ready) store.set("tt_remDays",   JSON.stringify(reminderDays)); }, [reminderDays, ready]);
  useEffect(() => { if (ready) store.set("tt_timer",     JSON.stringify({ ...timer, bergenKg:timerBergenKg })); }, [timer, timerBergenKg, ready]);
  useEffect(() => { if (ready) store.set("tt_routes",    JSON.stringify(routes)); }, [routes, ready]);
  useEffect(() => { if (ready && onboarded) store.set("tt_onboarded", "1"); },   [onboarded, ready]);

  // ── Timer tick (just re-renders; the time itself comes from timestamps) ───
  useEffect(() => {
    if (!timer.running) return;
    const id = setInterval(() => setTick(t => t+1), 1000);
    const onVis = () => { setTick(t => t+1); if (document.visibilityState === "visible") requestWakeLock(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", onVis); };
  }, [timer.running]); // eslint-disable-line

  // ── GPS ───────────────────────────────────────────────────────────────────
  const MAX_ACCURACY_M = 35;   // ignore fixes less accurate than this
  const MAX_SPEED_MS   = 7;    // ~25 km/h — anything faster is a GPS glitch, not a tab
  const onPosition = (p) => {
    const { latitude:lat, longitude:lon, accuracy } = p.coords;
    setGps({ state:"ok", acc:Math.round(accuracy) });
    if (accuracy > MAX_ACCURACY_M) return;
    const pt = { lat, lon, t:p.timestamp };
    const last = lastPtRef.current;
    if (!last) { lastPtRef.current = pt; setTimer(t => addRoutePoint(t, pt, true)); return; }   // first fix after start/resume: new route segment
    const d = haversine(last, pt);
    if (d < Math.max(5, accuracy*0.5)) return;          // jitter while standing still — wait for real movement
    const dt = (pt.t - last.t) / 1000;
    lastPtRef.current = pt;
    if (dt > 0 && d/dt > MAX_SPEED_MS) return;           // impossible jump — re-anchor, don't count it
    setTimer(t => ({ ...addRoutePoint(t, pt, false), gpsKm: t.gpsKm + d/1000 }));
  };
  const addRoutePoint = (t, pt, newSeg) => {
    if (!t.running || !t.startedAt) return t;
    const P = [+pt.lat.toFixed(5), +pt.lon.toFixed(5), Math.round(t.accum + (Date.now()-t.startedAt)/1000)];
    const route = t.route || [];
    return { ...t, route: newSeg || !route.length ? [...route, [P]] : [...route.slice(0,-1), [...route[route.length-1], P]] };
  };
  const onGpsError = (e) => setGps({ state: e.code === 1 ? "denied" : "error", acc:null });
  const startGps = () => {
    if (!gpsSupported) { setGps({ state:"unavailable", acc:null }); return; }
    if (watchIdRef.current !== null) return;
    lastPtRef.current = null;
    setGps(g => ({ ...g, state:"acquiring" }));
    watchIdRef.current = navigator.geolocation.watchPosition(onPosition, onGpsError, { enableHighAccuracy:true, maximumAge:0, timeout:20000 });
  };
  const stopGps = () => {
    if (watchIdRef.current !== null && gpsSupported) navigator.geolocation.clearWatch(watchIdRef.current);
    watchIdRef.current = null;
    lastPtRef.current = null;   // so a resume doesn't count the distance moved while paused
    setGps(g => ({ ...g, state:"idle" }));
  };
  // Resume GPS if the app was reopened mid-tab.
  useEffect(() => {
    if (ready && timer.running && timer.mode === "gps") startGps();
    return () => { if (watchIdRef.current !== null && gpsSupported) navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null; };
  }, [ready, timer.running, timer.mode]); // eslint-disable-line

  // Keep the screen awake while tabbing (where the phone supports it) so GPS keeps running.
  const requestWakeLock = async () => {
    try { if ("wakeLock" in navigator && !wakeLockRef.current) { wakeLockRef.current = await navigator.wakeLock.request("screen"); wakeLockRef.current.addEventListener?.("release", () => { wakeLockRef.current = null; }); } } catch {}
  };
  const releaseWakeLock = () => { try { wakeLockRef.current?.release(); } catch {} wakeLockRef.current = null; };

  const elapsedSec = Math.max(0, Math.floor(timer.accum + (timer.running && timer.startedAt ? (Date.now()-timer.startedAt)/1000 : 0)));
  const startTimer = () => {
    setTimer(t => ({ ...t, running:true, startedAt:Date.now() }));   // GPS starts via the effect above
    requestWakeLock();
    // Speaking inside the button press also unlocks speech on iPhone for the cues that follow.
    if (profile.voiceCues) say(elapsedSec>0 ? "Resuming." : `Tab started.${targetPace&&timer.mode==="gps" ? ` Target pace, ${spoken(targetPace*60*(u.imp?MI_TO_KM:1))} per ${u.imp?"mile":"kilometre"}.` : ""}`);
  };
  const pauseTimer = () => {
    setTimer(t => ({ ...t, running:false, startedAt:null, accum: t.accum + (t.startedAt ? (Date.now()-t.startedAt)/1000 : 0) }));
    stopGps(); releaseWakeLock();
    if (profile.voiceCues) say("Paused.");
  };
  const resetTimer = (ask=true) => {
    if (ask && elapsedSec > 0 && !window.confirm("Reset the timer? This session won't be saved.")) return;
    stopGps(); releaseWakeLock();
    setTimer(t => ({ ...TIMER_IDLE, mode:t.mode, targetPace:t.targetPace }));
  };

  // ── Rest day awareness ─────────────────────────────────────────────────────
  const daysSinceLast = (() => {
    if (!sessionLogs.length) return null;
    const latest = Math.max(...sessionLogs.map(l => parseDate(l.date).getTime()));
    return Math.floor(((new Date().setHours(0,0,0,0)) - latest)/86400000);
  })();
  const restStatus = (() => {
    if (daysSinceLast === null) return { type:"none", msg:null };
    if (daysSinceLast === 0)   return { type:"active",  msg:"Session logged today. Good work." };
    if (daysSinceLast === 1)   return { type:"rest",    msg:"1 day since last session. Ready to go again." };
    if (daysSinceLast === 2)   return { type:"rest",    msg:"2 days rest. Your legs should be fresh — time to tab." };
    if (daysSinceLast === 3)   return { type:"warning", msg:"3 days since last session. Don't let momentum slip." };
    if (daysSinceLast <= 6)    return { type:"warning", msg:`${daysSinceLast} days since last session. Get back on it.` };
    return { type:"danger", msg:`${daysSinceLast} days since last session. The bergen won't carry itself.` };
  })();

  // ── Computed values ────────────────────────────────────────────────────────
  const T = THEMES[theme];
  const u = makeUnits(profile.units);
  const bw = parseFloat(userBodyWeight);
  const fmtTime = (sec) => { const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60; return h>0?`${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`:`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`; };
  const timerKm       = timer.mode === "gps" ? timer.gpsKm : timerDistance;
  const currentPace   = elapsedSec>0 && timerKm>0.05 ? u.pace(elapsedSec/60/timerKm) : "--";
  const liveCalories  = elapsedSec>0 && timerKm>0 ? calcCalories(bw,timerBergenKg,timerKm,elapsedSec/60) : null;
  const PROG          = getProgramme(profile.programme?.test, profile.programme?.level || profile.fitnessLevel);
  const pk            = (w,i) => `${PROG.id}|${w}-${i}`;
  const totalSess     = PROG.weeks.reduce((a,w)=>a+w.sessions.length,0);
  const completedCnt  = Object.keys(completedSessions).filter(k=>k.startsWith(PROG.id+"|")).length;
  const activeTest    = TESTS[PROG.test];
  const totalDist     = sessionLogs.reduce((a,l)=>a+(parseFloat(l.distance)||0),0);
  const totalCals     = sessionLogs.reduce((a,l)=>a+(l.calories||0),0);
  const progPct       = Math.round((completedCnt/totalSess)*100);
  const today         = new Date().toLocaleDateString("en-GB");
  const todayName     = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date().getDay()];
  const xpLedger      = computeXP(sessionLogs);
  const totalXP       = xpLedger.total;
  const earnedBadges  = new Set(ALL_BADGES.filter(b=>b.check(sessionLogs)).map(b=>b.id));
  const earnedMissions= xpLedger.missionIds;
  const todayLogs     = sessionLogs.filter(l=>l.date===today);
  const thisWeekLogs  = sessionLogs.filter(l=>weekKey(l.date)===weekKey(today));
  const rank          = getRank(totalXP);
  const nextRank      = getNextRank(totalXP);
  const badgeCats     = ["All", ...new Set(ALL_BADGES.map(b=>b.category))];

  // ── Helpers ────────────────────────────────────────────────────────────────
  const toast = (msg, type="xp", icon=null) => { setNotification({msg,type,icon}); setTimeout(()=>setNotification(null),3200); };

  // Jump to any screen by name, whichever bottom tab it lives under.
  const go = (screen) => {
    if (screen==="home"||screen==="dashboard") return setTab("home");
    if (screen==="log") return setTab("log");
    if (screen==="timer"||screen==="programme") { setTrainView(screen); return setTab("train"); }
    if (["records","missions","honours"].includes(screen)) { setProgressView(screen); return setTab("progress"); }
    if (["settings","calories","tips","days"].includes(screen)) { setMoreView(screen); return setTab("more"); }
    if (screen==="more") { setMoreView(null); return setTab("more"); }
  };

  const addSession = (raw) => {
    const log = { ...raw, distance:Math.round((parseFloat(raw.distance)||0)*100)/100, time:parseFloat(raw.time)||0, bergenKg:parseFloat(raw.bergenKg)||0 };
    // Keep the log in date order (newest first) so past-dated sessions slot into place.
    const newLogs = [log, ...sessionLogs].sort((a,b) => parseDate(b.date) - parseDate(a.date) || b.id - a.id);
    setSessionLogs(newLogs);
    if (log.progKey) setCompletedSessions(p => ({ ...p, [log.progKey]:true }));
    const before = computeXP(sessionLogs), after = computeXP(newLogs);
    const gained = after.total - before.total;
    const oldRank = getRank(before.total), newRank = getRank(after.total);
    toast(`+${gained} XP earned`,"xp");
    if (newRank.title !== oldRank.title) {
      setTimeout(() => { setRankUp(newRank); try { navigator.vibrate?.([90,50,90,50,220]); } catch {} }, 500);
    }
    let delay = 1200;
    const prevBadges = new Set(ALL_BADGES.filter(b=>b.check(sessionLogs)).map(b=>b.id));
    ALL_BADGES.filter(b=>b.check(newLogs)&&!prevBadges.has(b.id)).slice(0,1).forEach(b=>{ setTimeout(()=>toast(`Badge unlocked: ${b.title}`,"badge",b.icon),delay); delay+=1600; });
    MISSIONS.filter(m=>after.missionIds.has(m.id)&&!before.missionIds.has(m.id)).forEach(m=>{ setTimeout(()=>toast(`Mission complete: ${m.title} +${m.xpReward} XP`,"mission",m.icon),delay); delay+=1600; });
    const chGained = (after.daily+after.weekly) - (before.daily+before.weekly);
    if (chGained > 0) setTimeout(()=>toast(`Challenge complete +${chGained} XP`,"mission",Zap),delay);
  };

  const deleteSession = (log) => {
    const lost = computeXP(sessionLogs).total - computeXP(sessionLogs.filter(l=>l.id!==log.id)).total;
    if (!window.confirm(`Delete this session (${u.dist(log.distance)}, ${log.date})?\n\nYou'll lose ${lost} XP, plus any badges, missions or challenges it unlocked.`)) return;
    const rest = sessionLogs.filter(l=>l.id!==log.id);
    setSessionLogs(rest);
    if (routes[log.id]) setRoutes(r => { const n = { ...r }; delete n[log.id]; return n; });
    if (detailId === log.id) setDetailId(null);
    // If this session ticked off a programme session (and no other log did), un-tick it.
    if (log.progKey && !rest.some(l=>l.progKey===log.progKey))
      setCompletedSessions(p => Object.fromEntries(Object.entries(p).filter(([k])=>k!==log.progKey)));
  };

  // ── Programme ⇄ timer/log link ────────────────────────────────────────────
  const parseProgKey = key => { const [id, wi] = String(key).split("|"); const [w,i] = (wi||"").split("-").map(Number); return { prog:getProgrammeById(id), w, i }; };
  const progSession = key => { const { prog, w, i } = parseProgKey(key); return prog.weeks[w-1]?.sessions[i]; };
  // Target pace (min per km) for live guidance: the linked programme session's, or one the user picked.
  const timerProgSess = timer.progKey ? progSession(timer.progKey) : null;
  const targetPace = timerProgSess ? timerProgSess.targetTime/timerProgSess.distance : (timer.targetPace || null);
  const unitKm = u.imp ? MI_TO_KM : 1;
  const paceGapSec = targetPace && timer.gpsKm >= 0.1 ? elapsedSec - timer.gpsKm*targetPace*60 : null;   // + = behind, − = ahead
  const gapText = g => Math.abs(g) < 15 ? "on target pace" : `${mmss(Math.abs(g))} ${g<0?"ahead of":"behind"} target`;
  const liveSplits = timer.mode==="gps" ? computeSplits(timer.route, unitKm) : [];
  // Spoken cue each time you pass a whole km (or mile).
  useEffect(() => {
    if (!timer.running || timer.mode!=="gps") return;
    const idx = Math.floor(timer.gpsKm/unitKm + 1e-9);
    if (idx > (timer.cued||0)) {
      const lap = elapsedSec - (timer.lastCueSec||0), unitName = u.imp ? "Mile" : "Kilometre";
      setTimer(t => ({ ...t, cued:idx, lastCueSec:elapsedSec }));
      if (profile.voiceCues) {
        const g = targetPace ? elapsedSec - timer.gpsKm*targetPace*60 : null;
        say(`${unitName} ${idx}. Time, ${spoken(elapsedSec)}. That ${unitName.toLowerCase()}, ${spoken(lap)}.${g!==null ? (Math.abs(g)<15 ? " Right on target pace." : ` ${spoken(Math.abs(g))} ${g<0?"ahead of":"behind"} target.`) : ""}`);
      }
    }
  }, [timer.gpsKm]); // eslint-disable-line
  const progLabel = key => { const { prog, w } = parseProgKey(key); const sess = progSession(key); if (!sess) return "";
    return `${prog.id!==PROG.id ? prog.short+" · " : ""}Week ${w} · ${sess.day} ${sess.type}`; };
  const startProgSession = (key, sess) => {
    if (elapsedSec > 0 || timer.running) { toast("Finish or reset the current tab first.", "warn"); go("timer"); return; }
    setTimerBergenKg(sess.weight); setTimerDistance(sess.distance);
    setTimer(t => ({ ...t, progKey:key }));
    go("timer");
  };
  const logProgSession = (key, sess) => {
    setLogForm({ ...BLANK_LOG(), distance:String(u.distNum(sess.distance,1)), time:"", bergenKg:sess.weight, progKey:key });
    setShowLogForm(true); go("log");
  };
  const nextProg = (() => {
    for (const w of PROG.weeks) for (let i=0;i<w.sessions.length;i++) { const key=pk(w.week,i); if (!completedSessions[key]) return { key, week:w.week, sess:w.sessions[i] }; }
    return null;
  })();

  // ── Weekly summary ────────────────────────────────────────────────────────
  const weekSummary = (() => {
    const start = new Date(); start.setHours(0,0,0,0); start.setDate(start.getDate() - (start.getDay()+6)%7 - 7*weekOffset);   // Monday
    const key = weekKey(start.toLocaleDateString("en-GB"));
    const logs = sessionLogs.filter(l=>weekKey(l.date)===key);
    const days = Array.from({length:7},(_,i)=>{ const d=new Date(start); d.setDate(d.getDate()+i); const ds=d.toLocaleDateString("en-GB"); return logs.filter(l=>l.date===ds).reduce((a,l)=>a+(parseFloat(l.distance)||0),0); });
    const xp = computeXP(sessionLogs.filter(l=>weekKey(l.date)<=key)).total - computeXP(sessionLogs.filter(l=>weekKey(l.date)<key)).total;
    // Week streak: consecutive weeks with at least one tab, ending at this week (or last week if this one's still empty).
    const weeks = new Set(sessionLogs.map(l=>weekKey(l.date)));
    let streak = 0; const cur = new Date(start); if (weekOffset===0 && !weeks.has(key)) cur.setDate(cur.getDate()-7);
    while (weeks.has(weekKey(cur.toLocaleDateString("en-GB")))) { streak++; cur.setDate(cur.getDate()-7); }
    const end = new Date(start); end.setDate(end.getDate()+6);
    const label = `${start.getDate()} ${start.toLocaleDateString("en-GB",{month:"short"})} – ${end.getDate()} ${end.toLocaleDateString("en-GB",{month:"short"})}`;
    return { logs, days, xp, streak, label,
      tabs: logs.length, km: logs.reduce((a,l)=>a+(parseFloat(l.distance)||0),0), mins: logs.reduce((a,l)=>a+(parseFloat(l.time)||0),0),
      heaviest: logs.reduce((a,l)=>Math.max(a,parseFloat(l.bergenKg)||0),0) };
  })();
  const shareWeek = async () => {
    const w = weekSummary;
    try {
      const c = document.createElement("canvas"); c.width = 1080; c.height = 1350;
      const g = c.getContext("2d"); await document.fonts?.ready;
      const dark = T.scheme==="dark", bg = dark ? T.bg : "#14180f", acc = dark ? T.accent : "#8CB43A", txt = dark ? T.text : "#EDEBDD", mut = dark ? T.textMuted : "#9A9C84";
      g.fillStyle = bg; g.fillRect(0,0,1080,1350);
      g.textAlign = "left";
      g.fillStyle = acc; g.font = `700 54px ${T.displayFont}`; g.fillText("TABBR", 80, 130);
      g.fillStyle = mut; g.font = `500 38px ${T.font}`; g.fillText(`${profile.name ? profile.name+"'s" : "My"} week · ${w.label}`, 80, 200);
      const tiles = [[String(w.tabs), w.tabs===1?"tab":"tabs"], [trim(u.distNum(w.km,1)), `${u.dUnit} covered`], [mmss(w.mins*60), "time on feet"], [w.heaviest?u.wt(w.heaviest):"—", "heaviest load"], [`+${w.xp}`, "XP earned"], [String(w.streak), "week streak"]];
      tiles.forEach(([v,l],i)=>{ const x = 80 + (i%2)*480, y = 330 + Math.floor(i/2)*220;
        g.fillStyle = txt; g.font = `700 104px ${T.displayFont}`; g.fillText(v, x, y);
        g.fillStyle = mut; g.font = `500 36px ${T.font}`; g.fillText(l, x, y+56); });
      // day bars
      const max = Math.max(1, ...w.days), base = 1150, bw2 = 92, gap = 40;
      ["M","T","W","T","F","S","S"].forEach((d,i)=>{ const x = 80 + i*(bw2+gap), h = Math.round((w.days[i]/max)*190);
        g.fillStyle = w.days[i] ? acc : (dark ? T.surfaceAlt : "#262b1f"); g.fillRect(x, base - Math.max(h,8), bw2, Math.max(h,8));
        g.fillStyle = mut; g.font = `500 32px ${T.font}`; g.textAlign = "center"; g.fillText(d, x+bw2/2, base+50); g.textAlign = "left"; });
      g.fillStyle = acc; g.font = `700 34px ${T.font}`; g.fillText(`${rank.title} · ${totalXP.toLocaleString()} XP`, 80, 1290);
      const blob = await new Promise(res => c.toBlob(res, "image/png"));
      const file = new File([blob], `tabbr-week-${isoToday()}.png`, { type:"image/png" });
      if (navigator.canShare?.({ files:[file] })) { await navigator.share({ files:[file], text:`My TABBR week: ${w.tabs} tabs, ${u.dist(w.km)}.` }); return; }
      const url = URL.createObjectURL(file); const a = document.createElement("a"); a.href = url; a.download = file.name; a.click(); setTimeout(()=>URL.revokeObjectURL(url), 2000);
    } catch (e) { if (e?.name !== "AbortError") toast("Couldn't create the share image on this device.", "warn"); }
  };

  // ── Backup ────────────────────────────────────────────────────────────────
  const exportData = async () => {
    const data = {}; try { for (let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if (k.startsWith("tt_")) data[k]=localStorage.getItem(k); } } catch {}
    const json = JSON.stringify({ app:"TABBR", version:2, exported:new Date().toISOString(), data }, null, 2);
    const name = `tabbr-backup-${isoToday()}.json`;
    const file = new File([json], name, { type:"application/json" });
    try { if (navigator.canShare?.({ files:[file] })) { await navigator.share({ files:[file], title:"TABBR backup" }); return; } } catch (e) { if (e?.name === "AbortError") return; }
    const url = URL.createObjectURL(file); const a = document.createElement("a"); a.href = url; a.download = name; a.click(); setTimeout(()=>URL.revokeObjectURL(url), 2000);
    toast("Backup saved", "xp", Download);
  };
  const importData = (file) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const parsed = JSON.parse(r.result);
        if (parsed.app !== "TABBR" || !parsed.data) throw new Error("not a backup");
        const n = JSON.parse(parsed.data.tt_logs || "[]").length;
        if (!window.confirm(`Restore this backup from ${new Date(parsed.exported).toLocaleDateString("en-GB")} (${n} sessions)?\n\nThis replaces everything currently in TABBR on this device.`)) return;
        Object.keys(localStorage).filter(k=>k.startsWith("tt_")).forEach(k=>localStorage.removeItem(k));
        Object.entries(parsed.data).forEach(([k,v])=>localStorage.setItem(k,v));
        window.location.reload();
      } catch { toast("That file isn't a TABBR backup. Choose a file named tabbr-backup-….json.", "warn"); }
    };
    r.readAsText(file);
  };

  const logDistKm = u.toKm(logForm.distance);
  const handleLogSubmit = () => {
    if (!(logDistKm>0) || !(parseFloat(logForm.time)>0)) return;
    const cals = calcCalories(bw,logForm.bergenKg,logDistKm,parseFloat(logForm.time));
    const [y,m,d] = (logForm.date || isoToday()).split("-");
    addSession({ ...logForm, distance:logDistKm, calories:cals, notes:logForm.freeNotes, date:`${d}/${m}/${y}`, id:Date.now() });
    setLogForm(BLANK_LOG());
    setShowLogForm(false);
  };

  const saveTimerSession = () => {
    if (!(timerKm >= 0.1)) {
      toast(timer.mode==="gps" ? "No GPS distance recorded yet — switch to Manual to enter it yourself." : "Enter a distance first.", "warn");
      return;
    }
    const mins = Math.max(1, Math.round(elapsedSec/60));
    const cals = calcCalories(bw,timerBergenKg,timerKm,mins);
    const id = Date.now();
    const route = timer.mode==="gps" && (timer.route||[]).some(sg=>sg.length>1) ? downsampleRoute(timer.route) : null;
    if (route) setRoutes(r => ({ ...r, [id]:route }));
    addSession({ distance:timerKm, bergenKg:timerBergenKg, time:mins, calories:cals, notes: timer.mode==="gps" ? "GPS-tracked" : "Logged from timer", source:timer.mode, progKey:timer.progKey||null, hasRoute:!!route, date:today, id });
    resetTimer(false);
    go("log");
  };

  const typeColor = t => t==="Recovery"||t==="Taper" ? T.warning : t==="TEST" ? T.danger : T.accent;
  const sessCalories = sess => bw ? calcCalories(bw,sess.weight,sess.distance,sess.targetTime) : null;

  // ── Styles ─────────────────────────────────────────────────────────────────
  const hair = theme==="tabbr" ? "rgba(74,222,128,0.18)" : T.border;
  const s = {
    app:     { minHeight:"100vh", background:T.bg, fontFamily:T.font, color:T.text },
    header:  { position:"sticky", top:0, zIndex:100, background:T.navBg, borderBottom:`1px solid ${hair}`, padding:"calc(10px + env(safe-area-inset-top)) 16px 10px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"10px" },
    tabbar:  { position:"fixed", left:0, right:0, bottom:0, zIndex:100, background:T.navBg, borderTop:`1px solid ${hair}`, paddingBottom:"env(safe-area-inset-bottom)", display:"grid", gridTemplateColumns:"repeat(5,1fr)" },
    tabBtn:  a => ({ minHeight:"58px", border:"none", background:"transparent", color:a?T.accent:T.textMuted, fontFamily:T.font, fontSize:"0.68rem", fontWeight:a?700:500, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"3px", cursor:"pointer", position:"relative", padding:"6px 0" }),
    main:    { maxWidth:"680px", margin:"0 auto", padding:"18px 16px calc(96px + env(safe-area-inset-bottom))" },
    card:    { background:T.cardBg, border:`1px solid ${hair}`, borderRadius:"12px", padding:"16px", marginBottom:"14px" },
    statGrid:{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"8px", marginBottom:"14px" },
    stat:    { background:T.surface, border:`1px solid ${T.border}`, borderRadius:"10px", padding:"12px 6px", textAlign:"center" },
    statNum: { fontFamily:T.displayFont, fontSize:"1.5rem", color:T.accent, display:"block", lineHeight:1.1 },
    statLbl: { fontSize:"0.7rem", color:T.textMuted },
    pBar:    { height:"8px", background:T.surfaceAlt, borderRadius:"4px", overflow:"hidden", marginTop:"8px" },
    pFill:   p => ({ height:"100%", width:`${p}%`, background:T.accent, borderRadius:"4px", transition:"width 0.5s" }),
    wkCard:  { background:T.surface, border:`1px solid ${T.border}`, borderRadius:"10px", marginBottom:"10px", overflow:"hidden" },
    wkHead:  { padding:"10px 14px", background:T.surfaceAlt, display:"flex", alignItems:"center", justifyContent:"space-between" },
    sessRow: { padding:"6px 8px 6px 4px", borderTop:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:"6px" },
    badge:   c => ({ background:c+"22", color:c, padding:"2px 7px", borderRadius:"4px", fontSize:"0.7rem", fontWeight:700, whiteSpace:"nowrap", display:"inline-flex", alignItems:"center", gap:"4px" }),
    hit:     { minWidth:"44px", minHeight:"44px", display:"flex", alignItems:"center", justifyContent:"center", border:"none", background:"transparent", cursor:"pointer", padding:0, flexShrink:0, color:T.textMuted },
    chkBox:  d => ({ width:"24px", height:"24px", borderRadius:"50%", border:`2px solid ${d?T.accent:T.border}`, background:d?T.accent:"transparent", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s" }),
    timerBox:{ background:T.timerBg, borderRadius:"14px", padding:"22px", textAlign:"center", marginBottom:"14px" },
    timerNum:{ fontFamily:T.displayFont, fontSize:"3.5rem", color:T.accent, letterSpacing:"3px", fontVariantNumeric:"tabular-nums" },
    tBtn:    c => ({ minHeight:"48px", padding:"0 22px", borderRadius:"10px", border:"none", background:c, color:c===T.accent||c===T.accentLight?T.onAccent:"#fff", fontSize:"0.95rem", fontWeight:700, cursor:"pointer", fontFamily:T.font, display:"inline-flex", alignItems:"center", gap:"8px" }),
    input:   { width:"100%", minHeight:"44px", padding:"10px 12px", borderRadius:"8px", border:`1px solid ${T.border}`, background:T.surface, color:T.text, fontFamily:T.font, fontSize:"16px", boxSizing:"border-box", colorScheme:T.scheme },
    btn:     p => ({ minHeight:"44px", padding:"0 16px", borderRadius:"8px", border:p?"none":`1px solid ${T.border}`, background:p?T.accent:"transparent", color:p?T.onAccent:T.text, fontFamily:T.font, fontSize:"0.86rem", fontWeight:600, cursor:"pointer", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:"6px" }),
    chip:    sel => ({ minHeight:"40px", padding:"0 12px", borderRadius:"8px", border:`1px solid ${sel?T.accent:T.border}`, background:sel?T.accentBg:T.surface, color:sel?T.accent:T.textMuted, fontSize:"0.8rem", fontWeight:600, cursor:"pointer", fontFamily:T.font, display:"inline-flex", alignItems:"center", gap:"6px" }),
    seg:     { display:"grid", gap:"4px", padding:"4px", background:T.surfaceAlt, borderRadius:"10px", marginBottom:"18px" },
    segBtn:  a => ({ minHeight:"40px", borderRadius:"7px", background:a?T.cardBg:"transparent", color:a?T.text:T.textMuted, fontWeight:a?700:500, fontFamily:T.font, fontSize:"0.84rem", cursor:"pointer", boxShadow:a&&T.scheme==="light"?"0 1px 3px rgba(0,0,0,0.12)":"none", border:a&&T.scheme==="dark"?`1px solid ${hair}`:"1px solid transparent" }),
    tipGrid: { display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"10px" },
    tipCard: sel => ({ background:sel?T.accentBg:T.surface, border:`1px solid ${sel?T.accent:T.border}`, borderRadius:"10px", padding:"14px", cursor:"pointer", textAlign:"left", fontFamily:T.font, color:T.text }),
    logRow:  { display:"flex", gap:"8px", padding:"10px 0", alignItems:"flex-start" },
    label:   { fontSize:"0.8rem", color:T.textMuted, marginBottom:"5px", display:"block" },
    formGrid:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"12px" },
    banner:  { background:T.accentBg, border:`1px solid ${T.accent}`, borderRadius:"10px", padding:"10px 12px", marginBottom:"14px", display:"flex", alignItems:"center", gap:"10px" },
    h1:      { fontFamily:T.displayFont, fontSize:"1.9rem", margin:"0 0 4px", lineHeight:1.15 },
    h2:      { fontFamily:T.displayFont, fontSize:"1.1rem", margin:"0 0 10px", display:"flex", alignItems:"center", gap:"8px" },
    sub:     { color:T.textMuted, fontSize:"0.9rem", margin:"0 0 18px", lineHeight:1.5 },
    row:     { display:"flex", alignItems:"center", gap:"10px" },
  };
  const I = (C, size=18, color, style) => <C size={size} color={color||"currentColor"} strokeWidth={1.9} aria-hidden="true" style={{ flexShrink:0, ...style }}/>;
  const seg = (items, value, onChange) => (
    <div role="tablist" style={{ ...s.seg, gridTemplateColumns:`repeat(${items.length},1fr)` }}>
      {items.map(([id,label])=><button key={id} role="tab" aria-selected={value===id} style={s.segBtn(value===id)} onClick={()=>onChange(id)}>{label}</button>)}
    </div>
  );
  const backTo = (label, onClick) => (
    <button style={{ ...s.hit, justifyContent:"flex-start", gap:"2px", color:T.accent, fontFamily:T.font, fontSize:"0.9rem", fontWeight:600, marginLeft:"-8px", marginBottom:"4px" }} onClick={onClick}>{I(ChevronLeft,20)}{label}</button>
  );
  const fontsHref = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&family=Oswald:wght@500;600;700&family=Share+Tech+Mono&family=Barlow+Condensed:wght@600;700;900&display=swap";
  const globalCss = `
    html, body { margin:0; background:${T.bg}; }
    * { -webkit-tap-highlight-color: transparent; }
    button:focus-visible, input:focus-visible, [role=button]:focus-visible { outline:2px solid ${T.accent}; outline-offset:2px; }
    @keyframes slideDown { from { transform:translateY(-12px); opacity:0 } to { transform:none; opacity:1 } }
    @keyframes promote { 0% { transform:scale(0.4); opacity:0 } 60% { transform:scale(1.08); opacity:1 } 100% { transform:scale(1) } }
    @keyframes fadeUp { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:none } }
    .leaflet-container { font-family:inherit; }
    .tabbr-map.dark .leaflet-tile-pane { filter: invert(1) hue-rotate(180deg) brightness(0.9) contrast(0.9); }
    @media (prefers-reduced-motion: reduce) { *, *::before { animation:none !important; transition:none !important; } }
    ${theme==="tabbr" ? `.tabbr-app::before { content:''; position:fixed; inset:0; pointer-events:none; z-index:9999;
      background:repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px); }` : ""}
  `;
  const logo = (size="1.2rem") => (
    <span style={{ fontFamily:T.displayFont, fontSize:size, fontWeight:700, color:T.accent, letterSpacing:theme==="military"?"3px":theme==="tabbr"?"4px":"0", textTransform:theme==="tabbr"?"uppercase":"none" }}>
      {theme==="military"?"█ TABBR":theme==="tabbr"?"// TABBR":"TABBR"}
    </span>
  );
  const themeSwatches = (onPick) => (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"8px" }}>
      {[["clean","Clean"],["military","Military"],["tabbr","TABBR"]].map(([id,label])=>{
        const P = THEMES[id], sel = theme===id;
        return <button key={id} onClick={()=>onPick(id)} aria-pressed={sel}
          style={{ minHeight:"76px", borderRadius:"10px", border:`2px solid ${sel?T.accent:T.border}`, background:P.bg, cursor:"pointer", padding:"10px 8px", display:"flex", flexDirection:"column", alignItems:"flex-start", justifyContent:"space-between" }}>
          <span style={{ display:"flex", gap:"4px" }}>{[P.accent,P.surfaceAlt,P.text].map((c,i)=><span key={i} style={{ width:"14px", height:"14px", borderRadius:"50%", background:c, border:`1px solid ${P.border}` }}/>)}</span>
          <span style={{ fontFamily:P.displayFont, color:P.text, fontSize:"0.9rem", fontWeight:700 }}>{label}</span>
        </button>;
      })}
    </div>
  );

  // ── Loading splash (uses the saved theme, so no flash) ─────────────────────
  if (!ready) return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:T.font }}>
      <link href={fontsHref} rel="stylesheet"/>
      <style>{globalCss}</style>
      <div style={{ textAlign:"center", color:T.accent }}>
        {I(Backpack,44)}
        <div style={{ marginTop:"12px" }}>{logo("1.5rem")}</div>
        <div style={{ color:T.textMuted, fontSize:"0.85rem", marginTop:"8px" }}>Loading your data…</div>
      </div>
    </div>
  );

  // ── ONBOARDING (follows the chosen theme) ──────────────────────────────────
  if (!onboarded) {
    const OT = T;
    const GOALS = [
      { id:"recruit",   label:"Join up",            icon:Shield,   desc:"Preparing for selection or basic training" },
      { id:"fitness",   label:"General fitness",    icon:Dumbbell, desc:"Building real-world strength and endurance" },
      { id:"challenge", label:"Personal challenge", icon:Mountain, desc:"Pushing limits, taking on events or charity tabs" },
      { id:"veteran",   label:"Staying sharp",      icon:Medal,    desc:"Maintaining the standard after service" },
    ];
    const LEVELS = [
      { id:"beginner",     label:"Beginner",     icon:"○", desc:"New to tabbing or loaded marching" },
      { id:"intermediate", label:"Intermediate", icon:"▲", desc:"Some experience, building consistency" },
      { id:"advanced",     label:"Advanced",     icon:"★", desc:"Regularly tabbing with significant load" },
    ];
    const STEPS = [
      { title:"Welcome to TABBR",           sub:"Loaded-march training built on British Army tabbing — for everyone." },
      { title:"What's your name?",          sub:"We'll use it to personalise your experience." },
      { title:"What's your goal?",          sub:"This helps us tailor the programme to you." },
      { title:"What's your fitness level?", sub:"Be honest — the programme adapts." },
      { title:"Your setup",                 sub:"Units, body weight and the look you want. You can change these later in Settings." },
    ];
    const canNext = () => {
      if (onboardStep===1) return profile.name.trim().length>0;
      if (onboardStep===2) return !!profile.goal;
      if (onboardStep===3) return !!profile.fitnessLevel;
      return true;
    };
    const completeOnboarding = () => {
      if (profile.bodyWeight) {
        const v = profile.units==="imperial" ? (parseFloat(profile.bodyWeight)*0.453592).toFixed(1) : profile.bodyWeight;
        setUserBodyWeight(String(v));
      }
      setOnboarded(true);
    };
    const os = {
      wrap:  { minHeight:"100vh", background:OT.bg, fontFamily:OT.font, color:OT.text, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"calc(24px + env(safe-area-inset-top)) 16px calc(24px + env(safe-area-inset-bottom))", boxSizing:"border-box" },
      card:  { background:OT.cardBg, border:`1px solid ${hair}`, borderRadius:"16px", padding:"26px 20px", width:"100%", maxWidth:"460px", boxSizing:"border-box", boxShadow:OT.scheme==="light"?"0 8px 40px rgba(0,0,0,0.08)":"none" },
      title: { fontFamily:OT.displayFont, fontSize:"1.7rem", marginBottom:"6px", textAlign:"center" },
      sub:   { color:OT.textMuted, fontSize:"0.88rem", textAlign:"center", marginBottom:"22px", lineHeight:1.5 },
      dot:   (a,d) => ({ width:d||a?"20px":"8px", height:"8px", borderRadius:"4px", background:d||a?OT.accent:OT.border, transition:"all 0.3s" }),
      opt:   sel => ({ background:sel?OT.accentBg:OT.surface, border:`2px solid ${sel?OT.accent:OT.border}`, borderRadius:"10px", padding:"12px", cursor:"pointer", textAlign:"center", color:OT.text, fontFamily:OT.font }),
      pBtn:  en => ({ ...s.btn(true), width:"100%", minHeight:"50px", fontSize:"0.95rem", fontWeight:700, opacity:en?1:0.38, cursor:en?"pointer":"not-allowed" }),
    };
    return (
      <div style={os.wrap}>
        <link href={fontsHref} rel="stylesheet"/>
        <style>{globalCss}</style>
        <div key={onboardStep} style={{ ...os.card, animation:"fadeUp 0.35s ease" }}>
          <div style={{ display:"flex", justifyContent:"center", gap:"8px", marginBottom:"22px" }}>{STEPS.map((_,i)=><div key={i} style={os.dot(i===onboardStep,i<onboardStep)}/>)}</div>
          {onboardStep>0 && backTo("Back", ()=>setOnboardStep(st=>st-1))}
          <div style={os.title}>{STEPS[onboardStep].title}</div>
          <div style={os.sub}>{STEPS[onboardStep].sub}</div>

          {onboardStep===0 && (
            <div>
              <div style={{ display:"flex", justifyContent:"center", color:OT.accent, marginBottom:"16px" }}>{I(Backpack,52)}</div>
              <p style={{ color:OT.textMuted, fontSize:"0.88rem", lineHeight:1.7, textAlign:"center", margin:"0 0 20px" }}>
                TABBR helps you train, track, and progress at loaded marching — whether you're preparing for service in any branch of the Armed Forces, pushing personal limits, or staying sharp after it.
              </p>
              <div style={{ background:OT.accentBg, border:`1px solid ${OT.accent}`, borderRadius:"10px", padding:"14px", marginBottom:"20px", display:"grid", gap:"10px" }}>
                {[[Medal,"Rank up from Recruit to Field Marshal through real sessions"],[Target,"Complete missions and earn badges"],[ClipboardList,"Follow the 8-week programme — beginner to the 10-miler"],[Satellite,"Track distance with GPS while you tab"]].map(([Ic,text],i)=>(
                  <div key={i} style={{ display:"flex", gap:"10px", alignItems:"flex-start", color:OT.accent }}>{I(Ic,18)}<span style={{ fontSize:"0.85rem", color:OT.text }}>{text}</span></div>
                ))}
              </div>
              <button style={os.pBtn(true)} onClick={()=>setOnboardStep(1)}>Get started</button>
            </div>
          )}

          {onboardStep===1 && (
            <div>
              <label style={s.label} htmlFor="ob-name">Your name or callsign</label>
              <input id="ob-name" style={s.input} placeholder="e.g. Jamie or Ranger" value={profile.name} onChange={e=>setProfile(p=>({...p,name:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&canNext()&&setOnboardStep(2)} autoFocus/>
              <p style={{ color:OT.textMuted, fontSize:"0.78rem", margin:"8px 0 18px" }}>This is how the app will address you.</p>
              <button style={os.pBtn(canNext())} onClick={()=>canNext()&&setOnboardStep(2)}>Continue</button>
            </div>
          )}

          {onboardStep===2 && (
            <div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"18px" }}>
                {GOALS.map(g=>{ const sel=profile.goal===g.id; return (
                  <button key={g.id} style={os.opt(sel)} onClick={()=>setProfile(p=>({...p,goal:g.id}))} aria-pressed={sel}>
                    <div style={{ color:sel?OT.accent:OT.textMuted, display:"flex", justifyContent:"center", marginBottom:"6px" }}>{I(g.icon,24)}</div>
                    <div style={{ fontWeight:700, fontSize:"0.85rem", color:sel?OT.accent:OT.text, marginBottom:"3px" }}>{g.label}</div>
                    <div style={{ fontSize:"0.72rem", color:OT.textMuted, lineHeight:1.4 }}>{g.desc}</div>
                  </button>); })}
              </div>
              <button style={os.pBtn(canNext())} onClick={()=>canNext()&&setOnboardStep(3)}>Continue</button>
            </div>
          )}

          {onboardStep===3 && (
            <div>
              <div style={{ display:"flex", flexDirection:"column", gap:"9px", marginBottom:"18px" }}>
                {LEVELS.map(l=>{ const sel=profile.fitnessLevel===l.id; return (
                  <button key={l.id} style={{ ...os.opt(sel), display:"flex", alignItems:"center", gap:"13px", textAlign:"left" }} onClick={()=>setProfile(p=>({...p,fitnessLevel:l.id}))} aria-pressed={sel}>
                    <span style={{ fontSize:"1.3rem", color:sel?OT.accent:OT.textMuted, width:"22px", textAlign:"center" }}>{l.icon}</span>
                    <div><div style={{ fontWeight:700, fontSize:"0.88rem", color:sel?OT.accent:OT.text }}>{l.label}</div><div style={{ fontSize:"0.75rem", color:OT.textMuted }}>{l.desc}</div></div>
                  </button>); })}
              </div>
              <button style={os.pBtn(canNext())} onClick={()=>canNext()&&setOnboardStep(4)}>Continue</button>
            </div>
          )}

          {onboardStep===4 && (
            <div>
              <label style={s.label}>Units</label>
              {seg([["metric","Metric (km, kg)"],["imperial","Imperial (mi, lb)"]], profile.units, id=>setProfile(p=>({...p,units:id})))}
              <label style={s.label} htmlFor="ob-bw">Body weight ({profile.units==="metric"?"kg":"lb"}) — optional, for calorie estimates</label>
              <input id="ob-bw" style={{ ...s.input, marginBottom:"16px" }} type="number" inputMode="decimal" placeholder={profile.units==="metric"?"e.g. 75":"e.g. 165"} value={profile.bodyWeight||""} onChange={e=>setProfile(p=>({...p,bodyWeight:e.target.value}))}/>
              <label style={s.label}>Look</label>
              <div style={{ marginBottom:"20px" }}>{themeSwatches(setTheme)}</div>
              <button style={os.pBtn(true)} onClick={completeOnboarding}>Enter TABBR</button>
            </div>
          )}
        </div>
        <p style={{ color:OT.textMuted, fontSize:"0.72rem", marginTop:"18px", textAlign:"center" }}>TABBR · Tactical Advance to Battle</p>
      </div>
    );
  }

  // ── Rank-up share image ────────────────────────────────────────────────────
  const shareRank = async (r) => {
    try {
      const c = document.createElement("canvas"); c.width = c.height = 1080;
      const g = c.getContext("2d");
      await document.fonts?.ready;
      g.fillStyle = T.scheme==="light" ? "#14180f" : T.bg; g.fillRect(0,0,1080,1080);
      const acc = T.scheme==="light" ? "#8CB43A" : T.accent, txt = T.scheme==="light" ? "#EDEBDD" : T.text, mut = T.scheme==="light" ? "#9A9C84" : T.textMuted;
      // reticle
      g.strokeStyle = acc; g.globalAlpha = 0.25; g.lineWidth = 3;
      g.beginPath(); g.arc(540,440,300,0,Math.PI*2); g.stroke();
      g.beginPath(); g.arc(540,440,220,0,Math.PI*2); g.stroke();
      [[540,100,540,190],[540,690,540,780],[200,440,290,440],[790,440,880,440]].forEach(([a,b,c2,d])=>{ g.beginPath(); g.moveTo(a,b); g.lineTo(c2,d); g.stroke(); });
      g.globalAlpha = 1; g.textAlign = "center";
      g.fillStyle = r.colour; g.font = `700 200px ${T.displayFont}`; g.fillText(r.insignia, 540, 510);
      g.fillStyle = mut; g.font = `500 40px ${T.font}`; g.fillText(`${profile.name||"Soldier"} has been promoted to`, 540, 830);
      g.fillStyle = txt; g.font = `700 96px ${T.displayFont}`; g.fillText(r.title, 540, 935);
      g.fillStyle = acc; g.font = `700 36px ${T.font}`; g.fillText(`TABBR · ${totalXP.toLocaleString()} XP`, 540, 1020);
      const blob = await new Promise(res => c.toBlob(res, "image/png"));
      const file = new File([blob], `tabbr-${r.abbr.replace(/\s/g,"").toLowerCase()}.png`, { type:"image/png" });
      if (navigator.canShare?.({ files:[file] })) { await navigator.share({ files:[file], text:`Promoted to ${r.title} on TABBR.` }); return; }
      const url = URL.createObjectURL(file); const a = document.createElement("a"); a.href = url; a.download = file.name; a.click(); setTimeout(()=>URL.revokeObjectURL(url), 2000);
    } catch (e) { if (e?.name !== "AbortError") toast("Couldn't create the share image on this device.", "warn"); }
  };

  // ── Reusable bits ──────────────────────────────────────────────────────────
  const restCard = () => {
    if (restStatus.type==="none") return null;
    const map = {
      active:  { bg:T.accentBg,  bd:T.accent,  ic:CircleCheck,   title:"Active today" },
      rest:    { bg:T.surface,   bd:T.border,  ic:Moon,          title:"Rest day" },
      warning: { bg:T.warningBg, bd:T.warning, ic:TriangleAlert, title:"You've been resting" },
      danger:  { bg:T.dangerBg,  bd:T.danger,  ic:Siren,         title:"Extended rest" },
    }[restStatus.type];
    return (
      <div style={{ ...s.card, background:map.bg, border:`1px solid ${map.bd}` }}>
        <div style={s.row}>
          <span style={{ color:restStatus.type==="rest"?T.textMuted:map.bd }}>{I(map.ic,22)}</span>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:"0.88rem", marginBottom:"2px" }}>{map.title}</div>
            <div style={{ color:T.textMuted, fontSize:"0.8rem" }}>{restStatus.msg}</div>
          </div>
        </div>
      </div>
    );
  };
  const bwBanner = () => (!bw && showProfileBanner) ? (
    <div style={s.banner}>
      <span style={{ color:T.accent }}>{I(Scale,20)}</span>
      <div style={{ flex:1, fontSize:"0.84rem" }}>Add your body weight to see calorie estimates.</div>
      <button style={{ ...s.btn(true), minHeight:"36px", padding:"0 12px" }} onClick={()=>go("settings")}>Add</button>
      <button aria-label="Dismiss" style={s.hit} onClick={()=>setShowProfileBanner(false)}>{I(X,18)}</button>
    </div>
  ) : null;
  const progRow = (week, sess, si, compact=false) => {
    const key=pk(week,si), done=!!completedSessions[key], cals=sessCalories(sess);
    return (
      <div key={key} style={{ ...s.sessRow, opacity:done?0.55:1 }}>
        <button aria-label={done?"Mark as not done":"Mark as done"} aria-pressed={done} style={s.hit}
          onClick={()=>setCompletedSessions(p=>done?Object.fromEntries(Object.entries(p).filter(([k])=>k!==key)):{...p,[key]:true})}>
          <span style={s.chkBox(done)}>{done&&I(Check,14,T.onAccent)}</span>
        </button>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", gap:"7px", alignItems:"center", flexWrap:"wrap", marginBottom:compact?0:"3px" }}>
            <span style={{ fontWeight:700, fontSize:"0.86rem" }}>{sess.day}</span>
            <span style={s.badge(typeColor(sess.type))}>{sess.type}</span>
            <span style={{ color:T.accent, fontWeight:700, fontSize:"0.86rem" }}>{u.dist(sess.distance)}</span>
            <span style={{ color:T.textMuted, fontSize:"0.82rem" }}>{u.wt(sess.weight)}</span>
            <span style={{ color:T.textMuted, fontSize:"0.78rem" }}>~{sess.targetTime} min</span>
            {cals&&!compact&&<span style={s.badge(T.warning)}>{I(Flame,12)}{cals} kcal</span>}
          </div>
          {!compact&&<p style={{ color:T.textMuted, fontSize:"0.76rem", margin:0, lineHeight:1.45 }}>{sess.notes}</p>}
        </div>
        {!done && <>
          <button aria-label={`Start ${sess.day} session on the timer`} style={{ ...s.hit, color:T.accent }} onClick={()=>startProgSession(key,sess)}>{I(Play,20)}</button>
          <button aria-label={`Log ${sess.day} session`} style={s.hit} onClick={()=>logProgSession(key,sess)}>{I(PenLine,19)}</button>
        </>}
      </div>
    );
  };
  const challengeRow = (ch, done) => (
    <div key={ch.id} style={{ display:"flex", alignItems:"center", gap:"10px", padding:"9px 0", borderBottom:`1px solid ${T.border}`, opacity:done?0.6:1 }}>
      <span style={{ color:done?T.accent:T.textMuted }}>{I(done?CircleCheck:Target,20)}</span>
      <div style={{ flex:1 }}><div style={{ fontWeight:600, fontSize:"0.86rem" }}>{ch.title}</div><div style={{ color:T.textMuted, fontSize:"0.76rem" }}>{ch.desc}</div></div>
      <span style={s.badge(done?T.accent:T.warning)}>{done&&I(Check,12)}+{ch.xp} XP</span>
    </div>
  );
  const timerActiveNow = timer.running || elapsedSec > 0;
  const TABS = [["home",House,"Home"],["train",Footprints,"Train"],["log",NotebookPen,"Log"],["progress",Trophy,"Progress"],["more",Menu,"More"]];

  // ── MAIN APP RENDER ───────────────────────────────────────────────────────
  return (
    <div style={s.app} className={theme==="tabbr"?"tabbr-app":""}>
      <link href={fontsHref} rel="stylesheet"/>
      <style>{globalCss}</style>

      {/* Header */}
      <header style={s.header}>
        <button onClick={()=>go("home")} style={{ background:"none", border:"none", padding:0, cursor:"pointer", minHeight:"44px" }} aria-label="Home">{logo()}</button>
        <button onClick={()=>go("honours")} aria-label={`Rank: ${rank.title}, ${totalXP} XP`}
          style={{ display:"flex", alignItems:"center", gap:"6px", background:T.goldBg, border:`1px solid ${T.gold}`, borderRadius:"8px", padding:"0 10px", minHeight:"36px", cursor:"pointer", fontFamily:T.font }}>
          <span style={{ fontSize:"0.85rem", color:rank.colour }}>{rank.insignia}</span>
          <span style={{ fontSize:"0.78rem", color:T.gold, fontWeight:700 }}>{rank.abbr}</span>
          <span style={{ fontSize:"0.74rem", color:T.textMuted }}>{totalXP.toLocaleString()} XP</span>
        </button>
      </header>

      {!isOnline && (
        <div style={{ background:T.warningBg, color:T.warning, borderBottom:`1px solid ${T.warning}`, padding:"7px 16px", fontSize:"0.8rem", fontWeight:600, textAlign:"center" }}>
          Offline — everything still works and saves on this phone
        </div>
      )}

      {/* Toast */}
      {notification && (
        <div role="status" style={{ position:"fixed", top:"calc(66px + env(safe-area-inset-top))", left:"16px", right:"16px", maxWidth:"440px", margin:"0 auto", zIndex:999,
          background:notification.type==="warn"?T.warningBg:T.cardBg, color:notification.type==="warn"?T.warning:T.text, border:`1px solid ${notification.type==="warn"?T.warning:T.accent}`,
          borderRadius:"10px", padding:"12px 14px", fontSize:"0.86rem", fontWeight:600, boxShadow:"0 6px 24px rgba(0,0,0,0.25)", animation:"slideDown 0.25s ease", display:"flex", alignItems:"center", gap:"10px" }}>
          {notification.icon && <span style={{ color:T.accent }}>{I(notification.icon,20)}</span>}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Rank-up screen */}
      {rankUp && (
        <div role="dialog" aria-modal="true" aria-label={`Promoted to ${rankUp.title}`}
          style={{ position:"fixed", inset:0, zIndex:2000, background:T.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"calc(24px + env(safe-area-inset-top)) 24px calc(24px + env(safe-area-inset-bottom))", textAlign:"center" }}>
          <div style={{ position:"relative", width:"220px", height:"220px", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"26px" }}>
            <svg width="220" height="220" viewBox="0 0 220 220" aria-hidden="true" style={{ position:"absolute", inset:0, opacity:0.35 }}>
              <circle cx="110" cy="110" r="100" fill="none" stroke={T.accent} strokeWidth="1.5"/>
              <circle cx="110" cy="110" r="72" fill="none" stroke={T.accent} strokeWidth="1.5"/>
              {[[110,0,110,26],[110,194,110,220],[0,110,26,110],[194,110,220,110]].map(([a,b,c,d],i)=><line key={i} x1={a} y1={b} x2={c} y2={d} stroke={T.accent} strokeWidth="1.5"/>)}
            </svg>
            <span style={{ fontSize:rankUp.insignia.length>=3?"3rem":rankUp.insignia.length===2?"3.8rem":"4.6rem", color:rankUp.colour, fontFamily:T.displayFont, animation:"promote 0.7s cubic-bezier(.2,.8,.2,1) both" }}>{rankUp.insignia}</span>
          </div>
          <div style={{ color:T.textMuted, fontSize:"0.95rem", marginBottom:"6px" }}>You've been promoted to</div>
          <div style={{ fontFamily:T.displayFont, fontSize:"2.6rem", color:T.text, lineHeight:1.1, marginBottom:"6px" }}>{rankUp.title}</div>
          <div style={{ color:T.textMuted, fontSize:"0.8rem", marginBottom:"18px" }}>{rankUp.abbr} · {rankUp.nato}</div>
          <p style={{ color:T.accent, fontSize:"1rem", fontStyle:"italic", maxWidth:"340px", lineHeight:1.6, margin:"0 0 30px" }}>"{rankUp.lore}"</p>
          <div style={{ display:"flex", gap:"10px", width:"100%", maxWidth:"360px" }}>
            <button style={{ ...s.btn(false), flex:1, minHeight:"50px" }} onClick={()=>shareRank(rankUp)}>{I(Share2,18)}Share</button>
            <button style={{ ...s.btn(true), flex:1, minHeight:"50px" }} onClick={()=>setRankUp(null)} autoFocus>Continue</button>
          </div>
        </div>
      )}

      {/* Session detail sheet */}
      {detailId && (() => {
        const log = sessionLogs.find(l=>l.id===detailId); if (!log) return null;
        const route = routes[log.id];
        const splits = route ? computeSplits(route, unitKm) : [];
        const full = splits.filter(x=>x.full), best = full.length ? Math.min(...full.map(x=>x.sec)) : null, worst = full.length ? Math.max(...full.map(x=>x.sec)) : null;
        const W = WEATHER.find(([,l])=>l===log.weather), F = FINISH.find(([,l])=>l===log.finish);
        return (
          <div role="dialog" aria-modal="true" aria-label={`Session on ${log.date}`} style={{ position:"fixed", inset:0, zIndex:1500, background:T.bg, overflowY:"auto" }}>
            <div style={{ ...s.header, position:"sticky" }}>
              {backTo("Back", ()=>setDetailId(null))}
              <span style={{ fontSize:"0.85rem", color:T.textMuted }}>{log.date}</span>
            </div>
            <div style={{ ...s.main, paddingBottom:"calc(32px + env(safe-area-inset-bottom))" }}>
              <div style={{ fontFamily:T.displayFont, fontSize:"2.6rem", color:T.accent, lineHeight:1 }}>{u.dist(log.distance,2)}</div>
              <div style={{ color:T.textMuted, fontSize:"0.88rem", margin:"6px 0 16px" }}>with {u.wt(log.bergenKg)}{log.progKey?` · ${progLabel(log.progKey)}`:""}</div>
              <div style={s.statGrid}>
                {[{num:mmss(log.time*60),lbl:"Time"},{num:log.distance>0?u.pace(log.time/log.distance).split(" ")[0]:"--",lbl:`min/${u.dUnit}`},{num:`+${calcSessionXP(log)}`,lbl:"XP"}].map((x,i)=>(
                  <div key={i} style={s.stat}><span style={s.statNum}>{x.num}</span><span style={s.statLbl}>{x.lbl}</span></div>
                ))}
              </div>
              {route ? (
                <>
                  <RouteMap route={route} T={T}/>
                  <p style={{ color:T.textMuted, fontSize:"0.72rem", margin:"6px 0 16px" }}>Map tiles need a connection the first time you view an area. The route line always shows.</p>
                  {splits.length>0 && (
                    <div style={s.card}>
                      <h2 style={s.h2}>{I(Clock,18,T.accent)}{u.imp?"Mile":"Km"} splits</h2>
                      {splits.map(sp=>{
                        const isBest = sp.full && sp.sec===best && full.length>1;
                        const w = sp.full && worst ? Math.max(12, (best/sp.sec)*100) : null;
                        return (
                          <div key={sp.n} style={{ display:"grid", gridTemplateColumns:"56px 1fr 52px", alignItems:"center", gap:"10px", padding:"6px 0", borderBottom:`1px solid ${T.border}` }}>
                            <span style={{ fontSize:"0.82rem", color:T.textMuted }}>{sp.full ? `${u.imp?"Mile":"Km"} ${sp.n}` : `${trim(sp.part*(u.imp?1:1),2)} ${u.dUnit}`}</span>
                            <span style={{ height:"10px", background:T.surfaceAlt, borderRadius:"5px", overflow:"hidden" }}>{w && <span style={{ display:"block", height:"100%", width:`${w}%`, background:isBest?T.accent:T.textMuted, opacity:isBest?1:0.5, borderRadius:"5px" }}/>}</span>
                            <span style={{ fontSize:"0.86rem", fontWeight:isBest?700:500, color:isBest?T.accent:T.text, textAlign:"right", fontVariantNumeric:"tabular-nums" }}>{mmss(sp.sec)}</span>
                          </div>
                        );
                      })}
                      <p style={{ color:T.textMuted, fontSize:"0.72rem", margin:"8px 0 0" }}>Longer bar = faster. Highlighted = fastest full {u.imp?"mile":"km"}.</p>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ ...s.card, background:T.surfaceAlt, display:"flex", gap:"10px", alignItems:"center" }}>
                  <span style={{ color:T.textMuted }}>{I(MapPinned,20)}</span>
                  <span style={{ color:T.textMuted, fontSize:"0.82rem" }}>No route for this session. Routes are recorded when you track a tab with GPS on the timer.</span>
                </div>
              )}
              <div style={s.card}>
                <h2 style={s.h2}>Details</h2>
                {[["Calories", log.calories?`${log.calories} kcal`:"—"],["Terrain", log.terrain||"—"],["Conditions", W?W[1]:"—"],["Effort", log.effort>0?`${log.effort}/5`:"—"],["Finish", F?F[1]:"—"],["Notes", log.freeNotes||log.notes||"—"]].map(([k,v])=>(
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", gap:"12px", padding:"7px 0", borderBottom:`1px solid ${T.border}`, fontSize:"0.86rem" }}><span style={{ color:T.textMuted }}>{k}</span><span style={{ textAlign:"right" }}>{v}</span></div>
                ))}
              </div>
              <button style={{ ...s.btn(false), width:"100%", color:T.danger, borderColor:T.danger }} onClick={()=>deleteSession(log)}>{I(X,16)}Delete session</button>
            </div>
          </div>
        );
      })()}

      <main style={s.main}>

        {/* ── HOME ── */}
        {tab==="home" && (
          <div>
            <h1 style={s.h1}>{theme==="military"?"MISSION STATUS":theme==="tabbr"?"// MISSION STATUS":profile.name?`Welcome back, ${profile.name}.`:"Your training"}</h1>
            <p style={s.sub}>{profile.goal==="recruit"?"Training for selection.":profile.goal==="fitness"?"Building real-world strength and endurance.":profile.goal==="challenge"?"On a personal challenge — keep pushing.":profile.goal==="veteran"?"Maintaining the standard. Never stop.":"Tactical Advance to Battle"}</p>

            {/* The one big button */}
            <button onClick={()=>{ if (!timerActiveNow) startTimer(); go("timer"); }}
              style={{ width:"100%", minHeight:"128px", border:"none", borderRadius:"16px", background:T.accent, color:T.onAccent, cursor:"pointer", display:"flex", alignItems:"center", gap:"18px", padding:"18px 22px", marginBottom:"14px", textAlign:"left", fontFamily:T.font, position:"relative", overflow:"hidden" }}>
              <svg width="160" height="160" viewBox="0 0 160 160" aria-hidden="true" style={{ position:"absolute", right:"-30px", top:"-16px", opacity:0.16 }}>
                <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="3"/><circle cx="80" cy="80" r="44" fill="none" stroke="currentColor" strokeWidth="3"/>
                <line x1="80" y1="0" x2="80" y2="30" stroke="currentColor" strokeWidth="3"/><line x1="80" y1="130" x2="80" y2="160" stroke="currentColor" strokeWidth="3"/>
                <line x1="0" y1="80" x2="30" y2="80" stroke="currentColor" strokeWidth="3"/><line x1="130" y1="80" x2="160" y2="80" stroke="currentColor" strokeWidth="3"/>
              </svg>
              <span style={{ width:"64px", height:"64px", borderRadius:"50%", border:"2px solid currentColor", display:"flex", alignItems:"center", justifyContent:"center" }}>{I(timerActiveNow?TimerIcon:Play,30)}</span>
              <span>
                <span style={{ display:"block", fontFamily:T.displayFont, fontSize:"2rem", fontWeight:700, lineHeight:1.05 }}>{timerActiveNow?(timer.running?fmtTime(elapsedSec):"Tab paused"):"Start TAB"}</span>
                <span style={{ display:"block", fontSize:"0.82rem", opacity:0.85, marginTop:"4px" }}>
                  {timerActiveNow ? `${timer.mode==="gps"?u.dist(timer.gpsKm,2)+" · ":""}Tap to return to the timer` : `${timer.mode==="gps"?"GPS tracking":"Manual distance"} · ${u.wt(timerBergenKg)} bergen`}
                </span>
              </span>
            </button>

            {bwBanner()}

            {reminderDays.includes(todayName) && todayLogs.length===0 && (
              <div style={{ ...s.card, background:T.accentBg, border:`1px solid ${T.accent}` }}>
                <div style={s.row}>
                  <span style={{ color:T.accent }}>{I(CalendarDays,22)}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:"0.88rem", marginBottom:"2px" }}>Training day</div>
                    <div style={{ color:T.textMuted, fontSize:"0.8rem" }}>{todayName} is on your schedule and nothing's logged yet. Time to pick up the bergen{profile.name?`, ${profile.name}`:""}.</div>
                  </div>
                </div>
              </div>
            )}
            {!(reminderDays.includes(todayName) && todayLogs.length===0) && restCard()}

            {profile.goal==="recruit" && PROG.test==="tabbr10" && (
              <div style={s.banner}>
                <span style={{ color:T.accent }}>{I(Shield,20)}</span>
                <div style={{ flex:1, fontSize:"0.84rem" }}>Training for a specific test? There are programmes for the Army RFT, P Company and Royal Marines.</div>
                <button style={{ ...s.btn(true), minHeight:"36px", padding:"0 12px" }} onClick={()=>{ setPicker({ test:"army_gcc", level:PROG.level }); go("programme"); }}>Choose</button>
              </div>
            )}
            {nextProg && (
              <div style={s.card}>
                <div style={{ ...s.row, justifyContent:"space-between", marginBottom:"4px" }}>
                  <h2 style={{ ...s.h2, margin:0 }}>{I(ClipboardList,18,T.accent)}Next in your programme</h2>
                  <span style={{ fontSize:"0.75rem", color:T.textMuted }}>{completedCnt}/{totalSess}</span>
                </div>
                <div style={s.pBar}><div style={s.pFill(progPct)}/></div>
                <button onClick={()=>go("programme")} style={{ background:"none", border:"none", padding:0, marginTop:"8px", color:T.textMuted, fontSize:"0.78rem", fontFamily:T.font, cursor:"pointer", textDecoration:"underline", textUnderlineOffset:"3px" }}>{PROG.short} · {LEVEL_INFO[PROG.level].label}</button>
                <div style={{ margin:"8px 0 4px", fontWeight:700, fontSize:"0.95rem" }}>Week {nextProg.week} · {nextProg.sess.day} <span style={s.badge(typeColor(nextProg.sess.type))}>{nextProg.sess.type}</span></div>
                <div style={{ color:T.textMuted, fontSize:"0.84rem", marginBottom:"4px" }}>{u.dist(nextProg.sess.distance)} with {u.wt(nextProg.sess.weight)} · target {nextProg.sess.targetTime} min</div>
                <div style={{ color:T.textMuted, fontSize:"0.78rem", marginBottom:"12px", lineHeight:1.45 }}>{nextProg.sess.notes}</div>
                <div style={{ display:"flex", gap:"8px" }}>
                  <button style={{ ...s.btn(true), flex:1 }} onClick={()=>startProgSession(nextProg.key,nextProg.sess)}>{I(Play,16)}Start</button>
                  <button style={{ ...s.btn(false), flex:1 }} onClick={()=>logProgSession(nextProg.key,nextProg.sess)}>{I(PenLine,16)}Log it</button>
                </div>
              </div>
            )}
            {!nextProg && (
              <div style={{ ...s.card, background:T.accentBg, border:`1px solid ${T.accent}` }}>
                <h2 style={s.h2}>{I(Trophy,18,T.accent)}Programme complete</h2>
                <p style={{ color:T.textMuted, fontSize:"0.84rem", margin:"0 0 12px" }}>All {totalSess} sessions of {PROG.short} done. Step up a level or pick a new test.</p>
                <button style={s.btn(true)} onClick={()=>{ setPicker({ test:PROG.test, level:PROG.level==="beginner"?"intermediate":"advanced" }); go("programme"); }}>Choose next programme</button>
              </div>
            )}

            {/* Weekly summary */}
            <div style={s.card}>
              <div style={{ ...s.row, justifyContent:"space-between", marginBottom:"10px" }}>
                <h2 style={{ ...s.h2, margin:0 }}>{I(CalendarCheck,18,T.accent)}{weekOffset===0?"This week":"Last week"}</h2>
                <span style={{ fontSize:"0.76rem", color:T.textMuted }}>{weekSummary.label}</span>
              </div>
              {seg([["0","This week"],["1","Last week"]], String(weekOffset), v=>setWeekOffset(+v))}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"10px 8px", marginTop:"-4px" }}>
                {[[weekSummary.tabs, weekSummary.tabs===1?"tab":"tabs"],[u.distNum(weekSummary.km,1), `${u.dUnit} covered`],[mmss(weekSummary.mins*60),"time on feet"],[weekSummary.heaviest?u.wt(weekSummary.heaviest):"—","heaviest load"],[`+${weekSummary.xp}`,"XP earned"],[weekSummary.streak, "week streak"]].map(([v,l],i)=>(
                  <div key={i}><div style={{ fontFamily:T.displayFont, fontSize:"1.35rem", lineHeight:1.1, color:T.text }}>{v}</div><div style={{ fontSize:"0.72rem", color:T.textMuted }}>{l}</div></div>
                ))}
              </div>
              <div style={{ display:"flex", gap:"6px", alignItems:"flex-end", height:"56px", margin:"16px 0 4px" }} aria-label="Distance by day">
                {weekSummary.days.map((d,i)=>{ const max=Math.max(1,...weekSummary.days); return (
                  <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:"4px", height:"100%", justifyContent:"flex-end" }}>
                    <div title={u.dist(d)} style={{ width:"100%", height:`${Math.max(6,(d/max)*100)}%`, background:d?T.accent:T.surfaceAlt, borderRadius:"4px" }}/>
                    <span style={{ fontSize:"0.66rem", color:T.textMuted }}>{"MTWTFSS"[i]}</span>
                  </div>); })}
              </div>
              {weekSummary.tabs>0 && <button style={{ ...s.btn(false), width:"100%", marginTop:"10px" }} onClick={shareWeek}>{I(Share2,16)}Share {weekOffset===0?"this":"last"} week</button>}
            </div>

            <XPBar xp={totalXP} T={T}/>
            <div style={{ height:"14px" }}/>
            <div style={{ fontSize:"0.8rem", color:T.textMuted, margin:"0 0 6px" }}>All time</div>
            <div style={s.statGrid}>
              {[{num:sessionLogs.length,lbl:"Tabs logged"},{num:u.distNum(totalDist,1),lbl:`${u.dUnit} covered`},{num:totalCals>0?totalCals.toLocaleString():"--",lbl:"kcal burned"},{num:earnedBadges.size,lbl:"Badges"},{num:`${earnedMissions.size}/${MISSIONS.length}`,lbl:"Missions"},{num:progPct+"%",lbl:"Programme"}].map((x,i)=>(
                <div key={i} style={s.stat}><span style={s.statNum}>{x.num}</span><span style={s.statLbl}>{x.lbl}</span></div>
              ))}
            </div>

            <div style={s.card}>
              <h2 style={s.h2}>{I(Target,18,T.accent)}Active missions</h2>
              {MISSIONS.filter(m=>!earnedMissions.has(m.id)).slice(0,3).map(m=>(
                <div key={m.id} style={{ display:"flex", alignItems:"center", gap:"10px", padding:"9px 0", borderBottom:`1px solid ${T.border}` }}>
                  <span style={{ color:T.textMuted }}>{I(m.icon,20)}</span>
                  <div style={{ flex:1 }}><div style={{ fontWeight:600, fontSize:"0.86rem" }}>{m.title}</div><div style={{ color:T.textMuted, fontSize:"0.76rem" }}>{m.desc}</div></div>
                  <span style={s.badge(T.gold)}>+{m.xpReward} XP</span>
                </div>
              ))}
              {MISSIONS.filter(m=>!earnedMissions.has(m.id)).length===0 && <p style={{ color:T.accent, fontSize:"0.86rem", margin:0 }}>All missions complete.</p>}
              <button style={{ ...s.btn(false), marginTop:"12px", width:"100%" }} onClick={()=>go("missions")}>See all missions{I(ChevronRight,16)}</button>
            </div>

            <div style={{ ...s.card, background:T.accentBg, border:`1px solid ${T.accent}` }}>
              <p style={{ color:T.text, fontSize:"0.88rem", lineHeight:1.6, margin:"0 0 6px", fontStyle:"italic" }}>"{rank.lore}"</p>
              {nextRank&&<p style={{ color:T.textMuted, fontSize:"0.78rem", margin:0 }}>Next rank: <strong>{nextRank.title}</strong>, {(nextRank.xpRequired-totalXP).toLocaleString()} XP away</p>}
            </div>
          </div>
        )}

        {/* ── TRAIN ── */}
        {tab==="train" && seg([["timer","Timer"],["programme","Programme"]], trainView, setTrainView)}

        {tab==="train" && trainView==="programme" && (
          <div>
            <h1 style={s.h1}>Training programme</h1>
            <div style={{ ...s.card, border:`1px solid ${T.accent}` }}>
              <div style={{ ...s.row, alignItems:"flex-start" }}>
                <span style={{ color:T.accent, marginTop:"2px" }}>{I(activeTest.official?Shield:ClipboardList,22)}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:T.displayFont, fontSize:"1.1rem", lineHeight:1.2 }}>{PROG.name}</div>
                  <div style={{ display:"flex", gap:"6px", margin:"5px 0 8px", flexWrap:"wrap" }}>
                    <span style={s.badge(T.accent)}>{LEVEL_INFO[PROG.level].label}</span>
                    <span style={s.badge(T.textMuted)}>8 weeks · {completedCnt}/{totalSess} done</span>
                  </div>
                  <p style={{ color:T.textMuted, fontSize:"0.8rem", margin:0, lineHeight:1.5 }}>{activeTest.desc}</p>
                </div>
              </div>
              {!picker && <button style={{ ...s.btn(false), width:"100%", marginTop:"12px" }} onClick={()=>setPicker({ test:PROG.test, level:PROG.level })}>Change programme</button>}
              {picker && (
                <div style={{ marginTop:"14px", borderTop:`1px solid ${T.border}`, paddingTop:"14px" }}>
                  <label style={s.label}>What are you training for?</label>
                  <div style={{ display:"grid", gap:"8px", marginBottom:"14px" }}>
                    {Object.entries(TESTS).map(([id,t])=>{ const sel=picker.test===id; return (
                      <button key={id} aria-pressed={sel} onClick={()=>setPicker(p=>({...p,test:id}))}
                        style={{ textAlign:"left", padding:"12px", borderRadius:"10px", border:`2px solid ${sel?T.accent:T.border}`, background:sel?T.accentBg:T.surface, color:T.text, cursor:"pointer", fontFamily:T.font }}>
                        <div style={{ fontWeight:700, fontSize:"0.88rem", color:sel?T.accent:T.text, display:"flex", alignItems:"center", gap:"6px" }}>{I(t.official?Shield:ClipboardList,15)}{t.name}</div>
                        <div style={{ fontSize:"0.76rem", color:T.textMuted, marginTop:"3px", lineHeight:1.45 }}>{t.desc}</div>
                      </button>); })}
                  </div>
                  <label style={s.label}>Your level</label>
                  {seg(Object.entries(LEVEL_INFO).map(([id,l])=>[id,l.label]), picker.level, lv=>setPicker(p=>({...p,level:lv})))}
                  <p style={{ color:T.textMuted, fontSize:"0.76rem", margin:"-6px 0 12px", lineHeight:1.5 }}>Progress is kept for each programme, so you can switch back any time. Official standards change: confirm the current test with your unit or recruiter.</p>
                  <div style={{ display:"flex", gap:"8px" }}>
                    <button style={{ ...s.btn(true), flex:1 }} onClick={()=>{ setProfile(p=>({...p, programme:{ test:picker.test, level:picker.level }})); setPicker(null); toast(`Programme set: ${TESTS[picker.test].short}, ${LEVEL_INFO[picker.level].label.toLowerCase()}`,"xp",ClipboardList); window.scrollTo(0,0); }}>{I(Check,16)}Use this programme</button>
                    <button style={s.btn(false)} onClick={()=>setPicker(null)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
            <p style={s.sub}>Tap {I(Play,14,T.accent,{verticalAlign:"-2px"})} to run a session on the timer or {I(PenLine,14,T.textMuted,{verticalAlign:"-2px"})} to log one you've done. Sessions tick off automatically when you save them.</p>
            {PROG.weeks.map((week,wi)=>(
              <div key={wi} style={s.wkCard}>
                <div style={s.wkHead}>
                  <span style={{ fontFamily:T.displayFont, fontSize:"0.98rem" }}>Week {week.week}{wi===3?" — Deload":wi===7?" — Test week":""}</span>
                  <span style={{ color:T.textMuted, fontSize:"0.78rem" }}>{week.sessions.filter((_,si)=>completedSessions[pk(week.week,si)]).length}/{week.sessions.length} done</span>
                </div>
                {week.sessions.map((sess,si)=>progRow(week.week,sess,si))}
              </div>
            ))}
          </div>
        )}

        {tab==="train" && trainView==="timer" && (() => {
          const isGps = timer.mode === "gps";
          const canSwitch = elapsedSec === 0 && !timer.running;
          const gpsMsg = {
            idle:        gpsSupported ? "GPS ready — starts when you press Start" : "GPS isn't available on this device",
            acquiring:   "Finding your position…",
            ok:          gps.acc!==null && gps.acc>MAX_ACCURACY_M ? `Weak signal (±${gps.acc}m) — waiting for a better fix` : `GPS locked (±${gps.acc}m)`,
            denied:      "Location permission denied — allow it in Settings › Privacy › Location Services › Safari Websites, or switch to Manual",
            error:       "GPS signal lost — still trying. The timer keeps running.",
            unavailable: "GPS isn't available on this device — switch to Manual",
          }[gps.state];
          const gpsColour = gps.state==="ok" && gps.acc<=MAX_ACCURACY_M ? T.accent : (gps.state==="denied"||gps.state==="unavailable") ? T.danger : T.warning;
          const dc = distConv(u.imp);
          const ps = timer.progKey ? progSession(timer.progKey) : null;
          return (
          <div>
            {ps && (
              <div style={s.banner}>
                <span style={{ color:T.accent }}>{I(ClipboardList,20)}</span>
                <div style={{ flex:1, fontSize:"0.84rem" }}><strong>{progLabel(timer.progKey)}</strong><br/><span style={{ color:T.textMuted }}>Target {u.dist(ps.distance)} in {ps.targetTime} min. Ticks off when you save.</span></div>
                {canSwitch && <button aria-label="Unlink programme session" style={s.hit} onClick={()=>setTimer(t=>({...t,progKey:null}))}>{I(X,18)}</button>}
              </div>
            )}
            {bwBanner()}
            <div style={s.card}>
              <label style={s.label}>Distance tracking</label>
              {seg([["gps",<span key="g" style={{ display:"inline-flex", alignItems:"center", gap:"6px" }}>{I(Satellite,16)}GPS</span>],["manual",<span key="m" style={{ display:"inline-flex", alignItems:"center", gap:"6px" }}>{I(PenLine,16)}Manual</span>]], timer.mode, m=>{ if (canSwitch) setTimer(t=>({...t,mode:m})); else toast("Reset the timer to change how distance is tracked.","warn"); })}
              {!isGps && <div style={{ marginBottom:"14px" }}><label style={s.label}>Distance ({u.dUnit})</label><UnitInput style={s.input} valueMetric={timerDistance} onChangeMetric={v=>setTimerDistance(parseFloat(v)||0)} {...dc}/></div>}
              <WeightStepper value={timerBergenKg} onChange={setTimerBergenKg} label="Bergen weight" T={T} s={s} u={u}/>
              {isGps && (
                <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:"10px", alignItems:"end", marginTop:"14px" }}>
                  <div>
                    <label style={s.label} htmlFor="tgt-pace">Target pace {ps?"(from programme)":"(optional)"}</label>
                    {ps ? <div style={{ ...s.input, display:"flex", alignItems:"center" }}>{u.pace(targetPace)}</div> : (
                      <select id="tgt-pace" style={s.input} value={timer.targetPace ? Math.round(timer.targetPace*60*unitKm/15)*15 : ""}
                        onChange={e=>setTimer(t=>({...t, targetPace: e.target.value ? (+e.target.value/60)/unitKm : null }))}>
                        <option value="">No target</option>
                        {Array.from({length:45},(_,i)=>300+i*15).map(sec=><option key={sec} value={sec}>{mmss(sec)} min/{u.dUnit}</option>)}
                      </select>
                    )}
                  </div>
                  <button aria-pressed={!!profile.voiceCues} onClick={()=>{ const on=!profile.voiceCues; setProfile(p=>({...p,voiceCues:on})); if (on) say(`Voice cues on. You'll hear your time every ${u.imp?"mile":"kilometre"}.`); }}
                    style={{ ...s.chip(!!profile.voiceCues), minHeight:"44px" }}>{I(profile.voiceCues?Volume2:VolumeX,17)}Voice</button>
                </div>
              )}
            </div>
            {isGps && (
              <div role="status" style={{ display:"flex", alignItems:"center", gap:"8px", padding:"10px 12px", borderRadius:"8px", border:`1px solid ${gpsColour}`, background:T.surface, marginBottom:"12px", fontSize:"0.8rem", color:gpsColour }}>
                <span style={{ width:"8px", height:"8px", borderRadius:"50%", background:gpsColour, flexShrink:0 }}/>
                <span>{gpsMsg}</span>
              </div>
            )}
            <div style={s.timerBox}>
              <div style={s.timerNum}>{fmtTime(elapsedSec)}</div>
              {isGps && <div style={{ fontFamily:T.displayFont, fontSize:"1.8rem", color:T.text, marginTop:"6px" }}>{u.dist(timer.gpsKm, 2)}</div>}
              <div style={{ color:T.textMuted, fontSize:"0.84rem", marginTop:"8px" }}>{currentPace!=="--"?`${currentPace}${isGps?" average pace":""}`:isGps?"Pace appears once you're moving":"Set distance and press Start"}</div>
              {isGps && paceGapSec!==null && (
                <div style={{ display:"inline-flex", alignItems:"center", gap:"6px", marginTop:"10px", padding:"6px 12px", borderRadius:"999px", fontWeight:700, fontSize:"0.9rem",
                  background: paceGapSec<=15 ? T.accentBg : T.warningBg, color: paceGapSec<=15 ? T.accent : T.warning, border:`1px solid ${paceGapSec<=15 ? T.accent : T.warning}` }}>
                  {I(Clock,15)}{gapText(paceGapSec)}
                </div>
              )}
              {isGps && liveSplits.filter(x=>x.full).length>0 && (() => { const f = liveSplits.filter(x=>x.full); const last = f[f.length-1]; return (
                <div style={{ color:T.textMuted, fontSize:"0.8rem", marginTop:"8px" }}>{u.imp?"Mile":"Km"} {last.n}: {mmss(last.sec)}{f.length>1?` · best ${mmss(Math.min(...f.map(x=>x.sec)))}`:""}</div>); })()}
              {elapsedSec>0&&timerKm>0&&<div style={{ color:T.textMuted, fontSize:"0.78rem", marginTop:"4px" }}>Est. XP: +{calcSessionXP({ distance:timerKm, bergenKg:timerBergenKg, time:elapsedSec/60, calories:liveCalories })}</div>}
              {liveCalories&&<div style={{ marginTop:"14px" }}><CalorieBadge calories={liveCalories} T={T}/></div>}
            </div>
            {isGps && elapsedSec>0 && !timer.running && (
              <div style={{ ...s.card, padding:"12px 14px" }}>
                <label style={s.label}>Distance to save ({u.dUnit}) — correct it here if GPS was off</label>
                <UnitInput style={s.input} valueMetric={Math.round(timer.gpsKm*100)/100} onChangeMetric={v=>setTimer(t=>({...t,gpsKm:parseFloat(v)||0}))} {...dc}/>
              </div>
            )}
            <div style={{ display:"flex", gap:"10px", justifyContent:"center", marginBottom:"16px", flexWrap:"wrap" }}>
              <button style={s.tBtn(timer.running?T.warning:T.accent)} onClick={()=>timer.running?pauseTimer():startTimer()}>{I(timer.running?Pause:Play,18)}{timer.running?"Pause":elapsedSec>0?"Resume":"Start TAB"}</button>
              {elapsedSec>0&&<button style={s.tBtn(T.danger)} onClick={()=>resetTimer(true)}>{I(RotateCcw,18)}Reset</button>}
              {elapsedSec>0&&!timer.running&&(
                <button style={s.tBtn(T.accentLight)} onClick={saveTimerSession}>{I(Check,18)}Save & earn XP</button>
              )}
            </div>
            {timer.running&&<div style={{ ...s.card, background:T.accentBg, border:`1px solid ${T.accent}`, textAlign:"center" }}><p style={{ color:T.accent, fontWeight:700, margin:0 }}>{theme==="military"?"ADVANCING TO BATTLE — KEEP MOVING":theme==="tabbr"?"// TABBING IN PROGRESS — MAINTAIN PACE":"Keep pushing — head up, arms swinging."}</p></div>}
            {isGps && (
              <div style={{ ...s.card, background:T.surfaceAlt }}>
                <p style={{ color:T.textMuted, fontSize:"0.78rem", margin:0, lineHeight:1.6 }}><strong>For accurate GPS:</strong> keep TABBR open on screen while you tab. iPhones pause location for home-screen web apps when the screen locks or you switch apps. The timer keeps correct time either way, and TABBR fills in the straight-line gap when you come back, but winding routes will under-count. Check the distance before you save.</p>
              </div>
            )}
          </div>
          );
        })()}

        {/* ── PROGRESS ── */}
        {tab==="progress" && seg([["records","Records"],["missions","Missions"],["honours","Honours"]], progressView, setProgressView)}

        {tab==="progress" && progressView==="missions" && (
          <div>
            <h1 style={s.h1}>Missions</h1>
            <p style={s.sub}>Scenario-based objectives drawn from real military operations. Complete them to earn XP.</p>
            <div style={s.card}>
              <h2 style={{ ...s.h2, marginBottom:"4px", color:T.warning }}>{I(Zap,18)}Daily challenges</h2>
              <p style={{ color:T.textMuted, fontSize:"0.76rem", margin:"0 0 6px" }}>Reset every day. XP is added automatically when a session meets the target.</p>
              {DAILY_CHALLENGES.map(ch=>challengeRow(ch, ch.check(todayLogs)))}
            </div>
            <div style={s.card}>
              <h2 style={{ ...s.h2, marginBottom:"4px" }}>{I(CalendarDays,18,T.accent)}Weekly challenges</h2>
              <p style={{ color:T.textMuted, fontSize:"0.76rem", margin:"0 0 6px" }}>Reset every Monday. This week: {thisWeekLogs.length} session{thisWeekLogs.length===1?"":"s"}, {u.dist(thisWeekLogs.reduce((a,l)=>a+(parseFloat(l.distance)||0),0))}</p>
              {WEEKLY_CHALLENGES.map(ch=>challengeRow(ch, ch.check(thisWeekLogs)))}
            </div>
            <h2 style={{ ...s.h2, margin:"6px 0 12px" }}>{I(Target,18,T.accent)}Operational missions</h2>
            {MISSIONS.map(m=>{
              const done=earnedMissions.has(m.id);
              return (
                <div key={m.id} style={{ ...s.card, border:`1px solid ${done?T.accent:hair}`, background:done?T.accentBg:T.cardBg }}>
                  <div style={{ display:"flex", alignItems:"flex-start", gap:"12px" }}>
                    <span style={{ width:"44px", height:"44px", borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", border:`2px solid ${done?T.accent:T.border}`, color:done?T.accent:T.textMuted }}>
                      {I(m.icon,22)}
                      {done&&<span style={{ position:"absolute", right:"-4px", bottom:"-4px", width:"18px", height:"18px", borderRadius:"50%", background:T.accent, display:"flex", alignItems:"center", justifyContent:"center" }}>{I(Check,12,T.onAccent)}</span>}
                    </span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:T.displayFont, fontSize:"1rem", marginBottom:"4px" }}>{m.title}</div>
                      <p style={{ color:T.textMuted, fontSize:"0.8rem", margin:"0 0 8px" }}>{m.desc}</p>
                      <span style={s.badge(done?T.accent:T.gold)}>{done?"Complete · ":""}+{m.xpReward} XP</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab==="progress" && progressView==="honours" && (
          <div>
            <h1 style={s.h1}>Honours & awards</h1>
            <p style={s.sub}>Your rank, badges, and the complete British Army rank reference.</p>

            <div style={{ ...s.card, background:T.goldBg, border:`2px solid ${T.gold}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
                <div style={{ fontSize:"2.6rem", color:rank.colour, flexShrink:0 }}>{rank.insignia}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"0.74rem", color:T.textMuted, marginBottom:"2px" }}>{rank.abbr} · {rank.nato} · {rank.group}</div>
                  <div style={{ fontFamily:T.displayFont, fontSize:"1.4rem", color:T.gold }}>{rank.title}</div>
                  <div style={{ color:T.textMuted, fontSize:"0.8rem", marginTop:"4px", lineHeight:1.5 }}>{rank.role}</div>
                  <div style={{ color:T.accent, fontSize:"0.8rem", marginTop:"6px", fontStyle:"italic" }}>"{rank.lore}"</div>
                </div>
              </div>
              <div style={{ marginTop:"12px" }}><XPBar xp={totalXP} T={T}/></div>
            </div>

            <h2 style={{ ...s.h2, margin:"6px 0 10px" }}>{I(Award,18,T.accent)}Badges <span style={{ fontFamily:T.font, fontSize:"0.8rem", color:T.textMuted, fontWeight:400 }}>{earnedBadges.size} of {ALL_BADGES.length}</span></h2>
            <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginBottom:"14px" }}>
              {badgeCats.map(cat=><button key={cat} style={s.chip(cat===selectedBadgeCategory)} onClick={()=>setSelectedBadgeCategory(cat)}>{cat}</button>)}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:"10px", marginBottom:"24px" }}>
              {ALL_BADGES.filter(b=>selectedBadgeCategory==="All"||b.category===selectedBadgeCategory).map(badge=>{
                const earned=earnedBadges.has(badge.id);
                return (
                  <div key={badge.id} style={{ background:earned?T.accentBg:T.surfaceAlt, border:`1px solid ${earned?T.accent:T.border}`, borderRadius:"10px", padding:"14px", textAlign:"center", position:"relative" }}>
                    <div style={{ display:"flex", justifyContent:"center", marginBottom:"6px", color:earned?T.accent:T.textMuted, opacity:earned?1:0.55 }}>{I(badge.icon,30)}</div>
                    <div style={{ fontWeight:700, fontSize:"0.82rem", marginBottom:"3px", color:earned?T.text:T.textMuted }}>{badge.title}</div>
                    <div style={{ color:T.textMuted, fontSize:"0.72rem", marginBottom:"6px", lineHeight:1.4 }}>{badge.desc}</div>
                    <span style={s.badge(earned?T.accent:T.textMuted)}>{badge.category}</span>
                    {!earned&&<span style={{ position:"absolute", top:"8px", right:"8px", color:T.textMuted }} aria-label="Locked">{I(Lock,13)}</span>}
                  </div>
                );
              })}
            </div>

            <h2 style={{ ...s.h2, marginBottom:"4px" }}>British Army rank structure</h2>
            <p style={{ color:T.textMuted, fontSize:"0.8rem", margin:"0 0 16px" }}>Tap any rank for its full role and regimental variants.</p>
            {[...new Set(RANKS.map(r=>r.group))].map(group=>(
              <div key={group} style={{ marginBottom:"20px" }}>
                <div style={{ fontSize:"0.8rem", fontWeight:700, color:T.textMuted, marginBottom:"8px", borderLeft:`3px solid ${T.accent}`, paddingLeft:"8px" }}>{group}</div>
                {RANKS.filter(r=>r.group===group).map(r=>{
                  const achieved=totalXP>=r.xpRequired, isCur=r.title===rank.title, isOpen=expandedRank===r.title;
                  return (
                    <div key={r.title} style={{ marginBottom:"6px" }}>
                      <button aria-expanded={isOpen} onClick={()=>setExpandedRank(isOpen?null:r.title)}
                        style={{ width:"100%", display:"flex", alignItems:"center", gap:"10px", padding:"10px 12px", minHeight:"48px", borderRadius:"10px", border:`1px solid ${isCur?T.gold:achieved?T.accent:T.border}`, background:isCur?T.goldBg:achieved?T.accentBg:T.surfaceAlt, opacity:achieved?1:0.6, cursor:"pointer", textAlign:"left", fontFamily:T.font, color:T.text }}>
                        <span style={{ fontSize:"1.05rem", color:r.colour, minWidth:"26px", textAlign:"center" }}>{r.insignia}</span>
                        <span style={{ flex:1, minWidth:0, display:"flex", alignItems:"center", gap:"6px", flexWrap:"wrap" }}>
                          <span style={{ fontWeight:700, fontSize:"0.88rem", color:isCur?T.gold:T.text }}>{r.title}</span>
                          <span style={{ fontSize:"0.7rem", color:T.textMuted }}>{r.abbr} · {r.nato}</span>
                          {isCur&&<span style={s.badge(T.gold)}>You are here</span>}
                        </span>
                        <span style={{ fontSize:"0.72rem", color:T.textMuted }}>{r.xpRequired.toLocaleString()} XP</span>
                        {achieved&&<span style={{ color:T.accent }}>{I(Check,15)}</span>}
                        <span style={{ color:T.textMuted, transform:isOpen?"rotate(90deg)":"none", transition:"transform 0.2s" }}>{I(ChevronRight,16)}</span>
                      </button>
                      {isOpen&&(
                        <div style={{ margin:"2px 0 6px", padding:"14px 16px", background:T.surface, border:`1px solid ${T.border}`, borderRadius:"0 0 10px 10px" }}>
                          <p style={{ color:T.text, fontSize:"0.84rem", lineHeight:1.6, margin:"0 0 12px" }}>{r.role}</p>
                          {r.variants.length>0&&(
                            <div>
                              <div style={{ fontSize:"0.78rem", fontWeight:700, color:T.textMuted, marginBottom:"8px" }}>Regimental equivalents and variants</div>
                              <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                                {r.variants.map((v,vi)=>(
                                  <div key={vi} style={{ display:"flex", gap:"10px", alignItems:"flex-start", padding:"8px 10px", background:T.surfaceAlt, borderRadius:"7px" }}>
                                    <div style={{ minWidth:"86px" }}><div style={{ fontWeight:700, fontSize:"0.82rem" }}>{v.title}</div><div style={{ fontSize:"0.7rem", color:T.accent }}>{v.abbr}</div></div>
                                    <div style={{ fontSize:"0.78rem", color:T.textMuted, flex:1, lineHeight:1.5 }}>{v.unit}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          <div style={{ marginTop:"10px", fontSize:"0.78rem", color:T.accent, fontStyle:"italic" }}>"{r.lore}"</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            <h2 style={{ ...s.h2, marginTop:"8px", marginBottom:"6px" }}>Private: regimental titles</h2>
            <p style={{ color:T.textMuted, fontSize:"0.8rem", margin:"0 0 12px", lineHeight:1.5 }}>The rank of Private is known by different titles across the British Army. They're all the same NATO OR-2 grade; the names reflect centuries of regimental tradition.</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:"8px" }}>
              {RANKS.find(r=>r.title==="Private").variants.map((v,i)=>(
                <div key={i} style={{ background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:"8px", padding:"12px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"4px" }}><span style={{ fontWeight:700, fontSize:"0.86rem" }}>{v.title}</span><span style={s.badge(T.accent)}>{v.abbr}</span></div>
                  <div style={{ fontSize:"0.74rem", color:T.textMuted, lineHeight:1.5 }}>{v.unit}</div>
                </div>
              ))}
            </div>
            <div style={{ ...s.card, background:T.accentBg, border:`1px solid ${T.accent}`, marginTop:"16px" }}>
              <h2 style={s.h2}>⬟ Warrant Officers — a unique grade</h2>
              <p style={{ color:T.text, fontSize:"0.82rem", lineHeight:1.6, margin:0 }}>
                Warrant Officers hold their rank by <strong>Royal Warrant</strong> — not by commission. This places them in a unique position: senior to all NCOs, but distinct from commissioned officers. The WO1 (RSM) is the most senior soldier in a battalion and the Commanding Officer's right hand. They are addressed as "Mr" or "Ms", or by their appointment title (e.g. "Sergeant Major"). The warrant system dates back centuries and is fiercely protected as part of regimental tradition.
              </p>
            </div>
            <div style={{ ...s.card, background:T.surfaceAlt }}>
              <h2 style={s.h2}>✦ The Colour Sergeant</h2>
              <p style={{ color:T.text, fontSize:"0.82rem", lineHeight:1.6, margin:0 }}>
                In infantry regiments, the grade of Staff Sergeant is titled <strong>Colour Sergeant</strong>. The title was created in 1813 as a reward for distinguished NCOs who carried the regimental colours into battle — one of the most dangerous tasks on the battlefield, as the colours marked the rallying point and were a prime target for the enemy. The title carries enormous prestige in the infantry to this day.
              </p>
            </div>
          </div>
        )}

        {tab==="progress" && progressView==="records" && (() => {
          const has = sessionLogs.length > 0;
          const bestPace     = has ? sessionLogs.reduce((b,l)=>{ const p=l.distance>0?l.time/l.distance:999; return p<b.pace?{pace:p,log:l}:b; },{pace:999,log:null}) : null;
          const bestDist     = has ? sessionLogs.reduce((b,l)=>parseFloat(l.distance)>parseFloat(b.distance||0)?l:b) : null;
          const heaviest     = has ? sessionLogs.reduce((b,l)=>parseFloat(l.bergenKg)>parseFloat(b.bergenKg||0)?l:b) : null;
          const mostCals     = has ? sessionLogs.reduce((b,l)=>(l.calories||0)>(b.calories||0)?l:b) : null;
          const mostXP       = has ? sessionLogs.reduce((b,l)=>calcSessionXP(l)>calcSessionXP(b)?l:b) : null;
          const best5k       = sessionLogs.filter(l=>l.distance>=5).reduce((b,l)=>{ const p=l.time/l.distance; return (!b||p<b.pace)?{pace:p,log:l}:b; },null);
          const best10k      = sessionLogs.filter(l=>l.distance>=10).reduce((b,l)=>{ const p=l.time/l.distance; return (!b||p<b.pace)?{pace:p,log:l}:b; },null);
          const streak = (() => {
            if (!has) return 0;
            const days=[...new Set(sessionLogs.map(l=>l.date))].map(d=>parseDate(d).getTime()).sort((a,b)=>a-b);
            let max=1,cur=1;
            for(let i=1;i<days.length;i++){ const diff=Math.round((days[i]-days[i-1])/86400000); if(diff===1){cur++;max=Math.max(max,cur);}else cur=1; }
            return max;
          })();
          const pb = ({icon,title,value,sub,date,hi}) => (
            <div key={title} style={{ background:hi?T.accentBg:T.surface, border:`1px solid ${hi?T.accent:T.border}`, borderRadius:"12px", padding:"14px", position:"relative" }}>
              <div style={{ color:hi?T.accent:T.textMuted, marginBottom:"6px" }}>{I(icon,22)}</div>
              <div style={{ fontSize:"0.76rem", color:T.textMuted, marginBottom:"3px" }}>{title}</div>
              {value?<><div style={{ fontFamily:T.displayFont, fontSize:"1.45rem", color:hi?T.accent:T.text, lineHeight:1.1 }}>{value}</div>{sub&&<div style={{ fontSize:"0.76rem", color:T.textMuted, marginTop:"3px" }}>{sub}</div>}{date&&<div style={{ fontSize:"0.7rem", color:T.textMuted, marginTop:"5px" }}>{date}</div>}</>:<div style={{ color:T.textMuted, fontSize:"0.8rem", marginTop:"4px" }}>No data yet</div>}
              {value&&hi&&<div style={{ position:"absolute", top:"10px", right:"10px", fontSize:"0.68rem", color:T.accent, fontWeight:700 }}>PB</div>}
            </div>
          );
          return (
            <div>
              <h1 style={s.h1}>Personal records</h1>
              <p style={s.sub}>Your best performances. Earned in the field — never simulated.</p>
              {!has?(
                <div style={{ ...s.card, textAlign:"center", padding:"40px 20px" }}>
                  <div style={{ color:T.textMuted, display:"flex", justifyContent:"center", marginBottom:"10px" }}>{I(TrendingUp,36)}</div>
                  <div style={{ fontSize:"0.95rem", fontWeight:600, marginBottom:"6px" }}>No records yet</div>
                  <div style={{ color:T.textMuted, fontSize:"0.84rem" }}>Log your first tab to start your record board.</div>
                  <button style={{ ...s.btn(true), marginTop:"16px" }} onClick={()=>{ setShowLogForm(true); go("log"); }}>{I(Plus,16)}Log a session</button>
                </div>
              ):(
                <>
                  <div style={{ ...s.card, background:T.goldBg, border:`2px solid ${T.gold}`, textAlign:"center", padding:"20px" }}>
                    <div style={{ color:T.gold, display:"flex", justifyContent:"center", marginBottom:"4px" }}>{I(Trophy,28)}</div>
                    <div style={{ fontFamily:T.displayFont, fontSize:"2.6rem", color:T.gold, lineHeight:1 }}>{sessionLogs.length}</div>
                    <div style={{ fontSize:"0.8rem", color:T.textMuted, marginTop:"4px" }}>tabs logged · {u.dist(totalDist)} · {totalCals>0?totalCals.toLocaleString()+" kcal":"no calorie data"}</div>
                  </div>
                  <h2 style={s.h2}>{I(Zap,18,T.accent)}Performance records</h2>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"10px", marginBottom:"18px" }}>
                    {pb({ icon:Gauge, title:"Best pace", hi:true, value:bestPace?.log?u.pace(bestPace.pace):null, sub:bestPace?.log?`${u.dist(bestPace.log.distance)} · ${u.wt(bestPace.log.bergenKg)}`:null, date:bestPace?.log?.date })}
                    {pb({ icon:Route, title:"Longest tab", hi:true, value:bestDist?u.dist(bestDist.distance):null, sub:bestDist?`${u.wt(bestDist.bergenKg)} · ${bestDist.time} min`:null, date:bestDist?.date })}
                    {pb({ icon:Backpack, title:"Heaviest bergen", hi:true, value:heaviest?u.wt(heaviest.bergenKg):null, sub:heaviest?`${u.dist(heaviest.distance)} tab`:null, date:heaviest?.date })}
                    {pb({ icon:Flame, title:"Most calories", hi:true, value:mostCals?.calories?`${mostCals.calories.toLocaleString()} kcal`:null, sub:mostCals?.calories?`${u.dist(mostCals.distance)} · ${u.wt(mostCals.bergenKg)}`:null, date:mostCals?.date })}
                    {pb({ icon:Zap, title:"Best XP session", hi:true, value:mostXP?`${calcSessionXP(mostXP)} XP`:null, sub:mostXP?`${u.dist(mostXP.distance)} · ${u.wt(mostXP.bergenKg)}`:null, date:mostXP?.date })}
                    {pb({ icon:CalendarCheck, title:"Longest streak", value:streak>0?`${streak} day${streak>1?"s":""}`:null, sub:"consecutive active days" })}
                  </div>
                  <h2 style={s.h2}>{I(Flag,18,T.accent)}Distance benchmarks</h2>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"18px" }}>
                    {pb({ icon:Flag, title:`Best pace, ${u.dist(5,1)}+`, value:best5k?u.pace(best5k.pace):null, sub:best5k?`${u.wt(best5k.log.bergenKg)} bergen`:null, date:best5k?.log?.date })}
                    {pb({ icon:Map, title:`Best pace, ${u.dist(10,1)}+`, value:best10k?u.pace(best10k.pace):null, sub:best10k?`${u.wt(best10k.log.bergenKg)} bergen`:null, date:best10k?.log?.date })}
                  </div>
                  <h2 style={s.h2}>{I(Crosshair,18,T.accent)}{activeTest.short} benchmark</h2>
                  <div style={s.card}>
                    <p style={{ color:T.textMuted, fontSize:"0.78rem", margin:"0 0 4px", lineHeight:1.5 }}>{activeTest.desc}</p>
                    {(PROG.test==="tabbr10" ? [{label:"Pass (sub 2:00)",target:120},{label:"Full marks (sub 1:45)",target:105}] : [{label:`Pass (under ${activeTest.T} min)`,target:activeTest.T}]).map((std,i)=>{
                      const best=sessionLogs.filter(l=>l.distance>=activeTest.D*0.99&&l.bergenKg>=activeTest.L).reduce((b,l)=>(!b||l.time<b.time)?l:b,null);
                      const done=best&&best.time<=std.target;
                      const pct2=best?Math.min(100,Math.round((std.target/best.time)*100)):0;
                      return <div key={i} style={{ padding:"12px 0", borderBottom:`1px solid ${T.border}` }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
                          <span style={{ fontSize:"0.86rem", fontWeight:600 }}>{std.label}</span>
                          {done?<span style={s.badge(T.accent)}>{I(Check,12)}Achieved</span>:best?<span style={{ fontSize:"0.78rem", color:T.textMuted }}>Best: {best.time} min</span>:<span style={{ fontSize:"0.78rem", color:T.textMuted }}>No qualifying tab yet</span>}
                        </div>
                        <div style={{ height:"6px", background:T.surfaceAlt, borderRadius:"3px", overflow:"hidden" }}><div style={{ height:"100%", width:`${pct2}%`, background:done?T.accent:T.warning, borderRadius:"3px" }}/></div>
                        <div style={{ fontSize:"0.72rem", color:T.textMuted, marginTop:"3px" }}>{u.dist(activeTest.D)}+ · {u.wt(activeTest.L)}+ bergen required{activeTest.part2?` (part 1 of the test)`:""}</div>
                      </div>;
                    })}
                    <div style={{ paddingTop:"12px", fontSize:"0.76rem", color:T.textMuted, lineHeight:1.6 }}>
                      <strong style={{ color:T.text }}>Official Army standards, for reference:</strong> the Ground Close Combat Role Fitness Test loaded march is 4km with 40kg in 50 min, then 2km with 25kg in 15 min. The Annual Fitness Test is 8 miles (12.9km), with 25kg for infantry. Standards change, so check the latest with your unit or recruiter.
                    </div>
                  </div>
                  <h2 style={s.h2}>{I(TrendingUp,18,T.accent)}Recent form</h2>
                  <div style={s.card}>
                    <p style={{ color:T.textMuted, fontSize:"0.78rem", margin:"0 0 12px" }}>Last {Math.min(5,sessionLogs.length)} sessions — pace (min/{u.dUnit})</p>
                    <div style={{ display:"flex", gap:"8px", alignItems:"flex-end", height:"70px" }}>
                      {sessionLogs.slice(0,5).reverse().map((log,i,arr)=>{
                        const pace=log.distance>0?log.time/log.distance:0;
                        const all=arr.map(l=>l.distance>0?l.time/l.distance:0).filter(p=>p>0);
                        const minP=Math.min(...all),maxP=Math.max(...all),range=maxP-minP||1;
                        const h=pace>0?Math.round(((maxP-pace)/range)*70+30):30;
                        return <div key={i} style={{ flex:1, height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-end", gap:"3px" }}>
                          <div style={{ fontSize:"0.64rem", color:pace===minP?T.accent:T.textMuted }}>{pace>0?(u.imp?pace/KM_TO_MI:pace).toFixed(1):"--"}</div>
                          <div style={{ width:"100%", height:`${h}%`, background:pace===minP?T.accent:T.surfaceAlt, border:`1px solid ${pace===minP?T.accent:T.border}`, borderRadius:"4px 4px 0 0", minHeight:"8px" }}/>
                          <div style={{ fontSize:"0.62rem", color:T.textMuted }}>{log.date.slice(0,5)}</div>
                        </div>;
                      })}
                    </div>
                    <p style={{ color:T.textMuted, fontSize:"0.72rem", margin:"8px 0 0" }}>Taller bar = faster pace. Highlighted = best in this window.</p>
                  </div>
                </>
              )}
            </div>
          );
        })()}

        {/* ── LOG ── */}
        {tab==="log" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"10px", marginBottom:"18px" }}>
              <div><h1 style={s.h1}>Session log</h1><p style={{ color:T.textMuted, fontSize:"0.88rem", margin:0 }}>Every tab earns XP. Every session builds the rank.</p></div>
              {!showLogForm && <button style={{ ...s.btn(true), flexShrink:0 }} onClick={()=>{ setLogForm(BLANK_LOG()); setShowLogForm(true); }}>{I(Plus,16)}Log session</button>}
            </div>
            {bwBanner()}

            {showLogForm&&(
              <div style={{ ...s.card, border:`1px solid ${T.accent}` }}>
                <h2 style={s.h2}>Log a session</h2>
                {logForm.progKey && (
                  <div style={{ ...s.banner, marginBottom:"12px" }}>
                    <span style={{ color:T.accent }}>{I(ClipboardList,18)}</span>
                    <div style={{ flex:1, fontSize:"0.82rem" }}><strong>{progLabel(logForm.progKey)}</strong> — ticks off when you save</div>
                    <button aria-label="Unlink programme session" style={s.hit} onClick={()=>setLogForm(p=>({...p,progKey:null}))}>{I(X,16)}</button>
                  </div>
                )}
                <div style={{ marginBottom:"12px" }}>
                  <label style={s.label} htmlFor="log-date">Date</label>
                  <input id="log-date" style={s.input} type="date" max={isoToday()} value={logForm.date} onChange={e=>setLogForm(p=>({...p,date:e.target.value||isoToday()}))}/>
                </div>
                <div style={s.formGrid}>
                  <div><label style={s.label} htmlFor="log-dist">Distance ({u.dUnit})</label><input id="log-dist" style={s.input} type="number" inputMode="decimal" value={logForm.distance} onChange={e=>setLogForm(p=>({...p,distance:e.target.value}))} placeholder={u.imp?"6":"10"}/></div>
                  <div><label style={s.label} htmlFor="log-time">Time (minutes)</label><input id="log-time" style={s.input} type="number" inputMode="numeric" value={logForm.time} onChange={e=>setLogForm(p=>({...p,time:e.target.value}))} placeholder="105"/></div>
                </div>
                <div style={{ marginBottom:"14px" }}><WeightStepper value={logForm.bergenKg} onChange={v=>setLogForm(p=>({...p,bergenKg:v}))} label="Bergen weight" T={T} s={s} u={u}/></div>

                <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:"14px", marginBottom:"14px" }}>
                  <div style={{ fontSize:"0.84rem", fontWeight:700, marginBottom:"12px" }}>Session notes <span style={{ fontWeight:400, color:T.textMuted }}>(optional)</span></div>
                  <div style={{ marginBottom:"12px" }}>
                    <label style={s.label}>Terrain</label>
                    <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                      {["Road","Trail","Hills","Mixed","Off-road"].map(t=>(
                        <button key={t} aria-pressed={logForm.terrain===t} style={s.chip(logForm.terrain===t)} onClick={()=>setLogForm(p=>({...p,terrain:p.terrain===t?"":t}))}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom:"12px" }}>
                    <label style={s.label}>Conditions</label>
                    <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                      {WEATHER.map(([Ic,lbl])=>(
                        <button key={lbl} aria-pressed={logForm.weather===lbl} style={s.chip(logForm.weather===lbl)} onClick={()=>setLogForm(p=>({...p,weather:p.weather===lbl?"":lbl}))}>{I(Ic,15)}{lbl}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom:"12px" }}>
                    <label style={s.label}>Effort (1 = easy, 5 = maximal)</label>
                    <div style={{ display:"flex", gap:"6px" }}>
                      {[1,2,3,4,5].map(n=>{
                        const c=EFFORT_COLS[n-1], sel=logForm.effort===n;
                        return <button key={n} aria-pressed={sel} style={{ flex:1, minHeight:"44px", borderRadius:"8px", border:`2px solid ${sel?c:T.border}`, background:sel?c+"22":T.surface, color:sel?c:T.textMuted, fontWeight:700, fontSize:"0.95rem", cursor:"pointer", fontFamily:T.font }} onClick={()=>setLogForm(p=>({...p,effort:p.effort===n?0:n}))}>{n}</button>;
                      })}
                    </div>
                  </div>
                  <div style={{ marginBottom:"12px" }}>
                    <label style={s.label}>How did you finish?</label>
                    <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                      {FINISH.map(([Ic,lbl])=>(
                        <button key={lbl} aria-pressed={logForm.finish===lbl} style={s.chip(logForm.finish===lbl)} onClick={()=>setLogForm(p=>({...p,finish:p.finish===lbl?"":lbl}))}>{I(Ic,15)}{lbl}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={s.label} htmlFor="log-notes">Anything else</label>
                    <input id="log-notes" style={s.input} value={logForm.freeNotes} onChange={e=>setLogForm(p=>({...p,freeNotes:e.target.value}))} placeholder="Route, kit, how it felt…"/>
                  </div>
                </div>

                {bw>0&&logDistKm>0&&logForm.time&&<div style={{ marginBottom:"12px" }}><CalorieBadge calories={calcCalories(bw,logForm.bergenKg,logDistKm,parseFloat(logForm.time))} T={T}/></div>}
                {logDistKm>0&&logForm.time&&<div style={{ ...s.badge(T.gold), marginBottom:"12px", fontSize:"0.78rem", padding:"5px 10px" }}>Est. XP: +{calcSessionXP({ distance:logDistKm, bergenKg:logForm.bergenKg, time:parseFloat(logForm.time)||0, calories:calcCalories(bw,logForm.bergenKg,logDistKm,parseFloat(logForm.time)) })} (plus any missions or challenges)</div>}

                <div style={{ display:"flex", gap:"10px" }}>
                  <button style={{ ...s.btn(true), flex:1, opacity:logDistKm>0&&parseFloat(logForm.time)>0?1:0.4 }} onClick={handleLogSubmit}>{I(Check,16)}Save & earn XP</button>
                  <button style={s.btn(false)} onClick={()=>setShowLogForm(false)}>Cancel</button>
                </div>
              </div>
            )}

            {sessionLogs.length===0?(
              !showLogForm && <div style={{ ...s.card, textAlign:"center", padding:"40px 20px" }}>
                <div style={{ color:T.textMuted, display:"flex", justifyContent:"center", marginBottom:"10px" }}>{I(NotebookPen,36)}</div>
                <div style={{ fontSize:"0.95rem", fontWeight:600, marginBottom:"6px" }}>No sessions yet</div>
                <div style={{ color:T.textMuted, fontSize:"0.84rem" }}>Track a tab with the timer, or log one you've already done.</div>
              </div>
            ):(
              <div style={{ ...s.card, padding:"4px 14px" }}>
                {sessionLogs.map((log,i)=>{
                  const W = WEATHER.find(([,l])=>l===log.weather), F = FINISH.find(([,l])=>l===log.finish);
                  return (
                  <div key={log.id} style={{ ...s.logRow, borderBottom:i<sessionLogs.length-1?`1px solid ${T.border}`:"none" }}>
                    <button onClick={()=>setDetailId(log.id)} aria-label={`Open session from ${log.date}`} style={{ flex:1, minWidth:0, display:"flex", gap:"8px", background:"none", border:"none", padding:0, textAlign:"left", cursor:"pointer", color:T.text, fontFamily:T.font }}>
                    <div style={{ minWidth:"72px", fontSize:"0.74rem", color:T.textMuted, paddingTop:"3px" }}>{log.date}{routes[log.id]&&<div style={{ color:T.accent, marginTop:"6px" }} title="Has a route map">{I(MapPinned,16)}</div>}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", gap:"7px", flexWrap:"wrap", alignItems:"center", marginBottom:"4px" }}>
                        <span style={{ fontWeight:700, color:T.accent }}>{u.dist(log.distance,2)}</span>
                        <span style={{ color:T.textMuted, fontSize:"0.82rem" }}>{u.wt(log.bergenKg)}</span>
                        <span style={{ color:T.textMuted, fontSize:"0.82rem" }}>{log.time} min</span>
                        {log.distance>0&&log.time>0&&<span style={s.badge(T.accent)}>{u.pace(log.time/log.distance)}</span>}
                        {log.source==="gps"&&<span style={s.badge(T.textMuted)}>{I(Satellite,11)}GPS</span>}
                        {log.calories&&<span style={s.badge(T.warning)}>{I(Flame,11)}{log.calories} kcal</span>}
                        <span style={s.badge(T.gold)}>+{calcSessionXP(log)} XP</span>
                      </div>
                      {(log.terrain||W||log.effort>0||F||log.progKey)&&(
                        <div style={{ display:"flex", gap:"5px", flexWrap:"wrap", marginBottom:"3px" }}>
                          {log.progKey&&<span style={s.badge(T.accent)}>{I(ClipboardList,11)}{progLabel(log.progKey)}</span>}
                          {log.terrain&&<span style={s.badge(T.textMuted)}>{I(Map,11)}{log.terrain}</span>}
                          {W&&<span style={s.badge(T.textMuted)}>{I(W[0],11)}{W[1]}</span>}
                          {log.effort>0&&<span style={s.badge(EFFORT_COLS[log.effort-1])}>Effort {log.effort}/5</span>}
                          {F&&<span style={s.badge(T.textMuted)}>{I(F[0],11)}{F[1]}</span>}
                        </div>
                      )}
                      {(log.freeNotes||log.notes)&&<div style={{ color:T.textMuted, fontSize:"0.78rem" }}>{log.freeNotes||log.notes}</div>}
                    </div>
                    </button>
                    <button aria-label="Delete session" style={s.hit} onClick={()=>deleteSession(log)}>{I(X,18)}</button>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── MORE ── */}
        {tab==="more" && !moreView && (
          <div>
            <h1 style={s.h1}>More</h1>
            <p style={s.sub}>Settings, tools and reference.</p>
            <div style={{ ...s.card, padding:0, overflow:"hidden" }}>
              {[["settings",Settings,"Settings","Body weight, units, look, backup"],["days",CalendarDays,"Training days","Pick the days you train"],["calories",Calculator,"Calorie calculator","Estimate burn for any tab"],["tips",Lightbulb,"Technique & tips","Hard-won knowledge for the road"]].map(([id,Ic,title,desc],i)=>(
                <button key={id} onClick={()=>setMoreView(id)} style={{ width:"100%", display:"flex", alignItems:"center", gap:"14px", padding:"14px 16px", minHeight:"64px", background:"transparent", border:"none", borderTop:i?`1px solid ${T.border}`:"none", cursor:"pointer", textAlign:"left", fontFamily:T.font, color:T.text }}>
                  <span style={{ color:T.accent }}>{I(Ic,22)}</span>
                  <span style={{ flex:1 }}><span style={{ display:"block", fontWeight:700, fontSize:"0.92rem" }}>{title}</span><span style={{ display:"block", color:T.textMuted, fontSize:"0.78rem" }}>{desc}</span></span>
                  <span style={{ color:T.textMuted }}>{I(ChevronRight,18)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab==="more" && moreView && backTo("More", ()=>setMoreView(null))}

        {tab==="more" && moreView==="settings" && (
          <div>
            <h1 style={s.h1}>Settings</h1>
            <p style={s.sub}>Everything here is stored only on this phone.</p>
            <div style={s.card}>
              <h2 style={s.h2}>Profile</h2>
              <label style={s.label} htmlFor="set-name">Name or callsign</label>
              <input id="set-name" style={{ ...s.input, marginBottom:"14px" }} value={profile.name} onChange={e=>setProfile(p=>({...p,name:e.target.value}))}/>
              <label style={s.label} htmlFor="set-bw">Body weight ({u.wUnit}) — used for calorie estimates</label>
              <div id="set-bw"><UnitInput style={s.input} valueMetric={userBodyWeight} onChangeMetric={v=>setUserBodyWeight(v===""?"":String(v))} placeholder={u.imp?"e.g. 165":"e.g. 75"} {...bwConv(u.imp)}/></div>
            </div>
            <div style={s.card}>
              <h2 style={s.h2}>Units</h2>
              {seg([["metric","Metric (km, kg)"],["imperial","Imperial (mi, lb)"]], profile.units, id=>setProfile(p=>({...p,units:id})))}
              <p style={{ color:T.textMuted, fontSize:"0.76rem", margin:"-8px 0 0" }}>Changes every distance, weight and pace in the app. Badge and mission rules are written in metric.</p>
            </div>
            <div style={s.card}>
              <h2 style={s.h2}>Look</h2>
              {themeSwatches(setTheme)}
            </div>
            <div style={s.card}>
              <h2 style={s.h2}>Backup</h2>
              <p style={{ color:T.textMuted, fontSize:"0.8rem", margin:"0 0 12px", lineHeight:1.5 }}>Your data lives in Safari's storage, so clearing website data erases it. Save a backup file now and then, for example to iCloud Drive.</p>
              <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                <button style={{ ...s.btn(true), flex:1 }} onClick={exportData}>{I(Download,16)}Save backup</button>
                <label style={{ ...s.btn(false), flex:1, cursor:"pointer" }}>
                  {I(Upload,16)}Restore backup
                  <input type="file" accept="application/json,.json" style={{ display:"none" }} onChange={e=>{ importData(e.target.files?.[0]); e.target.value=""; }}/>
                </label>
              </div>
            </div>
          </div>
        )}

        {tab==="more" && moreView==="calories" && (
          <div>
            <h1 style={s.h1}>Calorie calculator</h1>
            <p style={s.sub}>Estimate the burn for any tab.</p>
            <div style={{ ...s.card, display:"flex", alignItems:"center", gap:"12px" }}>
              <span style={{ color:T.accent }}>{I(Scale,22)}</span>
              <div style={{ flex:1 }}><div style={{ fontSize:"0.8rem", color:T.textMuted }}>Your body weight</div><div style={{ fontWeight:700 }}>{bw>0?u.wt(bw):"Not set"}</div></div>
              <button style={s.btn(false)} onClick={()=>setMoreView("settings")}>{bw>0?"Change":"Add"}</button>
            </div>
            <div style={s.card}>
              <h2 style={s.h2}>{I(Calculator,18,T.accent)}Session estimator</h2>
              <CalcWidget T={T} s={s} u={u} userBodyWeight={userBodyWeight}/>
            </div>
            {bw>0&&(
              <div style={s.card}>
                <h2 style={{ ...s.h2, marginBottom:"4px" }}>Bergen weight impact</h2>
                <p style={{ color:T.textMuted, fontSize:"0.78rem", margin:"0 0 12px" }}>kcal over {u.dist(10)} in 2 hours at {u.wt(bw)} body weight</p>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(76px,1fr))", gap:"6px" }}>
                  {Array.from({length:45},(_,i)=>i+1).map(kg=>{
                    const cals=calcCalories(bw,kg,10,120), mark=kg===25;   // 25kg = infantry Annual Fitness Test load
                    return <div key={kg} style={{ background:mark?T.accentBg:T.surfaceAlt, border:`1px solid ${mark?T.accent:T.border}`, borderRadius:"7px", padding:"7px 4px", textAlign:"center" }}>
                      <div style={{ fontWeight:700, color:mark?T.accent:T.text, fontFamily:T.displayFont }}>{u.wt(kg)}</div>
                      <div style={{ color:T.textMuted, fontSize:"0.68rem" }}>{cals} kcal</div>
                      {mark&&<div style={{ color:T.accent, fontSize:"0.62rem" }}>Inf AFT</div>}
                    </div>;
                  })}
                </div>
              </div>
            )}
            <div style={{ ...s.card, background:T.surfaceAlt }}>
              <p style={{ color:T.textMuted, fontSize:"0.78rem", margin:0, lineHeight:1.6 }}><strong>How it's calculated:</strong> MET-based formula for loaded marching, adjusted for load-to-bodyweight ratio. Estimates vary with terrain, pace, temperature, and fitness.</p>
            </div>
          </div>
        )}

        {tab==="more" && moreView==="tips" && (
          <div>
            <h1 style={s.h1}>Technique & tips</h1>
            <p style={s.sub}>Hard-won knowledge from infantry veterans and experienced tabbers.</p>
            <div style={s.tipGrid}>
              {TIPS.map((tip,i)=>(
                <button key={i} aria-expanded={selectedTip===i} style={s.tipCard(selectedTip===i)} onClick={()=>setSelectedTip(selectedTip===i?null:i)}>
                  <div style={{ color:T.accent, marginBottom:"8px" }}>{I(tip.icon,24)}</div>
                  <div style={{ fontWeight:700, marginBottom:"6px", fontSize:"0.88rem" }}>{tip.title}</div>
                  <span style={s.badge(T.accent)}>{tip.category}</span>
                </button>
              ))}
            </div>
            {selectedTip!==null&&(
              <div style={{ ...s.card, marginTop:"14px", background:T.accentBg, border:`1px solid ${T.accent}` }}>
                <h2 style={s.h2}>{I(TIPS[selectedTip].icon,20,T.accent)}{TIPS[selectedTip].title}</h2>
                <p style={{ lineHeight:1.7, color:T.text, fontSize:"0.9rem", margin:0 }}>{TIPS[selectedTip].content}</p>
              </div>
            )}
          </div>
        )}

        {tab==="more" && moreView==="days" && (
          <div>
            <h1 style={s.h1}>Training days</h1>
            <p style={s.sub}>Pick the days you train. On those days, Home will nudge you until you've logged a session.</p>
            <div style={s.card}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"5px", marginBottom:"14px" }}>
                {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(day=>{
                  const sel=reminderDays.includes(day);
                  return <button key={day} aria-pressed={sel} style={{ minHeight:"48px", borderRadius:"8px", border:`2px solid ${sel?T.accent:T.border}`, background:sel?T.accentBg:T.surface, color:sel?T.accent:T.textMuted, fontSize:"0.78rem", fontWeight:700, cursor:"pointer", fontFamily:T.font }} onClick={()=>setReminderDays(prev=>prev.includes(day)?prev.filter(d=>d!==day):[...prev,day])}>{day}</button>;
                })}
              </div>
              {reminderDays.length>0?(
                <div style={{ background:T.accentBg, border:`1px solid ${T.accent}`, borderRadius:"8px", padding:"10px 13px", fontSize:"0.84rem", color:T.accent }}>
                  Training on <strong>{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].filter(d=>reminderDays.includes(d)).join(", ")}</strong>
                  {reminderDays.includes(todayName)&&<span>{todayLogs.length?" — today's done.":" — including today."}</span>}
                </div>
              ):<div style={{ color:T.textMuted, fontSize:"0.82rem" }}>No days selected yet.</div>}
            </div>
            <div style={{ ...s.card, background:T.surfaceAlt }}>
              <h2 style={{ ...s.h2, fontSize:"0.95rem" }}>Want an alert on your phone?</h2>
              <p style={{ color:T.textMuted, fontSize:"0.8rem", margin:0, lineHeight:1.6 }}>TABBR can't send notifications yet. That needs a server, which is on the roadmap. For now, set a repeating alarm or reminder in your phone's Clock or Reminders app for the same days.</p>
            </div>
            <div style={s.card}>
              <h2 style={s.h2}>{I(Moon,18,T.accent)}Rest day guidance</h2>
              {[{days:"Same day",c:T.accent,lbl:"Active",adv:"Session logged. Rest or light activity."},
                {days:"1–2 days",c:T.accent,lbl:"Good rest",adv:"Optimal recovery window. Ready to tab again."},
                {days:"3 days",  c:T.warning,lbl:"Getting long",adv:"Don't let the habit break. Get a session in."},
                {days:"4–6 days",c:T.warning,lbl:"Extended rest",adv:"Fitness starts declining. Time to move."},
                {days:"7+ days", c:T.danger,lbl:"AWOL",adv:"The bergen won't carry itself. Get back out there."},
              ].map((r,i)=>(
                <div key={i} style={{ display:"grid", gridTemplateColumns:"62px 92px 1fr", alignItems:"center", gap:"8px", padding:"9px 10px", borderRadius:"8px", background:T.surfaceAlt, marginBottom:i<4?"6px":0 }}>
                  <span style={{ fontSize:"0.74rem", color:T.textMuted }}>{r.days}</span>
                  <span style={{ ...s.badge(r.c), justifyContent:"center" }}>{r.lbl}</span>
                  <span style={{ fontSize:"0.78rem", color:T.textMuted }}>{r.adv}</span>
                </div>
              ))}
            </div>
            {restCard()}
          </div>
        )}
      </main>

      {/* Bottom tab bar */}
      <nav style={s.tabbar} aria-label="Main">
        {TABS.map(([id,Ic,label])=>{
          const a = tab===id;
          return (
            <button key={id} style={s.tabBtn(a)} aria-current={a?"page":undefined}
              onClick={()=>{ if (a && id==="more") setMoreView(null); setTab(id); window.scrollTo(0,0); }}>
              {a && <span style={{ position:"absolute", top:0, left:"30%", right:"30%", height:"2px", background:T.accent, borderRadius:"0 0 2px 2px" }}/>}
              {I(Ic,22)}
              <span>{label}</span>
              {id==="train" && timerActiveNow && <span aria-label="Tab in progress" style={{ position:"absolute", top:"9px", left:"calc(50% + 9px)", width:"8px", height:"8px", borderRadius:"50%", background:timer.running?T.danger:T.warning }}/>}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
