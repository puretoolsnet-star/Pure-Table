import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

import { getSeoCopy } from "@/i18n/seo/copy";
import { parseOgImageQuery } from "@/lib/seo/og";

const WIDTH = 1200;
const HEIGHT = 630;

export async function GET(request: NextRequest) {
  const parsed = parseOgImageQuery(request.nextUrl.searchParams);
  if (!parsed) return new Response("Invalid parameters", { status: 400 });

  const copy = getSeoCopy(parsed.page, parsed.locale);
  const title = copy.title.length > 110 ? `${copy.title.slice(0, 107)}…` : copy.title;
  const description =
    copy.description.length > 220
      ? `${copy.description.slice(0, 217)}…`
      : copy.description;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 56,
          background: "linear-gradient(145deg, #020617 0%, #0f172a 48%, #1e293b 100%)",
          color: "#f8fafc",
          fontFamily: "ui-sans-serif, system-ui, Segoe UI, Roboto, Helvetica, Arial",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "rgba(59, 130, 246, 0.2)",
              border: "1px solid rgba(59, 130, 246, 0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              fontWeight: 700,
              color: "#93c5fd",
            }}
          >
            T
          </div>
          <span style={{ fontSize: 22, fontWeight: 600, color: "#cbd5e1" }}>PureTable</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 46, fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.02em" }}>
            {title}
          </div>
          <div style={{ fontSize: 26, lineHeight: 1.45, color: "#94a3b8", maxWidth: 1040 }}>
            {description}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 20,
            color: "#64748b",
          }}
        >
          <span>puretable.app</span>
          <span style={{ textTransform: "uppercase", letterSpacing: "0.12em" }}>
            {parsed.locale} · client-side
          </span>
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT },
  );
}
