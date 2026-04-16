import { useEffect, useState } from "react";
import { ExternalLink, MessageCircle, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/siteEnv";

type DiscordWidgetResponse = {
  guildId: string;
  name?: string;
  widgetUrl?: string;
  inviteUrl?: string;
  memberCount?: number;
  memberCountExact?: boolean;
  onlineCount?: number;
};

export function DiscordWidgetCard() {
  const [data, setData] = useState<DiscordWidgetResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await fetch("/api/discord/widget");
        if (!response.ok) throw new Error("Failed to load Discord widget");
        const next = (await response.json()) as DiscordWidgetResponse;
        if (active) setData(next);
      } catch (error) {
        console.error("Discord widget load failed:", error);
        if (active) setData(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const memberCount = data?.memberCount ?? 0;
  const memberCountExact = data?.memberCountExact ?? false;
  const onlineCount = data?.onlineCount ?? 0;
  const widgetUrl = data?.widgetUrl;
  const inviteUrl = data?.inviteUrl || siteConfig.discordUrl;

  const formatApproximateCount = (count: number) => {
    if (count < 5) return `${count}+`;
    const rounded = Math.floor(count / 5) * 5;
    return `${rounded}+`;
  };

  const displayMemberCount = loading ? "..." : formatApproximateCount(memberCount);
  const displayOnlineCount = loading ? "..." : formatApproximateCount(onlineCount);

  return (
    <Card className="border-border/60 bg-card/90 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
        <CardTitle className="flex items-center gap-3 font-display text-xl">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
          </div>
          Discord community
        </CardTitle>
        <span className="mc-chip">Live widget</span>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-card/70 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              <Users className="h-4 w-4 text-primary" aria-hidden="true" />
              Members
              {!loading && data && !memberCountExact && (
                <span className="ml-1 rounded-full border border-border/60 bg-card/60 px-2 py-0.5 text-[10px] tracking-[0.18em] text-muted-foreground">
                  Approx
                </span>
              )}
            </div>
            <div className="mt-2 text-3xl font-bold text-foreground">
              {displayMemberCount}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">People in the server{!loading && data && !memberCountExact ? " (approx)" : ""}</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/70 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Online now</div>
            <div className="mt-2 text-3xl font-bold text-foreground">
              {displayOnlineCount}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Active right now</p>
          </div>
        </div>

        {widgetUrl ? (
          <iframe
            title="Discord server widget"
            src={widgetUrl}
            className="h-[360px] w-full rounded-2xl border border-border/60 bg-card/70"
            loading="lazy"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        ) : (
          <div className="rounded-2xl border border-border/60 bg-card/70 p-5 text-sm text-muted-foreground">
            Discord widget is not configured yet. Add your guild ID to enable the live embed.
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="btn-primary-gradient h-11 px-5">
            <a href={inviteUrl} target="_blank" rel="noopener noreferrer">
              Join Discord
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          <Button asChild variant="outline" className="h-11 border-border/60 bg-card/60 px-5">
            <a href={inviteUrl} target="_blank" rel="noopener noreferrer">
              Open invite
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
