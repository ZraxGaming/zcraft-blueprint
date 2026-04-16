/**
 * ============================================================
 * Community Section Component - Protected by BuiltByBit Anti-Piracy
 * © 2024-2026 ZCraft. All rights reserved.
 * Unauthorized distribution or modification is prohibited.
 * ============================================================
 * This code is protected under international copyright law.
 * Removal of this notice or unauthorized copying will be detected.
 * __BUILTIN_ANTI_PIRACY_CHECK_COMMUNITY_001__
 */

import { MessageSquare, Bell, ArrowRight, CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { newsService } from "@/services/newsService";
import { forumService } from "@/services/forumService";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { DiscordWidgetCard } from "@/components/community/DiscordWidgetCard";

type Announcement = { id: string; title: string; date: string; type?: string; excerpt?: string };
type ThreadPreview = { id: string; title: string; author: string; replies_count: number; category: string };

export function CommunitySection() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [forumPosts, setForumPosts] = useState<ThreadPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        const [newsData, threadsData] = await Promise.all([
          newsService.getNews(3, 0),
          forumService.getLatestThreads(3),
        ]);

        if (!active) return;

        setAnnouncements(
          (newsData || []).map((n: any) => ({
            id: n.id,
            title: n.title,
            date: n.created_at ? new Date(n.created_at).toLocaleDateString() : "",
            type: "News",
            excerpt: n.excerpt || "",
          }))
        );

        setForumPosts(threadsData || []);
      } catch (err) {
        console.error("Error loading community data:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      <div
        className="absolute inset-0 opacity-70"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle at top right, hsl(214 90% 56% / 0.1), transparent 30%), radial-gradient(circle at bottom left, hsl(38 100% 56% / 0.09), transparent 34%)",
        }}
      />

      <div className="container mx-auto px-4 relative">
        <motion.div
          className="max-w-3xl mx-auto text-center mb-14 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-eyebrow mx-auto">
            <CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" />
            Community pulse
          </span>
          <h2 className="section-title text-balance">
            News, forums, and the spaces where players actually talk
          </h2>
          <p className="section-copy">
            The redesign keeps the latest updates easy to find and gives the community a stronger visual home, with
            cards that feel consistent across desktop and mobile.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="space-y-8"
          >
            <Card className="border-border/60 bg-card/90">
              <CardHeader className="flex flex-row items-center justify-between gap-3 pb-4">
                <CardTitle className="flex items-center gap-3 font-display text-xl">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Bell className="h-5 w-5" aria-hidden="true" />
                  </div>
                  Latest news
                </CardTitle>
                <Button variant="ghost" size="sm" asChild className="text-primary hover:bg-transparent">
                  <Link to="/news" className="gap-1">
                    View all
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <motion.div
                  className="space-y-3"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-2xl border border-border/60 bg-card/70 p-4">
                          <div className="h-4 w-20 rounded bg-blue-100 animate-pulse mb-2" />
                          <div className="h-5 w-3/4 rounded bg-blue-100 animate-pulse mb-2" />
                          <div className="h-4 w-full rounded bg-blue-100 animate-pulse" />
                        </div>
                      ))}
                    </div>
                  ) : announcements.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">No news available yet.</p>
                  ) : (
                    announcements.map((post) => (
                      <motion.div
                        key={post.id}
                        variants={itemVariants}
                        className="rounded-2xl border border-border/60 bg-card/60 p-4 transition-colors hover:bg-card/80"
                      >
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="text-[11px] uppercase tracking-[0.18em]">
                            {post.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{post.date}</span>
                        </div>
                        <h3 className="font-display text-lg font-bold text-foreground">{post.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground line-clamp-2">{post.excerpt}</p>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/90">
              <CardHeader className="flex flex-row items-center justify-between gap-3 pb-4">
                <CardTitle className="flex items-center gap-3 font-display text-xl">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <MessageSquare className="h-5 w-5" aria-hidden="true" />
                  </div>
                  Forum activity
                </CardTitle>
                <Button variant="ghost" size="sm" asChild className="text-primary hover:bg-transparent">
                  <Link to="/forums" className="gap-1">
                    Browse forums
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <motion.div
                  className="space-y-3"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-2xl border border-border/60 bg-card/70 p-4">
                          <div className="h-4 w-20 rounded bg-blue-100 animate-pulse mb-2" />
                          <div className="h-5 w-3/4 rounded bg-blue-100 animate-pulse mb-2" />
                          <div className="h-4 w-1/2 rounded bg-blue-100 animate-pulse" />
                        </div>
                      ))}
                    </div>
                  ) : forumPosts.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">No forum posts available yet.</p>
                  ) : (
                    forumPosts.map((post) => (
                      <motion.div
                        key={post.id}
                        variants={itemVariants}
                        className="rounded-2xl border border-border/60 bg-card/60 p-4 transition-colors hover:bg-card/80"
                      >
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <Badge variant="outline" className="text-[11px] uppercase tracking-[0.18em]">
                            {post.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{post.replies_count} replies</span>
                        </div>
                        <h3 className="font-display text-lg font-bold text-foreground">{post.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">by {post.author}</p>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="space-y-6"
          >
            <Card className="overflow-hidden border-border/60 bg-card/90">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                      Visual pulse
                    </div>
                    <h3 className="mt-1 font-display text-2xl font-bold text-foreground">A place for big moments</h3>
                  </div>
                  <span className="mc-chip">Live style</span>
                </div>
                <div className="mt-4 image-frame pixel-border">
                  <OptimizedImage
                    src="/showcase/stats-card.png"
                    alt="Minecraft action image highlighting the server's energetic presentation"
                    priority
                    className="aspect-[16/11] w-full object-cover"
                  />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/60 bg-card/70 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Discord</div>
                    <div className="mt-1 text-sm text-foreground">Support, announcements, and social chat.</div>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-card/70 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Events</div>
                    <div className="mt-1 text-sm text-foreground">Built to spotlight seasonal drops and server launches.</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <DiscordWidgetCard />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
