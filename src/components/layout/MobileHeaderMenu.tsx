"use client";

import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { BodyPortal } from "@/components/layout/BodyPortal";
import { EcosystemDialog } from "@/components/layout/EcosystemDialog";
import { MobileNavOverlay } from "@/components/layout/MobileNavOverlay";
import { useI18n } from "@/i18n/context";
import type { Locale } from "@/i18n/locales";
import { useTapHandler } from "@/lib/use-tap-handler";

export function MobileHeaderMenu() {
  const { locale, setLocale, t } = useI18n();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEcosystemOpen, setIsEcosystemOpen] = useState(false);

  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);
  const toggleMenu = useTapHandler(() => setIsMobileMenuOpen((open) => !open));

  useEffect(() => {
    if (!isMobileMenuOpen && !isEcosystemOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isMobileMenuOpen, isEcosystemOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMobileMenu();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMobileMenuOpen, closeMobileMenu]);

  return (
    <>
      <button
        type="button"
        aria-expanded={isMobileMenuOpen}
        aria-controls="puretable-mobile-nav"
        aria-label={t.nav.menuAria}
        onClick={toggleMenu.onClick}
        className="glass-card relative z-30 inline-flex h-10 w-10 touch-manipulation items-center justify-center rounded-xl border-slate-800 text-slate-200 md:hidden"
      >
        {isMobileMenuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
      </button>
      <BodyPortal open={isMobileMenuOpen}>
        <MobileNavOverlay
          open={isMobileMenuOpen}
          locale={locale}
          t={t}
          onClose={closeMobileMenu}
          onOpenEcosystem={() => {
            closeMobileMenu();
            setIsEcosystemOpen(true);
          }}
          onSelectLocale={(item: Locale) => setLocale(item)}
        />
      </BodyPortal>
      {isEcosystemOpen && (
        <EcosystemDialog
          open={isEcosystemOpen}
          onClose={() => setIsEcosystemOpen(false)}
          layout="centered"
        />
      )}
    </>
  );
}
