"use client";

import { useCallback, useRef, useState } from "react";

import { cloneTable } from "@/lib/table/clone-table";
import type { ParsedTable } from "@/lib/table/types";

const MAX_HISTORY = 40;

export function useTableHistory(initial: ParsedTable = { headers: [], rows: [] }) {
  const [table, setTable] = useState<ParsedTable>(() => cloneTable(initial));
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const past = useRef<ParsedTable[]>([]);
  const future = useRef<ParsedTable[]>([]);

  const syncFlags = useCallback(() => {
    setCanUndo(past.current.length > 0);
    setCanRedo(future.current.length > 0);
  }, []);

  const commit = useCallback(
    (next: ParsedTable, options?: { skipHistory?: boolean }) => {
      const snapshot = cloneTable(next);
      setTable((current) => {
        if (!options?.skipHistory) {
          past.current.push(cloneTable(current));
          if (past.current.length > MAX_HISTORY) past.current.shift();
          future.current = [];
        }
        return snapshot;
      });
      queueMicrotask(syncFlags);
    },
    [syncFlags],
  );

  const replace = useCallback(
    (next: ParsedTable) => {
      commit(next);
    },
    [commit],
  );

  const undo = useCallback(() => {
    setTable((current) => {
      const previous = past.current.pop();
      if (!previous) return current;
      future.current.push(cloneTable(current));
      return cloneTable(previous);
    });
    queueMicrotask(syncFlags);
  }, [syncFlags]);

  const redo = useCallback(() => {
    setTable((current) => {
      const next = future.current.pop();
      if (!next) return current;
      past.current.push(cloneTable(current));
      return cloneTable(next);
    });
    queueMicrotask(syncFlags);
  }, [syncFlags]);

  const reset = useCallback(
    (next: ParsedTable) => {
      past.current = [];
      future.current = [];
      setTable(cloneTable(next));
      setCanUndo(false);
      setCanRedo(false);
    },
    [],
  );

  return { table, commit, replace, undo, redo, canUndo, canRedo, reset };
}