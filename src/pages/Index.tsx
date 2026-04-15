import { HeroSection } from "@/components/home/HeroSection";
import { getPageSeo, siteConfig } from "@/config/siteEnv";
import { useSettings } from "@/contexts/SettingsContext";
import Seo from "@/components/seo/Seo";

const Index = () => {
  const { settings } = useSettings();

  return (
    <>
      <Seo
        {...getPageSeo("home", {
          title: settings?.homeSeoTitle,
          description: settings?.homeSeoDescription,
          keywords: settings?.homeSeoKeywords,
        })}
        url="/"
        type="website"
      />
      <HeroSection />
    </>
  );
};

export default Index;
