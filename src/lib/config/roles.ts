import type { BranchId, ModuleId, RoleId } from "@/types";

export const ROLE_IDS: RoleId[] = [
  "owner",
  "branchManager",
  "receptionist",
  "therapist",
  "medicalSupervisor",
  "accountant",
  "hrManager",
  "inventoryManager",
  "marketing",
];

export const ROLE_BRANCH_SCOPE: Partial<Record<RoleId, Exclude<BranchId, "all">>> = {
  branchManager: "ghadeer",
  receptionist: "ghadeer",
  therapist: "ghadeer",
};

export const ROLE_ACCESS: Record<RoleId, ModuleId[]> = {
  owner: [
    "branches",
    "appointments",
    "patients",
    "clinical",
    "services",
    "finance",
    "inventory",
    "employees",
    "reports",
    "marketing",
    "notifications",
    "settings",
  ],
  branchManager: [
    "branches",
    "appointments",
    "patients",
    "clinical",
    "services",
    "finance",
    "inventory",
    "employees",
    "reports",
    "notifications",
  ],
  receptionist: ["appointments", "patients", "notifications"],
  therapist: ["appointments", "patients", "clinical", "notifications"],
  medicalSupervisor: ["patients", "clinical", "reports", "notifications"],
  accountant: ["finance", "reports", "notifications"],
  hrManager: ["employees", "reports", "notifications"],
  inventoryManager: ["inventory", "notifications"],
  marketing: ["marketing", "reports", "notifications"],
};

export function canAccessModule(role: RoleId, module: ModuleId): boolean {
  return ROLE_ACCESS[role].includes(module);
}

export function canManagePatients(role: RoleId): boolean {
  return role === "owner" || role === "branchManager" || role === "receptionist";
}

export function canBookAppointments(role: RoleId): boolean {
  return role === "owner" || role === "branchManager" || role === "receptionist";
}
