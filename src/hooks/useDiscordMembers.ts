import { useState, useEffect } from "react";
import { siteConfig } from "@/config/siteEnv";

/**
 * Fetches approximate member count from Discord's public widget API.
 * Falls back to a stored count from admin_settings.
 */
export function useDiscordMembers(fallback = 0) {
  const [count, setCount] = useState<number>(fallback);
  const [online, setOnline] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        // Try Discord invite API (public, no auth needed)
        // Extract invite code from URL like https://discord.gg/XXXX or https://discord.z-craft.xyz
        const discordUrl = siteConfig.discordUrl;
        let inviteCode = "";

        if (discordUrl.includes("discord.gg/")) {
          inviteCode = discordUrl.split("discord.gg/")[1]?.split(/[?#]/)[0] || "";
        } else if (discordUrl.includes("discord.com/invite/")) {
          inviteCode = discordUrl.split("discord.com/invite/")[1]?.split(/[?#]/)[0] || "";
        }

        if (inviteCode) {
          const res = await fetch(
            `https://discord.com/api/v10/invites/${inviteCode}?with_counts=true`
          );
          if (res.ok) {
            const data = await res.json();
            if (data.approximate_member_count) {
              setCount(data.approximate_member_count);
              setOnline(data.approximate_presence_count || 0);
              setLoading(false);
              return;
            }
          }
        }

        // Fallback: try fetching from admin_settings
        const { supabase } = await import("@/integrations/supabase/client");
        const { data } = await supabase
          .from("admin_settings")
          .select("value")
          .eq("key", "discord_member_count")
          .single();

        if (data?.value) {
          setCount(parseInt(data.value) || fallback);
        }
      } catch (err) {
        console.error("Failed to fetch Discord member count:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCount();
  }, [fallback]);

  return { count, online, loading };
}
