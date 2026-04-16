import { NextFunction, Request, Response } from "express";
import { newsService } from "../src/services/newsService";

export async function newsRssFeed(req: Request, res: Response, next: NextFunction) {
  try {
    const news = await newsService.getNews();
    const items = news.map((article: any) => `
      <item>
        <title>${article.title}</title>
        <link>${import.meta.env.VITE_SITE_URL || 'https://www.z-craft.xyz'}/news/${article.slug}</link>
        <description>${article.description}</description>
        <pubDate>${new Date(article.updated_at || article.created_at).toUTCString()}</pubDate>
        <guid>${import.meta.env.VITE_SITE_URL || 'https://www.z-craft.xyz'}/news/${article.slug}</guid>
      </item>
    `).join("");
    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
      <rss version="2.0">
        <channel>
          <title>${import.meta.env.VITE_NEWS_FEED_TITLE || 'ZCraft News Feed'}</title>
          <link>${import.meta.env.VITE_SITE_URL || 'https://www.z-craft.xyz'}/news</link>
          <description>${import.meta.env.VITE_NEWS_FEED_DESCRIPTION || 'Latest news from ZCraft Network'}</description>
          <language>en-us</language>
          ${items}
        </channel>
      </rss>`;
    res.set("Content-Type", "application/xml");
    res.send(rss);
  } catch (err) {
    next(err);
  }
}
