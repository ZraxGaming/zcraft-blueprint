import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Eye, ChevronRight } from "lucide-react";

const wikiArticles = {
  "getting-started": {
    title: "Getting Started",
    category: "Guides",
    updated: "January 1, 2025",
    views: "12.5K",
    content: `
      <h2>Welcome to ZCraft!</h2>
      <p>This guide will help you get started on your adventure. Follow these steps to begin your journey.</p>
      
      <h2>Step 1: Connect to the Server</h2>
      <p>Add our server address to your Minecraft client:</p>
      <ul>
        <li><strong>Java Edition:</strong> play.zcraftmc.xyz:25565</li>
      </ul>
      
      <h2>Step 2: Register Your Account</h2>
      <p>When you first join, you'll spawn in our tutorial area. Complete the tutorial to learn the basics and claim your starter kit.</p>
      
      <h2>Step 3: Explore the World</h2>
      <p>After completing the tutorial, you'll be teleported to the main world. Here you can:</p>
      <ul>
        <li>Claim land using /claim</li>
        <li>Join or create a faction</li>
        <li>Explore dungeons</li>
        <li>Trade with other players</li>
      </ul>
      
      <h2>Useful Commands</h2>
      <ul>
        <li><code>/help</code> - Shows all available commands</li>
        <li><code>/spawn</code> - Teleport to spawn</li>
        <li><code>/home</code> - Teleport to your home</li>
        <li><code>/tpa [player]</code> - Request teleport to a player</li>
      </ul>
      
      <h2>Need Help?</h2>
      <p>If you have questions, don't hesitate to ask in chat or join our Discord server!</p>
    `,
    related: [
      { title: "Commands List", slug: "commands" },
      { title: "Economy Guide", slug: "economy" },
      { title: "Claiming Land", slug: "claims" },
    ],
  },
};

export default function WikiArticlePage() {
  const { slug } = useParams();
  const article = wikiArticles[slug as keyof typeof wikiArticles] || wikiArticles["getting-started"];

  // Derive a short description from the content (first paragraph) for SEO
  const descriptionMatch = article.content.match(/<p>(.*?)<\//i);
  const shortDescription = descriptionMatch ? descriptionMatch[1].replace(/<[^>]*>/g, '').slice(0, 160) : `${article.title} — ${article.category}`;
  const publishedTime = new Date(article.updated).toISOString();

  return (
    <Layout
      seo={{
        title: `${article.title} — ZCraft Wiki`,
        description: shortDescription,
        keywords: `zcraft wiki, ${article.category?.toLowerCase() || 'wiki'}, ${article.title.split(' ')[0]}`,
        url: `https://z-craft.xyz/wiki/${slug || 'getting-started'}`,
        type: 'article',
        publishedTime,
      }}
    >
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <Link to="/wiki" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Wiki
              </Link>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{article.category}</span>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-3">
                <Card className="border-0 bg-card">
                  <CardContent className="p-8">
                    <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b">
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Updated {article.updated}
                      </span>
                      <span className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        {article.views} views
                      </span>
                    </div>

                    <div 
                      className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-display prose-headings:font-semibold prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-p:text-muted-foreground prose-li:text-muted-foreground prose-ul:space-y-2 prose-code:bg-muted prose-code:px-2 prose-code:py-0.5 prose-code:rounded prose-code:text-primary prose-code:font-mono prose-code:text-sm"
                      dangerouslySetInnerHTML={{ __html: article.content }}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <Card className="border-0 bg-card sticky top-24">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Related Articles</h3>
                    <div className="space-y-2">
                      {article.related.map((item) => (
                        <Link
                          key={item.slug}
                          to={`/wiki/${item.slug}`}
                          className="block p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <span className="text-sm font-medium">{item.title}</span>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
