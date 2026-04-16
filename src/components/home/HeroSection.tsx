/**
 * ============================================================
 * Hero Section Component - Protected by BuiltByBit Anti-Piracy
 * © 2024-2026 ZCraft. All rights reserved.
 * Unauthorized distribution or modification is prohibited.
 * ============================================================
 * This code is protected under international copyright law.
 * Removal of this notice or unauthorized copying will be detected.
 * __BUILTIN_ANTI_PIRACY_CHECK_HERO_001__
 */

import { Copy, Check, Play, Sparkles, ArrowRight, ShieldCheck, Server, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { supabase } from "@/integrations/supabase/client";
import { siteConfig } from "@/config/siteEnv";

const featuredArt = [
  {
    src: "/zcraft.png",
    alt: `${siteConfig.name} logo artwork`,
    className: "aspect-[1.02/1] w-full object-contain p-6 md:p-8",
    title: "Server branding",
    caption: "A bold, instantly recognizable start screen for the network.",
  },
  {
    src: "/showcase/stats-card.png",
    alt: "Minecraft action scene with a runner in a top hat and explosions",
    className: "aspect-[16/10] w-full object-cover",
    title: "Event energy",
    caption: "Use this as a high-impact feature card or banner.",
  },
  {
    src: "/showcase/store-card.png",
    alt: "Minecraft players around a glowing block in a bright arena",
    className: "aspect-[16/10] w-full object-cover",
    title: "Community showcase",
    caption: "A bright, competitive look that still feels playful.",
  },
];

const floatingTags = [
  { icon: Server, label: "Java IP", value: siteConfig.playIp },
  { icon: Users, label: "Community", value: "Active daily" },
  { icon: ShieldCheck, label: "Fair play", value: "Moderated staff" },
];

const decorativeOrbs = [
  { className: "left-[6%] top-[12%] h-24 w-24 bg-blue-400/10 blur-3xl" },
  { className: "right-[12%] top-[16%] h-28 w-28 bg-cyan-400/8 blur-3xl" },
];

export function HeroSection() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<{ players?: string; blocks?: string; uptime?: string } | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const { data } = await supabase
          .from("admin_settings")
          .select("key, value")
          .in("key", ["total_players", "total_blocks", "server_uptime"]);

        if (!active) return;

        if (data) {
          const statsMap: Record<string, string> = {};
          data.forEach((item) => {
            statsMap[item.key] = item.value;
          });

          setStats({
            players: statsMap.total_players,
            blocks: statsMap.total_blocks,
            uptime: statsMap.server_uptime,
          });
        } else {
          setStats(null);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        if (active) setStats(null);
      } finally {
        if (active) setLoadingStats(false);
      }
    };

    fetchStats();

    return () => {
      active = false;
    };
  }, []);

  const copyIP = async () => {
    try {
      await navigator.clipboard.writeText(siteConfig.playIp);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy IP", error);
    }
  };

  const FALLBACK_STATS = {
    players: "256+",
    blocks: "873k",
    uptime: "99.9%",
  };

  return (
    <section className="relative isolate overflow-hidden py-16 sm:py-20 lg:py-24">
      <div className="absolute inset-0 hero-gradient" aria-hidden="true" />
      <div
        className="absolute inset-0 opacity-[0.16]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />
      {decorativeOrbs.map((orb) => (
        <div key={orb.className} className={`absolute rounded-full ${orb.className}`} aria-hidden="true" />
      ))}

      <div className="container mx-auto px-4 relative">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="space-y-6">
              <span className="section-eyebrow">
                <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                Minecraft-inspired, community-first
              </span>

              <div className="space-y-4">
                <h1 className="section-title text-balance text-4xl sm:text-5xl lg:text-7xl">
                  Build, battle, and belong on{" "}
                  <span className="text-gradient">{siteConfig.shortName}</span>
                </h1>
                <p className="section-copy max-w-2xl text-base sm:text-lg lg:text-xl">
                  A polished Minecraft network experience shaped around Lifesteal, Skyblock, and a welcoming
                  community. Join with one click, explore custom events, and jump into a server that feels alive.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" onClick={() => navigate("/play")} className="btn-primary-gradient h-14 px-7 text-base">
                  <Play className="h-5 w-5" />
                  Play now
                </Button>
                {siteConfig.features.copyIpButton && (
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={copyIP}
                      className="h-14 px-7 text-base border-border/60 bg-card/60 text-foreground hover:bg-card/80"
                      aria-label={copied ? "Server IP copied to clipboard" : "Copy server IP address"}
                    >
                    {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                    {siteConfig.playIp}
                  </Button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {floatingTags.map((tag) => (
                  <div key={tag.label} className="stat-badge">
                    <tag.icon className="mb-2 h-5 w-5 text-primary" aria-hidden="true" />
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                      {tag.label}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-foreground">{tag.value}</div>
                  </div>
                ))}
              </div>

              <div className="panel-surface rounded-3xl p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                      Server connection
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="font-display text-lg font-bold text-foreground">{siteConfig.playIp}</span>
                      <span className="mc-chip">Java 1.8 - 1.21.x</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="justify-start gap-2 px-0 text-primary hover:bg-transparent hover:text-primary/90"
                    onClick={copyIP}
                  >
                    {copied ? "Copied" : "Copy IP"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {loadingStats
                    ? Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="rounded-2xl border border-border/60 bg-card/70 p-4">
                          <div className="h-3 w-20 animate-pulse rounded bg-blue-100" />
                          <div className="mt-3 h-6 w-16 animate-pulse rounded bg-blue-100" />
                        </div>
                      ))
                    : [
                        { label: "Players", value: stats?.players ?? FALLBACK_STATS.players },
                        { label: "Blocks", value: stats?.blocks ?? FALLBACK_STATS.blocks },
                        { label: "Uptime", value: stats?.uptime ?? FALLBACK_STATS.uptime },
                      ].map((item) => (
                        <div key={item.label} className="rounded-2xl border border-border/60 bg-card/70 p-4">
                          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                            {item.label}
                          </div>
                          <div className="mt-1 text-2xl font-bold text-foreground">{item.value}</div>
                        </div>
                      ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="grid gap-4 sm:grid-cols-2"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.08, ease: "easeOut" }}
          >
            <Card className="sm:col-span-2 overflow-hidden border-border/60 bg-card/95">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                      Featured artwork
                    </div>
                    <h2 className="mt-1 font-display text-2xl font-bold text-foreground">A brighter server identity</h2>
                  </div>
                  <span className="mc-chip">Gallery-ready</span>
                </div>
                <div className="mt-4 image-frame pixel-border">
                  <OptimizedImage
                    src={featuredArt[0].src}
                    alt={featuredArt[0].alt}
                    priority
                    className={featuredArt[0].className}
                  />
                </div>
              </CardContent>
            </Card>

            {featuredArt.slice(1).map((asset) => (
              <Card key={asset.src} className="overflow-hidden border-border/60 bg-card/90">
                <CardContent className="p-3 sm:p-4">
                  <div className="image-frame pixel-border">
                    <OptimizedImage src={asset.src} alt={asset.alt} className={asset.className} />
                  </div>
                  <div className="mt-3 space-y-1">
                    <h3 className="font-display text-lg font-bold text-foreground">{asset.title}</h3>
                    <p className="text-sm leading-6 text-muted-foreground">{asset.caption}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
