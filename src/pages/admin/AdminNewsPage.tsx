// %%__NONCE_ADMIN_NEWS_02_%%
// %%__TIMESTAMP_%%
// %%__VERSION_NUMBER_%%

import { useState, useEffect } from "react";
import {
  Newspaper,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Loader,
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AdminLayout from "@/components/admin/AdminLayout";
import { newsService, NewsArticle } from "@/services/newsService";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { StructuredContent } from "@/components/content/StructuredContent";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { sendAdminEmail } from "@/services/emailService";

function NewsFormFields({
  title,
  setTitle,
  excerpt,
  setExcerpt,
  content,
  setContent,
  imageUrl,
  setImageUrl,
  imageIdentifier,
}: {
  title: string;
  setTitle: (value: string) => void;
  excerpt: string;
  setExcerpt: (value: string) => void;
  content: string;
  setContent: (value: string) => void;
  imageUrl: string;
  setImageUrl: (value: string) => void;
  imageIdentifier: string;
}) {
  return (
    <div className="max-h-[calc(90vh-10rem)] overflow-y-auto pr-2">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input placeholder="Enter post title..." value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Excerpt *</Label>
            <Textarea
              placeholder="Brief summary..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={4}
              className="min-h-[110px] resize-y"
            />
          </div>
          <div className="space-y-2">
            <Label>Image</Label>
            <MediaPicker
              label="News Image"
              value={imageUrl}
              onChange={setImageUrl}
              kind="news"
              identifier={imageIdentifier}
            />
          </div>
          <div className="space-y-2">
            <Label>Content *</Label>
            <Textarea
              placeholder="Write your post content..."
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[260px] resize-y"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-muted/30 p-4 max-h-[180px] overflow-y-auto">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Excerpt Preview</p>
            <StructuredContent content={excerpt} />
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-4 max-h-[500px] overflow-y-auto">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Content Preview</p>
            <StructuredContent content={content} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminNewsPage() {
  const { user, session } = useAuth();
  const [posts, setPosts] = useState<NewsArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingPost, setEditingPost] = useState<NewsArticle | null>(null);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const data = await newsService.getNews(100);
      setPosts(data);
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to load news posts", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (value: string) => {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  };

  const resetForm = () => {
    setTitle("");
    setExcerpt("");
    setContent("");
    setImageUrl("");
    setEditingPost(null);
  };

  const handleCreate = async () => {
    if (!title || !content || !excerpt) {
      toast({ title: "Missing fields", description: "Please fill in title, excerpt, and content" });
      return;
    }

    if (!user?.id) {
      toast({ title: "Error", description: "You must be logged in", variant: "destructive" });
      return;
    }

    try {
      setSaving(true);
      await newsService.createNews({
        title,
        slug: generateSlug(title),
        excerpt,
        content,
        image_url: imageUrl || null,
        author_id: user.id,
      });

      if (session?.access_token) {
        sendAdminEmail({
          subject: `News: ${title}`,
          html: `
            <h1>${title}</h1>
            <p>${excerpt}</p>
            <p><a href="https://z-craft.xyz/news/${generateSlug(title)}">Read the full update</a></p>
          `,
          accessToken: session.access_token,
          audience: "all_users",
        }).catch((emailError) => {
          console.warn("Failed to send news email:", emailError);
        });
      }

      toast({ title: "Success", description: "News post created" });
      setIsCreateOpen(false);
      resetForm();
      loadNews();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to create post", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editingPost || !title || !content || !excerpt) {
      toast({ title: "Missing fields", description: "Please fill in all required fields" });
      return;
    }

    try {
      setSaving(true);
      await newsService.updateNews(editingPost.id, {
        title,
        slug: generateSlug(title),
        excerpt,
        content,
        image_url: imageUrl || null,
      });

      toast({ title: "Success", description: "News post updated" });
      setIsEditOpen(false);
      resetForm();
      loadNews();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to update post", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, postTitle: string) => {
    if (!confirm(`Delete "${postTitle}"?`)) return;

    try {
      await newsService.deleteNews(id);
      toast({ title: "Success", description: "News post deleted" });
      loadNews();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to delete post", variant: "destructive" });
    }
  };

  const openEditDialog = (post: NewsArticle) => {
    setEditingPost(post);
    setTitle(post.title);
    setExcerpt(post.excerpt);
    setContent(post.content);
    setImageUrl(post.image_url || "");
    setIsEditOpen(true);
  };

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout title="News Management">
        <div className="flex items-center justify-center py-20">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="News Management">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search news posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button className="btn-primary-gradient gap-2" onClick={() => { resetForm(); setIsCreateOpen(true); }}>
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Total Posts", value: posts.length.toString() },
            { label: "This Month", value: posts.filter((p) => {
              const postDate = new Date(p.created_at || "");
              const now = new Date();
              return postDate.getMonth() === now.getMonth() && postDate.getFullYear() === now.getFullYear();
            }).length.toString() },
            { label: "Total Views", value: posts.reduce((sum, p) => sum + (p.views || 0), 0).toLocaleString() },
            { label: "Authors", value: new Set(posts.map((p) => p.author_id)).size.toString() },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold font-display">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-primary" />
              All Posts ({filteredPosts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPosts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No posts found</p>
              ) : (
                filteredPosts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      {post.image_url ? (
                        <img src={post.image_url} alt={post.title} className="h-12 w-12 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Newspaper className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-medium truncate">{post.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 break-words mt-1">{post.excerpt}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-muted-foreground">{post.views || 0} views</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(post.created_at || "").toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="default">Published</Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => window.open(`/news/${post.slug}`, "_blank")}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(post)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(post.id, post.title)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Create News Post</DialogTitle>
            <DialogDescription>
              Write and preview a news post in a scrollable editor that stays usable with long content.
            </DialogDescription>
          </DialogHeader>
          <NewsFormFields
            title={title}
            setTitle={setTitle}
            excerpt={excerpt}
            setExcerpt={setExcerpt}
            content={content}
            setContent={setContent}
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            imageIdentifier={generateSlug(title) || "news-post"}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button className="btn-primary-gradient" onClick={handleCreate} disabled={saving}>
              {saving ? "Publishing..." : "Publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Edit News Post</DialogTitle>
            <DialogDescription>
              Update the article without long text stretching the editor out of view.
            </DialogDescription>
          </DialogHeader>
          <NewsFormFields
            title={title}
            setTitle={setTitle}
            excerpt={excerpt}
            setExcerpt={setExcerpt}
            content={content}
            setContent={setContent}
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            imageIdentifier={generateSlug(title) || editingPost?.slug || "news-post"}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button className="btn-primary-gradient" onClick={handleEdit} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
