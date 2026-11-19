"use client";

/**
 * Placeholder UI for a future Rewarded Video SDK (e.g. Google Ad Manager rewarded ads).
 * Not shown while `REWARDED_VIDEO_ENABLED` is false.
 */
export function RewardedVideoGate({
  open,
  onClose,
  onUnlocked,
}: {
  open: boolean;
  onClose: () => void;
  onUnlocked: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal
      aria-labelledby="rewarded-video-gate-title"
      data-puretable-overlay="rewarded-video-gate"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
        <h2 id="rewarded-video-gate-title" className="text-lg font-semibold text-white">
          Rewarded video
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          SDK slot reserved — wire your provider here, then call <code className="text-cyan-300">onUnlocked</code>{" "}
          after the user earns the reward.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 hover:border-slate-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onUnlocked}
            className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-gray-950 hover:bg-cyan-400"
          >
            Continue (dev stub)
          </button>
        </div>
      </div>
    </div>
  );
}