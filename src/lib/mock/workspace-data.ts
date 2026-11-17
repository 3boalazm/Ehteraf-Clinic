import { CLINIC_SERVICES, CLINIC_THERAPISTS, DEMO_TODAY } from "@/lib/mock/clinic-seed";
import type { BranchId } from "@/types";
import type { WorkspaceKey } from "@/lib/i18n/workspace-copy";

export type WorkspaceStatus =
  | "active"
  | "pending"
  | "review"
  | "completed"
  | "draft"
  | "attention"
  | "unread"
  | "read"
  | "scheduled"
  | "inProgress"
  | "lowStock";

export interface WorkspaceRecord {
  id: string;
  titleAr: string;
  titleEn: string;
  detailAr: string;
  detailEn: string;
  categoryAr: string;
  categoryEn: string;
  status: WorkspaceStatus;
  branchId?: Exclude<BranchId, "all">;
  amount?: number;
  metric?: number;
  units?: number;
  audience?: number;
  valueAr?: string;
  valueEn?: string;
}

const BRANCH_IDS = ["ghadeer", "darAlbaida", "quwayiyah"] as const;

export function getWorkspaceRecords(key: WorkspaceKey): WorkspaceRecord[] {
  if (key === "services") {
    return CLINIC_SERVICES.map((service, index) => ({
      id: service.id.toUpperCase(),
      titleAr: service.nameAr,
      titleEn: service.nameEn,
      detailAr: `${service.durationMinutes} دقيقة · سعر عرض تجريبي`,
      detailEn: `${service.durationMinutes} minutes · demo price`,
      categoryAr: service.categoryAr,
      categoryEn: service.categoryEn,
      status: index === 5 ? "draft" : "active",
      amount: service.price,
      metric: service.durationMinutes,
      branchId: BRANCH_IDS[index % BRANCH_IDS.length],
    }));
  }

  if (key === "employees") {
    return CLINIC_THERAPISTS.map((staff, index) => ({
      id: `TEAM-${String(index + 1).padStart(2, "0")}`,
      titleAr: staff.nameAr,
      titleEn: staff.nameEn,
      detailAr: "عضو فريق تجريبي · التكليف غير معتمد",
      detailEn: "Demo team member · assignment unconfirmed",
      categoryAr: staff.specialtyAr,
      categoryEn: staff.specialtyEn,
      status: index === 4 ? "attention" : "active",
      branchId: staff.branchId,
      valueAr: "دوام تجريبي",
      valueEn: "Demo schedule",
    }));
  }

  const records: Partial<Record<WorkspaceKey, WorkspaceRecord[]>> = {
    clinical: [
      { id: "CLN-2048", titleAr: "مراجعة توثيق الجلسة", titleEn: "Session note review", detailAr: "رمز ملف تجريبي · لا توجد تفاصيل صحية", detailEn: "Demo record code · no health details", categoryAr: "توثيق سريري", categoryEn: "Clinical documentation", status: "review", branchId: "ghadeer", valueAr: "٣ حقول للتحقق", valueEn: "3 fields to verify" },
      { id: "CLN-2043", titleAr: "اعتماد ملخص زيارة", titleEn: "Visit summary approval", detailAr: "مراجعة اكتمال الحقول الإدارية", detailEn: "Administrative field-completeness review", categoryAr: "ملخص زيارة", categoryEn: "Visit summary", status: "pending", branchId: "darAlbaida", valueAr: "مستحق اليوم", valueEn: "Due today" },
      { id: "CLN-2037", titleAr: "مراجعة نموذج التقييم", titleEn: "Assessment form review", detailAr: "عنصر توضيحي مجهول الهوية", detailEn: "Anonymized illustrative item", categoryAr: "تقييم أولي", categoryEn: "Initial assessment", status: "completed", branchId: "quwayiyah", valueAr: "مكتمل", valueEn: "Completed" },
      { id: "CLN-2029", titleAr: "تدقيق خطة المتابعة", titleEn: "Follow-up plan audit", detailAr: "ينتظر اكتمال المراجعة", detailEn: "Awaiting final review", categoryAr: "متابعة", categoryEn: "Follow-up", status: "attention", branchId: "ghadeer", valueAr: "منذ يوم", valueEn: "1 day ago" },
      { id: "CLN-2022", titleAr: "مراجعة إغلاق جلسة", titleEn: "Session closure check", detailAr: "مراجعة سير العمل فقط", detailEn: "Workflow-only review", categoryAr: "إغلاق جلسة", categoryEn: "Session closure", status: "completed", branchId: "darAlbaida", valueAr: "مكتمل", valueEn: "Completed" },
    ],
    treatmentPlans: [
      { id: "PLAN-031", titleAr: "خطة تأهيل تجريبية 031", titleEn: "Demo rehabilitation plan 031", detailAr: "رمز ملف P-031 · ٦ من ١٢ جلسة", detailEn: "Record P-031 · 6 of 12 sessions", categoryAr: "قيد التنفيذ", categoryEn: "In progress", status: "inProgress", branchId: "ghadeer", metric: 50, units: 12, valueAr: "٦ / ١٢ جلسة", valueEn: "6 / 12 sessions" },
      { id: "PLAN-027", titleAr: "خطة تأهيل تجريبية 027", titleEn: "Demo rehabilitation plan 027", detailAr: "رمز ملف P-027 · ٤ من ٨ جلسات", detailEn: "Record P-027 · 4 of 8 sessions", categoryAr: "قيد التنفيذ", categoryEn: "In progress", status: "inProgress", branchId: "darAlbaida", metric: 50, units: 8, valueAr: "٤ / ٨ جلسات", valueEn: "4 / 8 sessions" },
      { id: "PLAN-022", titleAr: "خطة تأهيل تجريبية 022", titleEn: "Demo rehabilitation plan 022", detailAr: "رمز ملف P-022 · مراجعة إدارية", detailEn: "Record P-022 · administrative review", categoryAr: "بانتظار المراجعة", categoryEn: "Awaiting review", status: "review", branchId: "quwayiyah", metric: 72, units: 10, valueAr: "مراجعة ٧٢٪", valueEn: "72% reviewed" },
      { id: "PLAN-018", titleAr: "خطة تأهيل تجريبية 018", titleEn: "Demo rehabilitation plan 018", detailAr: "رمز ملف P-018 · اكتمل المسار", detailEn: "Record P-018 · pathway complete", categoryAr: "مكتملة", categoryEn: "Completed", status: "completed", branchId: "ghadeer", metric: 100, units: 8, valueAr: "٨ / ٨ جلسات", valueEn: "8 / 8 sessions" },
    ],
    packages: [
      { id: "PKG-008", titleAr: "باقة متابعة — ٨ جلسات", titleEn: "Follow-up bundle · 8 sessions", detailAr: "صلاحية توضيحية · ٩٠ يوماً", detailEn: "Illustrative validity · 90 days", categoryAr: "باقة جلسات", categoryEn: "Session bundle", status: "active", amount: 1800, metric: 8 },
      { id: "PKG-012", titleAr: "باقة تأهيل — ١٢ جلسة", titleEn: "Rehabilitation bundle · 12 sessions", detailAr: "صلاحية توضيحية · ١٢٠ يوماً", detailEn: "Illustrative validity · 120 days", categoryAr: "باقة جلسات", categoryEn: "Session bundle", status: "active", amount: 2520, metric: 12 },
      { id: "PKG-004", titleAr: "جلسات تمهيدية — ٤ جلسات", titleEn: "Starter bundle · 4 sessions", detailAr: "مسودة عرض غير معتمد", detailEn: "Unapproved offer draft", categoryAr: "باقة تمهيدية", categoryEn: "Starter bundle", status: "draft", amount: 960, metric: 4 },
      { id: "PKG-006", titleAr: "باقة رياضية — ٦ جلسات", titleEn: "Sports bundle · 6 sessions", detailAr: "مراجعة نطاق الاستخدام", detailEn: "Usage scope under review", categoryAr: "باقة تخصصية", categoryEn: "Specialty bundle", status: "review", amount: 1740, metric: 6 },
    ],
    finance: [
      { id: "INV-D-0841", titleAr: "فاتورة تجريبية 0841", titleEn: "Demo invoice 0841", detailAr: "حساب تجريبي · تستحق ٢١ نوفمبر", detailEn: "Demo account · due Nov 21", categoryAr: "فاتورة جلسات", categoryEn: "Session invoice", status: "pending", branchId: "ghadeer", amount: 750 },
      { id: "INV-D-0836", titleAr: "فاتورة تجريبية 0836", titleEn: "Demo invoice 0836", detailAr: "حساب تجريبي · مستحقة اليوم", detailEn: "Demo account · due today", categoryAr: "فاتورة خدمات", categoryEn: "Service invoice", status: "attention", branchId: "darAlbaida", amount: 1250 },
      { id: "INV-D-0828", titleAr: "فاتورة تجريبية 0828", titleEn: "Demo invoice 0828", detailAr: "تم تسجيل التحصيل محلياً", detailEn: "Collection recorded locally", categoryAr: "دفعة مسجلة", categoryEn: "Payment recorded", status: "completed", branchId: "quwayiyah", amount: 500 },
      { id: "INV-D-0821", titleAr: "فاتورة تجريبية 0821", titleEn: "Demo invoice 0821", detailAr: "بانتظار مطابقة الدفعة", detailEn: "Awaiting payment reconciliation", categoryAr: "مطابقة مالية", categoryEn: "Reconciliation", status: "review", branchId: "ghadeer", amount: 980 },
      { id: "INV-D-0814", titleAr: "فاتورة تجريبية 0814", titleEn: "Demo invoice 0814", detailAr: "تم السداد في هذا النموذج", detailEn: "Paid in this prototype", categoryAr: "مدفوعة", categoryEn: "Paid", status: "completed", branchId: "darAlbaida", amount: 640 },
    ],
    inventory: [
      { id: "SUP-031", titleAr: "أشرطة مقاومة", titleEn: "Resistance bands", detailAr: "حد إعادة الطلب: ٢٠ وحدة", detailEn: "Reorder threshold: 20 units", categoryAr: "مستلزمات تمرين", categoryEn: "Exercise supplies", status: "active", branchId: "ghadeer", metric: 48, valueAr: "٤٨ وحدة", valueEn: "48 units" },
      { id: "SUP-027", titleAr: "حصائر تمارين", titleEn: "Exercise mats", detailAr: "حد إعادة الطلب: ١٥ وحدة", detailEn: "Reorder threshold: 15 units", categoryAr: "مستلزمات تشغيل", categoryEn: "Operating supplies", status: "lowStock", branchId: "darAlbaida", metric: 9, valueAr: "٩ وحدات", valueEn: "9 units" },
      { id: "SUP-022", titleAr: "كرات علاجية", titleEn: "Therapy balls", detailAr: "متاح في الفرع المحدد", detailEn: "Available at selected branch", categoryAr: "معدات خفيفة", categoryEn: "Light equipment", status: "active", branchId: "quwayiyah", metric: 22, valueAr: "٢٢ وحدة", valueEn: "22 units" },
      { id: "SUP-018", titleAr: "كمادات باردة قابلة لإعادة الاستخدام", titleEn: "Reusable cold packs", detailAr: "طلب توريد قيد المتابعة", detailEn: "Restock request in progress", categoryAr: "مستلزمات تشغيل", categoryEn: "Operating supplies", status: "pending", branchId: "ghadeer", metric: 12, valueAr: "١٢ وحدة", valueEn: "12 units" },
      { id: "SUP-011", titleAr: "أوزان يد خفيفة", titleEn: "Light hand weights", detailAr: "مراجعة حالة الأصل", detailEn: "Asset condition review", categoryAr: "معدات خفيفة", categoryEn: "Light equipment", status: "review", branchId: "darAlbaida", metric: 16, valueAr: "١٦ وحدة", valueEn: "16 units" },
    ],
    procurement: [
      { id: "PO-D-143", titleAr: "طلب مستلزمات تمرين", titleEn: "Exercise supplies order", detailAr: "مورد عرض · متوقع ٢٢ نوفمبر", detailEn: "Demo supplier · expected Nov 22", categoryAr: "طلب شراء", categoryEn: "Purchase order", status: "pending", branchId: "ghadeer", amount: 4200 },
      { id: "PO-D-137", titleAr: "طلب تجهيز فرع", titleEn: "Branch equipment order", detailAr: "بانتظار اعتماد الموازنة", detailEn: "Awaiting budget approval", categoryAr: "طلب اعتماد", categoryEn: "Approval request", status: "review", branchId: "darAlbaida", amount: 7800 },
      { id: "PO-D-131", titleAr: "طلب مواد تشغيل", titleEn: "Operating materials order", detailAr: "استلم جزئياً في العرض", detailEn: "Partially received in demo", categoryAr: "توريد جزئي", categoryEn: "Partial delivery", status: "inProgress", branchId: "quwayiyah", amount: 2350 },
      { id: "PO-D-124", titleAr: "طلب صيانة معدات", titleEn: "Equipment maintenance order", detailAr: "اكتمل الاستلام التجريبي", detailEn: "Demo receipt complete", categoryAr: "استلام", categoryEn: "Received", status: "completed", branchId: "ghadeer", amount: 1650 },
    ],
    reports: [
      { id: "RPT-112", titleAr: "ملخص أداء الفروع", titleEn: "Branch performance summary", detailAr: "مؤشرات مجمعة · أسبوعي", detailEn: "Aggregate indicators · weekly", categoryAr: "تشغيل", categoryEn: "Operations", status: "completed", metric: 92, valueAr: "تم التحديث اليوم", valueEn: "Updated today" },
      { id: "RPT-108", titleAr: "اتجاه المواعيد", titleEn: "Appointment trends", detailAr: "آخر ٦ أشهر · بيانات عرض", detailEn: "Last 6 months · demo data", categoryAr: "مواعيد", categoryEn: "Appointments", status: "active", metric: 84, valueAr: "جاهز للعرض", valueEn: "Ready to view" },
      { id: "RPT-103", titleAr: "ملخص التحصيل", titleEn: "Collections overview", detailAr: "تقرير مالي اصطناعي", detailEn: "Synthetic financial report", categoryAr: "مالية", categoryEn: "Finance", status: "scheduled", valueAr: "الاثنين · ٩:٠٠ ص", valueEn: "Monday · 9:00 AM" },
      { id: "RPT-097", titleAr: "إشغال الجداول", titleEn: "Schedule utilization", detailAr: "مقارنة بين الفروع", detailEn: "Branch comparison", categoryAr: "موارد", categoryEn: "Capacity", status: "review", metric: 76, valueAr: "بانتظار المراجعة", valueEn: "Awaiting review" },
    ],
    marketing: [
      { id: "CMP-024", titleAr: "رسالة توعوية تجريبية", titleEn: "Demo education campaign", detailAr: "قناة داخلية · لا يتم إرسالها", detailEn: "Internal channel · not sent", categoryAr: "محتوى توعوي", categoryEn: "Education content", status: "active", metric: 6.8, audience: 2400, valueAr: "وصول ٢٫٤ ألف", valueEn: "2.4k estimated reach" },
      { id: "CMP-019", titleAr: "تحديث ساعات العمل", titleEn: "Opening hours update", detailAr: "مسودة للمراجعة", detailEn: "Draft awaiting review", categoryAr: "تحديث تشغيلي", categoryEn: "Operations update", status: "draft", metric: 0, valueAr: "غير منشورة", valueEn: "Not published" },
      { id: "CMP-016", titleAr: "برنامج العودة للمتابعة", titleEn: "Follow-up return program", detailAr: "رسالة توضيحية غير موجهة لأشخاص", detailEn: "Illustrative message not sent to anyone", categoryAr: "متابعة عامة", categoryEn: "General follow-up", status: "review", metric: 4.2, audience: 1200, valueAr: "تفاعل ٤٫٢٪", valueEn: "4.2% engagement" },
      { id: "CMP-011", titleAr: "تعريف بالخدمات", titleEn: "Services overview", detailAr: "حملة تجريبية مكتملة", detailEn: "Completed demo campaign", categoryAr: "خدمات", categoryEn: "Services", status: "completed", metric: 8.1, audience: 1800, valueAr: "وصول ١٫٨ ألف", valueEn: "1.8k estimated reach" },
    ],
    notifications: [
      { id: "NTF-019", titleAr: "موعد تجريبي يحتاج إلى تأكيد", titleEn: "Demo appointment needs confirmation", detailAr: "مواعيد · الفرع المحدد", detailEn: "Appointments · selected branch", categoryAr: "موعد", categoryEn: "Appointment", status: "unread", branchId: "ghadeer", valueAr: "منذ ١٢ دقيقة", valueEn: "12 minutes ago" },
      { id: "NTF-016", titleAr: "مراجعة عنصر توثيق", titleEn: "Documentation item for review", detailAr: "مهام تشغيلية · بيانات مجهولة", detailEn: "Operations task · anonymized demo", categoryAr: "مهمة", categoryEn: "Task", status: "unread", branchId: "darAlbaida", valueAr: "منذ ٤٥ دقيقة", valueEn: "45 minutes ago" },
      { id: "NTF-012", titleAr: "تم تجهيز ملخص الأداء", titleEn: "Performance summary is ready", detailAr: "التقارير · ملف عرض", detailEn: "Reports · demo file", categoryAr: "تقرير", categoryEn: "Report", status: "read", valueAr: "أمس", valueEn: "Yesterday" },
      { id: "NTF-009", titleAr: "مراجعة طلب توريد", titleEn: "Supply request review", detailAr: "المشتريات · انتظار الموافقة", detailEn: "Procurement · approval pending", categoryAr: "مخزون", categoryEn: "Inventory", status: "unread", branchId: "quwayiyah", valueAr: "أمس", valueEn: "Yesterday" },
      { id: "NTF-004", titleAr: "تم تحديث كتالوج الخدمة", titleEn: "Service catalog updated", detailAr: "الخدمات · بيانات عرض", detailEn: "Services · demo data", categoryAr: "خدمات", categoryEn: "Services", status: "read", valueAr: "منذ يومين", valueEn: "2 days ago" },
    ],
  };

  return (records[key] ?? []).map((record) => ({ ...record }));
}

export const DEMO_TODAY_LABEL = DEMO_TODAY;
