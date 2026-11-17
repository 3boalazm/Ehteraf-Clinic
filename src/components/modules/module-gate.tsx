"use client";

import type { ReactNode } from "react";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { ModulePlaceholder } from "@/components/modules/module-placeholder";
import { canAccessModule } from "@/lib/config/roles";
import type { ModuleId } from "@/types";

export function ModuleGate({
  module,
  path,
  children,
}: {
  module: ModuleId;
  path: string;
  children: ReactNode;
}) {
  const { role } = useWorkspace();
  if (!canAccessModule(role, module)) {
    return <ModulePlaceholder module={module} path={path} />;
  }
  return children;
}
