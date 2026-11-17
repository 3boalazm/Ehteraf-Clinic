"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { ROLE_BRANCH_SCOPE, ROLE_IDS } from "@/lib/config/roles";
import type { BranchId, Locale, RoleId, ThemeMode } from "@/types";

interface WorkspaceContextValue {
  locale: Locale;
  role: RoleId;
  setRole: Dispatch<SetStateAction<RoleId>>;
  branchId: BranchId;
  setBranchId: Dispatch<SetStateAction<BranchId>>;
  theme: ThemeMode;
  setTheme: Dispatch<SetStateAction<ThemeMode>>;
  mobileOpen: boolean;
  setMobileOpen: Dispatch<SetStateAction<boolean>>;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: Dispatch<SetStateAction<boolean>>;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const [role, setRole] = useState<RoleId>("owner");
  const [branchId, setBranchId] = useState<BranchId>("all");
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedRole = window.localStorage.getItem("ehteraf:role");
      const savedBranch = window.localStorage.getItem("ehteraf:branch");
      const savedTheme = window.localStorage.getItem("ehteraf:theme");
      const savedSidebar = window.localStorage.getItem("ehteraf:sidebar-collapsed");

      const initialRole =
        savedRole && ROLE_IDS.includes(savedRole as RoleId)
          ? (savedRole as RoleId)
          : "owner";
      setRole(initialRole);
      const assignedBranch = ROLE_BRANCH_SCOPE[initialRole];
      if (assignedBranch) {
        setBranchId(assignedBranch);
      } else if (
        savedBranch &&
        ["all", "ghadeer", "darAlbaida", "quwayiyah"].includes(savedBranch)
      ) {
        setBranchId(savedBranch as BranchId);
      }
      if (savedTheme === "light" || savedTheme === "dark") {
        setTheme(savedTheme);
      }
      if (savedSidebar === "true") setSidebarCollapsed(true);
    } catch {
      // The prototype remains usable when browser storage is disabled.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem("ehteraf:role", role);
      window.localStorage.setItem("ehteraf:branch", branchId);
      window.localStorage.setItem("ehteraf:theme", theme);
      window.localStorage.setItem(
        "ehteraf:sidebar-collapsed",
        String(sidebarCollapsed),
      );
    } catch {
      // Preferences are an enhancement; they are not required for the app to work.
    }
  }, [branchId, hydrated, role, sidebarCollapsed, theme]);

  const value = useMemo(
    () => ({
      locale,
      role,
      setRole,
      branchId,
      setBranchId,
      theme,
      setTheme,
      mobileOpen,
      setMobileOpen,
      sidebarCollapsed,
      setSidebarCollapsed,
      searchQuery,
      setSearchQuery,
    }),
    [
      branchId,
      locale,
      mobileOpen,
      role,
      searchQuery,
      sidebarCollapsed,
      theme,
    ],
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used inside a WorkspaceProvider");
  }
  return context;
}
