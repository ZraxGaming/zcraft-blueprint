import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Send, Globe, Pickaxe, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchChatMessages,
  getMyDiscordConnection,
  pollDiscordForNewMessages,
  sendChatMessage,
  type ChatMessage,
  type DiscordConnection,
} from "@/services/chatBridgeService";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString();
}

export function LiveChatbox({ className }: { className?: string }) {
  const { user, loading: authLoading } = useAuth();
  const [conn, setConn] = useState<DiscordConnection | null>(null);
  const [checkingConn, setCheckingConn] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load Discord connection
  useEffect(() => {
    if (!user) {
      setCheckingConn(false);
      return;
    }
    (async () => {
      setCheckingConn(true);
      setConn(await getMyDiscordConnection());
      setCheckingConn(false);
    })();
  }, [user]);

  // Poll for messages
  const refresh = useCallback(async () => {
    try {
      pollDiscordForNewMessages();
      const msgs = await fetchChatMessages(80);
      setMessages(msgs);
    } catch (e) {
      console.error("chat fetch failed", e);
    }
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 3000);
    return () => clearInterval(t);
  }, [refresh]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true);
    try {
      await sendChatMessage(content);
      setDraft("");
      await refresh();
    } catch (err: any) {
      toast({ title: "Couldn't send", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className={cn("border border-border/60 flex flex-col h-[520px]", className)}>
      <CardHeader className="border-b border-border/40 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageCircle className="h-5 w-5 text-primary" />
          Live Server Chat
          <Badge variant="secondary" className="ml-auto text-[10px]">DiscordSRV bridge</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* States */}
        {authLoading ? (
          <EmptyState icon={<Loader2 className="h-6 w-6 animate-spin" />} title="Loading…" />
        ) : !user ? (
          <EmptyState
            icon={<MessageCircle className="h-6 w-6" />}
            title="Log in to view and send messages"
            cta={<Link to="/login"><Button size="sm">Log in</Button></Link>}
          />
        ) : checkingConn ? (
          <EmptyState icon={<Loader2 className="h-6 w-6 animate-spin" />} title="Checking Discord connection…" />
        ) : !conn ? (
          <EmptyState
            icon={<MessageCircle className="h-6 w-6 text-[#5865F2]" />}
            title="Connect your Discord account to chat"
            description="The bridge needs your Discord identity to post into in-game chat."
            cta={<Link to="/profile"><Button size="sm">Open Settings</Button></Link>}
          />
        ) : (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-10">
                  No messages yet — be the first to say hi!
                </p>
              ) : (
                messages.map((m) => <ChatRow key={m.id} m={m} />)
              )}
            </div>
            <form onSubmit={handleSend} className="border-t border-border/40 p-3 flex gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Send a message to the server…"
                maxLength={1500}
                disabled={sending}
                className="flex-1"
              />
              <Button type="submit" disabled={sending || !draft.trim()} className="gap-2">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send
              </Button>
            </form>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState({
  icon,
  title,
  description,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  cta?: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-3">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">{icon}</div>
      <p className="font-medium">{title}</p>
      {description && <p className="text-sm text-muted-foreground max-w-xs">{description}</p>}
      {cta}
    </div>
  );
}

function ChatRow({ m }: { m: ChatMessage }) {
  const isMC = m.source === "minecraft";
  return (
    <div className="flex items-start gap-3">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={m.avatar_url ?? undefined} alt={m.username} />
        <AvatarFallback>{m.username.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className={cn(
              "h-5 px-1.5 text-[10px] gap-1 font-semibold",
              isMC
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-blue-500/10 text-blue-400 border-blue-500/30"
            )}
          >
            {isMC ? <Pickaxe className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
            {isMC ? "Minecraft" : "Website"}
          </Badge>
          <span className="text-sm font-medium truncate">{m.minecraft_username || m.username}</span>
          <span className="text-[10px] text-muted-foreground ml-auto">{relativeTime(m.created_at)}</span>
        </div>
        <p className="text-sm text-foreground/90 break-words">{m.content}</p>
      </div>
    </div>
  );
}