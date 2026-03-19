import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, User, Eye, Tag, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { newsService, NewsArticle } from "@/services/newsService";
import { toast } from "@/components/ui/use-toast";
import { StructuredContent } from "@/components/content/StructuredContent";

export default function NewsArticlePage() {
  const { slug } = useParams();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArticle = async () => {
      if (!slug) {
        setError("Missing article slug");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await newsService.getNewsArticle(slug);
        setArticle(data);
      } catch (err: any) {
        setError(err?.message || "Failed to load article");
        toast({ title: "Error", description: "Failed to load article", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [slug]);

  if (loading) {
    return (
      <Layout seo={{ title: "Loading Article...", url: `/news/${slug || ""}`, noindex: true }}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error || !article) {
    return (
      <Layout seo={{ title: "Article Not Found", url: `/news/${slug || ""}`, noindex: true }}>
        <div className="container mx-auto px-4 py-16 max-w-3xl">
          <Card className="border-0 bg-card">
            <CardContent className="p-8">
              <p className="text-lg font-medium mb-2">Article unavailable</p>
              <p className="text-muted-foreground mb-6">{error || "This article could not be found."}</p>
              <Button asChild variant="outline">
                <Link to="/news">Back to News</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const publishedTime = new Date(article.updated_at || article.created_at || Date.now()).toISOString();

  return (
    <Layout
      seo={{
        title: `${article.title} - ZCraft Network News`,
        description: article.excerpt || article.title,
        keywords: `zcraft news, ${article.title}, minecraft server updates, announcements`,
        url: `/news/${article.slug}`,
        type: "article",
        publishedTime,
        section: "News",
        tags: ["news", "updates", "announcement", "minecraft"],
      }}
    >
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link to="/news" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to News
            </Link>

            <Card className="border-0 bg-card overflow-hidden">
              {article.image_url && (
                <div className="border-b border-border">
                  <img src={article.image_url} alt={article.title} className="w-full h-64 md:h-80 object-cover" />
                </div>
              )}
              <CardContent className="p-8">
                <Badge className="mb-4">News</Badge>
                <h1 className="font-display text-3xl md:text-5xl font-bold mb-4">{article.title}</h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(article.created_at || Date.now()).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {article.author?.username || "ZCraft Staff"}
                  </span>
                  <span className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    {(article.views || 0).toLocaleString()} views
                  </span>
                </div>

                {article.excerpt && (
                  <div className="mb-8 p-5 rounded-2xl bg-muted/40 border border-border">
                    <p className="text-lg leading-8">{article.excerpt}</p>
                  </div>
                )}

                <StructuredContent content={article.content} className="text-base" />

                <div className="mt-8 pt-8 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline">News</Badge>
                  </div>
                  <Button variant="outline" asChild>
                    <Link to="/news">More News</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}
