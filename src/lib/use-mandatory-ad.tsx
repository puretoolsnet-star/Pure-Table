"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";

import { MandatoryAdModal } from "@/components/ads/MandatoryAdModal";
import { ADSTERRA_WATCH_MS } from "@/lib/ads/adsterra";

export function useMandatoryAd(watchMs: number = ADSTERRA_WATCH_MS): {
  requestDownload: (
    action: () => void | Promise<void>,
    downloadLabel: string,
    options?: { requiresAd?: boolean },
  ) => void;
  modal: ReactNode;
} {
  const [open, setOpen] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);
  const [downloadLabel, setDownloadLabel] = useState("");
  const pendingRef = useRef<(() => void | Promise<void>) | null>(null);

  const requestDownload = useCallback(
    (action: () => void | Promise<void>, label: string, options?: { requiresAd?: boolean }) => {
      const run = () => {
        pendingRef.current = action;
        setDownloadLabel(label);
        setSessionKey((key) => key + 1);
        setOpen(true);
      };
      if (options?.requiresAd === false) {
        void action();
        return;
      }
      run();
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
    modal: (
      <MandatoryAdModal
        open={open}
        sessionKey={sessionKey}
        downloadLabel={downloadLabel}
        onClose={close}
        onUnlocked={complete}
        watchMs={watchMs}
      />
    ),
  };
}
