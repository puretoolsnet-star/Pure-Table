"use client";

export function TablePreview({
  title,
  headers,
  rows,
  emptyLabel,
  mobileScrollHint,
  variant = "default",
}: {
  title: string;
  headers: string[];
  rows: string[][];
  emptyLabel: string;
  mobileScrollHint?: string;
  variant?: "default" | "studio";
}) {
  const studio = variant === "studio";
  if (headers.length === 0 || rows.length === 0) {
    return (
      <div className="glass-card rounded-2xl border-dashed border-slate-800 px-4 py-8 text-center text-sm text-slate-500">
        {emptyLabel}
      </div>
    );
  }

  return (
    <section className="min-w-0">
      <h2 className="mb-2 text-sm font-semibold text-white">{title}</h2>
      {mobileScrollHint && (
        <p className="mb-2 text-xs text-gray-500 sm:hidden">{mobileScrollHint}</p>
      )}
      <div
        className={
          studio
            ? "max-w-full overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/60"
            : "max-w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50"
        }
      >
        <div
          className="max-h-[min(28rem,70dvh)] overflow-auto overscroll-x-contain touch-pan-x [-webkit-overflow-scrolling:touch]"
          tabIndex={0}
          role="region"
          aria-label={title}
        >
          <table className="w-max min-w-full border-collapse text-left text-sm">
            <thead
              className={
                studio
                  ? "sticky top-0 bg-gray-950/95 backdrop-blur"
                  : "sticky top-0 bg-slate-900/95 backdrop-blur"
              }
            >
              <tr>
                {headers.map((header, index) => (
                  <th
                    key={`${header}-${index}`}
                    className={
                      studio
                        ? "border-b border-gray-800 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-cyan-200/90"
                        : "border-b border-slate-800 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-300"
                    }
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="odd:bg-white/[0.02]">
                  {headers.map((_, cellIndex) => (
                    <td
                      key={cellIndex}
                      className={
                        studio
                          ? "whitespace-nowrap border-b border-gray-800/80 px-3 py-2 align-top text-gray-100 sm:whitespace-normal"
                          : "border-b border-slate-800/80 px-3 py-2 align-top text-slate-200"
                      }
                    >
                      {row[cellIndex] ?? ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
