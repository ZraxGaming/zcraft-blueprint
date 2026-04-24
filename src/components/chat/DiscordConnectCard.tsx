import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MessageCircle, Unplug } from "lucide-react";
import {
  buildDiscordOAuthUrl,
  disconnectDiscord,
  getMyDiscordConnection,
  type DiscordConnection,
} from "@/services/chatBridgeService";
import { toast } from "@/components/ui/use-toast";

export function DiscordConnectCard() {
  const [conn, setConn] = useState<DiscordConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    setConn(await getMyDiscordConnection());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleConnect = () => {
    try {
      window.location.href = buildDiscordOAuthUrl();
    } catch (e: any) {
      toast({ title: "Cannot connect", description: e.message, variant: "destructive" });
    }
  };

  const handleDisconnect = async () => {
    setBusy(true);
    try {
      await disconnectDiscord();
      setConn(null);
      toast({ title: "Discord disconnected" });
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="border border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="h-5 w-5 text-[#5865F2]" />
          Discord Connection
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : conn ? (
          <div className="flex items-center gap-4 flex-wrap">
            <Avatar className="h-12 w-12 ring-2 ring-[#5865F2]/40">
              <AvatarImage src={conn.discord_avatar ?? undefined} alt={conn.discord_username} />
              <AvatarFallback>{conn.discord_username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{conn.discord_username}</p>
              <p className="text-xs text-muted-foreground">
                Connected — you can now use the in-game chat bridge.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleDisconnect} disabled={busy} className="gap-2">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unplug className="h-4 w-4" />}
              Disconnect
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Connect your Discord account to use the live website ↔ Minecraft chat bridge.
              Your Discord identity will be used to post messages into the in-game chat via DiscordSRV.
            </p>
            <Button onClick={handleConnect} className="bg-[#5865F2] hover:bg-[#4752c4] text-white gap-2">
              <MessageCircle className="h-4 w-4" />
              Connect Discord
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}