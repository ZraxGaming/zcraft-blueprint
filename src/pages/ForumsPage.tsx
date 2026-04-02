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
import { forumService, Forum, ForumPost } from "@/services/forumService";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const FORUM_CATEGORIES = [
  { value: "general", label: "💬 General Discussion", description: "General discussion about the server and community" },
  { value: "support", label: "🛠️ Support", description: "Get help and support from the community" },
  { value: "suggestions", label: "💡 Suggestions", description: "Share your ideas and suggestions" },
  { value: "bugs", label: "🐛 Bug Reports", description: "Report bugs and issues" },
  { value: "marketplace", label: "💰 Marketplace", description: "Trading and marketplace discussions" },
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

  const filteredForums = forums.filter(forum => {
    const matchesCategory = !selectedCategory || forum.category === selectedCategory;
    const matchesSearch = !searchQuery || 
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
      const selectedForum = forums.find(f => f.category === newThreadCategory);
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

  if (loading) {
    return (
      <Layout seo={{
        title: "ZCraft Network Forums — Minecraft Community Discussions",
        description: "Join ZCraft Network forums for Minecraft discussions, lifesteal gameplay tips, server announcements, player support, and community conversations.",
        keywords: "zcraft forums, minecraft forums, lifesteal forums, minecraft community, server discussions, player support, minecraft discussions, gaming forums",
        url: "/forums",
        type: "website",
        tags: ["forums", "community", "discussions", "minecraft", "support"]
      }}>
        <div className="flex justify-center py-20">
          <Loader className="animate-spin h-8 w-8 text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout seo={{
      title: "ZCraft Network Forums — Minecraft Community Discussions",
      description: "Join ZCraft Network forums for Minecraft discussions, lifesteal gameplay tips, server announcements, player support, and community conversations. Connect with thousands of players.",
      keywords: "zcraft forums, minecraft forums, lifesteal forums, minecraft community, server discussions, player support, minecraft discussions, gaming forums",
      url: "/forums",
      type: "website",
      tags: ["forums", "community", "discussions", "minecraft", "support"]
    }}>
      {/* Hero */}
      <section className="py-16 bg-gradient-to-b from-primary/10 to-transparent">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">
            ZCraft <span className="text-primary">Forums</span>
          </h1>
          <p className="text-muted-foreground mb-8">
            Community discussions, ideas, and support. Join thousands of players.
          </p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              className="pl-12 h-12" 
              placeholder="Search forums..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 grid lg:grid-cols-3 gap-8">
          {/* Forums List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">Forum Categories</h2>
                <p className="text-sm text-muted-foreground">Select a category to browse forums</p>
              </div>
              <Badge variant="secondary">{filteredForums.length} forums</Badge>
            </div>

            {filteredForums.length === 0 ? (
              <Card className="border-0 bg-card">
                <CardContent className="p-12 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No forums found matching your search.</p>
                </CardContent>
              </Card>
            ) : (
              filteredForums.map((forum) => {
                const categoryLabel = FORUM_CATEGORIES.find(c => c.value === forum.category)?.label || forum.category;
                return (
                  <Card
                    key={forum.id}
                    className="hover:shadow-lg transition cursor-pointer border-0 bg-card hover:bg-muted/50"
                    onClick={() => navigate(`/forums/${forum.slug}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{forum.title}</h3>
                            <Badge variant="outline">{forum.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{forum.description}</p>
                          <div className="flex gap-6 text-xs text-muted-foreground">
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
                        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}

            {/* Category Filter */}
            <div className="mt-8">
              <h3 className="font-semibold mb-3">Filter by Category</h3>
              <div className="space-y-2">
                <Button 
                  variant={selectedCategory === null ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory(null)}
                >
                  All Categories
                </Button>
                {FORUM_CATEGORIES.map((category) => (
                  <Button 
                    key={category.value}
                    variant={selectedCategory === category.value ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(category.value)}
                  >
                    {category.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex gap-2 items-center">
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
                  <p className="text-xl font-bold text-primary">
                    {forums.reduce((sum, f) => sum + (f.post_count || 0), 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Posts</p>
                </div>
              </CardContent>
            </Card>

            {/* Create Thread */}
            <Card>
              <CardContent className="p-6">
                {!showNewThread ? (
                  <>
                    <PlusCircle className="h-8 w-8 text-primary mb-3" />
                    <Button
                      className="w-full"
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
                    />

                    <select
                      className="w-full p-2 rounded-md bg-muted border border-input"
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
                      className="w-full p-2 rounded-md bg-muted min-h-[120px] border border-input"
                      value={newThreadContent}
                      onChange={(e) => setNewThreadContent(e.target.value)}
                    />

                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={handleCreateThread}
                      >
                        Create Thread
                      </Button>

                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowNewThread(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex gap-2 items-center">
                  <Clock className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {forums.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No activity yet.</p>
                ) : (
                  forums
                    .filter(f => f.last_post_date)
                    .sort((a, b) => new Date(b.last_post_date || 0).getTime() - new Date(a.last_post_date || 0).getTime())
                    .slice(0, 5)
                    .map((forum) => (
                      <div
                        key={forum.id}
                        className="p-3 rounded bg-muted hover:bg-muted/70 transition cursor-pointer"
                        onClick={() => navigate(`/forums/${forum.slug}`)}
                      >
                        <h4 className="text-sm font-medium line-clamp-1">{forum.title}</h4>
                        {forum.last_post_date && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(forum.last_post_date).toLocaleDateString()}
                          </p>
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
