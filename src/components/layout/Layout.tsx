import { ReactNode, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { CookieBanner } from "./CookieBanner";
import Seo, { SeoProps } from "@/components/seo/Seo";
import Breadcrumbs, { Crumb } from "@/components/ui/Breadcrumbs";
import { useSettings } from "@/contexts/SettingsContext";
import { siteConfig } from "@/config/siteEnv";
import { motion } from "framer-motion";

interface LayoutProps {
  children: ReactNode;
  seo?: SeoProps;
  breadcrumbs?: Crumb[];
  skipToContent?: string;
}

export function Layout({ children, seo, breadcrumbs, skipToContent = "main-content" }: LayoutProps) {
  const { settings } = useSettings();
  const location = useLocation();

  const seoDefaults = {
    title: settings?.seo_title || siteConfig.seo.title,
    description: settings?.seo_description || siteConfig.seo.description,
    keywords: settings?.seo_keywords || siteConfig.seo.keywords,
    image: settings?.seo_image || siteConfig.seo.image,
    type: settings?.seo_type || siteConfig.seo.type,
  };

  const mergedSeo: SeoProps = { ...seoDefaults, ...(seo || {}) };

  if (breadcrumbs?.length) {
    mergedSeo.breadcrumbs = breadcrumbs.map((crumb) => ({
      name: crumb.label,
      url: crumb.href || mergedSeo.url || "/",
    }));
  }

  return (
    <div className="min-h-screen bg-bento-bg text-primary-foreground">
      <Seo {...mergedSeo} />

      {/* Minimal top bar */}
      <motion.nav
        className="sticky top-0 z-50 bg-bento-bg/80 backdrop-blur-xl border-b border-bento-border"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <Link to="/" className="font-display text-lg font-bold text-primary">
            {siteConfig.shortName}
          </Link>
        </div>
      </motion.nav>

      {breadcrumbs && (
        <div className="max-w-5xl mx-auto px-4 pt-4">
          <Breadcrumbs crumbs={breadcrumbs} />
        </div>
      )}

      <motion.main
        id={skipToContent}
        className="flex-1 focus:outline-none px-4 pb-16 pt-6"
        tabIndex={-1}
        role="main"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="max-w-5xl mx-auto">{children}</div>
      </motion.main>
    </div>
  );
}
