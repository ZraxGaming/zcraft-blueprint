// %%__NONCE_FORUMS_PAGE_14_%%
// %%__BUILTBYBIT_%%
// %%__TIMESTAMP_%%
/**
 * ============================================================
 * Forums Page - Protected by BuiltByBit Anti-Piracy
 * © 2024-2026 ZCraft. All rights reserved.
 * Unauthorized distribution or modification is prohibited.
 * ============================================================
 * This code is protected under international copyright law.
 * Removal of this notice or unauthorized copying will be detected.
 * __BUILTIN_ANTI_PIRACY_CHECK_FORUMS_PAGE_001__
 */

import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, MessageSquare, Clock, TrendingUp, ChevronRight, Loader, PlusCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { forumService, Forum } from "@/services/forumService";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ensureIntegrityPulse } from "@/lib/_ig";

const FORUM_CATEGORIES = [
  { value: "general", label: "General Discussion", description: "General discussion about the server and community" },
  { value: "support", label: "Support", description: "Get help and support from the community" },
  { value: "suggestions", label: "Suggestions", description: "Share your ideas and suggestions" },
  { value: "bugs", label: "Bug Reports", description: "Report bugs and issues" },
  { value: "marketplace", label: "Marketplace", description: "Trading and marketplace discussions" },
];

