"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, CircleHelp, HeartPulse } from "lucide-react";
import { getNavigationForRole } from "@/lib/config/navigation";
import { messages } from "@/lib/i18n/messages";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();
  const {
    locale,
    role,
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileOpen,
    setMobileOpen,
  } = useWorkspace();
  const t = messages[locale];
  const navigation = getNavigationForRole(role);
  const sectionLabels = t.nav as Record<string, string>;
  const itemLabels = t.nav as Record<string, string>;

  return (
    <aside
      className={cn(
        "app-sidebar",
        sidebarCollapsed && "app-sidebar-collapsed",
        mobileOpen ? "app-sidebar-mobile-open" : "app-sidebar-mobile-closed",
      )}
      aria-label={locale === "ar" ? "القائمة الرئيسية" : "Main navigation"}
    >
      <div className="sidebar-brand-row">
        <Link
          href={`/${locale}/dashboard`}
          className="sidebar-brand"
          onClick={() => setMobileOpen(false)}
          aria-label={`${t.app.name} — ${t.app.product}`}
        >
          <span className="brand-mark">
            <HeartPulse size={21} strokeWidth={2.2} />
          </span>
          <span className="brand-copy">
            <span className="brand-name">{t.app.name}</span>
            <span className="brand-caption">{t.app.product}</span>
          </span>
        </Link>
        <button
          className="sidebar-collapse-button"
          type="button"
          onClick={() => setSidebarCollapsed((current) => !current)}
          aria-label={sidebarCollapsed ? t.app.expandSidebar : t.app.collapseSidebar}
          title={sidebarCollapsed ? t.app.expandSidebar : t.app.collapseSidebar}
        >
          {sidebarCollapsed ? (
            locale === "ar" ? <ChevronLeft size={17} /> : <ChevronRight size={17} />
          ) : locale === "ar" ? (
            <ChevronRight size={17} />
          ) : (
            <ChevronLeft size={17} />
          )}
        </button>
      </div>

      <nav className="sidebar-navigation">
        {navigation.map((section) => (
          <div className="sidebar-section" key={section.id}>
            <div className="sidebar-section-label">
              {sectionLabels[section.labelKey]}
            </div>
            <ul className="sidebar-nav-list">
              {section.items.map((item) => {
                const href = `/${locale}${item.href}`;
                const active =
                  item.id === "dashboard"
                    ? pathname === href
                    : pathname === href || pathname.startsWith(`${href}/`);
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <Link
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={cn("sidebar-link", active && "sidebar-link-active")}
                      aria-current={active ? "page" : undefined}
                      title={sidebarCollapsed ? itemLabels[item.labelKey] : undefined}
                    >
                      <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
                      <span className="sidebar-link-label">
                        {itemLabels[item.labelKey]}
                      </span>
                      {item.id === "appointments" && !sidebarCollapsed ? (
                        <span className="sidebar-count">8</span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-help-icon">
          <CircleHelp size={18} />
        </div>
        <div className="sidebar-footer-copy">
          <span className="sidebar-footer-title">{t.app.help}</span>
          <span className="sidebar-footer-subtitle">{t.app.demoModeDescription}</span>
        </div>
        <span className="demo-indicator" aria-label={t.app.demoMode} />
      </div>
    </aside>
  );
}
