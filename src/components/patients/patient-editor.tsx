"use client";

import { forwardRef, useEffect, useMemo, type InputHTMLAttributes } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldPath } from "react-hook-form";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { SelectField } from "@/components/ui/select-field";
import { PageHeading } from "@/components/shared/page-heading";
import { AccessDeniedNotice } from "@/components/modules/access-denied-notice";
import { useClinicData } from "@/services/clinic-data-provider";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { ROLE_BRANCH_SCOPE, canManagePatients } from "@/lib/config/roles";
import { BRANCHES } from "@/lib/mock/branches";
import { messages } from "@/lib/i18n/messages";
import { cn } from "@/lib/utils";
import { patientSchema, type PatientFormValues } from "@/features/patients/schemas/patient.schema";
import type { ClinicPatient, NewPatientInput } from "@/types";

export function PatientEditor({ patientId }: { patientId?: string }) {
  const router = useRouter();
  const { locale, role, branchId } = useWorkspace();
  const { patients, hydrated, createPatient, updatePatient } = useClinicData();
  const assignedBranch = ROLE_BRANCH_SCOPE[role];
  const patient = patientId
    ? patients.find((item) => item.id === patientId && (!assignedBranch || item.branchId === assignedBranch))
    : undefined;
  const isEdit = Boolean(patientId);
  const t = messages[locale].clinic.patientForm;
  const common = messages[locale].clinic.common as Record<string, string>;
  const BackIcon = locale === "ar" ? ArrowRight : ArrowLeft;

  const defaults = useMemo<PatientFormValues>(
    () => ({
      nameAr: patient?.nameAr ?? "",
      nameEn: patient?.nameEn ?? "",
      phone: patient?.phone ?? "",
      email: patient?.email ?? "",
      gender: patient?.gender ?? "female",
      dateOfBirth: patient?.dateOfBirth ?? "",
      branchId: patient?.branchId ?? assignedBranch ?? (branchId === "all" ? "ghadeer" : branchId),
      status: patient?.status ?? "active",
      emergencyContact: patient?.emergencyContact ?? "",
      diagnosisAr: patient?.diagnosisAr ?? "",
      allergiesAr: patient?.allergiesAr === "لا يوجد" || patient?.allergiesEn === "None reported"
        ? ""
        : patient?.allergiesAr ?? "",
    }),
    [assignedBranch, branchId, patient],
  );

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  if (!canManagePatients(role)) {
    return <AccessDeniedNotice title={locale === "ar" ? "إضافة أو تعديل ملف مريض" : "Create or edit patient profiles"} />;
  }

  if (isEdit && !patient && !hydrated) {
    return <div className="feature-page"><div className="page-loading">{messages[locale].clinic.common.loading}</div></div>;
  }

  if (isEdit && !patient) {
    return (
      <div className="feature-page">
        <PageHeading title={t.notFound} />
        <Button variant="outline" onClick={() => router.push(`/${locale}/patients`)}>
          <BackIcon size={16} />
          {messages[locale].clinic.profile.back}
        </Button>
      </div>
    );
  }

  function errorFor(field: FieldPath<PatientFormValues>) {
    const message = errors[field]?.message;
    return typeof message === "string" ? common[message] ?? common.required : undefined;
  }

  function onSubmit(values: PatientFormValues) {
    const normalizedEmail = values.email.trim().toLocaleLowerCase();
    const duplicatePhone = patients.some(
      (item) => item.id !== patientId && item.phone.replace(/\D/g, "") === values.phone.replace(/\D/g, ""),
    );
    if (duplicatePhone) {
      setError("phone", { type: "manual", message: "phoneDuplicate" });
      return;
    }
    if (normalizedEmail && patients.some((item) => item.id !== patientId && item.email.toLocaleLowerCase() === normalizedEmail)) {
      setError("email", { type: "manual", message: "emailDuplicate" });
      return;
    }

    const input: NewPatientInput = {
      nameAr: values.nameAr.trim(),
      nameEn: values.nameEn?.trim() || values.nameAr.trim(),
      phone: values.phone.trim(),
      email: normalizedEmail,
      gender: values.gender,
      dateOfBirth: values.dateOfBirth,
      branchId: assignedBranch ?? values.branchId,
      status: values.status,
      diagnosisAr: values.diagnosisAr?.trim() || "غير مسجل",
      diagnosisEn: values.diagnosisAr?.trim() || "Not recorded",
      allergiesAr: values.allergiesAr?.trim() || "لا يوجد",
      allergiesEn: values.allergiesAr?.trim() || "None reported",
      emergencyContact: values.emergencyContact?.trim() || "",
    };

    let savedPatient: ClinicPatient;
    if (patient) {
      updatePatient(patient.id, input);
      savedPatient = { ...patient, ...input };
    } else {
      savedPatient = createPatient(input);
    }
    router.push(`/${locale}/patients/${savedPatient.id}`);
  }

  return (
    <div className="feature-page feature-form-page">
      <PageHeading
        eyebrow={messages[locale].nav.patients}
        title={isEdit ? t.editTitle : t.newTitle}
        description={isEdit ? t.editSubtitle : t.newSubtitle}
      />

      <form className="patient-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Panel className="form-panel">
          <div className="form-section-heading">
            <span className="form-section-number">01</span>
            <div>
              <h2>{t.identitySection}</h2>
              <p>{t.requiredNote}</p>
            </div>
          </div>
          <div className="form-grid">
            <FormInput
              label={t.arabicName}
              required
              dir="rtl"
              error={errorFor("nameAr")}
              {...register("nameAr")}
            />
            <FormInput
              label={t.englishName}
              dir="ltr"
              error={errorFor("nameEn")}
              {...register("nameEn")}
            />
            <FormInput
              label={t.dateOfBirth}
              type="date"
              required
              error={errorFor("dateOfBirth")}
              {...register("dateOfBirth")}
            />
            <div className="form-field">
              <SelectField label={`${t.gender} *`} aria-invalid={Boolean(errors.gender)} {...register("gender")}>
                <option value="">{t.selectGender}</option>
                <option value="female">{t.female}</option>
                <option value="male">{t.male}</option>
              </SelectField>
              {errorFor("gender") ? <span className="form-error">{errorFor("gender")}</span> : null}
            </div>
          </div>
        </Panel>

        <Panel className="form-panel">
          <div className="form-section-heading">
            <span className="form-section-number">02</span>
            <div>
              <h2>{t.contactSection}</h2>
              <p>{locale === "ar" ? "وسيلة تواصل أساسية وتفاصيل للطوارئ." : "A primary contact method and emergency details."}</p>
            </div>
          </div>
          <div className="form-grid">
            <FormInput
              label={t.phone}
              type="tel"
              required
              dir="ltr"
              placeholder="05xxxxxxxx"
              error={errorFor("phone")}
              {...register("phone")}
            />
            <FormInput
              label={t.email}
              type="email"
              dir="ltr"
              error={errorFor("email")}
              {...register("email")}
            />
            <FormInput
              label={t.emergencyContact}
              type="tel"
              dir="ltr"
              placeholder="05xxxxxxxx"
              error={errorFor("emergencyContact")}
              {...register("emergencyContact")}
            />
          </div>
        </Panel>

        <Panel className="form-panel">
          <div className="form-section-heading">
            <span className="form-section-number">03</span>
            <div>
              <h2>{t.careSection}</h2>
              <p>{locale === "ar" ? "معلومات تنظيمية وصحية أولية فقط." : "Basic administrative and health information only."}</p>
            </div>
          </div>
          <div className="form-grid">
            <div className="form-field">
              <SelectField
                label={`${t.branch} *`}
                disabled={Boolean(assignedBranch)}
                aria-invalid={Boolean(errors.branchId)}
                {...register("branchId")}
              >
                {assignedBranch ? null : <option value="">{t.selectBranch}</option>}
                {BRANCHES.filter((branch) => !assignedBranch || branch.id === assignedBranch).map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {locale === "ar" ? branch.nameAr : branch.nameEn}
                  </option>
                ))}
              </SelectField>
              {errorFor("branchId") ? <span className="form-error">{errorFor("branchId")}</span> : null}
            </div>
            {isEdit ? (
              <div className="form-field">
                <SelectField label={`${t.status} *`} aria-invalid={Boolean(errors.status)} {...register("status")}>
                  <option value="active">{t.active}</option>
                  <option value="inactive">{t.inactive}</option>
                </SelectField>
                {errorFor("status") ? <span className="form-error">{errorFor("status")}</span> : null}
              </div>
            ) : null}
            <FormInput
              label={t.diagnosis}
              error={errorFor("diagnosisAr")}
              {...register("diagnosisAr")}
            />
            <FormInput
              label={t.allergies}
              error={errorFor("allergiesAr")}
              {...register("allergiesAr")}
            />
          </div>
        </Panel>

        <div className="form-footer-note">
          <ShieldCheck size={16} />
          <span>{t.privacyNote}</span>
        </div>
        <div className="form-actions">
          <Button type="submit" disabled={isSubmitting}>
            {isEdit ? t.updatePatient : t.savePatient}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push(patient ? `/${locale}/patients/${patient.id}` : `/${locale}/patients`)}>
            {t.cancel}
          </Button>
        </div>
      </form>
    </div>
  );
}

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(function FormInput(
  { label, error, required, className, ...props },
  ref,
) {
  return (
    <label className="form-field">
      <span className="form-label">
        {label}
        {required ? <i aria-hidden="true">*</i> : null}
      </span>
      <input
        ref={ref}
        className={cn("form-input", error && "form-input-error", className)}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error ? <span className="form-error">{error}</span> : null}
    </label>
  );
});