export default function ForumsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [forums, setForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewThread, setShowNewThread] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadContent, setNewThreadContent] = useState("");
  const [newThreadCategory, setNewThreadCategory] = useState(FORUM_CATEGORIES[0].value);

  useEffect(() => {
    ensureIntegrityPulse();
    loadForums();
  }, []);

  const loadForums = async () => {
    try {
      const data = await forumService.getForums();
      setForums(data);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to load forums",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredForums = forums.filter((forum) => {
    const matchesCategory = !selectedCategory || forum.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      forum.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      forum.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateThread = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to create a thread.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!newThreadTitle || !newThreadContent) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const selectedForum = forums.find((f) => f.category === newThreadCategory);
      if (!selectedForum) {
        toast({
          title: "Error",
          description: "Invalid forum selected.",
          variant: "destructive",
        });
        return;
      }

      await forumService.createForumPost({
        forum_id: selectedForum.id,
        author_id: user.id,
        title: newThreadTitle,
        content: newThreadContent,
      } as any);

      toast({
        title: "Success",
        description: "Your thread has been created!",
      });

      setShowNewThread(false);
      setNewThreadTitle("");
      setNewThreadContent("");
      loadForums();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to create thread",
        variant: "destructive",
      });
    }
  };

  const seo = {
    title: "ZCraft Network Forums - Minecraft Community Discussions",
    description:
      "Join ZCraft Network forums for Minecraft discussions, lifesteal gameplay tips, server announcements, player support, and community conversations.",
    keywords:
      "zcraft forums, minecraft forums, lifesteal forums, minecraft community, server discussions, player support, minecraft discussions, gaming forums",
    url: "/forums",
    type: "website",
    tags: ["forums", "community", "discussions", "minecraft", "support"],
  };

  return (
    <Layout seo={seo}>
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
            <span className="section-eyebrow mx-auto">Community discussion</span>
            <h1 className="section-title text-balance text-4xl sm:text-5xl lg:text-6xl">
              ZCraft <span className="text-gradient">Forums</span>
            </h1>
            <p className="section-copy text-lg">
              Community discussions, ideas, and support. Join players, ask questions, and share feedback.
            </p>
            <div className="relative mx-auto max-w-xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-12 border-border/60 bg-card/60 pl-12"
                placeholder="Search forums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">Forum Categories</h2>
                <p className="text-sm text-muted-foreground">Select a category to browse forums</p>
              </div>
              <Badge variant="secondary" className="border border-border/60 bg-card/60">
                {filteredForums.length} forums
              </Badge>
            </div>

            {filteredForums.length === 0 ? (
              <Card className="border-border/60 bg-card/90">
                <CardContent className="p-12 text-center">
                  <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">No forums found matching your search.</p>
                </CardContent>
              </Card>
            ) : (
              filteredForums.map((forum) => (
                <Card
                  key={forum.id}
                  className="card-hover cursor-pointer overflow-hidden border-border/60 bg-card/90"
                  onClick={() => navigate(`/forums/${forum.slug}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-3">
                          <h3 className="font-semibold text-lg text-foreground">{forum.title}</h3>
                          <Badge variant="outline" className="border-border/60 bg-card/60">
                            {forum.category}
                          </Badge>
                        </div>
                        <p className="mb-3 text-sm leading-6 text-muted-foreground">{forum.description}</p>
                        <div className="flex flex-wrap gap-6 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {forum.post_count || 0} posts
                          </span>
                          {forum.last_post_date && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Last: {new Date(forum.last_post_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="mt-1 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            <div className="mt-8">
              <h3 className="mb-3 font-semibold text-foreground">Filter by Category</h3>
              <div className="space-y-2">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  className="w-full justify-start border-border/60 bg-card/60"
                  onClick={() => setSelectedCategory(null)}
                >
                  All Categories
                </Button>
                {FORUM_CATEGORIES.map((category) => (
                  <Button
                    key={category.value}
                    variant={selectedCategory === category.value ? "default" : "outline"}
                    className="w-full justify-start border-border/60 bg-card/60"
                    onClick={() => setSelectedCategory(category.value)}
                  >
                    {category.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="border-border/60 bg-card/90">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Forum Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-xl font-bold text-primary">{forums.length}</p>
                  <p className="text-xs text-muted-foreground">Forums</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-primary">{forums.reduce((sum, f) => sum + (f.post_count || 0), 0)}</p>
                  <p className="text-xs text-muted-foreground">Posts</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/90">
              <CardContent className="p-6">
                {!showNewThread ? (
                  <>
                    <PlusCircle className="mb-3 h-8 w-8 text-primary" />
                    <Button
                      className="w-full btn-primary-gradient"
                      onClick={() => {
                        if (!user) {
                          toast({
                            title: "Login required",
                            description: "Please log in to create a thread.",
                            variant: "destructive",
                          });
                          navigate("/login");
                          return;
                        }
                        setShowNewThread(true);
                      }}
                    >
                      Create New Thread
                    </Button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <Input
                      placeholder="Thread title"
                      value={newThreadTitle}
                      onChange={(e) => setNewThreadTitle(e.target.value)}
                      className="border-border/60 bg-card/60"
                    />
                    <select
                      className="w-full rounded-md border border-border/60 bg-card/60 p-2 text-sm text-foreground"
                      value={newThreadCategory}
                      onChange={(e) => setNewThreadCategory(e.target.value)}
                    >
                      {FORUM_CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <textarea
                      placeholder="Write your thread content..."
                      className="min-h-[120px] w-full rounded-md border border-border/60 bg-card/60 p-2 text-sm text-foreground"
                      value={newThreadContent}
                      onChange={(e) => setNewThreadContent(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button className="flex-1 btn-primary-gradient" onClick={handleCreateThread}>
                        Create Thread
                      </Button>
                      <Button variant="outline" className="flex-1 border-border/60 bg-card/60" onClick={() => setShowNewThread(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/90">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display">
                  <Clock className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {forums.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No activity yet.</p>
                ) : (
                  forums
                    .filter((f) => f.last_post_date)
                    .sort((a, b) => new Date(b.last_post_date || 0).getTime() - new Date(a.last_post_date || 0).getTime())
                    .slice(0, 5)
                    .map((forum) => (
                      <div
                        key={forum.id}
                        className="cursor-pointer rounded-2xl border border-border/60 bg-card/60 p-3 transition-colors hover:bg-card/80"
                        onClick={() => navigate(`/forums/${forum.slug}`)}
                      >
                        <h4 className="line-clamp-1 text-sm font-medium text-foreground">{forum.title}</h4>
                        {forum.last_post_date && (
                          <p className="text-xs text-muted-foreground">{new Date(forum.last_post_date).toLocaleDateString()}</p>
                        )}
                      </div>
                    ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}
