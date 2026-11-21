// ─── NATIVE BRIDGE ───────────────────────────────────────────────────────────
// Everything that only exists in the iPhone/Android store apps lives here.
// In the web version `isNative` is false and each helper falls back to the browser.
import { Capacitor, registerPlugin } from "@capacitor/core";
import { TextToSpeech } from "@capacitor-community/text-to-speech";
import { Haptics, NotificationType } from "@capacitor/haptics";
import { Share } from "@capacitor/share";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Preferences } from "@capacitor/preferences";
import { StatusBar, Style } from "@capacitor/status-bar";

export const isNative = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform();   // "ios" | "android" | "web"

const BackgroundGeolocation = registerPlugin("BackgroundGeolocation");

// ── GPS that keeps running with the screen locked ────────────────────────────
// Calls onPosition with the same shape the browser's geolocation uses, so the app's
// distance/route logic doesn't care where the fix came from. Returns a handle for stopNativeGps.
export function startNativeGps(onPosition, onError) {
  return BackgroundGeolocation.addWatcher(
    {
      // Having a background message is what keeps updates coming while the app is in the background.
      // On Android it's the text of the notification shown while tracking.
      backgroundTitle: "TABBR is tracking your tab",
      backgroundMessage: "Distance and pace are being recorded. Open TABBR to pause or finish.",
      requestPermissions: true,
      stale: false,
      distanceFilter: 3,
    },
    (location, error) => {
      if (error) { onError({ code: error.code === "NOT_AUTHORIZED" ? 1 : 2 }); return; }
      if (!location) return;
      onPosition({ coords: { latitude: location.latitude, longitude: location.longitude, accuracy: location.accuracy ?? 999 }, timestamp: location.time || Date.now() });
    }
  );
}
export function stopNativeGps(handle) {
  Promise.resolve(handle).then(id => { if (id) BackgroundGeolocation.removeWatcher({ id }); }).catch(() => {});
}
export function openLocationSettings() {
  BackgroundGeolocation.openSettings().catch(() => {});
}

// ── Voice cues (the phone's own speech engine, which also works when locked) ──
export function speakNative(text) {
  // "ambient" mixes with music or podcasts instead of stopping them.
  TextToSpeech.speak({ text, lang: "en-GB", rate: 1.0, pitch: 1.0, volume: 1.0, category: "ambient" }).catch(() => {});
}

// ── A buzz for big moments (iPhones ignore the browser's vibrate) ─────────────
export function celebrate() {
  if (isNative) Haptics.notification({ type: NotificationType.Success }).catch(() => {});
  else { try { navigator.vibrate?.([90, 50, 90, 50, 220]); } catch {} }
}

// ── Share or save a file (share images, backups) ─────────────────────────────
// Returns once the share sheet closes. Throws { name: "AbortError" } if the person cancels.
export async function shareFile(file, text) {
  if (isNative) {
    const data = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(",")[1]); r.onerror = rej; r.readAsDataURL(file); });
    const { uri } = await Filesystem.writeFile({ path: file.name, data, directory: Directory.Cache });
    try { await Share.share({ title: file.name, text, files: [uri] }); }
    catch (e) { if (/cancel/i.test(e?.message || "")) { const err = new Error("cancelled"); err.name = "AbortError"; throw err; } throw e; }
    return;
  }
  if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], text }); return; }
  const url = URL.createObjectURL(file); const a = document.createElement("a"); a.href = url; a.download = file.name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// ── Safer storage in the store apps ──────────────────────────────────────────
// Phones can clear a web view's storage when space runs low; Preferences is the app's own
// storage and isn't cleared that way. The app writes to both and reads Preferences as a fallback.
export const prefs = {
  get: async key => { try { return (await Preferences.get({ key })).value; } catch { return null; } },
  set: (key, value) => { Preferences.set({ key, value }).catch(() => {}); },
  remove: key => { Preferences.remove({ key }).catch(() => {}); },
};

// ── Status bar text colour to suit the theme ─────────────────────────────────
export function setStatusBar(scheme) {
  if (!isNative) return;
  StatusBar.setStyle({ style: scheme === "dark" ? Style.Dark : Style.Light }).catch(() => {});
}
