"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Info, Languages, MapPin, Menu, Moon, Search, Sun, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { ROLE_BRANCH_SCOPE, ROLE_IDS } from "@/lib/config/roles";
import { BRANCHES } from "@/lib/mock/branches";
import { messages } from "@/lib/i18n/messages";
import type { BranchId, Locale, RoleId } from "@/types";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    locale,
    role,
    setRole,
    branchId,
    setBranchId,
    theme,
    setTheme,
    mobileOpen,
    setMobileOpen,
    searchQuery,
    setSearchQuery,
  } = useWorkspace();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const t = messages[locale];
  const roleOptions = useMemo(
    () => ROLE_IDS.map((id) => ({ id, name: t.roles[id] })),
    [t.roles],
  );

  function switchLanguage() {
    const target: Locale = locale === "ar" ? "en" : "ar";
    const segments = pathname.split("/").filter(Boolean);
    segments[0] = target;
    router.push(`/${segments.join("/")}`);
  }

  return (
    <header className="app-header">
      <div className="header-leading">
        <Button
          variant="ghost"
          size="icon"
          className="mobile-menu-button"
          onClick={() => setMobileOpen((current) => !current)}
          aria-label={mobileOpen ? t.app.closeMenu : t.app.openMenu}
        >
          {mobileOpen ? <X size={19} /> : <Menu size={20} />}
        </Button>
        <label className="header-search">
          <Search size={17} aria-hidden="true" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={t.app.search}
            aria-label={t.app.search}
            dir="auto"
          />
          {searchQuery ? (
            <button
              type="button"
              className="search-clear"
              onClick={() => setSearchQuery("")}
              aria-label={t.app.close}
            >
              <X size={14} />
            </button>
          ) : null}
        </label>
      </div>

      <div className="header-controls">
        <div className="header-select branch-select">
          <MapPin size={16} aria-hidden="true" />
          <SelectField
            compact
            aria-label={t.app.branch}
            title={ROLE_BRANCH_SCOPE[role] ? t.roles[role] : undefined}
            value={ROLE_BRANCH_SCOPE[role] ?? branchId}
            disabled={Boolean(ROLE_BRANCH_SCOPE[role])}
            onChange={(event) => setBranchId(event.target.value as BranchId)}
          >
            {!ROLE_BRANCH_SCOPE[role] ? (
              <option value="all">{t.branches.all}</option>
            ) : null}
            {BRANCHES.filter(
              (branch) => !ROLE_BRANCH_SCOPE[role] || branch.id === ROLE_BRANCH_SCOPE[role],
            ).map((branch) => (
              <option key={branch.id} value={branch.id}>
                {locale === "ar" ? branch.nameAr : branch.nameEn}
              </option>
            ))}
          </SelectField>
        </div>

        <div className="header-select role-select">
          <SelectField
            compact
            aria-label={t.app.role}
            value={role}
            onChange={(event) => {
              const nextRole = event.target.value as RoleId;
              setRole(nextRole);
              setBranchId(ROLE_BRANCH_SCOPE[nextRole] ?? "all");
            }}
          >
            {roleOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </SelectField>
        </div>

        <div className="header-divider" aria-hidden="true" />

        <Button
          variant="ghost"
          size="icon"
          className="header-icon-button language-button"
          onClick={switchLanguage}
          aria-label={t.app.language}
          title={t.app.language}
        >
          <Languages size={19} />
          <span className="language-short">{locale === "ar" ? "EN" : "ع"}</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="header-icon-button theme-button"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          aria-label={theme === "light" ? t.app.themeDark : t.app.themeLight}
          title={theme === "light" ? t.app.themeDark : t.app.themeLight}
        >
          {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
        </Button>

        <div className="notification-anchor">
          <Button
            variant="ghost"
            size="icon"
            className={cn("header-icon-button notification-button", notificationsOpen && "is-open")}
            onClick={() => setNotificationsOpen((current) => !current)}
            aria-label={t.app.notifications}
            aria-expanded={notificationsOpen}
          >
            <Bell size={19} aria-hidden="true" />
          </Button>
          {notificationsOpen ? (
            <div className="notification-popover" role="dialog" aria-label={t.app.notifications}>
              <div className="notification-popover-header">
                <div>
                  <strong>{t.app.notifications}</strong>
                  <span>{t.notifications.title}</span>
                </div>
              </div>
              <div className="notification-list">
                <div className="notification-item notification-demo-note">
                  <span className="notification-item-icon notification-demo" aria-hidden="true">
                    <Info size={16} />
                  </span>
                  <div className="notification-item-copy">
                    <span>{t.notifications.demoNotice}</span>
                  </div>
                </div>
              </div>
              <button
                className="notification-view-all"
                type="button"
                onClick={() => {
                  setNotificationsOpen(false);
                  router.push(`/${locale}/notifications`);
                }}
              >
                {t.app.viewAll}
              </button>
            </div>
          ) : null}
        </div>

        <div className="header-avatar" aria-hidden="true">
          <UserRound size={17} />
        </div>
      </div>
    </header>
  );
}