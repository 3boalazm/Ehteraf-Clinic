import { BRANCHES } from "@/lib/mock/branches";
import { CLINIC_SERVICES, CLINIC_THERAPISTS } from "@/lib/mock/clinic-seed";
import type { BranchId, Locale, ServiceFilter } from "@/types";

export function getBranchName(branchId: BranchId, locale: Locale): string {
  if (branchId === "all") {
    return locale === "ar" ? "كل الفروع" : "All branches";
  }
  const branch = BRANCHES.find((item) => item.id === branchId);
  return branch ? (locale === "ar" ? branch.nameAr : branch.nameEn) : "";
}

export function getServiceName(serviceId: string, locale: Locale): string {
  const service = CLINIC_SERVICES.find((item) => item.id === serviceId);
  if (!service) return locale === "ar" ? "خدمة علاجية" : "Therapy service";
  return locale === "ar" ? service.nameAr : service.nameEn;
}

export function matchesServiceFilter(serviceId: string, filter: ServiceFilter): boolean {
  if (filter === "all") return true;
  const service = CLINIC_SERVICES.find((item) => item.id === serviceId);
  if (!service) return false;
  const category = service.categoryEn.toLocaleLowerCase("en-US");
  const categoryKeyword = {
    orthopedic: "orthopedic",
    sports: "sports",
    neurological: "neurological",
  }[filter];
  return category.includes(categoryKeyword);
}

export function getTherapistName(therapistId: string, locale: Locale): string {
  const therapist = CLINIC_THERAPISTS.find((item) => item.id === therapistId);
  if (!therapist) return locale === "ar" ? "غير محدد" : "Unassigned";
  return locale === "ar" ? therapist.nameAr : therapist.nameEn;
}

export function formatClinicDate(
  value: string,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" },
): string {
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", options).format(date);
}

export function formatClinicMonth(value: string, locale: Locale): string {
  return formatClinicDate(value, locale, { month: "long", year: "numeric" });
}

export function getPatientAge(dateOfBirth: string): number {
  const birthDate = new Date(`${dateOfBirth}T12:00:00Z`);
  const today = new Date(`${new Date().toISOString().slice(0, 10)}T12:00:00Z`);
  let age = today.getUTCFullYear() - birthDate.getUTCFullYear();
  const monthDiff = today.getUTCMonth() - birthDate.getUTCMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getUTCDate() < birthDate.getUTCDate())) {
    age -= 1;
  }
  return Math.max(0, age);
}

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}
