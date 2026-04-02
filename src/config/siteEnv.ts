const env = import.meta.env;

const toBool = (value: unknown, fallback = false) => {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value).toLowerCase() === "true";
};

const toString = (value: unknown, fallback: string) => {
  const trimmed = String(value ?? "").trim();
  return trimmed || fallback;
};

const withDefaultUrl = (value: unknown, fallback: string) => {
  const trimmed = String(value ?? "").trim();
  return trimmed || fallback;
};

export const siteConfig = {
  name: toString(env.VITE_SITE_NAME, "ZCraft Network"),
  shortName: toString(env.VITE_SITE_SHORT_NAME, "ZCraft"),
  domain: toString(env.VITE_SITE_DOMAIN, "z-craft.xyz"),
  url: withDefaultUrl(env.VITE_SITE_URL, "https://www.z-craft.xyz"),
  themeColor: toString(env.VITE_THEME_COLOR, "#3b82f6"),
  logo: toString(env.VITE_SITE_LOGO, "/zcraft-logo.png"),
  icon: toString(env.VITE_SITE_ICON, "/favicon.ico"),
  appleTouchIcon: toString(env.VITE_SITE_APPLE_TOUCH_ICON, "/apple-touch-icon.png"),
  ogImage: toString(env.VITE_SITE_OG_IMAGE, "/zcraft.png"),
  ogImageUrl: toString(env.VITE_SEO_IMAGE_URL, ""),
  iconUrl: toString(env.VITE_SITE_ICON_URL, ""),
  appleTouchIconUrl: toString(env.VITE_SITE_APPLE_TOUCH_ICON_URL, ""),
  twitterHandle: toString(env.VITE_TWITTER_HANDLE, "@ZCraftNetwork"),
  discordUrl: toString(env.VITE_DISCORD_URL, "https://discord.z-craft.xyz"),
  playIp: toString(env.VITE_PLAY_IP, "play.zcraftmc.xyz"),
  bedrockIp: toString(env.VITE_BEDROCK_IP, "bedrock.zcraftmc.xyz"),
  supportUrl: toString(env.VITE_SUPPORT_URL, "/support"),
  storeUrl: toString(env.VITE_STORE_URL, "https://store.z-craft.xyz"),
  statusUrl: toString(env.VITE_STATUS_URL, "https://status.z-craft.xyz"),
  wikiUrl: toString(env.VITE_WIKI_URL, "https://wiki.z-craft.xyz"),
  appealUrl: toString(env.VITE_APPEAL_URL, "/appeal"),
  bansUrl: toString(env.VITE_BANS_URL, "https://bans.z-craft.xyz"),
  forumsUrl: toString(env.VITE_FORUMS_URL, "/forums"),
  newsUrl: toString(env.VITE_NEWS_URL, "/news"),
  changelogsUrl: toString(env.VITE_CHANGELOGS_URL, "/events"),
  serverListingsUrl: toString(env.VITE_SERVER_LISTINGS_URL, "/server-listings"),
  rulesUrl: toString(env.VITE_RULES_URL, "/rules"),
  staffUrl: toString(env.VITE_STAFF_URL, "/staff"),
  eventsUrl: toString(env.VITE_EVENTS_URL, "/events"),
  seo: {
    title: toString(env.VITE_SEO_TITLE, "ZCraft Network - Premium Minecraft Lifesteal & Skyblock SMP Server"),
    description: toString(
      env.VITE_SEO_DESCRIPTION,
      "Join ZCraft Network, the ultimate Minecraft network with Lifesteal and Skyblock SMP, survival gameplay, custom economy, factions, and active community events."
    ),
    keywords: toString(
      env.VITE_SEO_KEYWORDS,
      "zcraft, zcraft network, minecraft server, minecraft lifesteal, skyblock, lifesteal skyblock, minecraft survival, minecraft factions, minecraft economy, minecraft pvp, minecraft smp, best minecraft server"
    ),
    image: toString(env.VITE_SEO_IMAGE, "/zcraft.png"),
    type: toString(env.VITE_SEO_TYPE, "website"),
    author: toString(env.VITE_SEO_AUTHOR, "ZCraft Network"),
  },
  appeal: {
    mode: toString(env.VITE_APPEAL_MODE, "form"),
    redirectUrl: toString(env.VITE_APPEAL_REDIRECT_URL, ""),
  },
  pageSeo: {
    support: {
      title: toString(env.VITE_PAGE_SUPPORT_TITLE, "Support - ZCraft Network"),
      description: toString(env.VITE_PAGE_SUPPORT_DESCRIPTION, "Get help, FAQs, and support for ZCraft Network."),
      keywords: toString(env.VITE_PAGE_SUPPORT_KEYWORDS, "support, help, faq, minecraft support"),
    },
    appeal: {
      title: toString(env.VITE_PAGE_APPEAL_TITLE, "Appeal - ZCraft Network"),
      description: toString(env.VITE_PAGE_APPEAL_DESCRIPTION, "Submit a ban or punishment appeal for ZCraft Network."),
      keywords: toString(env.VITE_PAGE_APPEAL_KEYWORDS, "appeal, ban appeal, punishment appeal, minecraft appeal"),
    },
    home: {
      title: toString(env.VITE_PAGE_HOME_TITLE, "ZCraft Network - Premium Minecraft Lifesteal & Skyblock SMP Server"),
      description: toString(env.VITE_PAGE_HOME_DESCRIPTION, "Join ZCraft Network, the ultimate Minecraft network with Lifesteal and Skyblock SMP, survival gameplay, custom economy, factions, and active community events."),
      keywords: toString(env.VITE_PAGE_HOME_KEYWORDS, "zcraft, zcraft network, minecraft server, minecraft lifesteal, skyblock, lifesteal skyblock, minecraft survival, minecraft factions, minecraft economy, minecraft pvp, minecraft smp, best minecraft server"),
    },
  },
  features: {
    maintenanceBanner: toBool(env.VITE_FEATURE_MAINTENANCE_BANNER, true),
    announcementBanner: toBool(env.VITE_FEATURE_ANNOUNCEMENT_BANNER, true),
    homeHero: toBool(env.VITE_FEATURE_HOME_HERO, true),
    heroStats: toBool(env.VITE_FEATURE_HERO_STATS, true),
    homeFeatures: toBool(env.VITE_FEATURE_HOME_FEATURES, true),
    homeCommunity: toBool(env.VITE_FEATURE_HOME_COMMUNITY, true),
    play: toBool(env.VITE_FEATURE_PLAY, true),
    forums: toBool(env.VITE_FEATURE_FORUMS, true),
    news: toBool(env.VITE_FEATURE_NEWS, true),
    changelogs: toBool(env.VITE_FEATURE_CHANGELOGS, true),
    events: toBool(env.VITE_FEATURE_EVENTS, true),
    status: toBool(env.VITE_FEATURE_STATUS, true),
    store: toBool(env.VITE_FEATURE_STORE, true),
    support: toBool(env.VITE_FEATURE_SUPPORT, true),
    staff: toBool(env.VITE_FEATURE_STAFF, true),
    serverListings: toBool(env.VITE_FEATURE_SERVER_LISTINGS, true),
    rules: toBool(env.VITE_FEATURE_RULES, true),
    wiki: toBool(env.VITE_FEATURE_WIKI, true),
    appeal: toBool(env.VITE_FEATURE_APPEAL, true),
    bans: toBool(env.VITE_FEATURE_BANS, true),
    discordButton: toBool(env.VITE_FEATURE_DISCORD_BUTTON, true),
    copyIpButton: toBool(env.VITE_FEATURE_COPY_IP_BUTTON, true),
    themeToggle: toBool(env.VITE_FEATURE_THEME_TOGGLE, true),
    cookieBanner: toBool(env.VITE_FEATURE_COOKIE_BANNER, true),
  },
};

