import { BentoPageLayout } from "@/components/layout/BentoPageLayout";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { newsService, NewsArticle } from "@/services/newsService";
import { toast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function NewsPage() {
  const [posts, setPosts] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    newsService.getNews().then(setPosts).catch((err) => {
      toast({ title: "Error", description: "Failed to load news posts" });
    }).finally(() => setLoading(false));
  }, []);

  const featuredPost = posts[0];
  const otherPosts = posts.slice(1);

  return (
    <BentoPageLayout
      title="Latest News"
      subtitle="Stay updated with server announcements, events, and updates."
      seo={{
        title: "ZCraft Network News — Latest Updates, Events & Announcements",
        description: "Stay updated with ZCraft Network's latest news, server announcements, event schedules, and important updates.",
        keywords: "zcraft news, minecraft server news, lifesteal server updates, minecraft announcements",
        url: "/news",
        type: "website",
        rssFeeds: [{ title: "ZCraft News Feed", url: "https://z-craft.xyz/news/rss.xml" }],
      }}
    >
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-primary-foreground/50">No news posts available yet.</div>
      ) : (
        <div className="space-y-8">
          {/* Featured */}
          {featuredPost && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <Link to={`/news/${featuredPost.slug}`} className="block">
                <div className="bento-card overflow-hidden group">
                  <div className="grid md:grid-cols-2">
                    <div className="min-h-[200px] bg-primary/10 flex items-center justify-center relative overflow-hidden">
                      {featuredPost.image_url ? (
                        <img src={featuredPost.image_url} alt={featuredPost.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="text-6xl opacity-30">📰</div>
                      )}
                    </div>
                    <div className="p-8 flex flex-col justify-center">
                      <Badge className="w-fit mb-4 bg-primary/20 text-primary border-0">Featured</Badge>
                      <h2 className="font-display text-2xl font-bold text-primary-foreground mb-3">{featuredPost.title}</h2>
                      <p className="text-primary-foreground/50 mb-4 line-clamp-3">{featuredPost.excerpt}</p>
                      <div className="flex items-center gap-2 text-sm text-primary-foreground/40 mb-4">
                        <Calendar className="h-4 w-4" />
                        {new Date(featuredPost.created_at).toLocaleDateString()}
                      </div>
                      <span className="text-primary text-sm font-medium group-hover:underline flex items-center gap-1">
                        Read More <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Grid */}
          {otherPosts.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherPosts.map((post, i) => (
                <motion.div key={post.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.35 }}>
                  <Link to={`/news/${post.slug}`} className="block h-full">
                    <div className="bento-card overflow-hidden h-full group">
                      <div className="h-36 bg-primary/5 flex items-center justify-center overflow-hidden">
                        {post.image_url ? (
                          <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="text-4xl opacity-20">📄</div>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="font-semibold text-primary-foreground mb-2 line-clamp-2">{post.title}</h3>
                        <p className="text-sm text-primary-foreground/40 mb-3 line-clamp-2">{post.excerpt}</p>
                        <div className="flex items-center gap-2 text-xs text-primary-foreground/30">
                          <Calendar className="h-3 w-3" />
                          {new Date(post.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </BentoPageLayout>
  );
}
