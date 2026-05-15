// %%__NONCE_NEWS_PAGE_15_%%
// %%__VERSION_NUMBER_%%
// %%__RESOURCE_%%

import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight, Loader, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { newsService, NewsArticle } from "@/services/newsService";
import { toast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";

const getTagColor = (slug?: string) => {
  const tag = slug?.toLowerCase() || "";
  if (tag.includes("event")) return "bg-amber-500/10 text-amber-300 border border-amber-500/20";
  if (tag.includes("update")) return "bg-sky-500/10 text-sky-300 border border-sky-500/20";
  if (tag.includes("announce")) return "bg-amber-500/10 text-amber-300 border border-amber-500/20";
  if (tag.includes("maintenance")) return "bg-red-500/10 text-red-300 border border-red-500/20";
  if (tag.includes("community")) return "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20";
  return "bg-card/60 text-muted-foreground border border-border/60";
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
        title: "ZCraft News — Updates, Events & Announcements",
        description:
          "Stay updated with ZCraft Network's latest news, server announcements, event schedules, and important updates.",
        keywords:
          "zcraft news, minecraft server news, lifesteal server updates, minecraft announcements, server events, zcraft network news, minecraft server updates, lifesteal news",
        url: "/news",
        type: "website",
        tags: ["news", "updates", "announcements", "events", "minecraft"],
        rssFeeds: [{ title: "ZCraft News Feed", url: "https://z-craft.xyz/news/rss.xml" }],
      }}
    >
      <section className="relative overflow-hidden py-16 lg:py-20">
        <div className="absolute inset-0 hero-gradient" aria-hidden="true" />
        <div
          className="absolute inset-0 opacity-[0.12]"
          aria-hidden="true"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />
        <div className="container mx-auto px-4 relative">
          <div className="mx-auto max-w-3xl text-center space-y-4">
            <span className="section-eyebrow mx-auto">
              <Newspaper className="h-4 w-4 text-primary" aria-hidden="true" />
              News room
            </span>
            <h1 className="section-title text-balance text-4xl sm:text-5xl lg:text-6xl">
              Latest <span className="text-gradient">News</span>
            </h1>
            <p className="section-copy text-lg">
              Stay updated with server announcements, events, and changes that matter to the community.
            </p>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="py-16 text-center">
              <Loader className="mx-auto h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="py-16 text-center text-red-400">Error loading posts. Please try again.</div>
          ) : posts.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">No news posts available yet.</div>
          ) : featuredPost ? (
            <Card className="card-hover mx-auto max-w-5xl overflow-hidden border-border/60 bg-card/90">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2">
                  <div className="image-frame pixel-border flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20 p-8 text-8xl">
                    {featuredPost.image_url ? (
                      <img src={featuredPost.image_url} alt={featuredPost.title} className="h-full w-full object-cover" />
                    ) : (
                      "📰"
                    )}
                  </div>
                  <div className="flex flex-col justify-center p-8">
                    <Badge className={`mb-4 w-fit ${getTagColor(featuredPost.slug)}`}>News</Badge>
                    <h2 className="mb-4 font-display text-2xl font-bold text-foreground">{featuredPost.title}</h2>
                    <p className="mb-4 leading-7 text-muted-foreground">{featuredPost.excerpt}</p>
                    <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
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

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-8 font-display text-2xl font-bold text-foreground">All Posts</h2>
            {loading ? (
              <div className="py-8 text-center">
                <Loader className="mx-auto h-6 w-6 animate-spin" />
              </div>
            ) : error ? (
              <div className="py-8 text-center text-red-400">Error loading posts.</div>
            ) : otherPosts.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">No additional posts available.</div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {otherPosts.map((post) => (
                    <Link key={post.id} to={`/news/${post.slug}`}>
                      <Card className="card-hover h-full cursor-pointer overflow-hidden border-border/60 bg-card/90">
                        <CardContent className="p-0">
                          <div className="image-frame pixel-border flex items-center justify-center bg-muted/50 text-5xl">
                            {post.image_url ? (
                              <img src={post.image_url} alt={post.title} className="h-32 w-full object-cover" />
                            ) : (
                              "📄"
                            )}
                          </div>
                          <div className="p-6">
                            <Badge className={`mb-3 ${getTagColor(post.slug)}`}>News</Badge>
                            <h3 className="mb-2 line-clamp-2 font-semibold text-foreground">{post.title}</h3>
                            <p className="mb-4 line-clamp-2 text-sm leading-6 text-muted-foreground">
                              {post.excerpt}
                            </p>
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

                <div className="mt-12 text-center">
                  <Button variant="outline" size="lg" className="border-border/60 bg-card/60">
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