export type SiteFeatureKey = keyof typeof siteConfig.features;

export type NavLink = {
  name: string;
  path: string;
  external?: boolean;
  feature?: SiteFeatureKey;
};

export const navLinks: NavLink[] = [
  { name: "Home", path: "/", feature: "homeHero" },
  { name: "Play", path: "/play", feature: "play" },
  { name: "Forums", path: "/forums", feature: "forums" },
  { name: "News", path: "/news", feature: "news" },
  { name: "Changelogs", path: "/events", feature: "changelogs" },
  { name: "Appeal", path: siteConfig.appealUrl, external: siteConfig.appealUrl.startsWith("http"), feature: "appeal" },
  { name: "Server Listings", path: "/server-listings", feature: "serverListings" },
  { name: "Rules", path: "/rules", feature: "rules" },
  { name: "Status", path: siteConfig.statusUrl, external: true, feature: "status" },
];

export const footerSections: Record<string, NavLink[]> = {
  Server: [
    { name: "Home", path: "/", feature: "homeHero" },
    { name: "Play", path: "/play", feature: "play" },
    { name: "Status", path: siteConfig.statusUrl, external: true, feature: "status" },
    { name: "Rules", path: "/rules", feature: "rules" },
    { name: "Bans", path: siteConfig.bansUrl, external: true, feature: "bans" },
  ],
  Community: [
    { name: "Forums", path: "/forums", feature: "forums" },
    { name: "News", path: "/news", feature: "news" },
    { name: "Changelogs", path: "/events", feature: "changelogs" },
    { name: "Staff", path: "/staff", feature: "staff" },
  ],
  Resources: [
    { name: "Wiki", path: siteConfig.wikiUrl, external: true, feature: "wiki" },
    { name: "Support", path: "/support", feature: "support" },
    { name: "Appeal", path: siteConfig.appealUrl, external: siteConfig.appealUrl.startsWith("http"), feature: "appeal" },
    { name: "Store", path: siteConfig.storeUrl, external: true, feature: "store" },
  ],
  Legal: [
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Terms of Service", path: "/terms" },
  ],
};

export const enabledNavLinks = navLinks.filter((link) => !link.feature || siteConfig.features[link.feature]);

export const enabledFooterSections = Object.fromEntries(
  Object.entries(footerSections)
    .map(([section, links]) => [
      section,
      links.filter((link) => !link.feature || siteConfig.features[link.feature]),
    ])
    .filter(([, links]) => links.length > 0)
);

export const toAbsoluteUrl = (path = "") => {
  try {
    return new URL(path || "/", siteConfig.url).toString();
  } catch {
    return `${siteConfig.url.replace(/\/+$/, "")}/${String(path || "/").replace(/^\/+/, "")}`;
  }
};

export const getPageSeo = (
  page: keyof typeof siteConfig.pageSeo,
  overrides: Partial<{ title: string; description: string; keywords: string }> = {}
) => ({
  title: overrides.title || siteConfig.pageSeo[page].title,
  description: overrides.description || siteConfig.pageSeo[page].description,
  keywords: overrides.keywords || siteConfig.pageSeo[page].keywords,
});
