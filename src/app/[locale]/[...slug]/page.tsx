import { notFound } from "next/navigation";
import { ModulePlaceholder } from "@/components/modules/module-placeholder";
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
  if (!moduleId) notFound();

  return <ModulePlaceholder module={moduleId} path={path} />;
}
