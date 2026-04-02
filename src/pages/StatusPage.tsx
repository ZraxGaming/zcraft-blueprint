import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ExternalLink, Activity } from "lucide-react";
import { useEffect } from "react";
import { siteConfig } from "@/config/siteEnv";

export default function StatusPage() {
  useEffect(() => {
    // Redirect to canonical status domain
    window.location.replace(siteConfig.statusUrl);
  }, []);

  return (
    <Layout
      seo={{
        title: "ZCraft Network Server Status — Live Uptime & Incident Reports",
        description: "Check ZCraft Network server status, uptime monitoring, incident reports, and maintenance schedules for our Minecraft lifesteal SMP server.",
        keywords: "zcraft server status, minecraft server status, server uptime, incident reports, server maintenance, lifesteal server status, minecraft downtime",
        url: "/status",
        type: "website",
        tags: ["server status", "uptime", "incidents", "maintenance"]
      }}
    >
      <div className="py-24 text-center">
        <p className="text-lg">Redirecting to the live status page…</p>
        <p className="mt-4">
          If you are not redirected automatically, <a href={siteConfig.statusUrl} className="underline">click here</a>.
        </p>
      </div>
    </Layout>
  );
}
