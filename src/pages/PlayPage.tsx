import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, Monitor, ChevronRight } from "lucide-react";
import { useState } from "react";
import ServerLiveCard from "@/components/server/ServerLiveCard";
import { siteConfig } from "@/config/siteEnv";
const steps = [
  {
    number: 1,
    title: "Launch Minecraft",
    description: "Open Minecraft Java Edition on your device.",
  },
  {
    number: 2,
    title: "Add Server",
    description: "Go to Multiplayer > Add Server and enter our server address.",
  },
  {
    number: 3,
    title: "Connect & Play",
    description: "Select ZCraft from your server list and click Join Server!",
  },
];

export default function PlayPage() {
  const [copiedJava, setCopiedJava] = useState(false);
  const JAVA_IP = siteConfig.playIp;
  const JAVA_PORT = "25565";

  const copyAddress = (type: "java") => {
    const address = `${JAVA_IP}:${JAVA_PORT}`;
    navigator.clipboard.writeText(address);
    setCopiedJava(true);
    setTimeout(() => setCopiedJava(false), 2000);
  };

  return (
    <Layout
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Play", href: "/play" },
      ]}
      seo={{
        title: "Play ZCraft Network — Minecraft Server IP & How to Join",
        description: "Get ZCraft Network server IP and join our premier Minecraft lifesteal SMP server. Java compatible with custom plugins, economy system, factions, and active community events.",
        keywords: "zcraft server ip, minecraft server ip, play zcraft, join minecraft server, lifesteal server ip, minecraft java, zcraft network ip, minecraft smp server",
        url: "/play",
        type: "website",
        tags: ["minecraft server", "server ip", "java", "lifesteal", "smp"]
      }}
    >
      {/* Hero */}
      <section className="py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              How to <span className="text-gradient">Join</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Connect to ZCraft in seconds. We support Java Edition!
            </p>
          </div>
        </div>
      </section>

      {/* Live server card */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto mb-6">
            <ServerLiveCard host={`${siteConfig.playIp}:25565`} />
          </div>
        </div>
      </section>

      {/* Edition Cards */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Java Edition */}
            <Card className="card-hover border-0 bg-card relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
              <CardHeader className="relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                    <Monitor className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="font-display text-2xl">Java Edition</CardTitle>
                    <p className="text-sm text-muted-foreground">PC / Mac / Linux</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 relative">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Server Address</p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <code className="font-mono text-lg font-semibold flex-1 break-all">{JAVA_IP}</code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyAddress("java")}
                    >
                      {copiedJava ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Port</p>
                  <p className="font-semibold">{JAVA_PORT}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Supported Versions</p>
                  <p className="font-semibold">1.8.x – 1.21.x</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center mb-12">
            Quick Start <span className="text-gradient">Guide</span>
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className="flex items-start gap-6 p-6 rounded-xl bg-card card-hover"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-display font-bold text-xl">
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <ChevronRight className="h-6 w-6 text-muted-foreground hidden md:block" />
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
