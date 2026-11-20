import {
  Activity,
  BarChart3,
  Bell,
  Landmark,
  BriefcaseBusiness,
  CalendarDays,
  CreditCard,
  FileHeart,
  LayoutDashboard,
  Megaphone,
  PackageSearch,
  Settings2,
  Stethoscope,
  UsersRound,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
import type { ModuleId, RoleId } from "@/types";
import { canAccessModule } from "@/lib/config/roles";

export interface NavigationItem {
  id: string;
  labelKey: string;
  href: string;
  icon: LucideIcon;
  module?: ModuleId;
}

export interface NavigationSection {
  id: "workspace" | "operations" | "insights" | "system";
  labelKey: string;
  items: NavigationItem[];
}

export const NAVIGATION: NavigationSection[] = [
  {
    id: "workspace",
    labelKey: "workspace",
    items: [
      {
        id: "dashboard",
        labelKey: "dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        id: "branches",
        labelKey: "branches",
        href: "/branches",
        icon: Activity,
        module: "branches",
      },
      {
        id: "appointments",
        labelKey: "appointments",
        href: "/appointments",
        icon: CalendarDays,
        module: "appointments",
      },
      {
        id: "calendar",
        labelKey: "calendar",
        href: "/calendar",
        icon: CalendarDays,
        module: "appointments",
      },
      {
        id: "patients",
        labelKey: "patients",
        href: "/patients",
        icon: UsersRound,
        module: "patients",
      },
      {
        id: "clinical",
        labelKey: "clinical",
        href: "/clinical",
        icon: FileHeart,
        module: "clinical",
      },
    ],
  },
  {
    id: "operations",
    labelKey: "operations",
    items: [
      {
        id: "services",
        labelKey: "services",
        href: "/services",
        icon: Stethoscope,
        module: "services",
      },
      {
        id: "finance",
        labelKey: "finance",
        href: "/finance/invoices",
        icon: CreditCard,
        module: "finance",
      },
      {
        id: "accounting",
        labelKey: "accounting",
        href: "/accounting",
        icon: Landmark,
        module: "finance",
      },
      {
        id: "inventory",
        labelKey: "inventory",
        href: "/inventory",
        icon: Warehouse,
        module: "inventory",
      },
      {
        id: "procurement",
        labelKey: "procurement",
        href: "/procurement",
        icon: PackageSearch,
        module: "inventory",
      },
      {
        id: "employees",
        labelKey: "employees",
        href: "/hr",
        icon: BriefcaseBusiness,
        module: "employees",
      },
    ],
  },
  {
    id: "insights",
    labelKey: "insights",
    items: [
      {
        id: "reports",
        labelKey: "reports",
        href: "/reports",
        icon: BarChart3,
        module: "reports",
      },
      {
        id: "marketing",
        labelKey: "marketing",
        href: "/marketing",
        icon: Megaphone,
        module: "marketing",
      },
    ],
  },
  {
    id: "system",
    labelKey: "system",
    items: [
      {
        id: "notifications",
        labelKey: "notifications",
        href: "/notifications",
        icon: Bell,
        module: "notifications",
      },
      {
        id: "settings",
        labelKey: "settings",
        href: "/settings",
        icon: Settings2,
        module: "settings",
      },
    ],
  },
];

export function getNavigationForRole(role: RoleId): NavigationSection[] {
  return NAVIGATION.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) => !item.module || canAccessModule(role, item.module),
    ),
  })).filter((section) => section.items.length > 0);
}

export function getModuleFromPath(path: string): ModuleId | null {
  const firstSegment = path.split("/").filter(Boolean)[0];
  switch (firstSegment) {
    case "branches":
      return "branches";
    case "appointments":
    case "calendar":
      return "appointments";
    case "patients":
      return "patients";
    case "clinical":
    case "treatment-plans":
      return "clinical";
    case "services":
    case "packages":
      return "services";
    case "finance":
    case "accounting":
      return "finance";
    case "inventory":
    case "procurement":
      return "inventory";
    case "employees":
    case "hr":
      return "employees";
    case "reports":
      return "reports";
    case "marketing":
      return "marketing";
    case "notifications":
      return "notifications";
    case "settings":
      return "settings";
    default:
      return null;
  }
}
