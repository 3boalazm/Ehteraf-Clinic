"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { messages } from "@/lib/i18n/messages";

export function AccessDeniedNotice({
  title,
}: {
  title?: string;
}) {
  const router = useRouter();
  const { locale } = useWorkspace();
  const t = messages[locale];
  const BackIcon = locale === "ar" ? ArrowRight : ArrowLeft;

  return (
    <div className="module-page">
      <Panel className="module-card module-denied">
        <span className="module-icon"><LockKeyhole size={24} /></span>
        <span className="module-kicker">{t.modules.accessDeniedTitle}</span>
        <h1>{title ?? t.modules.accessDeniedTitle}</h1>
        <p>{t.modules.accessDenied}</p>
        <div className="module-button-wrap">
          <Button onClick={() => router.push(`/${locale}/dashboard`)}>
            <BackIcon size={16} />
            {t.app.backToDashboard}
          </Button>
        </div>
      </Panel>
    </div>
  );
}
