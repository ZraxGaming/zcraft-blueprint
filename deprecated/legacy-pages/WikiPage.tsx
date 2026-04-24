import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, ChevronRight, FileText, Loader } from "lucide-react";
import { useState, useEffect } from "react";
import { wikiService } from "@/services/wikiService";
import { toast } from "@/components/ui/use-toast";

interface WikiCategory {
  id: string;
  name: string;
  description: string;
  articles_count: number;
}

interface WikiArticlePreview {
  id: string;
  title: string;
  views_count?: number;
  created_at?: string;
  author?: string;
}

export default function WikiPage() {
  // Redirect wiki to canonical domain immediately
  useEffect(() => {
    window.location.replace("https://z-craft.xyz/wiki");
  }, []);

  const [categories, setCategories] = useState<WikiCategory[]>([]);
  const [popularArticles, setPopularArticles] = useState<WikiArticlePreview[]>([]);
  const [recentArticles, setRecentArticles] = useState<WikiArticlePreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWikiData();
  }, []);

  const loadWikiData = async () => {
    try {
      const [categoriesData, popularData, recentData] = await Promise.all([
        wikiService.getCategories(),
        wikiService.getPopularArticles(),
        wikiService.getRecentArticles(),
      ]);
      setCategories(categoriesData);
      setPopularArticles(popularData);
      setRecentArticles(recentData);
    } catch (err: any) {
      setError(err?.message || "Failed to load wiki");
      toast({ title: "Error", description: "Failed to load wiki data" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout
        seo={{
          title: "ZCraft Wiki — Server Guides & How-Tos",
          description:
            "Comprehensive guides for ZCraft Network including commands, economy, claims, and lifesteal mechanics.",
          keywords: "zcraft wiki, minecraft wiki, lifesteal guide, zcraft guides",
          url: "https://z-craft.xyz/wiki",
        }}
      >
        <div className="flex items-center justify-center py-20">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout
        seo={{
          title: "ZCraft Wiki — Server Guides & How-Tos",
          description:
            "Comprehensive guides for ZCraft Network including commands, economy, claims, and lifesteal mechanics.",
          keywords: "zcraft wiki, minecraft wiki, lifesteal guide, zcraft guides",
          url: "https://z-craft.xyz/wiki",
        }}
      >
        <div className="py-20 text-center text-red-500">{error}</div>
      </Layout>
    );
  }

  return (
    <Layout
      seo={{
        title: "ZCraft Wiki — Server Guides & How-Tos",
        description:
          "Comprehensive guides for ZCraft Network including commands, economy, claims, and lifesteal mechanics.",
        keywords: "zcraft wiki, minecraft wiki, lifesteal guide, zcraft guides",
        url: "https://z-craft.xyz/wiki",
      }}
    >
      {/* Hero */}
      <section className="py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border mb-6">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Knowledge Base</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Server <span className="text-gradient">Wiki</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Everything you need to know about ZCraft, all in one place.
            </p>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search the wiki..."
                className="pl-12 h-14 text-lg bg-card border-0"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl font-bold mb-6">Browse Categories</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.length === 0 ? (
              <p className="col-span-full text-center text-muted-foreground py-8">No categories available</p>
            ) : (
              categories.map((category) => (
                <Card key={category.id} className="card-hover border-0 bg-card cursor-pointer">
                  <CardContent className="p-6">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
                      📚
                    </div>
                    <h3 className="font-display text-lg font-semibold mb-1">{category.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                    <Badge variant="secondary">{category.articles_count} articles</Badge>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Popular */}
            <Card className="border-0 bg-card">
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  📈 Popular Articles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {popularArticles.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">No popular articles yet</p>
                ) : (
                  popularArticles.map((article) => (
                    <div
                      key={article.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{article.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{(article.views_count || 0).toLocaleString()} views</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Recent */}
            <Card className="border-0 bg-card">
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  🕒 Recently Updated
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentArticles.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">No recent articles yet</p>
                ) : (
                  recentArticles.map((article) => (
                    <div
                      key={article.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{article.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {article.created_at ? new Date(article.created_at).toLocaleDateString() : "N/A"}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto border-0 bg-primary/5">
            <CardContent className="p-8 text-center">
              <h3 className="font-display text-xl font-bold mb-4">Can't find what you're looking for?</h3>
              <p className="text-muted-foreground mb-6">
                Check out our forums or contact support for additional help.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Badge variant="outline" className="px-4 py-2 cursor-pointer hover:bg-muted">
                  Visit Forums
                </Badge>
                <Badge variant="outline" className="px-4 py-2 cursor-pointer hover:bg-muted">
                  Contact Support
                </Badge>
                <Badge variant="outline" className="px-4 py-2 cursor-pointer hover:bg-muted">
                  Join Discord
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}