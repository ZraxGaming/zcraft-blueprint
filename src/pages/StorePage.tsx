import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, ShoppingCart } from "lucide-react";

export default function StorePage() {
  useEffect(() => {
    // Redirect to the canonical store domain/path
    const storeUrl = import.meta.env.VITE_STORE_URL || 'https://store.z-craft.xyz';
    window.location.replace(storeUrl);
  }, []);

  return (
    <Layout
      seo={{
        title: "ZCraft Network Store — Donate & Unlock Exclusive Perks",
        description: "Support ZCraft Network through our official store. Unlock exclusive ranks, cosmetics, perks, and special items for our Minecraft lifesteal SMP server.",
        keywords: "zcraft store, minecraft server store, donate to server, server perks, ranks, cosmetics, tebex, server donations, lifesteal store, minecraft cosmetics",
        url: "/store",
        type: "website",
        tags: ["store", "donate", "perks", "ranks", "cosmetics"]
      }}
    >
      <div className="py-24 text-center">
        <p className="text-lg">Redirecting to the store…</p>
        <p className="mt-4">
          If you are not redirected automatically, <a href="https://z-craft.xyz/store" className="underline">click here</a>.
        </p>
      </div>
    </Layout>
  );
}
