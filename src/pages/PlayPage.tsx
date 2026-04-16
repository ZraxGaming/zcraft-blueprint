import { BentoPageLayout } from "@/components/layout/BentoPageLayout";
import { Button } from "@/components/ui/button";
import { Copy, Check, Monitor, ChevronRight } from "lucide-react";
import { useState } from "react";
import { siteConfig } from "@/config/siteEnv";
import { motion } from "framer-motion";

const steps = [
  { number: 1, title: "Launch Minecraft", description: "Open Minecraft Java Edition on your device." },
  { number: 2, title: "Add Server", description: "Go to Multiplayer > Add Server and enter our server address." },
  { number: 3, title: "Connect & Play", description: "Select ZCraft from your server list and click Join Server!" },
];

export default function PlayPage() {
  const [copiedJava, setCopiedJava] = useState(false);
  const JAVA_IP = siteConfig.playIp;

  const copyAddress = () => {
    navigator.clipboard.writeText(`${JAVA_IP}:25565`);
    setCopiedJava(true);
    setTimeout(() => setCopiedJava(false), 2000);
  };

  return (
    <BentoPageLayout
      title="How to Join"
      subtitle="Connect to ZCraft in seconds. We support Java Edition!"
      seo={{
        title: "Play ZCraft Network — Minecraft Server IP & How to Join",
        description: "Get ZCraft Network server IP and join our premier Minecraft lifesteal SMP server.",
        keywords: "zcraft server ip, minecraft server ip, play zcraft, join minecraft server",
        url: "/play",
        type: "website",
      }}
    >
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Java Edition Card */}
        <motion.div
          className="bento-card p-8"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <Monitor className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-primary-foreground">Java Edition</h2>
              <p className="text-sm text-primary-foreground/50">PC / Mac / Linux</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-bento-bg">
              <p className="text-sm text-primary-foreground/40 mb-1">Server Address</p>
              <div className="flex items-center gap-2">
                <code className="font-mono text-lg font-semibold text-primary-foreground flex-1">{JAVA_IP}</code>
                <Button variant="outline" size="sm" onClick={copyAddress} className="border-bento-border text-primary-foreground/60 hover:text-primary-foreground">
                  {copiedJava ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-bento-bg">
              <p className="text-sm text-primary-foreground/40 mb-1">Port</p>
              <p className="font-semibold text-primary-foreground">25565</p>
            </div>
            <div className="p-4 rounded-xl bg-bento-bg">
              <p className="text-sm text-primary-foreground/40 mb-1">Supported Versions</p>
              <p className="font-semibold text-primary-foreground">1.8.x – 1.21.x</p>
            </div>
          </div>
        </motion.div>

        {/* Steps */}
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-bold text-primary-foreground text-center mb-6">Quick Start Guide</h2>
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              className="bento-card flex items-start gap-6 p-6"
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-display font-bold text-xl">
                {step.number}
              </div>
              <div className="flex-1">
                <h3 className="font-display text-xl font-semibold text-primary-foreground mb-1">{step.title}</h3>
                <p className="text-primary-foreground/50">{step.description}</p>
              </div>
              {i < steps.length - 1 && <ChevronRight className="h-6 w-6 text-primary-foreground/20 hidden md:block mt-3" />}
            </motion.div>
          ))}
        </div>
      </div>
    </BentoPageLayout>
  );
}
