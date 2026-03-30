import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { CommunitySection } from "@/components/home/CommunitySection";

const Index = () => {
  return (
    <Layout
      seo={{
        title: "ZCraft Network — #1 Minecraft Lifesteal & Skyblock SMP Server | Join Now",
        description: "Join ZCraft Network for Lifesteal & Skyblock action, ranked PvP, custom economy, factions, and an active community. Play on the best multi-mode Minecraft network with cross-platform support.",
        keywords: "zcraft network, minecraft lifesteal, minecraft skyblock, lifesteal skyblock server, minecraft smp, best minecraft server, competitive minecraft, minecraft economy, minecraft factions, minecraft community server",
        url: "/",
        type: "website",
        tags: ["minecraft", "lifesteal", "skyblock", "smp", "server", "gaming", "community"]
      }}
    >
      <HeroSection />
      <FeaturesSection />
      <CommunitySection />
    </Layout>
  );
};

export default Index;
