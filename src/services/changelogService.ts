import { supabase } from '@/integrations/supabase/client';
import { sendWebhook, WebhookEvent } from './webhookService';
import { oneSignalTrackEvent } from '@/lib/onesignal';
import { sendOneSignalEmail } from './onesignalMessageService';

export type ChangelogType = 'feature' | 'fix' | 'improvement' | 'patch';

export interface Changelog {
  id: string;
  version: string;
  title: string;
  description: string;
  changes: string[];
  type: ChangelogType;
  image_url: string | null;
  released_at: string;
  created_at: string;
}

export async function getChangelogs(limit: number = 20, offset: number = 0) {
  const { data, error } = await supabase
    .from('changelogs')
    .select('*')
    .order('released_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return (data || []) as Changelog[];
}

export async function getLatestChangelog() {
  const { data, error } = await supabase
    .from('changelogs')
    .select('*')
    .order('released_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as Changelog | null;
}

export async function getChangelogByVersion(version: string) {
  const { data, error } = await supabase
    .from('changelogs')
    .select('*')
    .eq('version', version)
    .single();

  if (error) throw error;
  return data as Changelog;
}

export async function createChangelog(
  changelog: Omit<Changelog, 'id' | 'created_at'>
) {
  const { data, error } = await supabase
    .from('changelogs')
    .insert({
      version: changelog.version,
      title: changelog.title,
      description: changelog.description,
      changes: changelog.changes,
      type: changelog.type,
      image_url: changelog.image_url,
      released_at: changelog.released_at,
    })
    .select()
    .single();

  if (error) throw error;

  // Send webhook
  await sendWebhook(WebhookEvent.CHANGELOG_CREATED, {
    changelogId: data.id,
    version: data.version,
    title: data.title,
    type: data.type,
    releasedAt: data.released_at,
    changes: data.changes,
  });

  oneSignalTrackEvent('changelog_published', {
    changelog_id: data.id,
    version: data.version,
    title: data.title,
  });

  try {
    await sendOneSignalEmail({
      subject: `Changelog v${data.version}: ${data.title}`,
      html: `
        <h1>${data.title}</h1>
        <p><strong>Version:</strong> v${data.version}</p>
        <p>${data.description}</p>
        <p><a href="https://z-craft.xyz/events#changelog-${String(data.version).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}">Read the changelog</a></p>
      `,
    });
  } catch (error) {
    console.warn('Failed to send changelog email:', error);
  }

  return data as Changelog;
}

export async function updateChangelog(
  id: string,
  updates: Partial<Changelog>
) {
  const { data, error } = await supabase
    .from('changelogs')
    .update({
      version: updates.version,
      title: updates.title,
      description: updates.description,
      changes: updates.changes,
      type: updates.type,
      image_url: updates.image_url,
      released_at: updates.released_at,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // Send webhook
  await sendWebhook(WebhookEvent.CHANGELOG_UPDATED, {
    changelogId: data.id,
    version: data.version,
    title: data.title,
    type: data.type,
    updates,
  });

  return data as Changelog;
}

export async function deleteChangelog(id: string) {
  // Get changelog info before deleting
  const changelog = await supabase
    .from('changelogs')
    .select('*')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('changelogs')
    .delete()
    .eq('id', id);

  if (error) throw error;

  // Send webhook
  if (changelog.data) {
    await sendWebhook(WebhookEvent.CHANGELOG_DELETED, {
      changelogId: changelog.data.id,
      version: changelog.data.version,
      title: changelog.data.title,
      type: changelog.data.type,
    });
  }
}

export const changelogService = {
  getChangelogs,
  getLatestChangelog,
  getChangelogByVersion,
  createChangelog,
  updateChangelog,
  deleteChangelog,
  updateChangelogImage: async (id: string, imageUrl: string) => {
    const { data, error } = await supabase
      .from('changelogs')
      .update({ image_url: imageUrl })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Changelog;
  },
};
