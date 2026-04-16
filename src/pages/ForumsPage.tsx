import { BentoPageLayout } from "@/components/layout/BentoPageLayout";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MessageSquare, Clock, ChevronRight, Loader, PlusCircle, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { forumService, Forum } from "@/services/forumService";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const FORUM_CATEGORIES = [
  { value: "general", label: "💬 General Discussion" },
  { value: "support", label: "🛠️ Support" },
  { value: "suggestions", label: "💡 Suggestions" },
  { value: "bugs", label: "🐛 Bug Reports" },
  { value: "marketplace", label: "💰 Marketplace" },
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
    forumService.getForums().then(setForums).catch((err) => {
      toast({ title: "Error", description: err?.message || "Failed to load forums", variant: "destructive" });
    }).finally(() => setLoading(false));
  }, []);

  const filteredForums = forums.filter((f) => {
    const matchCat = !selectedCategory || f.category === selectedCategory;
    const matchSearch = !searchQuery || f.title.toLowerCase().includes(searchQuery.toLowerCase()) || f.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleCreateThread = async () => {
    if (!user) { navigate("/login"); return; }
    if (!newThreadTitle || !newThreadContent) { toast({ title: "Error", description: "Fill in all fields.", variant: "destructive" }); return; }
    const selectedForum = forums.find((f) => f.category === newThreadCategory);
    if (!selectedForum) return;
    try {
      await forumService.createForumPost({ forum_id: selectedForum.id, author_id: user.id, title: newThreadTitle, content: newThreadContent } as any);
      toast({ title: "Success", description: "Thread created!" });
      setShowNewThread(false); setNewThreadTitle(""); setNewThreadContent("");
      const data = await forumService.getForums(); setForums(data);
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed", variant: "destructive" });
    }
  };

  return (
    <BentoPageLayout
      title="Forums"
      subtitle="Community discussions, ideas, and support."
      seo={{
        title: "ZCraft Network Forums — Minecraft Community Discussions",
        description: "Join ZCraft Network forums for Minecraft discussions, lifesteal gameplay tips, and community conversations.",
        keywords: "zcraft forums, minecraft forums, lifesteal forums, minecraft community",
        url: "/forums",
        type: "website",
      }}
    >
      {/* Search */}
      <div className="max-w-xl mx-auto mb-8 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-foreground/30" />
        <Input
          className="pl-12 h-12 bg-bento-card border-bento-border text-primary-foreground placeholder:text-primary-foreground/30"
          placeholder="Search forums..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-display text-xl font-bold text-primary-foreground">Forum Categories</h2>
              <Badge className="bg-bento-card border-bento-border text-primary-foreground/60">{filteredForums.length} forums</Badge>
            </div>

            {filteredForums.length === 0 ? (
              <div className="bento-card p-12 text-center">
                <MessageSquare className="h-12 w-12 text-primary-foreground/20 mx-auto mb-4" />
                <p className="text-primary-foreground/40">No forums found.</p>
              </div>
            ) : (
              filteredForums.map((forum, i) => (
                <motion.div
                  key={forum.id}
                  className="bento-card p-5 cursor-pointer"
                  onClick={() => navigate(`/forums/${forum.slug}`)}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-primary-foreground">{forum.title}</h3>
                        <Badge className="bg-primary/10 text-primary border-0 text-xs">{forum.category}</Badge>
                      </div>
                      <p className="text-sm text-primary-foreground/40 mb-2">{forum.description}</p>
                      <div className="flex gap-4 text-xs text-primary-foreground/30">
                        <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{forum.post_count || 0} posts</span>
                        {forum.last_post_date && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(forum.last_post_date).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-primary-foreground/20 mt-1" />
                  </div>
                </motion.div>
              ))
            )}

            {/* Category filter */}
            <div className="mt-6">
              <h3 className="font-semibold text-primary-foreground/70 mb-3 text-sm">Filter by Category</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={selectedCategory === null ? "default" : "outline"}
                  onClick={() => setSelectedCategory(null)}
                  className={selectedCategory === null ? "" : "border-bento-border text-primary-foreground/60"}
                >All</Button>
                {FORUM_CATEGORIES.map((c) => (
                  <Button
                    key={c.value} size="sm"
                    variant={selectedCategory === c.value ? "default" : "outline"}
                    onClick={() => setSelectedCategory(c.value)}
                    className={selectedCategory === c.value ? "" : "border-bento-border text-primary-foreground/60"}
                  >{c.label}</Button>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bento-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-primary-foreground">Stats</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{forums.length}</p>
                  <p className="text-xs text-primary-foreground/40">Forums</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{forums.reduce((s, f) => s + (f.post_count || 0), 0)}</p>
                  <p className="text-xs text-primary-foreground/40">Posts</p>
                </div>
              </div>
            </div>

            <div className="bento-card p-5">
              {!showNewThread ? (
                <div className="text-center">
                  <PlusCircle className="h-8 w-8 text-primary mx-auto mb-3" />
                  <Button className="w-full" onClick={() => user ? setShowNewThread(true) : navigate("/login")}>
                    Create New Thread
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Input placeholder="Thread title" value={newThreadTitle} onChange={(e) => setNewThreadTitle(e.target.value)} className="bg-bento-bg border-bento-border text-primary-foreground" />
                  <select className="w-full p-2 rounded-md bg-bento-bg border border-bento-border text-primary-foreground" value={newThreadCategory} onChange={(e) => setNewThreadCategory(e.target.value)}>
                    {FORUM_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                  <textarea placeholder="Content..." className="w-full p-2 rounded-md bg-bento-bg min-h-[120px] border border-bento-border text-primary-foreground" value={newThreadContent} onChange={(e) => setNewThreadContent(e.target.value)} />
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={handleCreateThread}>Create</Button>
                    <Button variant="outline" className="flex-1 border-bento-border text-primary-foreground/60" onClick={() => setShowNewThread(false)}>Cancel</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </BentoPageLayout>
  );
}
