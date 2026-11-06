"use client";

import type { ReactNode } from "react";

import { AppTouchGuard } from "@/components/layout/AppTouchGuard";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      <AppTouchGuard />
      <div
        id="puretable-app-root"
        className="pointer-events-auto relative z-[1] flex min-h-dvh min-w-0 flex-1 touch-manipulation flex-col overflow-x-hidden"
      >
        {children}
      </div>
    </>
  );
}
