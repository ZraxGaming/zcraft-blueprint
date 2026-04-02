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

import { MessageSquare, Bell, ArrowRight, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { newsService } from "@/services/newsService";
import { forumService } from "@/services/forumService";
import { settingsService } from "@/services/settingsService";
import { siteConfig } from "@/config/siteEnv";

type Announcement = { id: string; title: string; date: string; type?: string; excerpt?: string };
type ThreadPreview = { id: string; title: string; author: string; replies_count: number; category: string };

export function CommunitySection() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [forumPosts, setForumPosts] = useState<ThreadPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [discordLink, setDiscordLink] = useState(siteConfig.discordUrl);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [newsData, threadsData, discord] = await Promise.all([
          newsService.getNews(3, 0),
          forumService.getLatestThreads(3),
          settingsService.getDiscordLink(),
        ]);

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
        if (discord) setDiscordLink(discord);
      } catch (err) {
        console.error("Error loading community data:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
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
    <section className="py-24">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Community <span className="text-gradient">Hub</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Stay updated with the latest news and connect with fellow players.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Announcements */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="card-hover border-0 bg-card h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 font-display text-xl">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  Latest News
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/news" className="gap-1">
                    View All <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <motion.div 
                  className="space-y-4"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 rounded-xl bg-muted/50 animate-pulse">
                          <div className="h-4 w-20 bg-muted rounded mb-2" />
                          <div className="h-5 w-3/4 bg-muted rounded mb-2" />
                          <div className="h-4 w-full bg-muted rounded" />
                        </div>
                      ))}
                    </div>
                  ) : announcements.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">No news available</p>
                  ) : (
                    announcements.map((post) => (
                      <motion.div
                        key={post.id}
                        variants={itemVariants}
                        className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all duration-300 cursor-pointer group"
                        whileHover={{ x: 4 }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {post.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{post.date}</span>
                        </div>
                        <h4 className="font-semibold mb-1 group-hover:text-primary transition-colors">{post.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Forum Activity */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="card-hover border-0 bg-card h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 font-display text-xl">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  Forum Activity
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/forums" className="gap-1">
                    Browse Forums <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <motion.div 
                  className="space-y-4"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 rounded-xl bg-muted/50 animate-pulse">
                          <div className="h-4 w-20 bg-muted rounded mb-2" />
                          <div className="h-5 w-3/4 bg-muted rounded mb-2" />
                          <div className="h-4 w-1/2 bg-muted rounded" />
                        </div>
                      ))}
                    </div>
                  ) : forumPosts.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">No forum posts available</p>
                  ) : (
                    forumPosts.map((post) => (
                      <motion.div
                        key={post.id}
                        variants={itemVariants}
                        className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all duration-300 cursor-pointer group"
                        whileHover={{ x: 4 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            {post.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{post.replies_count} replies</span>
                        </div>
                        <h4 className="font-semibold mb-1 group-hover:text-primary transition-colors">{post.title}</h4>
                        <p className="text-sm text-muted-foreground">by {post.author}</p>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Discord CTA */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card className="inline-block card-hover border-0 bg-gradient-to-r from-card to-card/80 max-w-3xl overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10" />
            <CardContent className="p-10 flex flex-col md:flex-row items-center gap-8 relative">
              <motion.div 
                className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <svg className="h-10 w-10 text-primary" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </motion.div>
              <div className="text-left flex-1">
                <h3 className="font-display text-2xl font-bold mb-2">Join our Discord</h3>
                <p className="text-muted-foreground text-lg">
                  Chat with players, get support, and stay updated on all server events.
                </p>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button className="btn-primary-gradient h-14 px-8 text-lg gap-2" asChild>
                  <a href={discordLink} target="_blank" rel="noopener noreferrer">
                    Join Discord
                    <ExternalLink className="h-5 w-5" />
                  </a>
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
