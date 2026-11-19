"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { PrimarySidebar } from "@/components/layout/primary-sidebar";
import { GlobalHeader } from "@/components/layout/global-header";
import {
  WorkspaceProvider,
  useWorkspace,
} from "@/components/workspace/workspace-provider";
import { ClinicDataProvider } from "@/services/clinic-data-provider";
import type { Locale } from "@/types";

export function ApplicationShell({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <WorkspaceProvider locale={locale}>
      <ClinicDataProvider>
        <ShellFrame>{children}</ShellFrame>
      </ClinicDataProvider>
    </WorkspaceProvider>
  );
}

function ShellFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { locale, mobileOpen, setMobileOpen, sidebarCollapsed } =
    useWorkspace();
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileOpen, setMobileOpen]);
  useEffect(() => setMobileOpen(false), [pathname, setMobileOpen]);
  return (
    <div className={`app-frame${sidebarCollapsed ? " is-collapsed" : ""}`}>
      <PrimarySidebar />
      {mobileOpen ? (
        <button
          className="shell-backdrop"
          type="button"
          aria-label={locale === "ar" ? "إغلاق القائمة" : "Close navigation"}
          onClick={() => setMobileOpen(false)}
        />
      ) : null}
      <div className="app-column">
        <GlobalHeader />
        <main className="app-main" id="main-content" tabIndex={-1}>
          {children}
        </main>
        <footer className="app-footer">
          <span>EH · EHTERAF CLINIC</span>
          <span>
            {locale === "ar" ? "مساحة عمل تجريبية" : "Prototype workspace"}
          </span>
        </footer>
      </div>
    </div>
  );
}
