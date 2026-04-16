import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Copy, Monitor, ChevronRight, Sparkles, Server, ShieldCheck } from "lucide-react";
import { useState } from "react";
import ServerLiveCard from "@/components/server/ServerLiveCard";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { siteConfig } from "@/config/siteEnv";

const steps = [
  {
    number: 1,
    title: "Open Minecraft Java Edition",
    description: "Use any supported launcher and make sure you are on a compatible version.",
  },
  {
    number: 2,
    title: "Add the server address",
    description: "Open Multiplayer, choose Add Server, and paste the IP shown on this page.",
  },
  {
    number: 3,
    title: "Join and start playing",
    description: "Save the entry, select ZCraft from your list, and jump into the network.",
  },
];

const joinNotes = [
  { icon: Server, label: "IP", value: siteConfig.playIp },
  { icon: Monitor, label: "Version", value: "1.8 - 1.21.x" },
  { icon: ShieldCheck, label: "Support", value: "Help from staff and Discord" },
];

export default function PlayPage() {
  const [copiedJava, setCopiedJava] = useState(false);
  const JAVA_IP = siteConfig.playIp;
  const JAVA_PORT = "25565";

  const copyAddress = async () => {
    const address = `${JAVA_IP}:${JAVA_PORT}`;
    await navigator.clipboard.writeText(address);
    setCopiedJava(true);
    window.setTimeout(() => setCopiedJava(false), 2000);
  };

  return (
    <Layout
      seo={{
        title: "Play ZCraft Network - Minecraft Server IP & How to Join",
        description:
          "Get the ZCraft Network server IP and join our Minecraft Lifesteal SMP server. Java compatible with custom plugins, economy systems, and community events.",
        keywords:
          "zcraft server ip, minecraft server ip, play zcraft, join minecraft server, lifesteal server ip, minecraft java, zcraft network ip, minecraft smp server",
        url: "/play",
        type: "website",
        tags: ["minecraft server", "server ip", "java", "lifesteal", "smp"],
      }}
    >
      <section className="relative overflow-hidden py-16 lg:py-20">
        <div className="absolute inset-0 hero-gradient" aria-hidden="true" />
        <div className="absolute inset-0 opacity-[0.14]" aria-hidden="true" style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }} />

        <div className="container mx-auto px-4 relative">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="space-y-6">
              <span className="section-eyebrow">
                <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                Fast join guide
              </span>
              <div className="space-y-4">
                <h1 className="section-title text-balance text-4xl sm:text-5xl lg:text-6xl">
                  Join <span className="text-gradient">{siteConfig.shortName}</span> in seconds
                </h1>
                <p className="section-copy max-w-2xl text-base sm:text-lg">
                  Everything you need to connect is on this page: the address, the version, live server status, and a
                  simple three-step guide that works well on both desktop and mobile.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button className="btn-primary-gradient h-12 px-6" onClick={copyAddress}>
                  {copiedJava ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copiedJava ? "Copied address" : `Copy ${JAVA_IP}:${JAVA_PORT}`}
                </Button>
                <Button variant="outline" className="h-12 border-border/60 bg-card/60 px-6" asChild>
                  <a href={siteConfig.discordUrl} target="_blank" rel="noopener noreferrer">
                    Get help on Discord
                  </a>
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {joinNotes.map((note) => (
                  <div key={note.label} className="stat-badge">
                    <note.icon className="mb-2 h-5 w-5 text-primary" aria-hidden="true" />
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                      {note.label}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-foreground">{note.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Card className="overflow-hidden border-border/60 bg-card/90">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                        Featured art
                      </div>
                      <h2 className="mt-1 font-display text-2xl font-bold text-foreground">Server identity</h2>
                    </div>
                    <span className="mc-chip">Join-ready</span>
                  </div>
                  <div className="mt-4 image-frame pixel-border">
                    <OptimizedImage
                      src="/zcraft.png"
                      alt={`${siteConfig.name} logo artwork`}
                      priority
                      className="aspect-[1.1/1] w-full object-contain p-6 sm:p-8"
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="panel-surface rounded-[1.75rem] p-4 sm:p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Server className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                      Live server status
                    </div>
                    <h2 className="font-display text-xl font-bold text-foreground">Check the server before joining</h2>
                  </div>
                </div>
                <ServerLiveCard host={`${siteConfig.playIp}:25565`} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="panel-surface rounded-[2rem] p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="section-title text-3xl">Quick start guide</h2>
                <p className="section-copy mt-2 max-w-2xl">
                  If you are new to the network, follow these steps and you will be in the server without guessing which
                  menu to open next.
                </p>
              </div>
              <span className="mc-chip self-start">Java Edition</span>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className="rounded-3xl border border-border/60 bg-card/70 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-display text-xl font-bold">
                      {step.number}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-xl font-bold text-foreground">{step.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <ChevronRight className="mt-4 hidden h-5 w-5 text-muted-foreground lg:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
