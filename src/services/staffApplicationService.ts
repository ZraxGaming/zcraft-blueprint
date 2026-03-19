import { supabase } from "@/integrations/supabase/client";
import { settingsService } from "./settingsService";
import { oneSignalTrackEvent } from "@/lib/onesignal";

export interface StaffApplicationQuestion {
  id: string;
  label: string;
  type: "text" | "textarea" | "select";
  required: boolean;
  placeholder?: string;
  options?: string[];
  image_url?: string | null;
}

export interface StaffApplicationRoleConfig {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  form: StaffApplicationQuestion[];
}

export interface StaffApplication {
  id: string;
  user_id: string;
  target_role: string;
  status: "pending" | "accepted" | "rejected";
  answers: Record<string, string>;
  notes: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    username: string;
    email: string;
    avatar_url?: string | null;
  };
}

const DEFAULT_FORM: StaffApplicationQuestion[] = [
  { id: "timezone", label: "Timezone", type: "text", required: true, placeholder: "UTC+4" },
  { id: "experience", label: "Moderation or community experience", type: "textarea", required: true, placeholder: "Describe your previous experience." },
  { id: "why_join", label: "Why do you want to join the staff team?", type: "textarea", required: true, placeholder: "Tell us why you would be a good fit." },
];

const DEFAULT_ROLES: StaffApplicationRoleConfig[] = [
  {
    id: "helper",
    label: "Helper",
    description: "Entry-level support for chat, tickets, and everyday player issues.",
    enabled: false,
    form: DEFAULT_FORM,
  },
  {
    id: "moderator",
    label: "Moderator",
    description: "Moderate the server, handle reports, and keep the community healthy.",
    enabled: false,
    form: DEFAULT_FORM,
  },
  {
    id: "builder",
    label: "Builder",
    description: "Help create maps, server visuals, and polished event spaces.",
    enabled: false,
    form: [
      { id: "timezone", label: "Timezone", type: "text", required: true, placeholder: "UTC+4" },
      { id: "portfolio", label: "Build portfolio or screenshots", type: "textarea", required: true, placeholder: "Share links or describe your best builds." },
      { id: "style", label: "What build styles are you strongest at?", type: "textarea", required: true, placeholder: "Medieval, fantasy, modern, terrain, etc." },
    ],
  },
];

function normalizeQuestion(question: Partial<StaffApplicationQuestion>, index: number): StaffApplicationQuestion {
  return {
    id: question.id?.trim() || `question_${index + 1}`,
    label: question.label?.trim() || `Question ${index + 1}`,
    type: question.type === "text" || question.type === "select" ? question.type : "textarea",
    required: question.required !== false,
    placeholder: question.placeholder?.trim() || "",
    options: Array.isArray(question.options)
      ? question.options.map((option) => String(option).trim()).filter(Boolean)
      : [],
    image_url: question.image_url?.trim() || null,
  };
}

function normalizeRole(role: Partial<StaffApplicationRoleConfig>, index: number): StaffApplicationRoleConfig {
  const fallback = DEFAULT_ROLES[index] || DEFAULT_ROLES[0];
  const formSource = Array.isArray(role.form) && role.form.length > 0 ? role.form : fallback.form;

  return {
    id: role.id?.trim().toLowerCase() || fallback.id,
    label: role.label?.trim() || fallback.label,
    description: role.description?.trim() || fallback.description,
    enabled: Boolean(role.enabled),
    form: formSource.map((question, questionIndex) => normalizeQuestion(question, questionIndex)),
  };
}

function isMissingStaffApplicationsResource(error: any) {
  const code = error?.code || "";
  const message = String(error?.message || "").toLowerCase();
  return code === "PGRST205" || code === "42P01" || message.includes("staff_applications");
}

