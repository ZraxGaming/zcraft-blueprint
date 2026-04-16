import { BentoPageLayout } from "@/components/layout/BentoPageLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitCommit, Loader } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { StructuredContent } from "@/components/content/StructuredContent";
import { siteConfig } from "@/config/siteEnv";
import { motion } from "framer-motion";

interface Changelog {
  id: string; version: string; title: string; description: string; changes: string[];
  type: "feature" | "fix" | "improvement" | "patch"; image_url?: string | null;
  released_at: string; created_at: string;
}

const typeConfig = {
  feature: { label: "Feature", color: "bg-emerald-500/20 text-emerald-400" },
  fix: { label: "Bug Fix", color: "bg-red-500/20 text-red-400" },
  improvement: { label: "Improvement", color: "bg-blue-500/20 text-blue-400" },
  patch: { label: "Patch", color: "bg-amber-500/20 text-amber-400" },
};

export default function ChangelogsPage() {
  const [changelogs, setChangelogs] = useState<Changelog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (supabase as any).from("changelogs").select("*").order("released_at", { ascending: false })
      .then(({ data, error: e }: any) => {
        if (e) { setError(e.message); toast({ title: "Error", description: "Failed to load changelogs" }); }
        else setChangelogs(data || []);
      }).finally(() => setLoading(false));
  }, []);

  if (loading) return <BentoPageLayout title="Changelogs"><div className="flex justify-center py-20"><Loader className="h-8 w-8 animate-spin text-primary" /></div></BentoPageLayout>;
  if (error) return <BentoPageLayout title="Changelogs"><div className="py-20 text-center text-red-400">{error}</div></BentoPageLayout>;

  return (
    <BentoPageLayout
      title="Changelogs"
      subtitle="Stay updated with the latest features, improvements, and fixes."
      seo={{
        title: "ZCraft Network Changelogs — Server Updates & Release Notes",
        description: "Stay updated with ZCraft Network changelogs and release notes.",
        keywords: "zcraft changelogs, minecraft server updates, release notes",
        url: "/events", type: "website",
        rssFeeds: [{ title: "ZCraft Changelog Feed", url: "https://z-craft.xyz/changelogs/rss.xml" }],
      }}
    >
      <div className="max-w-3xl mx-auto">
        {changelogs.length === 0 ? (
          <div className="text-center py-12 text-primary-foreground/40">No changelogs yet. Stay tuned!</div>
        ) : (
          <div className="space-y-5">
            {changelogs.map((cl, i) => {
              const t = typeConfig[cl.type as keyof typeof typeConfig];
              return (
                <motion.div key={cl.id} className="bento-card overflow-hidden" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  {cl.image_url && (
                    <div className="border-b border-bento-border">
                      <img src={cl.image_url} alt={cl.title} className="w-full h-48 object-cover" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge className={`${t.color} border-0`}>{t.label}</Badge>
                      <span className="text-sm text-primary-foreground/30 font-mono">v{cl.version}</span>
                      <span className="text-sm text-primary-foreground/30 ml-auto">
                        {new Date(cl.released_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <h2 className="font-display text-xl font-bold text-primary-foreground mb-3">{cl.title}</h2>
                    <div className="text-primary-foreground/50 text-sm mb-4"><StructuredContent content={cl.description} /></div>
                    {cl.changes?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-primary-foreground/30 mb-3">Changes</h4>
                        <ul className="space-y-2">
                          {cl.changes.map((c, j) => (
                            <li key={j} className="flex items-start gap-3 text-sm rounded-xl bg-bento-bg px-4 py-3">
                              <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                              <StructuredContent content={c} className="flex-1 text-primary-foreground/60" />
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="bento-card p-8 text-center mt-8">
          <h3 className="font-display text-xl font-bold text-primary-foreground mb-2">Get notified</h3>
          <p className="text-primary-foreground/40 mb-6">Join Discord to be first to know about updates.</p>
          <a href={siteConfig.discordUrl} target="_blank" rel="noopener noreferrer">
            <Button className="btn-primary-gradient">Join Discord</Button>
          </a>
        </div>
      </div>
    </BentoPageLayout>
  );
}
