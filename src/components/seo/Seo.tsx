import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { siteConfig, toAbsoluteUrl } from "@/config/siteEnv";

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
  type?: "website" | "article" | "profile" | string;
  publishedTime?: string;
  updatedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  noindex?: boolean;
  canonical?: string;
  structuredData?: any;
  breadcrumbs?: SeoBreadcrumb[];
  alternateUrls?: Record<string, string>;
  rssFeeds?: RssFeedLink[];
  faq?: SeoFaqItem[];
}

function setMeta(name: string, content?: string) {
  if (!content) return;
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setProperty(prop: string, content?: string) {
  if (!content) return;
  let el = document.querySelector(`meta[property="${prop}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", prop);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string, attrs: Record<string, string> = {}) {
  let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", rel);
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
  Object.entries(attrs).forEach(([key, value]) => link!.setAttribute(key, value));
}

function setAlternate(hrefLang: string, href: string) {
  let link = document.querySelector(`link[rel="alternate"][hreflang="${hrefLang}"]`) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "alternate");
    link.setAttribute("hreflang", hrefLang);
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
}

export function Seo({
  title = siteConfig.seo.title,
  description = siteConfig.seo.description,
  keywords = siteConfig.seo.keywords,
  image = siteConfig.seo.image,
  url,
  type = "website",
  publishedTime,
  updatedTime,
  author = siteConfig.seo.author,
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
    document.title = title;

    const origin = siteConfig.url;
    const currentPath = url || `${location.pathname}${location.search || ""}`;
    const absoluteUrl = currentPath.startsWith("http") ? currentPath : toAbsoluteUrl(currentPath);
    const absoluteImage = image.startsWith("http") ? image : toAbsoluteUrl(image);

    setMeta("description", description);
    setMeta("keywords", keywords);
    setMeta("author", author);
    setMeta("robots", noindex ? "noindex, nofollow" : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1");
    setMeta("googlebot", noindex ? "noindex, nofollow" : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1");
    setMeta("bingbot", noindex ? "noindex, nofollow" : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1");
    document.documentElement.lang = "en";
    setMeta("language", "en-US");
    setProperty("og:locale", "en_US");
    setMeta("theme-color", siteConfig.themeColor);
    setMeta("msapplication-TileColor", siteConfig.themeColor);
    setMeta("application-name", siteConfig.name);
    setMeta("mobile-web-app-capable", "yes");
    setMeta("apple-mobile-web-app-capable", "yes");
    setMeta("apple-mobile-web-app-status-bar-style", "default");
    setMeta("apple-mobile-web-app-title", siteConfig.name);
    setMeta("color-scheme", "light dark");
    setMeta("supported-color-schemes", "light dark");
    setMeta("referrer", "strict-origin-when-cross-origin");
    setMeta("viewport", "width=device-width, initial-scale=1.0, viewport-fit=cover");

    setProperty("og:title", title);
    setProperty("og:description", description);
    setProperty("og:image", absoluteImage);
    setProperty("og:image:alt", `${title} - ${siteConfig.name}`);
    setProperty("og:url", absoluteUrl);
    setProperty("og:type", type);
    setProperty("og:site_name", siteConfig.name);
    setProperty("og:image:width", "1200");
    setProperty("og:image:height", "630");
    setProperty("og:image:type", "image/png");

    if (type === "article" && publishedTime) {
      setProperty("article:published_time", publishedTime);
      setProperty("article:author", author);
      setProperty("article:section", section || "Gaming");
      tags.forEach((tag) => setProperty("article:tag", tag));
      if (updatedTime) setProperty("article:modified_time", updatedTime);
    }

    if (updatedTime) {
      setProperty("og:updated_time", updatedTime);
    }

    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:site", siteConfig.twitterHandle);
    setMeta("twitter:creator", siteConfig.twitterHandle);
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", absoluteImage);
    setMeta("twitter:image:alt", `${title} - ${siteConfig.name}`);

    const canonicalUrl = canonical || absoluteUrl;
    if (canonicalUrl) {
      setLink("canonical", canonicalUrl);
    }

    setAlternate("en", absoluteUrl);
    setAlternate("x-default", absoluteUrl);
    if (alternateUrls) {
      Object.entries(alternateUrls).forEach(([lang, href]) => {
        setAlternate(lang, href.startsWith("http") ? href : toAbsoluteUrl(href));
      });
    }

    const googleVerification = (import.meta.env.VITE_GOOGLE_SITE_VERIFICATION || import.meta.env.GOOGLE_SITE_VERIFICATION) as string | undefined;
    if (googleVerification) {
      setMeta("google-site-verification", googleVerification);
    }

    const preconnect = (href: string) => {
      let link = document.querySelector(`link[rel="preconnect"][href="${href}"]`) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "preconnect");
        link.setAttribute("href", href);
        link.setAttribute("crossorigin", "");
        document.head.appendChild(link);
      }
    };

    const dnsPrefetch = (href: string) => {
      let link = document.querySelector(`link[rel="dns-prefetch"][href="${href}"]`) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "dns-prefetch");
        link.setAttribute("href", href);
        document.head.appendChild(link);
      }
    };

    preconnect("https://fonts.googleapis.com");
    preconnect("https://fonts.gstatic.com");
    preconnect("https://cdn.jsdelivr.net");
    dnsPrefetch("https://fonts.googleapis.com");
    dnsPrefetch("https://fonts.gstatic.com");
    dnsPrefetch("https://cdn.jsdelivr.net");

    setLink("icon", siteConfig.icon);
    setLink("apple-touch-icon", siteConfig.appleTouchIcon, { sizes: "180x180" });
    setLink("manifest", "/site.webmanifest");

    if (rssFeeds?.length) {
      rssFeeds.forEach((feed) => {
        setLink("alternate", feed.url, { type: "application/rss+xml", title: feed.title });
      });
    }

    const breadcrumbItems =
      breadcrumbs?.length
        ? breadcrumbs
        : location.pathname
            .split("/")
            .filter(Boolean)
            .map((segment, index, segments) => ({
              name: segment.replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
              url: toAbsoluteUrl(`/${segments.slice(0, index + 1).join("/")}`),
            }));

    const ld: any = {
      "@context": "https://schema.org",
      "@type": type === "article" && publishedTime ? "Article" : "Organization",
      name: siteConfig.name,
      url: absoluteUrl,
      logo: absoluteImage,
      description,
      sameAs: [siteConfig.discordUrl],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        url: toAbsoluteUrl(siteConfig.supportUrl),
        availableLanguage: ["English"],
      },
      publisher: {
        "@type": "Organization",
        name: siteConfig.name,
        logo: {
          "@type": "ImageObject",
          url: absoluteImage,
        },
      },
      webSite: {
        "@type": "WebSite",
        url: origin,
        name: siteConfig.name,
        description: siteConfig.seo.description,
        potentialAction: {
          "@type": "SearchAction",
          target: `${origin}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      webPage: {
        "@type": "WebPage",
        name: title,
        description,
        url: absoluteUrl,
        isPartOf: {
          "@type": "WebSite",
          url: origin,
          name: siteConfig.name,
        },
      },
    };

    if (breadcrumbItems.length) {
      ld.webPage.breadcrumb = {
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbItems.map((crumb, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: crumb.name,
          item: crumb.url.startsWith("http") ? crumb.url : toAbsoluteUrl(crumb.url),
        })),
      };
    }

    if (type === "website" || !type) {
      ld.game = {
        "@type": "VideoGame",
        name: `${siteConfig.name} - Minecraft Server`,
        description: siteConfig.seo.description,
        genre: ["Action", "Adventure", "Simulation"],
        gamePlatform: "PC",
        operatingSystem: "Windows, macOS, Linux",
      };
    }

    if (type === "article" && publishedTime) {
      ld.headline = title;
      ld.datePublished = publishedTime;
      ld.author = { "@type": "Organization", name: author };
      if (section) ld.articleSection = section;
      if (tags.length) ld.keywords = tags.join(", ");
      if (updatedTime) ld.dateModified = updatedTime;
    }

    if (structuredData) {
      Object.assign(ld, structuredData);
    }

    const schemaPayload =
      faq?.length
        ? [
            ld,
            {
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
            },
          ]
        : ld;

    const scriptId = "zcraft-jsonld";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = scriptId;
      document.head.appendChild(script);
    }
    script.text = JSON.stringify(schemaPayload);

    const preload = (href: string, as: string, type?: string) => {
      let link = document.querySelector(`link[rel="preload"][href="${href}"]`) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "preload");
        link.setAttribute("href", href);
        link.setAttribute("as", as);
        if (type) link.setAttribute("type", type);
        document.head.appendChild(link);
      }
    };

    preload("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Rajdhani:wght@400;500;600;700&display=swap", "style");
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
