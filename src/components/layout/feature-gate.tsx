"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { LockKeyhole, MoveUpLeft } from "lucide-react";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { Button } from "@/design-system/button";
import { Card } from "@/design-system/card";
import { messages } from "@/lib/i18n/messages";
import { canAccessModule } from "@/lib/config/roles";
import type { ModuleId } from "@/types";

export function FeatureGate({
  module,
  children,
}: {
  module: ModuleId;
  children: ReactNode;
}) {
  const { locale, role } = useWorkspace();
  if (canAccessModule(role, module)) return <>{children}</>;
  const t = messages[locale].modules;
  return (
    <section className="mx-auto max-w-3xl py-14" aria-labelledby="access-title">
      <Card className="grid justify-items-center gap-4 px-6 py-14 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-warning-soft text-warning">
          <LockKeyhole size={20} />
        </span>
        <div>
          <h1 id="access-title" className="text-2xl font-semibold text-ink">
            {t.accessDeniedTitle}
          </h1>
          <p className="mt-2 text-sm text-muted">{t.accessDenied}</p>
        </div>
        <Link href={`/${locale}/dashboard`}>
          <Button variant="outline">
            <MoveUpLeft size={15} />
            {messages[locale].app.backToDashboard}
          </Button>
        </Link>
        <p className="max-w-md text-xs text-muted">
          {locale === "ar"
            ? "محاكاة للصلاحيات في نموذج العرض فقط؛ لا تمثل إجراءً أمنيًا فعليًا."
            : "Demo role-based visibility only; this is not an actual security control."}
        </p>
      </Card>
    </section>
  );
}