export async function getStaffApplicationSettings() {
  const [enabledRaw, formRaw, rolesRaw] = await Promise.all([
    settingsService.getSetting("staff_applications_enabled"),
    settingsService.getSetting("staff_application_form"),
    settingsService.getSetting("staff_application_roles"),
  ]);

  let roles = DEFAULT_ROLES;

  try {
    if (rolesRaw) {
      const parsed = JSON.parse(rolesRaw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        roles = parsed.map((role, index) => normalizeRole(role, index));
      }
    }
  } catch (error) {
    console.warn("Failed to parse staff application roles config:", error);
  }

  if (!rolesRaw) {
    let legacyForm = DEFAULT_FORM;
    try {
      if (formRaw) {
        const parsed = JSON.parse(formRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          legacyForm = parsed.map((question, index) => normalizeQuestion(question, index));
        }
      }
    } catch (error) {
      console.warn("Failed to parse legacy staff application form config:", error);
    }

    roles = DEFAULT_ROLES.map((role) => ({
      ...role,
      enabled: role.id === "moderator" ? enabledRaw === "true" : role.enabled,
      form: role.id === "moderator" ? legacyForm : role.form,
    }));
  }

  return {
    enabled: roles.some((role) => role.enabled),
    form: roles[0]?.form || DEFAULT_FORM,
    roles,
  };
}

export async function saveStaffApplicationSettings(roles: StaffApplicationRoleConfig[]) {
  const cleanedRoles = roles
    .map((role, index) => normalizeRole(role, index))
    .filter((role, index, array) => role.id && array.findIndex((item) => item.id === role.id) === index);

  await Promise.all([
    settingsService.setSetting("staff_applications_enabled", String(cleanedRoles.some((role) => role.enabled))),
    settingsService.setSetting("staff_application_form", JSON.stringify(cleanedRoles[0]?.form || DEFAULT_FORM)),
    settingsService.setSetting("staff_application_roles", JSON.stringify(cleanedRoles)),
  ]);
}

export async function getMyStaffApplications(userId: string) {
  const { data, error } = await (supabase as any)
    .from("staff_applications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingStaffApplicationsResource(error)) {
      return [];
    }
    throw error;
  }
  return (data || []) as StaffApplication[];
}

export async function getMyStaffApplicationForRole(userId: string, targetRole: string) {
  const { data, error } = await (supabase as any)
    .from("staff_applications")
    .select("*")
    .eq("user_id", userId)
    .eq("target_role", targetRole)
    .maybeSingle();

  if (error) {
    if (isMissingStaffApplicationsResource(error)) {
      return null;
    }
    throw error;
  }
  return (data || null) as StaffApplication | null;
}

export async function submitStaffApplication(userId: string, targetRole: string, answers: Record<string, string>) {
  const existing = await getMyStaffApplicationForRole(userId, targetRole);

  if (existing) {
    const { data, error } = await (supabase as any)
      .from("staff_applications")
      .update({
        target_role: targetRole,
        answers,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error) throw error;
    oneSignalTrackEvent("staff_application_updated", {
      target_role: targetRole,
      application_id: data.id,
    });
    return data as StaffApplication;
  }

  const { data, error } = await (supabase as any)
    .from("staff_applications")
    .insert({
      user_id: userId,
      target_role: targetRole,
      answers,
    })
    .select("*")
    .single();

  if (error) throw error;
  oneSignalTrackEvent("staff_application_submitted", {
    target_role: targetRole,
    application_id: data.id,
  });
  return data as StaffApplication;
}

export async function listStaffApplications() {
  const { data, error } = await (supabase as any)
    .from("staff_applications")
    .select("*, user:users(username, email, avatar_url)")
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingStaffApplicationsResource(error)) {
      return [];
    }
    throw error;
  }
  return (data || []) as StaffApplication[];
}

export async function reviewStaffApplication(id: string, status: "accepted" | "rejected", notes: string, reviewerId: string) {
  const { data, error } = await (supabase as any)
    .from("staff_applications")
    .update({
      status,
      notes,
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;

  try {
    await fetch("/api/onesignal/custom-event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        externalId: data.user_id,
        name: status === "accepted" ? "staff_application_accepted" : "staff_application_rejected",
        properties: {
          application_id: data.id,
          target_role: data.target_role,
          reviewed_by: reviewerId,
          notes,
        },
      }),
    });
  } catch (eventError) {
    console.warn("Failed to send OneSignal application review event:", eventError);
  }

  return data as StaffApplication;
}
