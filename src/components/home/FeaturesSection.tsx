/**
 * ============================================================
 * Features Section Component - Protected by BuiltByBit Anti-Piracy
 * © 2024-2026 ZCraft. All rights reserved.
 * Unauthorized distribution or modification is prohibited.
 * ============================================================
 * This code is protected under international copyright law.
 * Removal of this notice or unauthorized copying will be detected.
 * __BUILTIN_ANTI_PIRACY_CHECK_FEATURES_001__
 */

import { ArrowRight, Crown, Shield, Sparkles, Sword, Users, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { Link } from "react-router-dom";
import { siteConfig } from "@/config/siteEnv";

const featureCards = [
  {
    icon: Sword,
    title: "Combat-forward gameplay",
    description: "Survival modes tuned for fast starts, meaningful progression, and competitive moments that still feel fair.",
  },
  {
    icon: Users,
    title: "Community-driven spaces",
    description: "Forums, events, and in-game activity that make the network feel like a place people return to, not just a server IP.",
  },
  {
    icon: Shield,
    title: "Readable and safe design",
    description: "High-contrast panels, clear focus states, and strong mobile layouts so everyone can use the site comfortably.",
  },
  {
    icon: Zap,
    title: "Fast joins and quick feedback",
    description: "Server details, status, and calls to action are surfaced early so players can get in without hunting around.",
  },
];

const gallery = [
  {
    src: "/showcase/stats-card.png",
    alt: "High-intensity Minecraft PvP event with multiple players in combat",
    label: "Events",
    title: "High-Stakes PvP Battles",
  },
  {
    src: "/showcase/store-card.png",
    alt: "Minecraft store interface showcasing ranks and upgrades",
    label: "Store",
    title: "Premium Ranks & Rewards",
  },
  {
    src: "/zcraft.png",
    alt: `${siteConfig.name} official logo and branding artwork`,
    label: "Branding",
    title: "Iconic Network Identity",
  },
  {
    src: "/showcase/frog.png",
    alt: "Custom Minecraft cosmetic or themed build showcase",
    label: "Cosmetics",
    title: "Unique Visual Experiences",
  },
  {
    src: "/showcase/heromc.jpg",
    alt: "Hero-style Minecraft gameplay showcasing combat or abilities",
    label: "Gameplay",
    title: "Skill-Based Combat System",
  },
  {
    src: "/showcase/mchero.jpg",
    alt: "Minecraft hero-style cinematic scene",
    label: "Cinematics",
    title: "Immersive Visual Moments",
  },
  {
    src: "/showcase/nether.jpg",
    alt: "Nether world gameplay environment with custom terrain",
    label: "Worlds",
    title: "Custom-Built Environments",
  },
];

const stats = [
  { value: "24/7", label: "uptime goals" },
  { value: "1 click", label: "to copy the IP" },
  { value: "3", label: "featured gameplay pillars" },
];

export function FeaturesSection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(38_100%_56%/0.08),transparent_40%),radial-gradient(circle_at_bottom_right,hsl(214_90%_56%/0.08),transparent_34%)]" aria-hidden="true" />

      <div className="container mx-auto px-4 relative">
        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 0.65 }}
            className="space-y-6"
          >
            <span className="section-eyebrow">
              <Crown className="h-4 w-4 text-primary" aria-hidden="true" />
              What makes it feel different
            </span>
            <div className="space-y-4">
              <h2 className="section-title text-balance">
                A site and server identity that feels built, not bolted on
              </h2>
              <p className="section-copy max-w-2xl">
                The new direction leans into Minecraft textures, bold contrast, and focused calls to action while keeping
                every panel readable, keyboard friendly, and easy to scan on smaller screens.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="stat-badge">
                  <div className="font-display text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="mt-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {featureCards.map((feature) => (
                <Card key={feature.title} className="border-border/60 bg-card/90">
                  <CardContent className="flex items-start gap-4 p-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <feature.icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-display text-lg font-bold text-foreground">{feature.title}</h3>
                      <p className="text-sm leading-6 text-muted-foreground">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild className="btn-primary-gradient h-11 px-6">
                <Link to="/play">
                  <Sparkles className="h-4 w-4" />
                  See how to join
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 border-border/60 bg-card/60 px-6">
                <Link to="/news">
                  Latest news
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 0.65 }}
            className="grid gap-4 sm:grid-cols-2"
          >
            {gallery.map((item, index) => (
              <Card
                key={item.title}
                className={`overflow-hidden border-border/60 bg-card/90 ${index === 0 ? "sm:col-span-2" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="image-frame pixel-border">
                    <OptimizedImage
                      src={item.src}
                      alt={item.alt}
                      className={index === 0 ? "aspect-[16/9] w-full object-cover" : "aspect-[4/3] w-full object-cover"}
                    />
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                        {item.label}
                      </div>
                      <h3 className="mt-1 font-display text-xl font-bold text-foreground">{item.title}</h3>
                    </div>
                    <span className="mc-chip">Featured</span>
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
