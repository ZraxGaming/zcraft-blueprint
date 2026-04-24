import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { CommunitySection } from "@/components/home/CommunitySection";
import { getPageSeo, siteConfig } from "@/config/siteEnv";
import { useSettings } from "@/contexts/SettingsContext";
import { ensureIntegrityPulse } from "@/lib/_ig";
import { useEffect } from "react";

const Index = () => {
  const { settings } = useSettings();

  useEffect(() => {
    ensureIntegrityPulse();
  }, []);

  return (
    <Layout
      seo={{
        ...getPageSeo("home", {
          title: settings?.homeSeoTitle,
          description: settings?.homeSeoDescription,
          keywords: settings?.homeSeoKeywords,
        }),
        url: "/",
        type: "website",
        tags: ["minecraft", "lifesteal", "skyblock", "smp", "server", "gaming", "community"],
      }}
    >
      {siteConfig.features.homeHero && <HeroSection />}
      {siteConfig.features.homeFeatures && <FeaturesSection />}
      {siteConfig.features.homeCommunity && <CommunitySection />}
    </Layout>
  );
};

export default Index;
