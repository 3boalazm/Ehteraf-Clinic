"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/design-system/button";
import { getNavigationForRole } from "@/lib/config/navigation";
import { messages } from "@/lib/i18n/messages";
import { useClinicData } from "@/services/clinic-data-provider";
import { DEMO_TODAY } from "@/lib/mock/clinic-seed";
import { cn, formatNumber } from "@/lib/utils";
import { useWorkspace } from "@/components/workspace/workspace-provider";

export function PrimarySidebar() {
  const pathname = usePathname();
  const {
    locale,
    role,
    branchId,
    mobileOpen,
    setMobileOpen,
    sidebarCollapsed,
    setSidebarCollapsed,
  } = useWorkspace();
  const t = messages[locale];
  const { appointments } = useClinicData();
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 900px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const todayCount = appointments.filter(
    (item) =>
      item.date === DEMO_TODAY &&
      (branchId === "all" || item.branchId === branchId) &&
      !["cancelled", "noShow"].includes(item.status),
  ).length;
  const navigation = getNavigationForRole(role);
  const labels = t.nav as Record<string, string>;
  const collapsed = sidebarCollapsed;
  return (
    <aside
      id="primary-navigation"
      className={cn("sidebar", mobileOpen && "sidebar-mobile-open")}
      aria-label={locale === "ar" ? "القائمة الرئيسية" : "Main navigation"}
      aria-hidden={isMobile && !mobileOpen}
      inert={isMobile && !mobileOpen}
    >
      <div className="sidebar-brand-wrap">
        <Link
          href={`/${locale}/dashboard`}
          className="sidebar-brand"
          onClick={() => setMobileOpen(false)}
          aria-label={`${t.app.name} — ${t.app.product}`}
        >
          <span className="brand-emblem" aria-hidden="true">
            <svg viewBox="0 0 36 36" role="img">
              <path
                d="M8 9v18M8 18h8l5-8m-5 8 5 8m0-16h7m-7 16h7"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="8" cy="9" r="2" fill="currentColor" />
              <circle cx="8" cy="27" r="2" fill="currentColor" />
              <circle cx="28" cy="10" r="2" fill="currentColor" />
              <circle cx="28" cy="26" r="2" fill="currentColor" />
              <circle cx="16" cy="18" r="2" fill="currentColor" />
            </svg>
          </span>
          {!collapsed ? (
            <span className="brand-wordmark">
              <strong>ehteraf</strong>
              <small>
                {locale === "ar" ? "إدارة العيادات" : "CLINIC OPERATIONS"}
              </small>
            </span>
          ) : null}
        </Link>
      </div>
      <div className="sidebar-context">
        <span className="sidebar-context-dot" />
        {!collapsed ? (
          <span>{locale === "ar" ? "مجموعة احتراف" : "EHTERAF GROUP"}</span>
        ) : null}
      </div>
      <nav className="sidebar-nav">
        {navigation.map((section) => (
          <div className="sidebar-section" key={section.id}>
            {!collapsed ? (
              <div className="sidebar-section-title">
                {labels[section.labelKey]}
              </div>
            ) : null}
            <ul>
              {section.items.map((item) => {
                const href = `/${locale}${item.href}`;
                const active =
                  item.id === "dashboard"
                    ? pathname === href
                    : item.id === "clinical"
                      ? pathname.startsWith(`/${locale}/clinical`) ||
                        pathname.startsWith(`/${locale}/treatment-plans`)
                      : item.id === "services"
                        ? pathname.startsWith(`/${locale}/services`) ||
                          pathname.startsWith(`/${locale}/packages`)
                        : item.id === "employees"
                          ? pathname.startsWith(`/${locale}/employees`) ||
                            pathname.startsWith(`/${locale}/hr`)
                          : pathname === href ||
                            pathname.startsWith(`${href}/`);
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <Link
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "sidebar-link",
                        active && "sidebar-link-active",
                      )}
                      aria-current={active ? "page" : undefined}
                      title={collapsed ? labels[item.labelKey] : undefined}
                    >
                      <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                      {!collapsed ? (
                        <span className="sidebar-link-label">
                          {labels[item.labelKey]}
                        </span>
                      ) : null}
                      {item.id === "appointments" && todayCount > 0 ? (
                        <span
                          className="sidebar-count"
                          aria-label={t.nav.appointmentsTodayCount.replace(
                            "{count}",
                            formatNumber(todayCount, locale),
                          )}
                        >
                          {formatNumber(todayCount, locale)}
                        </span>
                      ) : null}
                      {active ? (
                        <span
                          className="sidebar-active-mark"
                          aria-hidden="true"
                        />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-demo-note">
          <span className="demo-stamp">{collapsed ? "D" : "DEMO"}</span>
          {!collapsed ? <span>{t.app.demoModeDescription}</span> : null}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="sidebar-collapse"
          onClick={() => setSidebarCollapsed(!collapsed)}
          aria-label={
            collapsed
              ? locale === "ar"
                ? "توسيع القائمة"
                : "Expand navigation"
              : locale === "ar"
                ? "طي القائمة"
                : "Collapse navigation"
          }
          title={
            locale === "ar" ? "تغيير عرض القائمة" : "Toggle navigation width"
          }
        >
          {locale === "ar" ? (
            collapsed ? (
              <ChevronLeft size={16} />
            ) : (
              <ChevronRight size={16} />
            )
          ) : collapsed ? (
            <ChevronRight size={16} />
          ) : (
            <ChevronLeft size={16} />
          )}
          {!collapsed ? (
            <span>{locale === "ar" ? "طي القائمة" : "Collapse"}</span>
          ) : null}
        </Button>
        <div className="sidebar-footnote">
          <span>v0.1 · {locale === "ar" ? "عرض تجريبي" : "PROTOTYPE"}</span>
        </div>
      </div>
    </aside>
  );
}
