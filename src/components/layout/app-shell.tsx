"use client";

import type { ReactNode } from "react";
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
  const { mobileOpen, setMobileOpen, sidebarCollapsed } = useWorkspace();

  return (
    <div className="app-frame">
      <div className="app-layout">
        <AppSidebar />
        <div className={cn("app-content", sidebarCollapsed && "app-content-expanded")}>
          <AppHeader />
          <main className="app-main">{children}</main>
        </div>
      </div>
      {mobileOpen ? (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}
    </div>
  );
}
