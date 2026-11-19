/**
 * Rewarded Video SDK integration — disabled by default until a provider is wired.
 * Set `NEXT_PUBLIC_REWARDED_VIDEO_ENABLED=true` to route exports through the gate.
 */
export const REWARDED_VIDEO_ENABLED =
  process.env.NEXT_PUBLIC_REWARDED_VIDEO_ENABLED === "true";