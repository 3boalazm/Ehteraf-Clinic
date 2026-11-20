"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  computeRun,
  defaultRunStatus,
  DEVICES,
  HR_BRANCHES,
  HR_TODAY,
  LEAVE_SEED,
  MONTHS,
  postedDate,
  RUN_FLOW,
  type Adjustment,
  type AdjustmentKind,
  type HrContext,
  type LeaveRequest,
  type LeaveStatus,
  type LeaveType,
  type PayrollRun,
  type PostedPayroll,
  type RealBranch,
  type RosterCell,
  type RosterOverrides,
  type RunStatus,
} from "@/lib/mock/hr-data";
import type { ModuleId, RoleId } from "@/types";

const STORAGE_KEY = "ehteraf:hr:v1";

interface PersistedState {
  adjustments: Adjustment[];
  leaves: LeaveRequest[];
  excused: Record<string, boolean>;
  roster: RosterOverrides;
  runStatus: Record<string, RunStatus>;
  postedAt: Record<string, string>;
  deviceSync: Record<string, number>;
  roleOverrides: Record<string, RoleId>;
  moduleOverrides: Record<string, Partial<Record<ModuleId, boolean>>>;
}

const INITIAL: PersistedState = {
  adjustments: [],
  leaves: LEAVE_SEED,
  excused: {},
  roster: {},
  runStatus: {},
  postedAt: {},
  deviceSync: {},
  roleOverrides: {},
  moduleOverrides: {},
};

interface HrValue extends PersistedState {
  ctx: HrContext;
  runs: PayrollRun[];
  runStatusOf: (key: string) => RunStatus;
  postedPayroll: PostedPayroll[];
  addAdjustment: (input: { empId: string; month: string; kind: AdjustmentKind; amount: number; note: string }) => void;
  removeAdjustment: (id: string) => void;
  advanceRun: (key: string) => void;
  submitLeave: (input: { empId: string; type: LeaveType; from: string; to: string; note: string }) => void;
  decideLeave: (id: string, status: Exclude<LeaveStatus, "pending">) => void;
  toggleExcused: (empId: string, date: string) => void;
  setRoster: (empId: string, weekday: number, cell: RosterCell) => void;
  syncDevice: (deviceId: string, currentMinutesAgo: number) => void;
  setRole: (empId: string, role: RoleId) => void;
  setModuleAccess: (empId: string, module: ModuleId, allowed: boolean | null) => void;
  resetHr: () => void;
  hydrated: boolean;
}

const HrContextValue = createContext<HrValue | null>(null);

