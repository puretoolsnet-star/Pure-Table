const NATIVE_SRC = process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_SRC?.trim() ?? "";
const NATIVE_ID = process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_ID?.trim() ?? "";
const POPUNDER_SRC = process.env.NEXT_PUBLIC_ADSTERRA_POPUNDER_SRC?.trim() ?? "";

const BANNER_KEY =
  process.env.NEXT_PUBLIC_ADSTERRA_BANNER_KEY?.trim() ?? "3d82a3652d9e64aa358e6ad1c7b1d69c";
const BANNER_SRC =
  process.env.NEXT_PUBLIC_ADSTERRA_BANNER_SRC?.trim() ??
  "https://bauval.org/22/3d82a3652d9e64aa358e6ad1c7b1d69c";

const BANNER_WIDTH = 300;
const BANNER_HEIGHT = 250;
const SIDEBAR_BANNER_SCRIPT_ID = "adsterra-sidebar-banner";

export const ADSTERRA_WATCH_MS = 5_000;

export const adsterraNative = {
  src: NATIVE_SRC,
  containerId: NATIVE_ID,
};

function ensureScript(src: string, id: string) {
  if (!src || typeof document === "undefined") return;
  if (document.getElementById(id)) return;
  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  script.setAttribute("data-cfasync", "false");
  script.src = src.startsWith("//") ? `https:${src}` : src;
  document.body.appendChild(script);
}

export function loadAdsterraNative() {
  if (!NATIVE_SRC) return;
  ensureScript(NATIVE_SRC, "adsterra-native-invoke");
}

export function triggerAdsterraReward() {
  if (typeof window === "undefined") return;
  if (POPUNDER_SRC) ensureScript(POPUNDER_SRC, "adsterra-reward-trigger");
  const invoke = (window as Window & { invoke?: () => void }).invoke;
  if (typeof invoke === "function") invoke();
}

export const adsterraSidebarBanner = {
  width: BANNER_WIDTH,
  height: BANNER_HEIGHT,
};

export function mountAdsterraSidebarBanner(container: HTMLElement): () => void {
  if (!BANNER_SRC || !BANNER_KEY) return () => {};

  const w = window as Window & { atOptions?: Record<string, unknown> };
  w.atOptions = {
    key: BANNER_KEY,
    format: "iframe",
    height: BANNER_HEIGHT,
    width: BANNER_WIDTH,
    params: {},
  };

  if (container.querySelector(`#${SIDEBAR_BANNER_SCRIPT_ID}`)) {
    return () => {
      container.replaceChildren();
    };
  }

  const script = document.createElement("script");
  script.id = SIDEBAR_BANNER_SCRIPT_ID;
  script.async = true;
  script.setAttribute("data-cfasync", "false");
  script.src = BANNER_SRC.startsWith("//") ? `https:${BANNER_SRC}` : BANNER_SRC;
  container.appendChild(script);

  return () => {
    container.replaceChildren();
  };
}
