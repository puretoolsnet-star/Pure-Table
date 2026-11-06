"use client";

import type { ReactNode } from "react";
import { createPortal } from "react-dom";

import { getPortalRoot } from "@/lib/release-interaction-locks";
import { useClientMounted } from "@/lib/use-client-mounted";

type BodyPortalProps = {
  open: boolean;
  children: ReactNode;
};

export function BodyPortal({ open, children }: BodyPortalProps) {
  const mounted = useClientMounted();
  if (!mounted || !open) return null;
  return createPortal(children, getPortalRoot());
}
