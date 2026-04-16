import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, ShoppingCart, Sparkles } from "lucide-react";

export default function StorePage() {
  useEffect(() => {
    const storeUrl = import.meta.env.VITE_STORE_URL || "https://store.z-craft.xyz";
    window.location.replace(storeUrl);
  }, []);

  return (
    <Layout
      seo={{
        title: "ZCraft Network Store - Donate & Unlock Exclusive Perks",
        description:
          "Support ZCraft Network through our official store. Unlock exclusive ranks, cosmetics, perks, and special items.",
        keywords:
          "zcraft store, minecraft server store, donate to server, server perks, ranks, cosmetics, tebex, server donations, lifesteal store, minecraft cosmetics",
        url: "/store",
        type: "website",
        tags: ["store", "donate", "perks", "ranks", "cosmetics"],
      }}
    >
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 hero-gradient" aria-hidden="true" />
        <div className="container mx-auto px-4 relative">
          <Card className="mx-auto max-w-3xl border-border/60 bg-card/90">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                <ShoppingCart className="h-8 w-8" />
              </div>
              <span className="section-eyebrow mx-auto mb-4">
                <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                Store redirect
              </span>
              <h1 className="section-title text-balance text-4xl sm:text-5xl">
                Redirecting to the <span className="text-gradient">Store</span>
              </h1>
              <p className="section-copy mx-auto mt-4 max-w-2xl">
                The store opens on our canonical storefront so ranks, cosmetics, and perks stay in one place.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild className="btn-primary-gradient h-12 px-6">
                  <a href={import.meta.env.VITE_STORE_URL || "https://store.z-craft.xyz"} target="_self" rel="noreferrer">
                    Open store now
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
