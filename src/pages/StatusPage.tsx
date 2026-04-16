import { BentoPageLayout } from "@/components/layout/BentoPageLayout";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { siteConfig } from "@/config/siteEnv";

export default function StatusPage() {
  return (
    <BentoPageLayout
      title="Server Status"
      subtitle="Redirecting to live status page..."
      seo={{
        title: "ZCraft Network Server Status — Live Uptime & Incident Reports",
        description: "Check ZCraft Network server status, uptime monitoring, and incident reports.",
        url: "/status", type: "website",
      }}
    >
      <div className="text-center py-12">
        <p className="text-primary-foreground/50 mb-6">If you are not redirected automatically:</p>
        <a href={siteConfig.statusUrl} target="_blank" rel="noopener noreferrer">
          <Button className="btn-primary-gradient gap-2">Open Status Page <ExternalLink className="h-4 w-4" /></Button>
        </a>
      </div>
    </BentoPageLayout>
  );
}
