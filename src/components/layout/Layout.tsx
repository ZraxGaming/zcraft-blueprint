import { ReactNode, useEffect } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { CookieBanner } from "./CookieBanner";
import Seo, { SeoProps } from "@/components/seo/Seo";
import Breadcrumbs, { Crumb } from "@/components/ui/Breadcrumbs";
import { useSettings } from "@/contexts/SettingsContext";
import { usePerformanceMonitor } from "@/components/ui/OptimizedImage";

interface LayoutProps {
  children: ReactNode;
  seo?: SeoProps;
  breadcrumbs?: Crumb[];
  skipToContent?: string; // ID of main content for skip links
}

export function Layout({ children, seo, breadcrumbs, skipToContent = "main-content" }: LayoutProps) {
  const { settings } = useSettings();
  const announcementEnabled =
    settings?.announcementEnabled ||
    settings?.announcement_enabled === 'true';
  const announcementMessage =
    settings?.announcementMessage ||
    settings?.announcement_message ||
    null;
  const announcementImage =
    settings?.announcementImage ||
    settings?.announcement_image ||
    null;

  const seoDefaults = {
    title: settings?.seo_title || "ZCraft Network — Premium Minecraft Lifesteal & Skyblock SMP Server",
    description: settings?.seo_description || "Join ZCraft Network, the ultimate Minecraft network with Lifesteal and Skyblock SMP, survival gameplay, custom economy, factions, and active community events.",
    keywords: settings?.seo_keywords || "zcraft, zcraft network, minecraft server, minecraft lifesteal, skyblock, lifesteal skyblock, minecraft survival, minecraft factions, minecraft economy, minecraft pvp, minecraft smp, best minecraft server",
    image: settings?.seo_image || "/zcraft.png",
    type: settings?.seo_type || "website",
  };

  const mergedSeo: SeoProps = {
    ...seoDefaults,
    ...(seo || {}),
  };

  if (breadcrumbs && breadcrumbs.length > 0) {
    mergedSeo.breadcrumbs = breadcrumbs.map((crumb) => ({
      name: crumb.label,
      url: crumb.href || mergedSeo.url || "/",
    }));
  }

  usePerformanceMonitor('Layout');

  // Skip to main content functionality
  useEffect(() => {
    const handleSkipLink = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && e.target instanceof HTMLAnchorElement && e.target.getAttribute('href') === `#${skipToContent}`) {
        e.preventDefault();
        const mainContent = document.getElementById(skipToContent);
        if (mainContent) {
          mainContent.focus();
          mainContent.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    document.addEventListener('keydown', handleSkipLink);
    return () => document.removeEventListener('keydown', handleSkipLink);
  }, [skipToContent]);

  return (
    <div className="flex min-h-screen flex-col">
      <Seo {...mergedSeo} />

      {/* Skip to main content link for accessibility */}
      <a
        href={`#${skipToContent}`}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Skip to main content
      </a>

      <Navbar />

      {/* Announcement banner with better accessibility */}
      {announcementEnabled && announcementMessage && (
        <div
          className="border-b border-primary/15 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(30,41,59,0.92))] text-white"
          role="banner"
          aria-live="polite"
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left shadow-[0_18px_60px_rgba(15,23,42,0.25)] backdrop-blur-sm">
              {announcementImage && (
                <img
                  src={announcementImage}
                  alt=""
                  className="hidden sm:block h-12 w-12 rounded-xl object-cover border border-white/10"
                  aria-hidden="true"
                />
              )}
              <span className="inline-flex h-3 w-3 shrink-0 rounded-full bg-emerald-400 animate-pulse self-start mt-1.5" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60 mb-1">Live Announcement</p>
                <p className="text-sm sm:text-[15px] text-white/95 break-words">{announcementMessage}</p>
              </div>
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

      <CookieBanner />
      <Footer />
    </div>
  );
}
