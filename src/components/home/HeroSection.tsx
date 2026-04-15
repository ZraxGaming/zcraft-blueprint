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

import { Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import zcraftLogo from "@/assets/zcraft-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { siteConfig } from "@/config/siteEnv";

export function HeroSection() {
  const [copied, setCopied] = useState(false);
  const [playerCount, setPlayerCount] = useState<number>(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await supabase
          .from("admin_settings")
          .select("key, value")
          .eq("key", "total_players")
          .single();

        if (data) {
          setPlayerCount(parseInt(data.value) || 0);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    fetchStats();
  }, []);

  const copyIP = () => {
    navigator.clipboard.writeText(siteConfig.playIp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
    }),
  };

  return (
    <div className="bento-container">
      <div className="bento-grid w-full">
        {/* Row 1: Logo + IP (left) | Media Card (right) */}
        {/* Logo Card */}
        <motion.div
          className="bento-card col-span-5 row-span-1 flex flex-col items-center justify-center p-6 bg-primary"
          custom={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <Link to="/" className="flex items-center justify-center w-full h-full">
            <img
              src={zcraftLogo}
              alt={siteConfig.name}
              className="h-24 md:h-32 w-auto object-contain drop-shadow-2xl"
            />
          </Link>
        </motion.div>

        {/* Media / News Card */}
        <motion.div
          className="bento-card col-span-7 row-span-1 relative min-h-[200px] overflow-hidden group"
          custom={1}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <Link to="/news" className="block w-full h-full">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bento-card/90 z-10" />
            <div className="absolute inset-0 bg-primary/10" />
            <div className="absolute top-4 left-4 z-20">
              <span className="font-display text-xl font-bold text-primary-foreground drop-shadow-lg">
                News
              </span>
            </div>
            <div className="absolute bottom-4 left-4 z-20">
              <span className="text-sm text-primary-foreground/80">Latest Updates →</span>
            </div>
            {/* Decorative blocks */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <div className="grid grid-cols-4 gap-2">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded bg-primary/40"
                    style={{ transform: `rotate(${Math.random() * 20 - 10}deg)` }}
                  />
                ))}
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Row 2: IP Copy Button */}
        <motion.div
          className="col-span-5 flex items-center justify-center"
          custom={2}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <button
            onClick={copyIP}
            className="bento-card flex items-center gap-3 px-5 py-3 w-full justify-center group"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4 text-primary-foreground/60 group-hover:text-primary transition-colors" />
            )}
            <span className="font-mono text-sm font-semibold text-primary-foreground uppercase tracking-wider">
              {siteConfig.playIp}
            </span>
            <span className="flex items-center gap-1.5 ml-2 bg-bento-card-hover rounded-full px-3 py-1">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-primary-foreground/80">{playerCount}</span>
            </span>
          </button>
        </motion.div>

        {/* Empty space for alignment on row 2 right side — stats card takes it */}

        {/* Row 2-3: Discord Card (left) | Stats Card (right) */}
        {/* Discord Card */}
        <motion.a
          href={siteConfig.discordUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bento-card col-span-5 row-span-1 flex flex-col items-center justify-center p-8 gap-3"
          custom={3}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Discord icon */}
          <svg className="h-12 w-12 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
          <span className="font-display text-2xl font-bold text-primary-foreground">1,200+</span>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-sm text-primary-foreground/60">Discord Members</span>
          </div>
          <span className="text-xs text-primary/80 mt-2 font-medium">Join the Discord</span>
        </motion.a>

        {/* Stats Card */}
        <motion.div
          className="bento-card col-span-7 row-span-1 relative min-h-[200px] overflow-hidden group"
          custom={4}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <Link to="/status" className="block w-full h-full">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bento-card/90 z-10" />
            <div className="absolute inset-0 bg-accent/10" />
            <div className="absolute top-4 left-4 z-20">
              <span className="font-display text-xl font-bold text-primary-foreground drop-shadow-lg">
                Stats
              </span>
            </div>
            <div className="absolute bottom-4 left-4 z-20">
              <span className="text-sm text-primary-foreground/80">View Server Stats →</span>
            </div>
            {/* Decorative elements */}
            <div className="absolute inset-0 flex items-center justify-center opacity-15">
              <div className="grid grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-lg bg-primary/30"
                    style={{ transform: `rotate(${Math.random() * 30 - 15}deg)` }}
                  />
                ))}
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Row 3: Play / How To Join Card (full width) */}
        <motion.div
          className="bento-card col-span-12 relative min-h-[180px] overflow-hidden group"
          custom={5}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <Link to="/play" className="block w-full h-full">
            <div className="absolute inset-0 bg-gradient-to-r from-bento-card via-transparent to-bento-card z-10" />
            <div className="absolute inset-0 bg-primary/5" />
            <div className="absolute top-4 left-6 z-20">
              <span className="font-display text-xl font-bold text-primary-foreground drop-shadow-lg">
                How To Join
              </span>
            </div>
            <div className="absolute bottom-6 left-6 z-20 space-y-2">
              <div className="text-sm text-primary-foreground/50">Server Name</div>
              <div className="font-mono text-lg text-primary-foreground font-medium">{siteConfig.shortName}</div>
              <div className="text-sm text-primary-foreground/50 mt-2">Server Address</div>
              <div className="font-mono text-lg text-primary-foreground font-medium">{siteConfig.playIp}</div>
            </div>
            <div className="absolute bottom-6 right-6 z-20">
              <span className="text-sm text-primary/80 font-medium">Start Playing →</span>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
