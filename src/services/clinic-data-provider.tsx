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
import { SEED_APPOINTMENTS, SEED_PATIENTS, CLINIC_SERVICES } from "@/lib/mock/clinic-seed";
import { mockClinicRepository } from "@/services/repositories/clinic.repository";
import type {
  AppointmentStatus,
  ClinicAppointment,
  ClinicPatient,
  NewAppointmentInput,
  NewPatientInput,
} from "@/types";

interface ClinicDataValue {
  patients: ClinicPatient[];
  appointments: ClinicAppointment[];
  hydrated: boolean;
  createPatient: (input: NewPatientInput) => ClinicPatient;
  updatePatient: (patientId: string, input: Partial<NewPatientInput>) => void;
  createAppointment: (input: NewAppointmentInput) => ClinicAppointment;
  updateAppointment: (appointmentId: string, input: NewAppointmentInput) => void;
  updateAppointmentStatus: (appointmentId: string, status: AppointmentStatus) => void;
  resetDemoData: () => void;
}

const ClinicDataContext = createContext<ClinicDataValue | null>(null);

export function ClinicDataProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<ClinicPatient[]>(SEED_PATIENTS);
  const [appointments, setAppointments] = useState<ClinicAppointment[]>(SEED_APPOINTMENTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const snapshot = mockClinicRepository.load();
    setPatients(snapshot.patients);
    setAppointments(snapshot.appointments);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    mockClinicRepository.save({ patients, appointments });
  }, [appointments, hydrated, patients]);

  const createPatient = useCallback(
    (input: NewPatientInput) => {
      const nextSerial = patients.reduce((max, patient) => {
        const serial = Number(patient.id.replace(/\D/g, ""));
        return Number.isFinite(serial) ? Math.max(max, serial) : max;
      }, 123) + 1;
      const patient: ClinicPatient = {
        ...input,
        id: `EH-${String(nextSerial).padStart(5, "0")}`,
        createdAt: new Date().toISOString().slice(0, 10),
        lastVisit: null,
        sessionsTotal: 0,
        sessionsRemaining: 0,
        episodes: [],
      };
      setPatients((current) => [patient, ...current]);
      return patient;
    },
    [patients],
  );

  const updatePatient = useCallback(
    (patientId: string, input: Partial<NewPatientInput>) => {
      setPatients((current) =>
        current.map((patient) =>
          patient.id === patientId ? { ...patient, ...input } : patient,
        ),
      );
    },
    [],
  );

  const createAppointment = useCallback(
    (input: NewAppointmentInput) => {
      const service = CLINIC_SERVICES.find((item) => item.id === input.serviceId);
      const appointment: ClinicAppointment = {
        ...input,
        id: `APT-${Date.now()}-${appointments.length + 1}`,
        durationMinutes: service?.durationMinutes ?? 45,
        status: "confirmed",
        createdAt: new Date().toISOString(),
      };
      setAppointments((current) => [appointment, ...current]);
      return appointment;
    },
    [appointments.length],
  );

  const updateAppointment = useCallback(
    (appointmentId: string, input: NewAppointmentInput) => {
      const service = CLINIC_SERVICES.find((item) => item.id === input.serviceId);
      setAppointments((current) => current.map((appointment) =>
        appointment.id === appointmentId
          ? { ...appointment, ...input, durationMinutes: service?.durationMinutes ?? appointment.durationMinutes }
          : appointment,
      ));
    },
    [],
  );

  const updateAppointmentStatus = useCallback(
    (appointmentId: string, status: AppointmentStatus) => {
      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === appointmentId ? { ...appointment, status } : appointment,
        ),
      );
    },
    [],
  );

  const resetDemoData = useCallback(() => {
    setPatients(SEED_PATIENTS);
    setAppointments(SEED_APPOINTMENTS);
  }, []);

  const value = useMemo(
    () => ({
      patients,
      appointments,
      hydrated,
      createPatient,
      updatePatient,
      createAppointment,
      updateAppointment,
      updateAppointmentStatus,
      resetDemoData,
    }),
    [
      appointments,
      createAppointment,
      createPatient,
      hydrated,
      patients,
      resetDemoData,
      updateAppointment,
      updateAppointmentStatus,
      updatePatient,
    ],
  );

  return <ClinicDataContext.Provider value={value}>{children}</ClinicDataContext.Provider>;
}

export function useClinicData(): ClinicDataValue {
  const context = useContext(ClinicDataContext);
  if (!context) {
    throw new Error("useClinicData must be used inside a ClinicDataProvider");
  }
  return context;
}
