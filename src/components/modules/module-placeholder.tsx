"use client";

import { useRouter } from "next/navigation";
import { Layers, LockKeyhole, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { canAccessModule } from "@/lib/config/roles";
import { messages } from "@/lib/i18n/messages";
import type { ModuleId } from "@/types";

export function ModulePlaceholder({
  module,
  path,
}: {
  module: ModuleId;
  path: string;
}) {
  const router = useRouter();
  const { locale, role } = useWorkspace();
  const t = messages[locale];
  const canAccess = canAccessModule(role, module);
  const BackIcon = locale === "ar" ? ArrowRight : ArrowLeft;

  return (
    <div className="module-page">
      <Panel className={`module-card ${canAccess ? "" : "module-denied"}`}>
        <span className="module-icon">
          {canAccess ? <Layers size={25} strokeWidth={1.7} /> : <LockKeyhole size={24} />}
        </span>
        <span className="module-kicker">
          {canAccess ? t.modules.nextPhase : t.modules.accessDeniedTitle}
        </span>
        <h1>{canAccess ? t.modules[module] : t.modules.accessDeniedTitle}</h1>
        <p>
          {canAccess
            ? t.modules.comingSoonDescription
            : t.modules.accessDenied}
        </p>
        {canAccess ? <span className="module-path">/{path}</span> : null}
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
