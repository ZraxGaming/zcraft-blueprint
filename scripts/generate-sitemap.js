import fs from 'fs';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SITE_URL = process.env.SITE_URL || 'https://guilded-design.lovable.app';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const isEnabled = (key, fallback = true) => {
  const value = process.env[key];
  if (value === undefined || value === '') return fallback;
  return String(value).toLowerCase() === 'true';
};

async function main() {
  console.log('Generating sitemap...');

  const buildDate = new Date().toISOString().slice(0, 10);

  const staticPages = [
    { loc: '/', lastmod: buildDate, changefreq: 'daily', priority: '1.0' },
    isEnabled('VITE_FEATURE_PLAY') && { loc: '/play', lastmod: buildDate, changefreq: 'weekly', priority: '0.9' },
    isEnabled('VITE_FEATURE_FORUMS') && { loc: '/forums', lastmod: buildDate, changefreq: 'weekly', priority: '0.8' },
    isEnabled('VITE_FEATURE_WIKI') && { loc: '/wiki', lastmod: buildDate, changefreq: 'weekly', priority: '0.7' },
    isEnabled('VITE_FEATURE_STORE') && { loc: '/store', lastmod: buildDate, changefreq: 'weekly', priority: '0.7' },
    isEnabled('VITE_FEATURE_SERVER_LISTINGS') && { loc: '/server-listings', lastmod: buildDate, changefreq: 'weekly', priority: '0.6' },
    isEnabled('VITE_FEATURE_NEWS') && { loc: '/news', lastmod: buildDate, changefreq: 'daily', priority: '0.8' },
    isEnabled('VITE_FEATURE_CHANGELOGS') && { loc: '/changelogs', lastmod: buildDate, changefreq: 'weekly', priority: '0.6' },
    isEnabled('VITE_FEATURE_EVENTS') && { loc: '/events', lastmod: buildDate, changefreq: 'weekly', priority: '0.6' },
    isEnabled('VITE_FEATURE_SUPPORT') && { loc: '/support', lastmod: buildDate, changefreq: 'monthly', priority: '0.4' },
    isEnabled('VITE_FEATURE_APPEAL') && { loc: '/appeal', lastmod: buildDate, changefreq: 'monthly', priority: '0.4' },
    { loc: '/search', lastmod: buildDate, changefreq: 'weekly', priority: '0.4' },
    isEnabled('VITE_FEATURE_STATUS') && { loc: '/status', lastmod: buildDate, changefreq: 'hourly', priority: '0.9' }
  ].filter(Boolean);

  const dynamicUrls = [];

  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

      const queries = [
        supabase.from('news').select('slug, updated_at').limit(1000),
        supabase.from('wiki').select('slug, updated_at').limit(1000),
        supabase.from('changelogs').select('version, released_at').limit(1000),
        supabase.from('events').select('id, date').limit(1000),
        supabase.from('forums').select('slug, updated_at').limit(1000),
        supabase.from('forum_posts').select('id, forum:forums(slug), updated_at, created_at').order('created_at', { ascending: false }).limit(1000),
      ];

      const results = await Promise.allSettled(queries);

      const news = results[0].status === 'fulfilled' ? results[0].value.data : null;
      if (news) {
        for (const n of news) {
          dynamicUrls.push({ loc: `/news/${n.slug}`, lastmod: n.updated_at?.slice(0, 10) || null, changefreq: 'weekly' });
        }
      }

      const wiki = results[1].status === 'fulfilled' ? results[1].value.data : null;
      if (wiki) {
        for (const w of wiki) {
          dynamicUrls.push({ loc: `/wiki/${w.slug}`, lastmod: w.updated_at?.slice(0, 10) || null, changefreq: 'monthly' });
        }
      }

      const changelogs = results[2].status === 'fulfilled' ? results[2].value.data : null;
      if (changelogs) {
        for (const c of changelogs) {
          const v = encodeURIComponent(c.version);
          dynamicUrls.push({ loc: `/changelogs/${v}`, lastmod: c.released_at?.slice(0,10) || null, changefreq: 'monthly' });
        }
      }

      const events = results[3].status === 'fulfilled' ? results[3].value.data : null;
      if (events) {
        for (const e of events) {
          dynamicUrls.push({ loc: `/events/${e.id}`, lastmod: e.date?.slice(0,10) || null, changefreq: 'weekly' });
        }
      }

      const forums = results[4].status === 'fulfilled' ? results[4].value.data : null;
      if (forums) {
        for (const f of forums) {
          dynamicUrls.push({ loc: `/forums/${f.slug}`, lastmod: f.updated_at?.slice(0,10) || null, changefreq: 'weekly', priority: '0.7' });
        }
      }

      const threads = results[5].status === 'fulfilled' ? results[5].value.data : null;
      if (threads) {
        for (const t of threads) {
          const forumSlug = t.forum?.slug || 'general';
          dynamicUrls.push({ loc: `/forums/${forumSlug}/${t.id}`, lastmod: (t.updated_at || t.created_at)?.slice(0,10) || null, changefreq: 'monthly', priority: '0.6' });
        }
      }
    } catch (err) {
      console.warn('Failed to query Supabase for dynamic pages, continuing with static pages only.', err.message || err);
    }
  } else {
    console.warn('Supabase env vars not found; generating sitemap with static pages only. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to enable dynamic pages.');
  }

  const urls = [...staticPages, ...dynamicUrls];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls
    .map((u) => {
      const full = `${SITE_URL}${u.loc}`;
      const lastmod = u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : '';
      const changefreq = u.changefreq ? `\n    <changefreq>${u.changefreq}</changefreq>` : '';
      const priority = u.priority ? `\n    <priority>${u.priority}</priority>` : '';
      const alternates = [
        { hreflang: 'en', href: full },
        { hreflang: 'x-default', href: full },
      ]
        .map((a) => `\n    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.href}" />`)
        .join('');
      return `  <url>\n    <loc>${full}</loc>${alternates}${lastmod}${changefreq}${priority}\n  </url>`;
    })
    .join('\n')}\n</urlset>`;

  fs.writeFileSync('public/sitemap.xml', sitemap, 'utf8');
  console.log(`Wrote public/sitemap.xml with ${urls.length} entries.`);
}

main().catch((e) => {
  console.error('Error generating sitemap', e);
  process.exit(1);
});
