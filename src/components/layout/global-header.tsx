"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Languages, Menu, Moon, Search, Sun } from "lucide-react";
import { Button } from "@/design-system/button";
import { Select } from "@/design-system/fields";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { ROLE_BRANCH_SCOPE, ROLE_IDS } from "@/lib/config/roles";
import { BRANCHES } from "@/lib/mock/branches";
import { messages } from "@/lib/i18n/messages";
import type { BranchId, RoleId } from "@/types";

export function GlobalHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
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
  const t = messages[locale];
  const roleOptions = useMemo(
    () => ROLE_IDS.map((id) => ({ id, label: t.roles[id] })),
    [t.roles],
  );

  useEffect(() => {
    function focusGlobalSearch(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", focusGlobalSearch);
    return () => window.removeEventListener("keydown", focusGlobalSearch);
  }, []);

  function switchLanguage() {
    const segments = pathname.split("/").filter(Boolean);
    segments[0] = locale === "ar" ? "en" : "ar";
    router.push(`/${segments.join("/")}`);
  }

  return (
    <header className="topbar">
      <div className="topbar-start">
        <Button
          variant="ghost"
          size="icon"
          className="mobile-menu-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? t.app.closeMenu : t.app.openMenu}
          aria-expanded={mobileOpen}
          aria-controls="primary-navigation"
        >
          <Menu size={19} />
        </Button>
        <a href="#main-content" className="skip-link">
          {locale === "ar" ? "انتقل إلى المحتوى" : "Skip to content"}
        </a>
        <label className="global-search">
          <Search size={16} aria-hidden="true" />
          <input
            ref={searchRef}
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={t.app.search}
            aria-label={t.app.search}
            aria-keyshortcuts="Control+K Meta+K"
            dir="auto"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label={t.app.close}
            >
              ×
            </button>
          ) : null}
          <kbd aria-hidden="true">⌘ K</kbd>
        </label>
      </div>

      <div className="topbar-tools">
        <label className="context-select">
          <span className="context-select-caption">
            {locale === "ar" ? "النطاق" : "SCOPE"}
          </span>
          <Select
            aria-label={t.app.branch}
            value={ROLE_BRANCH_SCOPE[role] ?? branchId}
            disabled={Boolean(ROLE_BRANCH_SCOPE[role])}
            onChange={(event) => setBranchId(event.target.value as BranchId)}
          >
            {!ROLE_BRANCH_SCOPE[role] ? (
              <option value="all">{t.branches.all}</option>
            ) : null}
            {BRANCHES.filter(
              (branch) =>
                !ROLE_BRANCH_SCOPE[role] ||
                branch.id === ROLE_BRANCH_SCOPE[role],
            ).map((branch) => (
              <option key={branch.id} value={branch.id}>
                {locale === "ar" ? branch.nameAr : branch.nameEn}
              </option>
            ))}
          </Select>
        </label>

        <label className="context-select role-context">
          <span className="context-select-caption">
            {locale === "ar" ? "الدور التجريبي" : "DEMO ROLE"}
          </span>
          <Select
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
                {option.label}
              </option>
            ))}
          </Select>
        </label>

        <span className="topbar-separator" aria-hidden="true" />
        <Button
          variant="ghost"
          size="icon"
          className="topbar-icon"
          onClick={switchLanguage}
          aria-label={t.app.language}
          title={t.app.language}
        >
          <Languages size={18} />
          <span className="topbar-language">
            {locale === "ar" ? "EN" : "ع"}
          </span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="topbar-icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          aria-label={theme === "light" ? t.app.themeDark : t.app.themeLight}
          title={theme === "light" ? t.app.themeDark : t.app.themeLight}
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="topbar-icon notification-trigger"
          onClick={() => router.push(`/${locale}/notifications`)}
          aria-label={t.app.notifications}
          title={t.app.notifications}
        >
          <Bell size={18} />
          <span className="notification-marker" />
        </Button>
        <span className="topbar-user" aria-label={t.app.product}>
          EH
        </span>
      </div>
    </header>
  );
}
