// %%__NONCE_NEWS_PAGE_15_%%
// %%__VERSION_NUMBER_%%
// %%__RESOURCE_%%

import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { newsService, NewsArticle } from "@/services/newsService";
import { toast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";

const getTagColor = (slug?: string) => {
  const tag = slug?.toLowerCase() || "";
  if (tag.includes("event")) return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
  if (tag.includes("update")) return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
  if (tag.includes("announce")) return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
  if (tag.includes("maintenance")) return "bg-red-500/10 text-red-600 dark:text-red-400";
  if (tag.includes("community")) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  return "bg-muted text-muted-foreground";
};

export default function NewsPage() {
  const [posts, setPosts] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setLoading(true);
      const data = await newsService.getNews();
      setPosts(data);
    } catch (err: any) {
      console.error("Error loading news:", err);
      setError(err?.message || "Failed to load news");
      toast({ title: "Error", description: "Failed to load news posts" });
    } finally {
      setLoading(false);
    }
  };

  const featuredPost = posts[0];
  const otherPosts = posts.slice(1);
  
  return (
    <Layout
      seo={{
        title: "ZCraft Network News — Latest Updates, Events & Announcements",
        description: "Stay updated with ZCraft Network's latest news, server announcements, event schedules, and important updates. Get the latest information about our Minecraft lifesteal SMP server.",
        keywords: "zcraft news, minecraft server news, lifesteal server updates, minecraft announcements, server events, zcraft network news, minecraft server updates, lifesteal news",
        url: "/news",
        type: "website",
        tags: ["news", "updates", "announcements", "events", "minecraft"],
        rssFeeds: [
          { title: "ZCraft News Feed", url: "https://z-craft.xyz/news/rss.xml" }
        ]
      }}
    >
      {/* Hero */}
      <section className="py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Latest <span className="text-gradient">News</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Stay updated with server announcements, events, and updates.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-16">
              <Loader className="h-8 w-8 animate-spin mx-auto" />
            </div>
          ) : error ? (
            <div className="text-center py-16 text-red-500">
              Error loading posts. Please try again.
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              No news posts available yet.
            </div>
          ) : featuredPost ? (
            <Card className="card-hover border-0 bg-card max-w-4xl mx-auto overflow-hidden">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2">
                  <div className="flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20 p-12 text-8xl">
                    {featuredPost.image_url ? (
                      <img src={featuredPost.image_url} alt={featuredPost.title} className="w-full h-full object-cover" />
                    ) : "📰"}
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <Badge className={`w-fit mb-4 ${getTagColor(featuredPost.slug)}`}>
                      News
                    </Badge>
                    <h2 className="font-display text-2xl font-bold mb-4">{featuredPost.title}</h2>
                    <p className="text-muted-foreground mb-4">{featuredPost.excerpt}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                      <Calendar className="h-4 w-4" />
                      {new Date(featuredPost.created_at).toLocaleDateString()}
                    </div>
                    <Link to={`/news/${featuredPost.slug}`}>
                      <Button className="btn-primary-gradient w-fit gap-2">
                        Read More <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-display text-2xl font-bold mb-8">All Posts</h2>
            {loading ? (
              <div className="text-center py-8">
                <Loader className="h-6 w-6 animate-spin mx-auto" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                Error loading posts.
              </div>
            ) : otherPosts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No additional posts available.
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {otherPosts.map((post) => (
                    <Link key={post.id} to={`/news/${post.slug}`}>
                      <Card className="card-hover border-0 bg-card cursor-pointer overflow-hidden h-full">
                        <CardContent className="p-0">
                          <div className="flex items-center justify-center bg-muted/50 py-8 text-5xl">
                            {post.image_url ? (
                              <img src={post.image_url} alt={post.title} className="w-full h-32 object-cover" />
                            ) : "📄"}
                          </div>
                          <div className="p-6">
                            <Badge className={`mb-3 ${getTagColor(post.slug)}`}>
                              News
                            </Badge>
                            <h3 className="font-semibold mb-2 line-clamp-2">{post.title}</h3>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{post.excerpt}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {new Date(post.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                {/* Load More */}
                <div className="text-center mt-12">
                  <Button variant="outline" size="lg">
                    Load More Posts
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
