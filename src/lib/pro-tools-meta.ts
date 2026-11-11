import {
  Barcode,
  Calculator,
  Coins,
  FileSpreadsheet,
  GitCompare,
  GitMerge,
  Receipt,
  ScanText,
  Sparkles,
  SprayCan,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { ToolId } from "@/i18n/types";

export type ProToolCardMeta = {
  id: ToolId;
  icon: LucideIcon;
  accent: string;
};

export const PRO_TOOL_CARDS: ProToolCardMeta[] = [
  { id: "image-to-table", icon: ScanText, accent: "from-cyan-500/25 to-cyan-500/5" },
  { id: "invoice-parser", icon: Receipt, accent: "from-sky-500/25 to-sky-500/5" },
  { id: "text-to-excel", icon: FileSpreadsheet, accent: "from-teal-500/25 to-teal-500/5" },
  { id: "merge-tables", icon: GitMerge, accent: "from-violet-500/25 to-violet-500/5" },
  { id: "margin-calculator", icon: Calculator, accent: "from-emerald-500/25 to-emerald-500/5" },
  { id: "currency-converter", icon: Coins, accent: "from-amber-500/25 to-amber-500/5" },
  { id: "price-diff", icon: GitCompare, accent: "from-orange-500/25 to-orange-500/5" },
  { id: "data-cleaner", icon: SprayCan, accent: "from-lime-500/25 to-lime-500/5" },
  { id: "qr-generator", icon: Barcode, accent: "from-fuchsia-500/25 to-fuchsia-500/5" },
];

export const PRO_HUB_ICON = Sparkles;
