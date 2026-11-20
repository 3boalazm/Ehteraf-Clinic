import { notFound } from "next/navigation";
import { FeatureGate } from "@/shell/app-shell";
import { WorkspacePage } from "@/features/workspaces/workspace";
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
      <WorkspacePage key={path} path={path} />
    </FeatureGate>
  );
}
