export type GuardState = {
  forced: boolean;
  code: string;
  message: string;
  at: number;
};

export function ensureIntegrityPulse() {
  // DRM/licensing enforcement has been removed. This app is intentionally
  // allowed to load without a remote license gate.
}

export function getIntegritySnapshot(): GuardState | null {
  return {
    forced: false,
    code: "BYPASS",
    message: "",
    at: Date.now(),
  };
}

export function onIntegrityChange(handler: (state: GuardState) => void) {
  handler(getIntegritySnapshot()!);
  return () => undefined;
}
