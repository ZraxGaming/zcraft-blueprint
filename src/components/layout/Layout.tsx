import { ReactNode, useEffect } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { CookieBanner } from "./CookieBanner";
import Seo, { SeoProps } from "@/components/seo/Seo";
import Breadcrumbs, { Crumb } from "@/components/ui/Breadcrumbs";
import { useSettings } from "@/contexts/SettingsContext";
import { usePerformanceMonitor } from "@/components/ui/OptimizedImage";
import { siteConfig } from "@/config/siteEnv";
import { Link, useLocation } from "react-router-dom";
import { Megaphone, Sparkles } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  seo?: SeoProps;
  breadcrumbs?: Crumb[];
  skipToContent?: string;
}

export function Layout({ children, seo, breadcrumbs, skipToContent = "main-content" }: LayoutProps) {
  const { settings } = useSettings();
  const location = useLocation();
  const announcementEnabled = settings?.announcementEnabled || settings?.announcement_enabled === "true";
  const announcementMessage = settings?.announcementMessage || settings?.announcement_message || null;
  const announcementImage = settings?.announcementImage || settings?.announcement_image || null;
  const isAuthShell =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/forgot-password" ||
    location.pathname === "/reset-password" ||
    location.pathname === "/auth/callback" ||
    location.pathname === "/auth/discord/callback" ||
    location.pathname === "/verify-identity";

  const seoDefaults = {
    title: settings?.seo_title || siteConfig.seo.title,
    description: settings?.seo_description || siteConfig.seo.description,
    keywords: settings?.seo_keywords || siteConfig.seo.keywords,
    image: settings?.seo_image || siteConfig.seo.image,
    type: settings?.seo_type || siteConfig.seo.type,
  };

  const mergedSeo: SeoProps = {
    ...seoDefaults,
    ...(seo || {}),
  };

  if (breadcrumbs?.length) {
    mergedSeo.breadcrumbs = breadcrumbs.map((crumb) => ({
      name: crumb.label,
      url: crumb.href || mergedSeo.url || "/",
    }));
  }

  usePerformanceMonitor("Layout");

  useEffect(() => {
    const handleSkipLink = (e: KeyboardEvent) => {
      if (e.key === "Enter" && e.target instanceof HTMLAnchorElement && e.target.getAttribute("href") === `#${skipToContent}`) {
        e.preventDefault();
        const mainContent = document.getElementById(skipToContent);
        if (mainContent) {
          mainContent.focus();
          mainContent.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    document.addEventListener("keydown", handleSkipLink);
    return () => document.removeEventListener("keydown", handleSkipLink);
  }, [skipToContent]);

  return (
    <div className="flex min-h-screen flex-col">
      <Seo {...mergedSeo} />

      <a
        href={`#${skipToContent}`}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Skip to main content
      </a>

      {isAuthShell ? (
        <header className="border-b border-border/60 bg-card/85 backdrop-blur supports-[backdrop-filter]:bg-card/75">
          <div className="container mx-auto flex h-16 items-center px-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={siteConfig.logo} alt="" aria-hidden="true" className="h-9 w-9 rounded-lg object-cover" />
              <span className="font-display text-lg font-bold text-gradient">{siteConfig.shortName}</span>
            </Link>
          </div>
        </header>
      ) : (
        <Navbar />
      )}

      {!isAuthShell && siteConfig.features.announcementBanner && announcementEnabled && announcementMessage && (
        <div
          className="announcement-strip text-foreground"
          role="banner"
          aria-live="polite"
        >
          <div className="container mx-auto px-4 py-3">
            <div className="metal-surface metal-surface-strong mx-auto flex max-w-5xl flex-col gap-4 rounded-[1.5rem] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative z-10 flex items-start gap-4 text-left">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-card/55 text-primary">
                  <Megaphone className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="metal-chip">Live announcement</span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                      Server update
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-foreground/90 sm:text-[15px]">
                    {announcementMessage}
                  </p>
                </div>
              </div>
              {announcementImage && (
                <img
                  src={announcementImage}
                  alt=""
                  className="relative z-10 h-16 w-full max-w-[128px] rounded-2xl border border-border/60 object-cover"
                  aria-hidden="true"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {breadcrumbs && <Breadcrumbs crumbs={breadcrumbs} />}

      <main
        id={skipToContent}
        className="flex-1 focus:outline-none motion-safe:animate-fade-in"
        tabIndex={-1}
        role="main"
      >
        {children}
      </main>

      {!isAuthShell && siteConfig.features.cookieBanner && <CookieBanner />}
      {!isAuthShell && <Footer />}
    </div>
  );
}
