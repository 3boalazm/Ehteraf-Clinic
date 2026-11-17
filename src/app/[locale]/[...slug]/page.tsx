import { notFound } from "next/navigation";
import { ModuleGate } from "@/components/modules/module-gate";
import { ModuleWorkspacePage } from "@/components/modules/module-workspace";
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
  if (!moduleId || moduleId === "appointments" || moduleId === "patients") notFound();

  return (
    <ModuleGate module={moduleId} path={path}>
      <ModuleWorkspacePage key={path} module={moduleId} path={path} />
    </ModuleGate>
  );
}
