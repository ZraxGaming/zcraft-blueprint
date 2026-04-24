import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { Loader } from "lucide-react";
import { exchangeDiscordCode } from "@/services/chatBridgeService";

/**
 * Handles Discord OAuth callback for *connecting* a Discord account
 * to the logged-in user (NOT for primary login).
 */
export default function DiscordCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("Connecting your Discord account…");

  useEffect(() => {
    (async () => {
      const code = searchParams.get("code");
      const error = searchParams.get("error");
      const state = searchParams.get("state");
      const expectedState = sessionStorage.getItem("discord_oauth_state");
      const returnTo = sessionStorage.getItem("discord_oauth_returnTo") || "/profile";

      if (error) {
        toast({
          title: "Discord connection cancelled",
          description: error,
          variant: "destructive",
        });
        navigate(returnTo);
        return;
      }
      if (!code) {
        toast({ title: "Missing authorization code", variant: "destructive" });
        navigate(returnTo);
        return;
      }
      if (expectedState && state !== expectedState) {
        toast({ title: "State mismatch", description: "Possible CSRF, aborted.", variant: "destructive" });
        navigate(returnTo);
        return;
      }

      try {
        const conn = await exchangeDiscordCode(code);
        setMessage(`Connected as ${conn.discord_username}`);
        toast({
          title: "Discord connected",
          description: `You're connected as ${conn.discord_username}.`,
        });
      } catch (e: any) {
        toast({
          title: "Discord connection failed",
          description: e?.message || "Unknown error",
          variant: "destructive",
        });
      } finally {
        sessionStorage.removeItem("discord_oauth_state");
        sessionStorage.removeItem("discord_oauth_returnTo");
        setTimeout(() => navigate(returnTo), 600);
      }
    })();
  }, [navigate, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader className="h-8 w-8 text-primary animate-spin" />
            </div>
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          </div>
        </div>
        <p className="text-muted-foreground animate-pulse">{message}</p>
      </div>
    </div>
  );
}
