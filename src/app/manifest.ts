import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PureTable",
    short_name: "PureTable",
    description: "Parse invoices and raw text into Excel or CSV locally in the browser.",
    start_url: "/uk",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#020617",
    lang: "uk",
  };
}
