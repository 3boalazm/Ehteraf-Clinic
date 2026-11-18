"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { WorkspaceProvider, useWorkspace } from "@/components/workspace/workspace-provider";
import { ClinicDataProvider } from "@/services/clinic-data-provider";
import type { Locale } from "@/types";
import { cn } from "@/lib/utils";

export function AppShell({
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
  const { locale, mobileOpen, setMobileOpen } = useWorkspace();
  const isDashboard = pathname === `/${locale}/dashboard` || pathname === `/${locale}/dashboard/`;

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen, setMobileOpen]);

  return (
    <div className={cn("app-frame", isDashboard && "app-frame-spatial")}>
      <div className="app-layout">
        <div className="app-content">
          <AppHeader />
          <main className="app-main">{children}</main>
        </div>
      </div>
      <AppSidebar />
      {mobileOpen ? (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label={locale === "ar" ? "إغلاق القائمة" : "Close navigation"}
          onClick={() => setMobileOpen(false)}
        />
      ) : null}
    </div>
  );
}
