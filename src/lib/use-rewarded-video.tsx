"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";

import { RewardedVideoGate } from "@/components/ads/RewardedVideoGate";
import { REWARDED_VIDEO_ENABLED } from "@/lib/ads/rewarded-video-config";

export function useRewardedVideo(): {
  requestDownload: (
    action: () => void | Promise<void>,
    downloadLabel?: string,
    options?: { skipGate?: boolean },
  ) => void;
  gate: ReactNode;
} {
  const [open, setOpen] = useState(false);
  const pendingRef = useRef<(() => void | Promise<void>) | null>(null);

  const requestDownload = useCallback(
    (action: () => void | Promise<void>, _downloadLabel?: string, options?: { skipGate?: boolean }) => {
      if (!REWARDED_VIDEO_ENABLED || options?.skipGate) {
        void action();
        return;
      }
      pendingRef.current = action;
      setOpen(true);
    },
    [],
  );

  const close = useCallback(() => {
    pendingRef.current = null;
    setOpen(false);
  }, []);

  const complete = useCallback(async () => {
    const action = pendingRef.current;
    pendingRef.current = null;
    if (action) await action();
    setOpen(false);
  }, []);

  return {
    requestDownload,
    gate: REWARDED_VIDEO_ENABLED ? (
      <RewardedVideoGate open={open} onClose={close} onUnlocked={complete} />
    ) : null,
  };
}