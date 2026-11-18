"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleHelp, HeartPulse } from "lucide-react";
import { getNavigationForRole } from "@/lib/config/navigation";
import { messages } from "@/lib/i18n/messages";
import { useClinicData } from "@/services/clinic-data-provider";
import { DEMO_TODAY } from "@/lib/mock/clinic-seed";
import { cn, formatNumber } from "@/lib/utils";
import { useWorkspace } from "@/components/workspace/workspace-provider";

export function AppSidebar() {
  const pathname = usePathname();
  const {
    locale,
    role,
    branchId,
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileOpen,
    setMobileOpen,
  } = useWorkspace();
  const t = messages[locale];
  const { appointments } = useClinicData();
  const todayAppointmentCount = appointments.filter(
    (appointment) => appointment.date === DEMO_TODAY &&
      (branchId === "all" || appointment.branchId === branchId) &&
      !["cancelled", "noShow"].includes(appointment.status),
  ).length;
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
                    : item.id === "clinical"
                      ? pathname.startsWith(`/${locale}/clinical`) || pathname.startsWith(`/${locale}/treatment-plans`)
                      : item.id === "services"
                        ? pathname.startsWith(`/${locale}/services`) || pathname.startsWith(`/${locale}/packages`)
                        : item.id === "employees"
                          ? pathname.startsWith(`/${locale}/employees`) || pathname.startsWith(`/${locale}/hr`)
                          : pathname === href || pathname.startsWith(`${href}/`);
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <Link
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={cn("sidebar-link", active && "sidebar-link-active")}
                      aria-current={active ? "page" : undefined}
                      aria-label={item.id === "appointments" && todayAppointmentCount > 0
                        ? t.nav.appointmentsTodayCount.replace("{count}", formatNumber(todayAppointmentCount, locale))
                        : undefined}
                      title={sidebarCollapsed ? itemLabels[item.labelKey] : undefined}
                    >
                      <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
                      <span className="sidebar-link-label">
                        {itemLabels[item.labelKey]}
                      </span>
                      {item.id === "appointments" && todayAppointmentCount > 0 ? (
                        <span className="sidebar-count" aria-hidden="true">
                          {formatNumber(todayAppointmentCount, locale)}
                        </span>
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
