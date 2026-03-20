import { supabase } from "@/integrations/supabase/client";

export type EmailPreferenceCategory = "marketing" | "recruitment";

export interface EmailPreferenceMap {
  marketing: boolean;
  recruitment: boolean;
}

export const DEFAULT_EMAIL_PREFERENCES: EmailPreferenceMap = {
  marketing: true,
  recruitment: true,
};

function isMissingEmailPreferencesTable(error: any) {
  return (
    error?.code === "PGRST205" ||
    error?.status === 404 ||
    String(error?.message || "").includes("user_email_preferences")
  );
}

export async function getMyEmailPreferences(userId: string): Promise<EmailPreferenceMap> {
  const { data, error } = await (supabase as any)
    .from("user_email_preferences")
    .select("category, enabled")
    .eq("user_id", userId);

  if (error) {
    if (isMissingEmailPreferencesTable(error)) {
      return { ...DEFAULT_EMAIL_PREFERENCES };
    }
    throw error;
  }

  const next = { ...DEFAULT_EMAIL_PREFERENCES };
  for (const row of data || []) {
    if (row.category in next) {
      next[row.category as EmailPreferenceCategory] = Boolean(row.enabled);
    }
  }

  return next;
}

export async function setMyEmailPreference(userId: string, category: EmailPreferenceCategory, enabled: boolean) {
  const { error } = await (supabase as any)
    .from("user_email_preferences")
    .upsert(
      {
        user_id: userId,
        category,
        enabled,
      },
      {
        onConflict: "user_id,category",
      }
    );

  if (error) {
    if (isMissingEmailPreferencesTable(error)) {
      return;
    }
    throw error;
  }
}
