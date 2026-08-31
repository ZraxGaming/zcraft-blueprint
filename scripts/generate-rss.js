import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SITE_URL = process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://z-craft.xyz';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeFile(filePath, contents) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, contents, 'utf8');
}

function buildFeed({ title, link, description, items }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(link)}</link>
    <description>${escapeXml(description)}</description>
    <language>en-us</language>
${items.join('\n')}
  </channel>
</rss>
`;
}

function buildItem({ title, link, description, pubDate, guid }) {
  return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(link)}</link>
      <description>${escapeXml(description)}</description>
      <pubDate>${escapeXml(pubDate)}</pubDate>
      <guid>${escapeXml(guid)}</guid>
    </item>`;
}

function slugifyFragment(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  console.log('Generating RSS feeds...');

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn('Supabase env vars not found. Skipping RSS feed generation.');
    writeFile(path.join('public', 'news', 'rss.xml'), buildFeed({ title: 'ZCraft News Feed', link: `${SITE_URL}/news`, description: 'Latest news from ZCraft Network', items: [] }));
    writeFile(path.join('public', 'changelogs', 'rss.xml'), buildFeed({ title: 'ZCraft Changelog Feed', link: `${SITE_URL}/events`, description: 'Latest changelogs from ZCraft Network', items: [] }));
    return;
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    const [{ data: news, error: newsError }, { data: changelogs, error: changelogError }] = await Promise.all([
      supabase
        .from('news')
        .select('title, slug, excerpt, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('changelogs')
        .select('version, title, description, released_at, created_at')
        .order('released_at', { ascending: false })
        .limit(100),
    ]);

    if (newsError) throw newsError;
    if (changelogError) throw changelogError;

    const newsItems = (news || []).map((article) => {
      const url = `${SITE_URL}/news/${article.slug}`;
      return buildItem({
        title: article.title,
        link: url,
        description: article.excerpt || article.title,
        pubDate: new Date(article.updated_at || article.created_at || Date.now()).toUTCString(),
        guid: url,
      });
    });

    const changelogItems = (changelogs || []).map((entry) => {
      const fragment = slugifyFragment(`changelog-${entry.version}`);
      const url = `${SITE_URL}/events#${fragment}`;
      return buildItem({
        title: `${entry.title} (v${entry.version})`,
        link: url,
        description: entry.description || entry.title,
        pubDate: new Date(entry.released_at || entry.created_at || Date.now()).toUTCString(),
        guid: url,
      });
    });

    writeFile(
      path.join('public', 'news', 'rss.xml'),
      buildFeed({
        title: 'ZCraft News Feed',
        link: `${SITE_URL}/news`,
        description: 'Latest news from ZCraft Network',
        items: newsItems,
      })
    );

    writeFile(
      path.join('public', 'changelogs', 'rss.xml'),
      buildFeed({
        title: 'ZCraft Changelog Feed',
        link: `${SITE_URL}/events`,
        description: 'Latest changelogs from ZCraft Network',
        items: changelogItems,
      })
    );

    console.log('Wrote public/news/rss.xml');
    console.log('Wrote public/changelogs/rss.xml');
  } catch (error) {
    console.warn('Skipping RSS feed generation due to Supabase access issue:', error?.message || error);
    writeFile(path.join('public', 'news', 'rss.xml'), buildFeed({ title: 'ZCraft News Feed', link: `${SITE_URL}/news`, description: 'Latest news from ZCraft Network', items: [] }));
    writeFile(path.join('public', 'changelogs', 'rss.xml'), buildFeed({ title: 'ZCraft Changelog Feed', link: `${SITE_URL}/events`, description: 'Latest changelogs from ZCraft Network', items: [] }));
  }
}

main().catch((error) => {
  console.error('Error generating RSS feeds', error);
  process.exit(1);
});
