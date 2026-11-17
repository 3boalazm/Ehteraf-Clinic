import { z } from "zod";

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function isValidTime(value: string): boolean {
  if (!/^\d{2}:\d{2}$/.test(value)) return false;
  const [hours, minutes] = value.split(":").map(Number);
  return hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60;
}

export const appointmentSchema = z.object({
  patientId: z.string().min(1, "required"),
  branchId: z.enum(["ghadeer", "darAlbaida", "quwayiyah"], { message: "required" }),
  serviceId: z.string().min(1, "required"),
  therapistId: z.string().min(1, "required"),
  date: z.string().refine(isValidDate, "dateInvalid"),
  time: z.string().refine(isValidTime, "required"),
  visitType: z.enum(["clinic", "home"], { message: "required" }),
});

export type AppointmentFormValues = z.infer<typeof appointmentSchema>;
