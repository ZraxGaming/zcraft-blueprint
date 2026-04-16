import { NextFunction, Request, Response } from "express";
import { changelogService } from "../src/services/changelogService";

export async function changelogRssFeed(req: Request, res: Response, next: NextFunction) {
  try {
    const changelogs = await changelogService.getChangelogs();
    const items = changelogs.map((log: any) => `
      <item>
        <title>${log.title} (v${log.version})</title>
        <link>https://z-craft.xyz/changelogs/${log.id}</link>
        <description>${log.description}</description>
        <pubDate>${new Date(log.released_at || log.created_at).toUTCString()}</pubDate>
        <guid>https://z-craft.xyz/changelogs/${log.id}</guid>
      </item>
    `).join("");
    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
      <rss version="2.0">
        <channel>
          <title>ZCraft Changelog Feed</title>
          <link>https://z-craft.xyz/changelogs</link>
          <description>Latest changelogs from ZCraft Network</description>
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