export function HrProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(INITIAL);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<PersistedState>;
        if (Array.isArray(parsed.adjustments) && Array.isArray(parsed.leaves)) {
          setState({ ...INITIAL, ...parsed });
        }
      }
    } catch {
      // Falls back to the demo data when storage is unavailable or malformed.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Session state keeps working without storage.
    }
  }, [state, hydrated]);

  const ctx = useMemo<HrContext>(
    () => ({ leaves: state.leaves, excused: state.excused, roster: state.roster }),
    [state.leaves, state.excused, state.roster],
  );

  const runs = useMemo(
    () =>
      HR_BRANCHES.flatMap((branchId) =>
        MONTHS.map((month) => computeRun(branchId, month, ctx, state.adjustments)),
      ),
    [ctx, state.adjustments],
  );

  const runStatusOf = useCallback(
    (key: string): RunStatus => state.runStatus[key] ?? defaultRunStatus(key.split(":")[1] ?? ""),
    [state.runStatus],
  );

  const postedPayroll = useMemo<PostedPayroll[]>(
    () =>
      runs
        .filter((run) => runStatusOf(run.key) === "posted")
        .map((run) => ({
          key: run.key,
          branchId: run.branchId,
          month: run.month,
          date: postedDate(run.month, state.postedAt[run.key]),
          salaryExpense: run.totals.salaryExpense,
          gosiEmployer: run.totals.gosiEmployer,
          gosiEmployee: run.totals.gosiEmployee,
        })),
    [runs, runStatusOf, state.postedAt],
  );

  const addAdjustment = useCallback<HrValue["addAdjustment"]>((input) => {
    setState((current) => {
      const highest = current.adjustments.reduce((max, item) => Math.max(max, Number(item.id.replace(/\D/g, "")) || 0), 0);
      return { ...current, adjustments: [...current.adjustments, { ...input, id: `ADJ-${String(highest + 1).padStart(4, "0")}` }] };
    });
  }, []);

  const removeAdjustment = useCallback((id: string) => {
    setState((current) => ({ ...current, adjustments: current.adjustments.filter((item) => item.id !== id) }));
  }, []);

  const advanceRun = useCallback((key: string) => {
    setState((current) => {
      const now = current.runStatus[key] ?? defaultRunStatus(key.split(":")[1] ?? "");
      const next = RUN_FLOW[RUN_FLOW.indexOf(now) + 1];
      if (!next) return current;
      return {
        ...current,
        runStatus: { ...current.runStatus, [key]: next },
        postedAt: next === "posted" ? { ...current.postedAt, [key]: HR_TODAY } : current.postedAt,
      };
    });
  }, []);

  const submitLeave = useCallback<HrValue["submitLeave"]>((input) => {
    setState((current) => {
      const highest = current.leaves.reduce((max, item) => Math.max(max, Number(item.id.replace(/\D/g, "")) || 0), 0);
      const request: LeaveRequest = { ...input, id: `LV-${String(highest + 1).padStart(3, "0")}`, status: "pending", requestedAt: HR_TODAY };
      return { ...current, leaves: [request, ...current.leaves] };
    });
  }, []);

  const decideLeave = useCallback((id: string, status: Exclude<LeaveStatus, "pending">) => {
    setState((current) => ({
      ...current,
      leaves: current.leaves.map((item) => (item.id === id ? { ...item, status } : item)),
    }));
  }, []);

  const toggleExcused = useCallback((empId: string, date: string) => {
    setState((current) => {
      const key = `${empId}:${date}`;
      const excused = { ...current.excused };
      if (excused[key]) delete excused[key];
      else excused[key] = true;
      return { ...current, excused };
    });
  }, []);

  const setRoster = useCallback((empId: string, weekday: number, cell: RosterCell) => {
    setState((current) => ({ ...current, roster: { ...current.roster, [`${empId}:${weekday}`]: cell } }));
  }, []);

  const syncDevice = useCallback((deviceId: string, currentMinutesAgo: number) => {
    setState((current) => ({ ...current, deviceSync: { ...current.deviceSync, [deviceId]: currentMinutesAgo } }));
  }, []);

  const setRole = useCallback((empId: string, role: RoleId) => {
    setState((current) => ({
      ...current,
      roleOverrides: { ...current.roleOverrides, [empId]: role },
      moduleOverrides: { ...current.moduleOverrides, [empId]: {} },
    }));
  }, []);

  const setModuleAccess = useCallback((empId: string, module: ModuleId, allowed: boolean | null) => {
    setState((current) => {
      const mine = { ...(current.moduleOverrides[empId] ?? {}) };
      if (allowed === null) delete mine[module];
      else mine[module] = allowed;
      return { ...current, moduleOverrides: { ...current.moduleOverrides, [empId]: mine } };
    });
  }, []);

  const resetHr = useCallback(() => setState(INITIAL), []);

  const value = useMemo<HrValue>(
    () => ({
      ...state,
      ctx,
      runs,
      runStatusOf,
      postedPayroll,
      addAdjustment,
      removeAdjustment,
      advanceRun,
      submitLeave,
      decideLeave,
      toggleExcused,
      setRoster,
      syncDevice,
      setRole,
      setModuleAccess,
      resetHr,
      hydrated,
    }),
    [state, ctx, runs, runStatusOf, postedPayroll, addAdjustment, removeAdjustment, advanceRun, submitLeave, decideLeave, toggleExcused, setRoster, syncDevice, setRole, setModuleAccess, resetHr, hydrated],
  );

  return <HrContextValue.Provider value={value}>{children}</HrContextValue.Provider>;
}

export function useHr(): HrValue {
  const context = useContext(HrContextValue);
  if (!context) throw new Error("useHr must be used inside an HrProvider");
  return context;
}

export { DEVICES };
export type { RealBranch };
