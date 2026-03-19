import { supabase } from '@/integrations/supabase/client';
import { sendWebhook, WebhookEvent } from './webhookService';

export interface AdminSettings {
  id: string;
  key: string;
  value: string;
  updated_at: string | null;
}

export async function getSettings() {
  const { data, error } = await supabase
    .from('admin_settings')
    .select('*');

  if (error) throw error;
  return (data || []) as AdminSettings[];
}

export async function getSetting(key: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('admin_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') throw error;
  return data?.value || null;
}

export async function setSetting(key: string, value: string) {
  // Check if setting exists
  const { data: existing } = await supabase
    .from('admin_settings')
    .select('id')
    .eq('key', key)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from('admin_settings')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('key', key)
      .select()
      .single();

    if (error) throw error;

    // Send webhook for setting update
    await sendWebhook(WebhookEvent.ADMIN_SETTING_UPDATED, {
      settingId: data.id,
      key: data.key,
      updatedAt: data.updated_at,
    });
  } else {
    const { data, error } = await supabase
      .from('admin_settings')
      .insert({
        key,
        value,
      })
      .select()
      .single();

    if (error) throw error;

    // Send webhook for setting creation
    await sendWebhook(WebhookEvent.ADMIN_SETTING_CREATED, {
      settingId: data.id,
      key: data.key,
    });
  }
}

export async function getDiscordLink(): Promise<string | null> {
  return getSetting('discord_link');
}

export async function setDiscordLink(link: string) {
  await setSetting('discord_link', link);
}

export async function deleteSetting(key: string) {
  // Get setting info before deleting
  const settingData = await getSetting(key);
  
  const { error } = await supabase
    .from('admin_settings')
    .delete()
    .eq('key', key);

  if (error) throw error;

  // Send webhook for setting deletion
  if (settingData !== null) {
    await sendWebhook(WebhookEvent.ADMIN_SETTING_DELETED, {
      key,
    });
  }
}

export const settingsService = {
  getSettings,
  getSetting,
  setSetting,
  deleteSetting,
  getDiscordLink,
  setDiscordLink,
};
