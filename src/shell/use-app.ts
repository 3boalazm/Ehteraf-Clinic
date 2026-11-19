"use client";

import { messages } from "@/lib/i18n/messages";
import { useWorkspace } from "@/state/workspace-provider";

/** Workspace state + the active locale's copy + a locale-aware href builder. */
export function useApp() {
  const workspace = useWorkspace();
  const t = messages[workspace.locale];
  const ar = workspace.locale === "ar";
  const href = (path: string) => `/${workspace.locale}${path}`;
  const pick = (arabic: string, english: string) => (ar ? arabic : english || arabic);
  return { ...workspace, t, ar, href, pick };
}
