import { notFound } from "next/navigation";
import { FeatureGate } from "@/components/layout/feature-gate";
import { ModuleWorkspacePage } from "@/features/workspaces/module-workspace";
import { getModuleFromPath } from "@/lib/config/navigation";

export default async function ModuleRoute({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}) {
  const { locale, slug } = await params;
  if (locale !== "ar" && locale !== "en") notFound();
  const path = slug.join("/");
  const moduleId = getModuleFromPath(path);
  if (!moduleId || moduleId === "appointments" || moduleId === "patients")
    notFound();
  return (
    <FeatureGate module={moduleId}>
      <ModuleWorkspacePage key={path} module={moduleId} path={path} />
    </FeatureGate>
  );
}
