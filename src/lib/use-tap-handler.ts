"use client";

import { useCallback, useRef } from "react";

export function useTapHandler(handler: () => void) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  const onClick = useCallback(() => {
    handlerRef.current();
  }, []);

  return { onClick };
}
