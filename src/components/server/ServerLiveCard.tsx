import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Server, Copy, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { fetchMinecraftServerStatus } from "@/services/serverService";
import { toast } from "@/components/ui/use-toast";

export default function ServerLiveCard({ host }: { host: string }) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["serverStatus", host],
    queryFn: () => fetchMinecraftServerStatus(host),
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(host);
      toast({ title: "Copied", description: `Server address ${host} copied to clipboard.` });
    } catch {
      toast({ title: "Copy failed", description: "Could not copy the server address.", variant: "destructive" });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-border/60 bg-card/90">
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Server className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <CardTitle className="truncate text-lg font-display">Main server</CardTitle>
              <div className="truncate text-xs text-muted-foreground">{host}</div>
            </div>
          </div>
          <div className="text-right text-xs text-muted-foreground">Updates every 30 seconds</div>
        </CardHeader>

        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-3 w-24 rounded bg-muted animate-pulse" />
              <div className="h-3 w-32 rounded bg-muted animate-pulse" />
            </div>
          ) : error || !data ? (
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Players: 256+</div>
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                Status unavailable
              </div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-3 w-3 rounded-full ${data.online ? "bg-emerald-400" : "bg-red-400"}`}
                    aria-hidden="true"
                  />
                  <div className="font-medium text-foreground">{data.online ? "Online" : "Offline"}</div>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">Status</div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
                <div className="font-medium text-foreground">
                  {data.players?.online ?? "—"}
                  {data.players ? ` / ${data.players.max}` : ""}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">Players online</div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
                <div className="font-medium text-foreground">{data.latency ?? "—"} ms</div>
                <div className="mt-2 text-sm text-muted-foreground">Latency</div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="justify-end gap-2 pt-0">
          <Button variant="outline" size="sm" className="border-border/60 bg-card/60" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="ghost" size="sm" className="gap-2" onClick={copy}>
            <Copy className="h-4 w-4" />
            Copy IP
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
