const NATIVE_SRC = process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_SRC?.trim() ?? "";
const NATIVE_ID = process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_ID?.trim() ?? "";
const SOCIAL_SRC = process.env.NEXT_PUBLIC_ADSTERRA_SOCIAL_SRC?.trim() ?? "";
const POPUNDER_SRC = process.env.NEXT_PUBLIC_ADSTERRA_POPUNDER_SRC?.trim() ?? "";

export const ADSTERRA_WATCH_MS = 12_000;

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
  const popunder = POPUNDER_SRC || SOCIAL_SRC;
  if (popunder) ensureScript(popunder, "adsterra-reward-trigger");
  const invoke = (window as Window & { invoke?: () => void }).invoke;
  if (typeof invoke === "function") invoke();
}
