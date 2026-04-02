// %%__NONCE_ADMIN_WIKI_06_%%
// %%__TIMESTAMP_%%
// %%__VERSION_%%

import { useState, useEffect } from "react";
import { 
  BookOpen, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  Eye,
  FolderOpen,
  Loader
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AdminLayout from "@/components/admin/AdminLayout";
import { wikiService, WikiArticle } from "@/services/wikiService";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface WikiArticleDisplay {
  id: string;
  title: string;
  slug: string;
  category: string;
  views_count: number;
  created_at: string;
  author: string;
}

interface WikiCategory {
  id: string;
  name: string;
  articles_count: number;
}

export default function AdminWikiPage() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<WikiArticleDisplay[]>([]);
  const [categories, setCategories] = useState<WikiCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<WikiArticle | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    loadWikiData();
  }, []);

  const loadWikiData = async () => {
    try {
      const [articlesData, categoriesData] = await Promise.all([
        wikiService.getArticles(),
        wikiService.getCategories(),
      ]);
      setArticles(articlesData);
      setCategories(categoriesData);
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to load wiki data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const resetForm = () => {
    setTitle("");
    setCategory("");
    setContent("");
    setEditingArticle(null);
  };

  const handleCreate = async () => {
    if (!title || !category || !content) {
      toast({ title: "Missing fields", description: "Please fill in all fields" });
      return;
    }

    if (!user?.id) {
      toast({ title: "Error", description: "You must be logged in", variant: "destructive" });
      return;
    }

    try {
      setSaving(true);
      await wikiService.createWikiArticle({
        title,
        slug: generateSlug(title),
        category,
        content,
        author_id: user.id,
      });
      
      toast({ title: "Success", description: "Article created" });
      setIsCreateOpen(false);
      resetForm();
      loadWikiData();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to create article", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editingArticle || !title || !category || !content) {
      toast({ title: "Missing fields", description: "Please fill in all fields" });
      return;
    }

    try {
      setSaving(true);
      await wikiService.updateWikiArticle(editingArticle.id, {
        title,
        slug: generateSlug(title),
        category,
        content,
      });
      
      toast({ title: "Success", description: "Article updated" });
      setIsEditOpen(false);
      resetForm();
      loadWikiData();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to update article", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, articleTitle: string) => {
    if (!confirm(`Delete "${articleTitle}"?`)) return;

    try {
      await wikiService.deleteWikiArticle(id);
      toast({ title: "Success", description: "Article deleted" });
      loadWikiData();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to delete article", variant: "destructive" });
    }
  };

  const openEditDialog = async (article: WikiArticleDisplay) => {
    try {
      // Fetch full article with content
      const fullArticle = await wikiService.getWikiArticle(article.slug);
      setEditingArticle(fullArticle);
      setTitle(fullArticle.title);
      setCategory(fullArticle.category);
      setContent(fullArticle.content);
      setIsEditOpen(true);
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to load article", variant: "destructive" });
    }
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout title="Wiki Management">
        <div className="flex items-center justify-center py-20">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Wiki Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button className="btn-primary-gradient gap-2" onClick={() => { resetForm(); setIsCreateOpen(true); }}>
            <Plus className="h-4 w-4" />
            New Article
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Total Articles", value: articles.length.toString() },
            { label: "Categories", value: categories.length.toString() },
            { label: "Total Views", value: articles.reduce((sum, a) => sum + (a.views_count || 0), 0).toLocaleString() },
            { label: "This Month", value: articles.filter(a => {
              const date = new Date(a.created_at);
              const now = new Date();
              return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            }).length.toString() },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold font-display">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-primary" />
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categories.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No categories yet</p>
              ) : (
                categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <span className="font-medium">{cat.name}</span>
                    <Badge variant="secondary">{cat.articles_count} articles</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Articles */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                All Articles ({filteredArticles.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredArticles.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No articles found</p>
              ) : (
                filteredArticles.map((article) => (
                  <div key={article.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{article.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">{article.category}</Badge>
                          <span>{article.views_count.toLocaleString()} views</span>
                          <span>by {article.author}</span>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => window.open(`/wiki/${article.slug}`, '_blank')}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(article)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(article.id, article.title)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Wiki Article</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input placeholder="Article title..." value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Input placeholder="e.g., Basics, Commands, Features" value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Content (Markdown) *</Label>
              <Textarea placeholder="Write article content..." rows={10} value={content} onChange={(e) => setContent(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button className="btn-primary-gradient" onClick={handleCreate} disabled={saving}>
                {saving ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Wiki Article</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input placeholder="Article title..." value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Input placeholder="e.g., Basics, Commands, Features" value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Content (Markdown) *</Label>
              <Textarea placeholder="Write article content..." rows={10} value={content} onChange={(e) => setContent(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button className="btn-primary-gradient" onClick={handleEdit} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
