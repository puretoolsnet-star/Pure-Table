"use client";

import { Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { cn } from "@/lib/cn";

export function FileDropzone({
  accept,
  multiple = true,
  title,
  hint,
  onFiles,
}: {
  accept: string;
  multiple?: boolean;
  title: string;
  hint: string;
  onFiles: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = useCallback(
    (list: FileList | null) => {
      if (!list?.length) return;
      onFiles(Array.from(list));
      if (inputRef.current) inputRef.current.value = "";
    },
    [onFiles],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      onClick={() => inputRef.current?.click()}
      onDragEnter={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        handleFiles(event.dataTransfer.files);
      }}
      className={cn(
        "glass-card flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-10 text-center transition-colors sm:px-6",
        dragging ? "border-primary/60 bg-primary/10" : "border-slate-700 hover:border-slate-500",
      )}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
        <Upload className="h-5 w-5 text-primary" aria-hidden />
      </div>
      <p className="text-base font-medium text-white">{title}</p>
      <p className="mt-2 max-w-md text-sm text-slate-400">{hint}</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(event) => handleFiles(event.target.files)}
      />
    </div>
  );
}
