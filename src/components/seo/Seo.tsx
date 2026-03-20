import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export interface SeoBreadcrumb {
  name: string;
  url: string;
}

export interface RssFeedLink {
  title: string;
  url: string;
}

export interface SeoFaqItem {
  question: string;
  answer: string;
}

export interface SeoProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile' | string;
  publishedTime?: string; // ISO date when the article was published
  updatedTime?: string; // ISO date when the article/page was last updated
  author?: string;
  section?: string;
  tags?: string[];
  noindex?: boolean;
  canonical?: string;
  structuredData?: any; // Additional structured data
  breadcrumbs?: SeoBreadcrumb[];
  alternateUrls?: Record<string, string>; // e.g. { en: '/en/about', fr: '/fr/about' }
  rssFeeds?: RssFeedLink[];
  faq?: SeoFaqItem[];
}

export function Seo({
  title = "ZCraft Network — Premium Minecraft Lifesteal & Survival Servers",
  description = "Join ZCraft Network, the ultimate Minecraft experience with lifesteal SMP, survival gameplay, factions, economy system, and active community. Best Minecraft server for competitive PvP and social gaming.",
  keywords = "zcraft, zcraft network, minecraft server, minecraft lifesteal, lifesteal server, minecraft survival, minecraft factions, minecraft economy, minecraft pvp, minecraft smp, best minecraft server, minecraft community server",
  image = "/zcraft.png",
  url,
  type = 'website',
  publishedTime,
  updatedTime,
  author = "ZCraft Network",
  section,
  tags = [],
  noindex = false,
  canonical,
  structuredData,
  breadcrumbs,
  alternateUrls,
  rssFeeds,
  faq,
}: SeoProps) {
  const location = useLocation();

  useEffect(() => {
    if (title) document.title = title;

    const setMeta = (name: string, content?: string) => {
      if (!content) return;
      let el = document.querySelector(`meta[name=\"${name}\"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const setProperty = (prop: string, content?: string) => {
      if (!content) return;
      let el = document.querySelector(`meta[property=\"${prop}\"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", prop);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // Ensure absolute URLs for image and url
    const origin = 'https://z-craft.xyz';
    const defaultPath = location.pathname + (location.search || '');
    const resolvedUrl = url || defaultPath;
    const absoluteUrl = resolvedUrl?.startsWith('http') ? resolvedUrl : `${origin}${resolvedUrl}`;
    const absoluteImage = image?.startsWith('http') ? image : `${origin}${image}`;

    // Basic meta tags
    setMeta("description", description);
    setMeta("keywords", keywords);
    setMeta("author", author);
    setMeta("robots", noindex ? "noindex, nofollow" : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1");
    setMeta("googlebot", noindex ? "noindex, nofollow" : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1");
    setMeta("bingbot", noindex ? "noindex, nofollow" : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1");

    // Language and locale
    document.documentElement.lang = "en";
    setMeta("language", "en-US");
    setProperty("og:locale", "en_US");

    // Performance and accessibility
    setMeta("theme-color", "#3b82f6");
    setMeta("msapplication-TileColor", "#3b82f6");
    setMeta("application-name", "ZCraft Network");
    setMeta("format-detection", "telephone=no"); // Prevent phone number detection
    setMeta("mobile-web-app-capable", "yes");
    setMeta("apple-mobile-web-app-capable", "yes");
    setMeta("apple-mobile-web-app-status-bar-style", "default");
    setMeta("apple-mobile-web-app-title", "ZCraft Network");
    setMeta("color-scheme", "light dark");
    setMeta("supported-color-schemes", "light dark");
    setMeta("referrer", "strict-origin-when-cross-origin");

    // Accessibility
    setMeta("viewport", "width=device-width, initial-scale=1.0, viewport-fit=cover");

    // Open Graph tags
    setProperty("og:title", title);
    setProperty("og:description", description);
    setProperty("og:image", absoluteImage);
    setProperty("og:image:alt", `${title} - ZCraft Network`);
    setProperty("og:url", absoluteUrl);
    setProperty("og:type", type || 'website');
    setProperty("og:site_name", "ZCraft Network");
    setProperty("og:image:width", "1200");
    setProperty("og:image:height", "630");
    setProperty("og:image:type", "image/png");

    // Article specific tags
    if (type === 'article' && publishedTime) {
      setProperty("article:published_time", publishedTime);
      setProperty("article:author", author);
      setProperty("article:section", section || "Gaming");
      if (tags.length > 0) {
        tags.forEach(tag => setProperty("article:tag", tag));
      }
      if (updatedTime) {
        setProperty("article:modified_time", updatedTime);
      }
    }

    // Open Graph modification tags
    if (updatedTime) {
      setProperty("og:updated_time", updatedTime);
    }

    // Twitter Card tags
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:site", "@ZCraftNetwork");
    setMeta("twitter:creator", "@ZCraftNetwork");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", absoluteImage);
    setMeta("twitter:image:alt", `${title} - ZCraft Network`);

    // Additional SEO tags for better ranking
    setMeta("theme-color", "#3b82f6");
    setMeta("msapplication-TileColor", "#3b82f6");
    setMeta("application-name", "ZCraft Network");

    // Canonical link
    if (canonical || absoluteUrl) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonical || absoluteUrl);
    }

    // Alternate / multilingual support
    const setAlternate = (hrefLang: string, href: string) => {
      let link = document.querySelector(`link[rel="alternate"][hreflang="${hrefLang}"]`) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'alternate');
        link.setAttribute('hreflang', hrefLang);
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    };

    setAlternate('en', absoluteUrl);

    if (alternateUrls) {
      Object.entries(alternateUrls).forEach(([lang, href]) => {
        const absoluteAlt = href.startsWith('http') ? href : `${origin}${href}`;
        setAlternate(lang, absoluteAlt);
      });
    }

    // Google site verification (if configured)
    const googleVerification = (import.meta.env.VITE_GOOGLE_SITE_VERIFICATION || import.meta.env.GOOGLE_SITE_VERIFICATION) as string | undefined;
    if (googleVerification) {
      setMeta('google-site-verification', googleVerification);
    }

    // Performance hints
    const setPreconnect = (href: string) => {
      let link = document.querySelector(`link[rel="preconnect"][href="${href}"]`) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'preconnect');
        link.setAttribute('href', href);
        link.setAttribute('crossorigin', '');
        document.head.appendChild(link);
      }
    };

    const setDnsPrefetch = (href: string) => {
      let link = document.querySelector(`link[rel="dns-prefetch"][href="${href}"]`) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'dns-prefetch');
        link.setAttribute('href', href);
        document.head.appendChild(link);
      }
    };

    setPreconnect('https://fonts.googleapis.com');
    setPreconnect('https://fonts.gstatic.com');
    setPreconnect('https://cdn.jsdelivr.net');
    setDnsPrefetch('https://fonts.googleapis.com');
    setDnsPrefetch('https://fonts.gstatic.com');
    setDnsPrefetch('https://cdn.jsdelivr.net');

    // Favicon and icons
    const setLink = (rel: string, href: string, attrs: Record<string, string> = {}) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
      Object.entries(attrs).forEach(([key, value]) => {
        link!.setAttribute(key, value);
      });
    };

    setLink("icon", "/favicon.ico");
    setLink("apple-touch-icon", "/apple-touch-icon.png", { sizes: "180x180" });
    setLink("icon", "/favicon-32x32.png", { sizes: "32x32", type: "image/png" });
    setLink("icon", "/favicon-16x16.png", { sizes: "16x16", type: "image/png" });
    setLink("manifest", "/site.webmanifest");

    // RSS / feed links
    if (rssFeeds && rssFeeds.length > 0) {
      rssFeeds.forEach((feed) => {
        setLink("alternate", feed.url, { type: "application/rss+xml", title: feed.title });
      });
    }

    // JSON-LD structured data (Organization + site-level data)
    const ld: any = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "ZCraft Network",
      url: absoluteUrl,
      logo: absoluteImage,
      description: "Premium Minecraft server network featuring lifesteal SMP, survival gameplay, and active community",
      foundingDate: "2024",
      sameAs: [
        "https://discord.gg/zcraft",
        "https://twitter.com/ZCraftNetwork",
        "https://www.youtube.com/@ZCraftNetwork",
        "https://www.tiktok.com/@zcraftnetwork"
      ],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        url: "https://z-craft.xyz/support",
        availableLanguage: ["English"],
        contactOption: "TollFree"
      },
      publisher: {
        "@type": "Organization",
        name: "ZCraft Network",
        logo: {
          "@type": "ImageObject",
          url: absoluteImage
        }
      }
    };

    // Always include WebSite + WebPage for deep SEO
    ld.webSite = {
      "@type": "WebSite",
      url: origin,
      name: "ZCraft Network",
      alternateName: "ZCraft",
      description: "Premium Minecraft Lifesteal & Survival Servers",
      publisher: {
        "@type": "Organization",
        name: "ZCraft Network",
        logo: {
          "@type": "ImageObject",
          url: absoluteImage
        }
      },
      potentialAction: {
        "@type": "SearchAction",
        target: `${origin}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    };

    ld.webPage = {
      "@type": "WebPage",
      name: title,
      description,
      url: absoluteUrl,
      isPartOf: {
        "@type": "WebSite",
        url: origin,
        name: "ZCraft Network"
      },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: []
      }
    };

    if (breadcrumbs && breadcrumbs.length > 0) {
      ld.webPage.breadcrumb.itemListElement = breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: crumb.url.startsWith('http') ? crumb.url : `${origin}${crumb.url}`
      }));
    }

    // Add WebSite SearchAction for better search results
    ld.website = {
      "@type": "WebSite",
      url: origin,
      name: "ZCraft Network",
      description: "Premium Minecraft Lifesteal & Survival Servers",
      potentialAction: {
        "@type": "SearchAction",
        target: `${origin}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      },
      publisher: {
        "@type": "Organization",
        name: "ZCraft Network",
        logo: {
          "@type": "ImageObject",
          url: absoluteImage
        }
      }
    };

    // Add VideoGame structured data for gaming content
    if (type === 'website' || !type) {
      ld.game = {
        "@type": "VideoGame",
        name: "ZCraft Network - Minecraft Server",
        description: "Minecraft server with lifesteal, survival, and community features",
        genre: ["Action", "Adventure", "Simulation"],
        gamePlatform: "PC",
        operatingSystem: "Windows, macOS, Linux",
        applicationCategory: "Game",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          description: "Free to play Minecraft server"
        }
      };
    }

    // Article specific structured data
    if (type === 'article' && publishedTime) {
      ld['@type'] = 'Article';
      ld.headline = title;
      ld.datePublished = publishedTime;
      ld.author = {
        "@type": "Organization",
        name: author
      };
      ld.publisher = {
        "@type": "Organization",
        name: "ZCraft Network",
        logo: {
          "@type": "ImageObject",
          url: absoluteImage
        }
      };
      if (section) ld.articleSection = section;
      if (tags.length > 0) ld.keywords = tags.join(", ");
    }

    // Add custom structured data if provided
    if (structuredData) {
      Object.assign(ld, structuredData);
    }

    // FAQ structured data (for rich result eligibility)
    if (faq && faq.length > 0) {
      const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      };
      // Merge in without overriding existing schema (if any)
      ld.faq = faqJsonLd;
    }

    // Add a JSON-LD script for deep SEO with rich schema
    const scriptId = "zcraft-jsonld";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = scriptId;
      document.head.appendChild(script);
    }
    script.text = JSON.stringify(ld);

    // Performance: Preload critical resources
    const setPreload = (href: string, as: string, type?: string) => {
      let link = document.querySelector(`link[rel="preload"][href="${href}"]`) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'preload');
        link.setAttribute('href', href);
        link.setAttribute('as', as);
        if (type) link.setAttribute('type', type);
        document.head.appendChild(link);
      }
    };

    // Preload critical fonts
    setPreload('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Rajdhani:wght@400;500;600;700&display=swap', 'style');

  }, [
    title,
    description,
    keywords,
    image,
    url,
    type,
    publishedTime,
    updatedTime,
    author,
    section,
    tags,
    noindex,
    canonical,
    structuredData,
    breadcrumbs,
    alternateUrls,
    rssFeeds,
    faq,
    location.pathname,
    location.search,
  ]);

  return null;
}

export default Seo;
