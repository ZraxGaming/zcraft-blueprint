// %%__NONCE_ADMIN_FORUMS_03_%%
// %%__RESOURCE_%%
// %%__TIMESTAMP_%%

import { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  Eye,
  Loader,
  FolderOpen
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
import { forumService, Forum } from "@/services/forumService";
import { toast } from "@/components/ui/use-toast";

interface ForumThread {
  id: string;
  title: string;
  author: string;
  category: string;
  replies_count: number;
  created_at: string;
}

export default function AdminForumsPage() {
  const [forums, setForums] = useState<Forum[]>([]);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Forum form state
  const [isCreateForumOpen, setIsCreateForumOpen] = useState(false);
  const [isEditForumOpen, setIsEditForumOpen] = useState(false);
  const [editingForum, setEditingForum] = useState<Forum | null>(null);
  const [forumTitle, setForumTitle] = useState("");
  const [forumDescription, setForumDescription] = useState("");
  const [forumCategory, setForumCategory] = useState("");

  useEffect(() => {
    loadForumData();
  }, []);

  const loadForumData = async () => {
    try {
      const [forumsData, threadsData] = await Promise.all([
        forumService.getForums(),
        forumService.getAllThreads(),
      ]);
      setForums(forumsData);
      setThreads(threadsData);
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to load forum data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const resetForumForm = () => {
    setForumTitle("");
    setForumDescription("");
    setForumCategory("");
    setEditingForum(null);
  };

  const handleCreateForum = async () => {
    if (!forumTitle || !forumDescription || !forumCategory) {
      toast({ title: "Missing fields", description: "Please fill in all fields" });
      return;
    }

    try {
      setSaving(true);
      await forumService.createForum({
        title: forumTitle,
        slug: generateSlug(forumTitle),
        description: forumDescription,
        category: forumCategory,
      });
      
      toast({ title: "Success", description: "Forum created" });
      setIsCreateForumOpen(false);
      resetForumForm();
      loadForumData();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to create forum", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleEditForum = async () => {
    if (!editingForum || !forumTitle || !forumDescription || !forumCategory) {
      toast({ title: "Missing fields", description: "Please fill in all fields" });
      return;
    }

    try {
      setSaving(true);
      await forumService.updateForum(editingForum.id, {
        title: forumTitle,
        slug: generateSlug(forumTitle),
        description: forumDescription,
        category: forumCategory,
      });
      
      toast({ title: "Success", description: "Forum updated" });
      setIsEditForumOpen(false);
      resetForumForm();
      loadForumData();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to update forum", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteForum = async (id: string, title: string) => {
    if (!confirm(`Delete forum "${title}"? All posts will also be deleted.`)) return;

    try {
      await forumService.deleteForum(id);
      toast({ title: "Success", description: "Forum deleted" });
      loadForumData();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to delete forum", variant: "destructive" });
    }
  };

  const handleDeleteThread = async (id: string, title: string) => {
    if (!confirm(`Delete thread "${title}"?`)) return;

    try {
      await forumService.deleteForumPost(id);
      toast({ title: "Success", description: "Thread deleted" });
      loadForumData();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to delete thread", variant: "destructive" });
    }
  };

  const openEditForumDialog = (forum: Forum) => {
    setEditingForum(forum);
    setForumTitle(forum.title);
    setForumDescription(forum.description);
    setForumCategory(forum.category);
    setIsEditForumOpen(true);
  };

  const filteredThreads = threads.filter(thread =>
    thread.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get unique categories from forums
  const categories = [...new Set(forums.map(f => f.category))].map(category => ({
    name: category,
    count: forums.filter(f => f.category === category).length,
  }));

  if (loading) {
    return (
      <AdminLayout title="Forums Management">
        <div className="flex items-center justify-center py-20">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Forums Management">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Total Forums", value: forums.length.toString() },
            { label: "Total Threads", value: threads.length.toString() },
            { label: "Total Posts", value: forums.reduce((sum, f) => sum + (f.post_count || 0), 0).toString() },
            { label: "Categories", value: categories.length.toString() },
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
          {/* Forums List */}
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-primary" />
                Forums
              </CardTitle>
              <Button size="sm" variant="outline" className="gap-1" onClick={() => { resetForumForm(); setIsCreateForumOpen(true); }}>
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {forums.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No forums created yet</p>
              ) : (
                forums.map((forum) => (
                  <div key={forum.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{forum.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{forum.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{forum.category}</Badge>
                        <span className="text-xs text-muted-foreground">{forum.post_count || 0} posts</span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditForumDialog(forum)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteForum(forum.id, forum.title)}>
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

          {/* Recent Threads */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Recent Threads ({threads.length})
                </CardTitle>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search threads..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredThreads.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No threads found</p>
              ) : (
                filteredThreads.map((thread) => (
                  <div key={thread.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{thread.title}</h3>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>by {thread.author}</span>
                        <Badge variant="outline" className="text-xs">{thread.category}</Badge>
                        <span>{thread.replies_count} replies</span>
                        <span>{new Date(thread.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => window.open(`/forums/thread/${thread.id}`, '_blank')}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteThread(thread.id, thread.title)}>
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

      {/* Create Forum Dialog */}
      <Dialog open={isCreateForumOpen} onOpenChange={setIsCreateForumOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Forum</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input placeholder="Forum title..." value={forumTitle} onChange={(e) => setForumTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Input placeholder="e.g., General, Support, Off-Topic" value={forumCategory} onChange={(e) => setForumCategory(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea placeholder="Forum description..." rows={3} value={forumDescription} onChange={(e) => setForumDescription(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateForumOpen(false)}>Cancel</Button>
              <Button className="btn-primary-gradient" onClick={handleCreateForum} disabled={saving}>
                {saving ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Forum Dialog */}
      <Dialog open={isEditForumOpen} onOpenChange={setIsEditForumOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Forum</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input placeholder="Forum title..." value={forumTitle} onChange={(e) => setForumTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Input placeholder="e.g., General, Support, Off-Topic" value={forumCategory} onChange={(e) => setForumCategory(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea placeholder="Forum description..." rows={3} value={forumDescription} onChange={(e) => setForumDescription(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditForumOpen(false)}>Cancel</Button>
              <Button className="btn-primary-gradient" onClick={handleEditForum} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
