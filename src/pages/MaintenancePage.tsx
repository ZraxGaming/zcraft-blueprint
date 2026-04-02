import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { siteConfig } from "@/config/siteEnv";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
      <Card className="max-w-md w-full border-0 bg-card card-hover relative">
        <CardContent className="p-12 text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10 mb-6">
            <AlertTriangle className="h-10 w-10 text-amber-500" />
          </div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="font-display text-xl font-bold text-primary-foreground">Z</span>
              </div>
            <span className="font-display text-xl font-bold text-gradient">{siteConfig.shortName}</span>
            </div>
          <h1 className="font-display text-2xl font-bold mb-4">
            Under Maintenance
          </h1>
          <p className="text-muted-foreground mb-8">
            We're currently performing scheduled maintenance to improve your experience. 
            We'll be back shortly!
          </p>
          <div className="space-y-3">
            <Button className="w-full gap-2" variant="outline" asChild>
              <a href={siteConfig.discordUrl} target="_blank" rel="noopener noreferrer">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                Join Discord for Updates
              </a>
            </Button>
            <Button className="w-full btn-primary-gradient" asChild>
              <a href={siteConfig.statusUrl} target="_blank" rel="noopener noreferrer">
                Check Status Page
              </a>
            </Button>
            <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              Authorized staff can use the regular sign-in flow to regain access once maintenance is finished.
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-8">
            Expected downtime: ~2 hours
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
