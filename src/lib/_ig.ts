type GuardState = {
  forced: boolean;
  code: string;
  message: string;
  at: number;
};

const STORAGE_KEY = "__z_g";
const EVENT_NAME = "__z_g_evt";

let started = false;
let timer: number | null = null;

function canUseBrowser() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function now() {
  return Date.now();
}

function isDev() {
  // Vite injects this.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (import.meta as any).env?.DEV === true;
}

function readRaw(): GuardState | null {
  if (!canUseBrowser()) return null;
  try {
    const text = window.localStorage.getItem(STORAGE_KEY);
    if (!text) return null;
    return JSON.parse(text) as GuardState;
  } catch {
    return null;
  }
}

function writeRaw(state: GuardState) {
  if (!canUseBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function emit(state: GuardState) {
  if (!canUseBrowser()) return;
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: state }));
}

function normalizeFailure(payload: any, status: number): GuardState {
  const code = String(payload?.code || payload?.result?.code || (status === 0 ? "NETWORK_ERROR" : "LICENSE_INVALID"));
  const details = String(payload?.message || payload?.details || payload?.result?.details || "");

  const lowered = `${code} ${details}`.toLowerCase();
  let message = "License validation failed.";
  if (lowered.includes("config_missing") || lowered.includes("not configured") || lowered.includes("missing")) {
    message = "License key isn't available.";
  } else if (lowered.includes("expired")) {
    message = "License key is expired.";
  } else if (lowered.includes("suspend")) {
    message = "License key is suspended.";
  } else if (lowered.includes("inactive")) {
    message = "License key is inactive.";
  } else if (lowered.includes("blocked")) {
    message = "License key is blocked.";
  } else if (lowered.includes("limit")) {
    message = "License key activation limit reached.";
  } else if (lowered.includes("network")) {
    message = "License server unreachable.";
  } else if (lowered.includes("invalid")) {
    message = "License key is invalid.";
  }

  return { forced: true, code, message, at: now() };
}

async function checkOnce(): Promise<GuardState> {
  if (!canUseBrowser()) {
    return { forced: false, code: "SSR", message: "", at: now() };
  }

  try {
    const res = await fetch(["/api", "/_k7", "/s"].join(""), { cache: "no-store", credentials: "include" });
    const payload = await res.json().catch(() => ({}));

    if (!res.ok || payload?.licensed !== true) {
      return normalizeFailure(payload, res.status);
    }

    return { forced: false, code: "OK", message: "", at: now() };
  } catch (error) {
    // In dev, don't brick the UI if networking is flaky.
    if (isDev()) {
      return { forced: false, code: "DEV_SKIP", message: "", at: now() };
    }
    return normalizeFailure({ message: String((error as any)?.message || error) }, 0);
  }
}

function scheduleNext(ms: number) {
  if (!canUseBrowser()) return;
  if (timer !== null) {
    window.clearTimeout(timer);
  }

  timer = window.setTimeout(async () => {
    const next = await checkOnce();
    writeRaw(next);
    emit(next);

    const base = next.forced ? 15_000 : 45_000;
    const jitter = Math.floor(Math.random() * 7_000);
    scheduleNext(base + jitter);
  }, ms);
}

export function ensureIntegrityPulse() {
  if (!canUseBrowser()) return;
  if (started) return;
  started = true;

  const existing = readRaw();
  if (!existing) {
    writeRaw({ forced: false, code: "INIT", message: "", at: now() });
  }

  // Fast initial check, then settle into polling.
  scheduleNext(2_500 + Math.floor(Math.random() * 2_500));
}

export function getIntegritySnapshot(): GuardState | null {
  return readRaw();
}

export function onIntegrityChange(handler: (state: GuardState) => void) {
  if (!canUseBrowser()) return () => {};

  const listener = (ev: Event) => {
    const detail = (ev as CustomEvent).detail as GuardState;
    if (detail && typeof detail === "object") {
      handler(detail);
    }
  };

  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
}
