import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Seo, { SeoProps } from "@/components/seo/Seo";
import { siteConfig } from "@/config/siteEnv";

interface BentoPageLayoutProps {
  children: ReactNode;
  seo?: SeoProps;
  title: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
}

export function BentoPageLayout({
  children,
  seo,
  title,
  subtitle,
  backTo = "/",
  backLabel = "Back",
}: BentoPageLayoutProps) {
  return (
    <div className="min-h-screen bg-bento-bg text-primary-foreground">
      {seo && <Seo {...seo} />}

      {/* Top bar */}
      <motion.nav
        className="sticky top-0 z-50 bg-bento-bg/80 backdrop-blur-xl border-b border-bento-border"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            to={backTo}
            className="flex items-center gap-2 text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
          <Link to="/" className="font-display text-lg font-bold text-primary">
            {siteConfig.shortName}
          </Link>
        </div>
      </motion.nav>

      {/* Page header */}
      <motion.header
        className="pt-12 pb-8 px-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3 text-primary-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg text-primary-foreground/50 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      </motion.header>

      {/* Content */}
      <motion.main
        className="px-4 pb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="max-w-5xl mx-auto">{children}</div>
      </motion.main>
    </div>
  );
}
