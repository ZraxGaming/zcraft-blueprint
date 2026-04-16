import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, FileText, MessageSquare, Newspaper } from "lucide-react";

const searchResults = {
  forums: [
    { title: "Best strategies for the new dungeon?", category: "General", replies: 42 },
    { title: "How to get started with farming", category: "Help", replies: 18 },
    { title: "Suggestion: New enchantment system", category: "Ideas", replies: 67 },
  ],
  wiki: [
    { title: "Getting Started Guide", views: "12.5K" },
    { title: "Commands List", views: "8.2K" },
    { title: "Economy Tutorial", views: "6.8K" },
  ],
  news: [
    { title: "Summer Event 2024 is Here!", date: "Dec 28, 2024", tag: "Event" },
    { title: "Server Update v3.2.1", date: "Dec 25, 2024", tag: "Update" },
  ],
};

export default function SearchPage() {
  return (
    <Layout
      seo={{
        title: "Search ZCraft Network - Find Forums, News & Server Information",
        description:
          "Search ZCraft Network for forums, news articles, changelogs, wiki pages, and server information.",
        keywords:
          "search zcraft, minecraft search, lifesteal search, server search, zcraft network search, minecraft forums search, server information",
        url: "/search",
        type: "website",
        tags: ["search", "forums", "news", "wiki", "server info"],
      }}
    >
      <section className="relative overflow-hidden py-16 lg:py-20">
        <div className="absolute inset-0 hero-gradient" aria-hidden="true" />
        <div className="container mx-auto px-4 relative">
          <div className="mx-auto max-w-3xl text-center space-y-4">
            <span className="section-eyebrow mx-auto">Search everything</span>
            <h1 className="section-title text-balance text-4xl sm:text-5xl lg:text-6xl">
              Search <span className="text-gradient">ZCraft</span>
            </h1>
            <p className="section-copy text-lg">
              Find forum posts, wiki pages, and news in one place.
            </p>
            <div className="relative mx-auto max-w-2xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search forums, wiki, news..." className="h-14 border-border/60 bg-card/60 pl-12 text-lg" defaultValue="dungeon" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6 h-auto w-full flex-wrap gap-2 bg-transparent p-0">
              <TabsTrigger value="all" className="border border-border/60 bg-card/60 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                All Results
              </TabsTrigger>
              <TabsTrigger value="forums" className="gap-2 border border-border/60 bg-card/60 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <MessageSquare className="h-4 w-4" />
                Forums
              </TabsTrigger>
              <TabsTrigger value="wiki" className="gap-2 border border-border/60 bg-card/60 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <FileText className="h-4 w-4" />
                Wiki
              </TabsTrigger>
              <TabsTrigger value="news" className="gap-2 border border-border/60 bg-card/60 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Newspaper className="h-4 w-4" />
                News
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              <Card className="border-border/60 bg-card/90">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 font-display text-sm text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    Forums
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {searchResults.forums.map((result, index) => (
                    <div key={index} className="rounded-2xl border border-border/60 bg-card/60 p-4 transition-colors hover:bg-card/80">
                      <h4 className="mb-1 font-medium text-foreground">{result.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className="border-border/60 bg-card/60 text-xs">
                          {result.category}
                        </Badge>
                        <span>{result.replies} replies</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card/90">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 font-display text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    Wiki
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {searchResults.wiki.map((result, index) => (
                    <div key={index} className="rounded-2xl border border-border/60 bg-card/60 p-4 transition-colors hover:bg-card/80">
                      <h4 className="mb-1 font-medium text-foreground">{result.title}</h4>
                      <span className="text-sm text-muted-foreground">{result.views} views</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card/90">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 font-display text-sm text-muted-foreground">
                    <Newspaper className="h-4 w-4" />
                    News
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {searchResults.news.map((result, index) => (
                    <div key={index} className="rounded-2xl border border-border/60 bg-card/60 p-4 transition-colors hover:bg-card/80">
                      <div className="mb-1 flex items-center gap-2">
                        <h4 className="font-medium text-foreground">{result.title}</h4>
                        <Badge variant="secondary" className="border border-border/60 bg-card/60 text-xs">
                          {result.tag}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">{result.date}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="forums">
              <Card className="border-border/60 bg-card/90">
                <CardContent className="space-y-2 p-6">
                  {searchResults.forums.map((result, index) => (
                    <div key={index} className="rounded-2xl border border-border/60 bg-card/60 p-4 transition-colors hover:bg-card/80">
                      <h4 className="mb-1 font-medium text-foreground">{result.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className="border-border/60 bg-card/60 text-xs">
                          {result.category}
                        </Badge>
                        <span>{result.replies} replies</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wiki">
              <Card className="border-border/60 bg-card/90">
                <CardContent className="space-y-2 p-6">
                  {searchResults.wiki.map((result, index) => (
                    <div key={index} className="rounded-2xl border border-border/60 bg-card/60 p-4 transition-colors hover:bg-card/80">
                      <h4 className="mb-1 font-medium text-foreground">{result.title}</h4>
                      <span className="text-sm text-muted-foreground">{result.views} views</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="news">
              <Card className="border-border/60 bg-card/90">
                <CardContent className="space-y-2 p-6">
                  {searchResults.news.map((result, index) => (
                    <div key={index} className="rounded-2xl border border-border/60 bg-card/60 p-4 transition-colors hover:bg-card/80">
                      <div className="mb-1 flex items-center gap-2">
                        <h4 className="font-medium text-foreground">{result.title}</h4>
                        <Badge variant="secondary" className="border border-border/60 bg-card/60 text-xs">
                          {result.tag}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">{result.date}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
}
