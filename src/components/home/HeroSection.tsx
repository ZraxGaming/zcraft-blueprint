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

import { Copy, Check, Play, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import zcraftLogo from "@/assets/zcraft-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { siteConfig } from "@/config/siteEnv";

export function HeroSection() {
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<{
    players?: string;
    blocks?: string;
    uptime?: string;
  } | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const { data } = await supabase
          .from("admin_settings")
          .select("key, value")
          .in("key", ["total_players", "total_blocks", "server_uptime"]);

        if (data) {
          const statsMap: Record<string, string> = {};
          data.forEach((item) => {
            statsMap[item.key] = item.value;
          });

          setStats({
            players: statsMap["total_players"],
            blocks: statsMap["total_blocks"],
            uptime: statsMap["server_uptime"],
          });
        } else {
          setStats(null);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        setStats(null);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  const copyIP = () => {
    navigator.clipboard.writeText(siteConfig.playIp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const FALLBACK_STATS = {
    players: "256+",
    blocks: "873k",
    uptime: "87.9%",
  };

  return (
    <section className="relative overflow-hidden py-28 lg:py-40">
      <div className="absolute inset-0 hero-gradient" />

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo */}
          {siteConfig.features.homeHero && (
            <motion.div
              className="mb-10 flex justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                <motion.img
                  src={zcraftLogo}
                  alt={siteConfig.name}
                  className="h-32 md:h-40 lg:h-48 w-auto object-contain"
                  whileHover={{ scale: 1.05 }}
                />
                <motion.div
                  className="absolute -top-4 -right-4"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-6 w-6 text-primary/60" />
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Tagline */}
          {siteConfig.features.homeHero && (
            <motion.p
              className="text-xl md:text-2xl lg:text-3xl text-muted-foreground mb-12 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              A cleaner, more focused Minecraft network experience built around survival, community, and scalable features.
            </motion.p>
          )}

          {/* Buttons */}
          {siteConfig.features.homeHero && (
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  onClick={() => navigate("/play")}
                  className="btn-primary-gradient h-16 px-10 text-lg gap-3 shadow-xl shadow-primary/25"
                >
                  <Play className="h-6 w-6" />
                  Play Now
                </Button>
              </motion.div>

              {siteConfig.features.copyIpButton && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={copyIP}
                    className="h-16 px-10 text-lg gap-3 font-mono border-2 hover:bg-primary/10"
                  >
                    {copied ? (
                      <Check className="h-6 w-6 text-emerald-500" />
                    ) : (
                      <Copy className="h-6 w-6" />
                    )}
                    {siteConfig.playIp}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Stats */}
          {siteConfig.features.heroStats && (
            <motion.div
              className="grid grid-cols-3 gap-8 max-w-xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {loadingStats
                ? Array(3)
                    .fill(null)
                    .map((_, i) => (
                      <div
                        key={i}
                        className="text-center p-4 rounded-xl bg-card/50 border border-border/50"
                      >
                        <div className="h-8 w-24 mx-auto mb-3 animate-pulse bg-muted rounded" />
                        <div className="h-4 w-20 mx-auto animate-pulse bg-muted rounded" />
                      </div>
                    ))
                : [
                    {
                      value: stats?.players ?? FALLBACK_STATS.players,
                      label: "Players",
                    },
                    {
                      value: stats?.blocks ?? FALLBACK_STATS.blocks,
                      label: "Blocks Placed",
                    },
                    {
                      value: stats?.uptime ?? FALLBACK_STATS.uptime,
                      label: "Uptime",
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="text-center p-4 rounded-xl bg-card/50 border border-border/50"
                    >
                      <p className="text-3xl font-bold text-primary">
                        {stat.value}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {stat.label}
                      </p>
                    </div>
                  ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
