const PORTAL_ROOT_ID = "puretable-portal-root";

export function releaseInteractionLocks() {
  if (typeof document === "undefined") return;

  document.body.style.overflow = "";
  document.body.style.pointerEvents = "";
  document.documentElement.style.pointerEvents = "";

  document
    .querySelectorAll<HTMLElement>("[data-puretable-overlay]")
    .forEach((node) => {
      if (node.dataset.open !== "true") node.remove();
    });

  const portalRoot = document.getElementById(PORTAL_ROOT_ID);
  if (portalRoot) portalRoot.style.pointerEvents = "none";
}

export function getPortalRoot(): HTMLElement {
  const existing = document.getElementById(PORTAL_ROOT_ID);
  if (existing) return existing;

  const created = document.createElement("div");
  created.id = PORTAL_ROOT_ID;
  created.setAttribute("aria-hidden", "true");
  created.className =
    "pointer-events-none fixed inset-0 z-[100] [&>*]:pointer-events-auto";
  document.body.appendChild(created);
  return created;
}
