// %%__NONCE_CHANGELOGS_PAGE_16_%%
// %%__TIMESTAMP_%%
// %%__VERSION_%%

import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitCommit, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { StructuredContent } from "@/components/content/StructuredContent";

interface Changelog {
  id: string;
  version: string;
  title: string;
  description: string;
  changes: string[];
  type: "feature" | "fix" | "improvement" | "patch";
  image_url?: string | null;
  released_at: string;
  created_at: string;
}

const typeConfig = {
  feature: { label: "Feature", color: "bg-emerald-500/10 text-emerald-600" },
  fix: { label: "Bug Fix", color: "bg-red-500/10 text-red-600" },
  improvement: { label: "Improvement", color: "bg-blue-500/10 text-blue-600" },
  patch: { label: "Patch", color: "bg-amber-500/10 text-amber-600" },
};

export default function ChangelogsPage() {
  const [changelogs, setChangelogs] = useState<Changelog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadChangelogs();
  }, []);

  const loadChangelogs = async () => {
    try {
      const { data, error: queryError } = await (supabase as any)
        .from("changelogs")
        .select("*")
        .order("released_at", { ascending: false });

      if (queryError) throw queryError;
      setChangelogs((data || []) as unknown as Changelog[]);
    } catch (err: any) {
      setError(err?.message || "Failed to load changelogs");
      toast({ title: "Error", description: "Failed to load changelogs" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout seo={{
        title: "ZCraft Network Changelogs — Server Updates & Release Notes",
        description: "Stay updated with ZCraft Network's latest changelogs, server updates, new features, bug fixes, and improvements. Read detailed release notes for our Minecraft lifesteal SMP server.",
        keywords: "zcraft changelogs, minecraft server updates, lifesteal server updates, release notes, server patches, minecraft updates, zcraft network changelogs",
        url: "/events",
        type: "website",
        tags: ["changelogs", "updates", "release notes", "server updates"],
        rssFeeds: [
          { title: "ZCraft Changelog Feed", url: "https://z-craft.xyz/changelogs/rss.xml" }
        ]
        }}>
        <div className="flex items-center justify-center py-20">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout seo={{
        title: "ZCraft Network Changelogs — Server Updates & Release Notes",
        description: "Stay updated with ZCraft Network's latest changelogs, server updates, new features, bug fixes, and improvements.",
        keywords: "zcraft changelogs, minecraft server updates, lifesteal server updates, release notes, server patches",
        url: "/events",
        type: "website",
        tags: ["changelogs", "updates", "release notes"],
        rssFeeds: [
          { title: "ZCraft Changelog Feed", url: "https://z-craft.xyz/changelogs/rss.xml" }
        ]
        }}>
        <div className="py-20 text-center text-red-500">{error}</div>
      </Layout>
    );
  }

  return (
    <Layout
      seo={{
        title: 'ZCraft Network Changelogs — Server Updates & Release Notes',
        description: 'Stay updated with ZCraft Network changelogs, server updates, new features, bug fixes, and improvements. Read detailed release notes for our Minecraft lifesteal SMP server.',
        keywords: 'zcraft changelogs, minecraft server updates, lifesteal server updates, release notes, server patches, minecraft updates, zcraft network changelogs, server changelog',
        url: '/events',
        type: 'website',
        tags: ['changelogs', 'updates', 'release notes', 'server updates'],
        rssFeeds: [
          { title: "ZCraft Changelog Feed", url: "https://z-craft.xyz/changelogs/rss.xml" }
        ]
      }}
    >
      {/* Hero */}
      <section className="py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border mb-6">
              <GitCommit className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Release Notes</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Server <span className="text-gradient">Changelogs</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Stay updated with the latest features, improvements, and fixes to ZCraft.
            </p>
          </div>
        </div>
      </section>

      {/* Changelogs Timeline */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {changelogs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No changelogs yet. Stay tuned for updates!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {changelogs.map((changelog) => {
                  const typeInfo = typeConfig[changelog.type as keyof typeof typeConfig];
                  return (
                    <Card
                      key={changelog.id}
                      id={`changelog-${String(changelog.version).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`}
                      className="card-hover border-0 bg-card overflow-hidden"
                    >
                      {changelog.image_url && (
                        <div className="border-b border-border">
                          <img src={changelog.image_url} alt={changelog.title} className="w-full h-56 object-cover" />
                        </div>
                      )}
                      <CardHeader className="border-b pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                              <span className="text-sm text-muted-foreground font-mono">v{changelog.version}</span>
                            </div>
                            <CardTitle className="text-2xl">{changelog.title}</CardTitle>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground whitespace-nowrap">
                              {new Date(changelog.released_at).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <StructuredContent content={changelog.description} className="mb-5" />
                        {changelog.changes && changelog.changes.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-3 uppercase tracking-wide text-muted-foreground">Changes</h4>
                            <ul className="space-y-3">
                              {changelog.changes.map((change, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-sm rounded-xl bg-muted/30 px-4 py-3">
                                  <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                                  <StructuredContent content={change} className="flex-1 space-y-2" />
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Subscribe Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto border-0 bg-card">
            <CardContent className="p-8 text-center">
              <h3 className="font-display text-xl font-bold mb-2">Get notified of updates</h3>
              <p className="text-muted-foreground mb-6">
                Join our Discord to be the first to know about new features and updates.
              </p>
              <a href="https://discord.z-craft.xyz" target="_blank" rel="noopener noreferrer">
                <Button className="btn-primary-gradient">Join Discord</Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
