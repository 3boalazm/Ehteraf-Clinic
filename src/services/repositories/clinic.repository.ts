import type { ClinicAppointment, ClinicPatient } from "@/types";
import { SEED_APPOINTMENTS, SEED_PATIENTS } from "@/lib/mock/clinic-seed";

const STORAGE_KEY = "ehteraf:clinic-data:v1";

export interface ClinicSnapshot {
  patients: ClinicPatient[];
  appointments: ClinicAppointment[];
}

export interface ClinicRepository {
  load(): ClinicSnapshot;
  save(snapshot: ClinicSnapshot): void;
}

/** Browser-backed mock adapter. Replace this adapter with an API repository later. */
export const mockClinicRepository: ClinicRepository = {
  load() {
    if (typeof window === "undefined") {
      return { patients: SEED_PATIENTS, appointments: SEED_APPOINTMENTS };
    }
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) return { patients: SEED_PATIENTS, appointments: SEED_APPOINTMENTS };
      const snapshot = JSON.parse(stored) as Partial<ClinicSnapshot>;
      if (Array.isArray(snapshot.patients) && Array.isArray(snapshot.appointments)) {
        return {
          patients: snapshot.patients,
          appointments: snapshot.appointments,
        };
      }
    } catch {
      // Fall back to seed data if local storage is disabled or malformed.
    }
    return { patients: SEED_PATIENTS, appointments: SEED_APPOINTMENTS };
  },

  save(snapshot) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // Session state continues to work when browser storage is unavailable.
    }
  },
};
