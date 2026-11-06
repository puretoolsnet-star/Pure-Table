"use client";

export function TablePreview({
  title,
  headers,
  rows,
  emptyLabel,
}: {
  title: string;
  headers: string[];
  rows: string[][];
  emptyLabel: string;
}) {
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
      <div className="max-w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">
        <div className="max-h-[28rem] overflow-auto">
          <table className="w-max min-w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 bg-slate-900/95 backdrop-blur">
              <tr>
                {headers.map((header, index) => (
                  <th
                    key={`${header}-${index}`}
                    className="border-b border-slate-800 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-300"
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
                      className="border-b border-slate-800/80 px-3 py-2 align-top text-slate-200"
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
