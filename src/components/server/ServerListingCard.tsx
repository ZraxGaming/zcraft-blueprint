/**
 * ============================================================
 * Server Listing Card Component - Protected by BuiltByBit Anti-Piracy
 * © 2024-2026 ZCraft. All rights reserved.
 * Unauthorized distribution or modification is prohibited.
 * ============================================================
 * This code is protected under international copyright law.
 * Removal of this notice or unauthorized copying will be detected.
 * __BUILTIN_ANTI_PIRACY_CHECK_SERVER_CARD_001__
 */

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy, Check } from "lucide-react";
import { copyToClipboard } from "@/lib/clipboard";
import { useQuery } from "@tanstack/react-query";
import { fetchMinecraftServerStatus } from "@/services/serverService";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/use-toast";

export function ServerListingCard({ name, url, host }: { name: string; url: string; host?: string }) {
  const [copied, setCopied] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: host ? ["serverStatus", host] : ["serverStatus", url],
    queryFn: host ? () => fetchMinecraftServerStatus(host) : async () => { return null; },
    enabled: !!host,
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const onCopy = async () => {
    const address = host ?? url;
    const ok = await copyToClipboard(address);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: 'Copied', description: `${address} copied to clipboard.` });
    } else {
      toast({ title: 'Copy failed', description: 'Unable to copy address', variant: 'destructive' });
    }
  };

  const onJoin = async () => {
    if (!host) return onCopy();
    try {
      await copyToClipboard(host);
      toast({ title: 'Ready to join', description: `Server address ${host} copied — paste into Minecraft to join.` });
    } catch {
      toast({ title: 'Copy failed', description: 'Unable to copy address', variant: 'destructive' });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="card-hover border-0 bg-card">
        <CardHeader className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{name}</CardTitle>
              {host && (
                <div className="text-xs text-muted-foreground">• <span className={`ml-1 ${data?.online ? 'text-emerald-400' : isLoading ? 'text-muted-foreground' : 'text-red-400'}`}>{data?.online ? 'Online' : isLoading ? 'Loading' : 'Offline'}</span></div>
              )}
            </div>
            <CardDescription className="mt-1 text-sm text-muted-foreground break-all">{url}</CardDescription>

            {host && (
              <div className="mt-3 flex items-center gap-4">
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-12 bg-muted rounded animate-pulse" />
                  </div>
                ) : data ? (
                  <>
                    <div className="text-sm text-muted-foreground">Players: {data.players?.online ?? '—'}{data.players ? ` / ${data.players.max}` : ''}</div>
                    <div className="text-sm text-muted-foreground">Latency: {data.latency ?? '—'} ms</div>
                  </>
                ) : (
                  <div className="text-sm text-destructive">Status unavailable</div>
                )}
              </div>
            )}
          </div>
          <Badge>External</Badge>
        </CardHeader>
        <CardFooter className="justify-between">
          <div className="flex items-center gap-2">
            {host ? (
              <Button variant="ghost" size="sm" onClick={onJoin}>
                Join
              </Button>
            ) : (
              <Button variant="ghost" size="icon" onClick={onCopy} title="Copy URL">
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            )}
          </div>

          <div>
            <Button asChild variant="outline" size="sm">
              <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${name}`} className="flex items-center">
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit
              </a>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
