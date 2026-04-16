import { useEffect, useState } from "react";
import { ExternalLink, MessageCircle, Users, WifiOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/siteEnv";

type DiscordWidget = {
  id: string;
  name: string;
  instant_invite?: string;
  presence_count?: number;
  members?: Array<{
    id: string;
    username: string;
    avatar_url?: string;
    status?: string;
  }>;
};

export function DiscordWidgetCard() {
  const [data, setData] = useState<DiscordWidget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const guildId = 1453950844469772485;

        if (!guildId) throw new Error("Missing guild ID");

        const res = await fetch(
          `https://discord.com/api/guilds/1453950844469772485/widget.json`
        );

        if (!res.ok) throw new Error("Widget disabled or inaccessible");

        const json = await res.json();

        if (alive) {
          setData(json);
          setError(false);
        }
      } catch (err) {
        console.error("Discord widget error:", err);
        if (alive) setError(true);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();

    return () => {
      alive = false;
    };
  }, []);

  const memberCount = data?.members?.length ?? 0;
  const onlineCount = data?.presence_count ?? 0;
  const inviteUrl = data?.instant_invite || siteConfig.discordUrl;

  return (
    <Card className="border-border/60 bg-card/90 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-3 text-xl font-semibold">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
            <MessageCircle className="h-5 w-5" />
          </div>
          Discord Community
        </CardTitle>

        <span className="text-xs px-2 py-1 rounded-full border border-border/60 bg-card/60 text-muted-foreground">
          Live
        </span>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Stats */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-card/70 p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <Users className="h-4 w-4 text-indigo-400" />
              Members
            </div>

            <div className="mt-2 text-3xl font-bold">
              {loading ? "..." : error ? "N/A" : memberCount}
            </div>

            <p className="text-sm text-muted-foreground">
              Total server members
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/70 p-4">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Online
            </div>

            <div className="mt-2 text-3xl font-bold">
              {loading ? "..." : error ? "N/A" : onlineCount}
            </div>

            <p className="text-sm text-muted-foreground">
              Active right now
            </p>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            <WifiOff className="h-4 w-4" />
            Discord widget unavailable (check widget settings or guild ID)
          </div>
        )}

        {/* Member preview */}
        {!loading && !error && data?.members?.length ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {data.members.slice(0, 8).map((m) => (
              <div
                key={m.id}
                className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs"
                title={m.username}
              >
                {m.username?.slice(0, 1)?.toUpperCase()}
              </div>
            ))}
          </div>
        ) : null}

        {/* Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="h-11 px-5">
            <a href={inviteUrl} target="_blank" rel="noopener noreferrer">
              Join Discord <ExternalLink className="h-4 w-4" />
            </a>
          </Button>

          <Button asChild variant="outline" className="h-11 px-5">
            <a href={inviteUrl} target="_blank" rel="noopener noreferrer">
              Open Invite
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
