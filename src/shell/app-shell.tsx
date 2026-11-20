"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import {
  Bell,
  Languages,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  ShieldAlert,
  Sun,
} from "lucide-react";
import { getNavigationForRole } from "@/lib/config/navigation";
import { canAccessModule, ROLE_BRANCH_SCOPE, ROLE_IDS } from "@/lib/config/roles";
import { BRANCHES } from "@/lib/mock/branches";
import { AccountingProvider } from "@/services/accounting-provider";
import { ClinicDataProvider } from "@/services/clinic-data-provider";
import { WorkspaceProvider } from "@/state/workspace-provider";
import { useApp } from "@/shell/use-app";
import { Avatar, Button, Card, cx, Empty, IconButton, Select } from "@/ui";
import type { BranchId, Locale, ModuleId, RoleId } from "@/types";

export function AppShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <WorkspaceProvider locale={locale}>
      <ClinicDataProvider>
        <AccountingProvider>
        <div className="app">
          <div className="frame">
            <Rail />
            <div className="main">
              <TopBar />
              <main className="page">{children}</main>
            </div>
          </div>
        </div>
        </AccountingProvider>
      </ClinicDataProvider>
    </WorkspaceProvider>
  );
}

function usePath() {
  const pathname = usePathname() ?? "";
  const segments = pathname.split("/").filter(Boolean);
  return { pathname, rest: segments.slice(1) };
}

function Rail() {
  const app = useApp();
  const { rest, pathname } = usePath();
  const sections = getNavigationForRole(app.role);
  const open = !app.sidebarCollapsed;
  const navLabels = app.t.nav as Record<string, string>;
  const { setMobileOpen } = app;

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  return (
    <>
      <button
        type="button"
        className={cx("scrim", app.mobileOpen && "scrim--on")}
        aria-label={app.t.app.closeMenu}
        onClick={() => app.setMobileOpen(false)}
      />
      <aside
        className={cx("rail", open && "rail--open", app.mobileOpen && "rail--mobile-open")}
        aria-label={app.t.nav.workspace}
      >
        <Link href={app.href("/dashboard")} className="rail__brand">
          <span className="rail__logo">{app.ar ? "ا" : "E"}</span>
          <span className="rail__name">
            {app.t.app.name}
            <span>{app.t.app.product}</span>
          </span>
        </Link>

        <nav className="rail__scroll">
          {sections.map((section, index) => (
            <div key={section.id} className="stack stack--sm">
              {index > 0 ? <div className="rail__sep" /> : null}
              <span className="rail__section">{navLabels[section.labelKey]}</span>
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = rest[0] === item.href.split("/").filter(Boolean)[0];
                return (
                  <Link
                    key={item.id}
                    href={app.href(item.href)}
                    className="rail__item"
                    aria-current={active ? "page" : undefined}
                    aria-label={navLabels[item.labelKey]}
                  >
                    <Icon />
                    <span className="rail__label">{navLabels[item.labelKey]}</span>
                    <span className="rail__tip" aria-hidden>
                      {navLabels[item.labelKey]}
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="rail__foot">
          <button
            type="button"
            className="rail__item"
            onClick={() => app.setTheme(app.theme === "dark" ? "light" : "dark")}
            aria-label={app.theme === "dark" ? app.t.app.themeLight : app.t.app.themeDark}
          >
            {app.theme === "dark" ? <Sun /> : <Moon />}
            <span className="rail__label">
              {app.theme === "dark" ? app.t.app.themeLight : app.t.app.themeDark}
            </span>
          </button>
          <button
            type="button"
            className="rail__item rail__collapse"
            onClick={() => app.setSidebarCollapsed(open)}
            aria-label={open ? app.t.app.collapseSidebar : app.t.app.expandSidebar}
          >
            {open ? <PanelLeftClose className="flip" /> : <PanelLeftOpen className="flip" />}
            <span className="rail__label">{app.t.app.collapseSidebar}</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function TopBar() {
  const app = useApp();
  const { rest } = usePath();
  const otherLocale: Locale = app.ar ? "en" : "ar";
  const scopedBranch = ROLE_BRANCH_SCOPE[app.role];
  const roleLabels = app.t.roles as Record<RoleId, string>;

  const changeRole = (role: RoleId) => {
    app.setRole(role);
    const scope = ROLE_BRANCH_SCOPE[role];
    if (scope) app.setBranchId(scope);
  };

  return (
    <header className="topbar">
      <IconButton
        label={app.t.app.openMenu}
        className="menu-btn"
        onClick={() => app.setMobileOpen(true)}
      >
        <Menu />
      </IconButton>

      <div className="search">
        <Search />
        <input
          type="search"
          value={app.searchQuery}
          placeholder={app.t.app.search}
          aria-label={app.t.app.search}
          onChange={(event) => app.setSearchQuery(event.target.value)}
        />
      </div>

      <div className="topbar__spacer" />

      <Select
        className="select--sm select--card"
        style={{ width: "auto" }}
        aria-label={app.t.app.branch}
        value={app.branchId}
        disabled={Boolean(scopedBranch)}
        onChange={(event) => app.setBranchId(event.target.value as BranchId)}
      >
        <option value="all">{app.t.app.allBranches}</option>
        {BRANCHES.map((branch) => (
          <option key={branch.id} value={branch.id}>
            {app.pick(branch.nameAr, branch.nameEn)}
          </option>
        ))}
      </Select>

      <Select
        className="select--sm select--card"
        style={{ width: "auto" }}
        aria-label={app.t.app.role}
        value={app.role}
        onChange={(event) => changeRole(event.target.value as RoleId)}
      >
        {ROLE_IDS.map((role) => (
          <option key={role} value={role}>
            {roleLabels[role]}
          </option>
        ))}
      </Select>

      <IconButton className="topbar__lang" label={app.t.app.language} href={`/${[otherLocale, ...rest].join("/")}`}>
        <Languages />
      </IconButton>
      {canAccessModule(app.role, "notifications") ? (
        <IconButton label={app.t.app.notifications} href={app.href("/notifications")}>
          <Bell />
        </IconButton>
      ) : null}

      <div className="user-chip">
        <Avatar name={roleLabels[app.role]} />
        <div className="user-chip__text">
          <b>{roleLabels[app.role]}</b>
          <span>{app.t.app.demoMode}</span>
        </div>
      </div>
    </header>
  );
}

/** Renders children only when the active demo role may open `module`. */
export function FeatureGate({ module, children }: { module: ModuleId; children: ReactNode }) {
  const app = useApp();
  if (canAccessModule(app.role, module)) return <>{children}</>;
  return (
    <Card>
      <Empty
        icon={<ShieldAlert />}
        title={app.t.modules.accessDeniedTitle}
        description={app.t.modules.accessDenied}
        action={
          <Button variant="ink" arrow href={app.href("/dashboard")}>
            {app.t.app.backToDashboard}
          </Button>
        }
      />
    </Card>
  );
}
