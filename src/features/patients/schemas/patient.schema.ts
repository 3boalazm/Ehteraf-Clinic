import { z } from "zod";

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

const today = new Date().toISOString().slice(0, 10);

export const patientSchema = z.object({
  nameAr: z.string().trim().min(2, "required").max(90, "nameTooLong"),
  nameEn: z.string().trim().max(90, "nameTooLong").optional().or(z.literal("")),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s()-]{9,18}$/, "phoneInvalid"),
  email: z
    .string()
    .trim()
    .refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), "emailInvalid"),
  gender: z.enum(["male", "female"], { message: "required" }),
  dateOfBirth: z
    .string()
    .refine(isValidDate, "dateInvalid")
    .refine((value) => value <= today, "birthDateFuture"),
  branchId: z.enum(["ghadeer", "darAlbaida", "quwayiyah"], { message: "required" }),
  status: z.enum(["active", "inactive"], { message: "required" }),
  emergencyContact: z.string().trim().max(18, "phoneInvalid").optional().or(z.literal("")),
  diagnosisAr: z.string().trim().max(120, "nameTooLong").optional().or(z.literal("")),
  allergiesAr: z.string().trim().max(120, "nameTooLong").optional().or(z.literal("")),
});

export type PatientFormValues = z.infer<typeof patientSchema>;
