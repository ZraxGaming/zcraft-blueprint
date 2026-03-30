import fs from 'fs';
import path from 'path';
import { createServer } from 'vite';

async function prerender() {
  console.log('Starting prerender...');

  // Create Vite server in middleware mode
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom'
  });

  // Create a simple HTML template
  const template = fs.readFileSync('index.html', 'utf-8');

  // Pages to prerender with their SEO data
  const pages = [
    {
      route: '/',
      seo: {
        title: "ZCraft Network — Premium Minecraft Lifesteal & Skyblock SMP Servers",
        description: "Join ZCraft Network, the ultimate Minecraft network with Lifesteal and Skyblock SMP, survival gameplay, factions, economy system, and active community. Best Minecraft server for competitive PvP and multi-mode SMP.",
        keywords: "zcraft, zcraft network, minecraft server, minecraft lifesteal, minecraft skyblock, lifesteal skyblock, minecraft survival, minecraft factions, minecraft economy, minecraft pvp, minecraft smp, best minecraft server, minecraft community server",
        type: 'website'
      }
    },
    {
      route: '/play',
      seo: {
        title: "Play ZCraft Network — Join Our Minecraft Server Now",
        description: "Start playing on ZCraft Network today! Join our premier Minecraft lifesteal SMP server with custom gameplay, active community, and competitive PvP. Free to join, endless fun.",
        keywords: "play zcraft, minecraft server join, lifesteal server join, minecraft smp join, minecraft factions join, minecraft pvp server, free minecraft server",
        type: 'website'
      }
    },
    {
      route: '/forums',
      seo: {
        title: "ZCraft Network Forums — Community Discussions & Support",
        description: "Join the ZCraft Network community forums. Discuss gameplay, get support, share builds, and connect with fellow Minecraft players on our active forum community.",
        keywords: "zcraft forums, minecraft forums, server forums, community discussions, minecraft support, player discussions, server community",
        type: 'website'
      }
    },
    {
      route: '/news',
      seo: {
        title: "ZCraft Network News — Latest Updates & Announcements",
        description: "Stay updated with the latest ZCraft Network news, server updates, events, and announcements. Get the newest information about our Minecraft server developments.",
        keywords: "zcraft news, minecraft server news, server updates, minecraft announcements, server events, minecraft updates, server changelog",
        type: 'website'
      }
    },
    {
      route: '/wiki',
      seo: {
        title: "ZCraft Network Wiki — Complete Server Guide & Documentation",
        description: "Complete guide to ZCraft Network. Learn about gameplay mechanics, server rules, commands, features, and everything you need to know about our Minecraft server.",
        keywords: "zcraft wiki, minecraft server guide, server documentation, gameplay guide, server rules, minecraft commands, server features",
        type: 'website'
      }
    }
  ];

  // Ensure dist directory exists
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
  }

  for (const page of pages) {
    try {
      console.log(`Prerendering ${page.route}...`);

      // Transform index.html with Vite
      const transformedTemplate = await vite.transformIndexHtml(page.route, template);

      // Inject SEO meta tags
      let html = transformedTemplate;

      // Add SEO meta tags
      const seoMeta = `
        <title>${page.seo.title}</title>
        <meta name="description" content="${page.seo.description}" />
        <meta name="keywords" content="${page.seo.keywords}" />
        <meta property="og:title" content="${page.seo.title}" />
        <meta property="og:description" content="${page.seo.description}" />
        <meta property="og:type" content="${page.seo.type}" />
        <meta property="og:url" content="https://z-craft.xyz${page.route}" />
        <meta property="og:site_name" content="ZCraft Network" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${page.seo.title}" />
        <meta name="twitter:description" content="${page.seo.description}" />
        <link rel="canonical" href="https://z-craft.xyz${page.route}" />
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "${page.seo.title}",
          "description": "${page.seo.description}",
          "url": "https://z-craft.xyz${page.route}",
          "isPartOf": {
            "@type": "WebSite",
            "url": "https://z-craft.xyz",
            "name": "ZCraft Network"
          }
        }
        </script>
      `;

      // Insert meta tags before closing head
      html = html.replace('</head>', `${seoMeta}</head>`);

      // Write the prerendered HTML
      const fileName = page.route === '/' ? 'index.html' : `${page.route.slice(1)}.html`;
      const filePath = path.join('dist', fileName);
      fs.writeFileSync(filePath, html);

      console.log(`✓ Prerendered ${page.route} -> ${filePath}`);
    } catch (error) {
      console.error(`✗ Failed to prerender ${page.route}:`, error);
    }
  }

  await vite.close();
  console.log('Prerendering complete!');
}

// Run prerender if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  prerender().catch(console.error);
}

export { prerender };