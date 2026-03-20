import { useState, useEffect } from "react";
import {
  GitCommit,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Loader,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { StructuredContent } from "@/components/content/StructuredContent";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { useAuth } from "@/contexts/AuthContext";
import { sendAdminEmail } from "@/services/emailService";

interface Changelog {
  id: string;
  version: string;
  title: string;
  description: string;
  changes: string[];
  type: "feature" | "fix" | "improvement" | "patch";
  image_url?: string | null;
  released_at: string;
  created_at: string;
}

const typeConfig = {
  feature: { label: "Feature", color: "bg-emerald-500/10 text-emerald-600" },
  fix: { label: "Bug Fix", color: "bg-red-500/10 text-red-600" },
  improvement: { label: "Improvement", color: "bg-blue-500/10 text-blue-600" },
  patch: { label: "Patch", color: "bg-amber-500/10 text-amber-600" },
};

function ChangelogFormFields({
  version,
  setVersion,
  title,
  setTitle,
  description,
  setDescription,
  changesText,
  setChangesText,
  imageUrl,
  setImageUrl,
  type,
  setType,
  releasedAt,
  setReleasedAt,
  imageIdentifier,
}: {
  version: string;
  setVersion: (value: string) => void;
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  changesText: string;
  setChangesText: (value: string) => void;
  imageUrl: string;
  setImageUrl: (value: string) => void;
  type: "feature" | "fix" | "improvement" | "patch";
  setType: (value: "feature" | "fix" | "improvement" | "patch") => void;
  releasedAt: string;
  setReleasedAt: (value: string) => void;
  imageIdentifier: string;
}) {
  return (
    <div className="max-h-[calc(90vh-10rem)] overflow-y-auto pr-2">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Version</Label>
              <Input
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="1.0.0"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(value) => setType(value as typeof type)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feature">Feature</SelectItem>
                  <SelectItem value="fix">Bug Fix</SelectItem>
                  <SelectItem value="improvement">Improvement</SelectItem>
                  <SelectItem value="patch">Patch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Changelog title"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this release"
              rows={5}
              className="min-h-[140px] resize-y"
            />
          </div>

          <div className="space-y-2">
            <Label>Changes (one per line)</Label>
            <Textarea
              value={changesText}
              onChange={(e) => setChangesText(e.target.value)}
              placeholder="Added new feature&#10;---&#10;✨ Economy rebalance&#10;• Buffed starter kits"
              rows={10}
              className="min-h-[240px] resize-y"
            />
          </div>

          <div className="space-y-2">
            <Label>Image</Label>
            <MediaPicker
              label="Changelog Image"
              value={imageUrl}
              onChange={setImageUrl}
              kind="changelog"
              identifier={imageIdentifier}
            />
          </div>

          <div className="space-y-2">
            <Label>Release Date</Label>
            <Input
              type="date"
              value={releasedAt}
              onChange={(e) => setReleasedAt(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-muted/30 p-4 max-h-[260px] overflow-y-auto">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Description Preview</p>
            <StructuredContent content={description} />
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-4 max-h-[420px] overflow-y-auto">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Changes Preview</p>
            <StructuredContent content={changesText} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminChangelogsPage() {
  const { session } = useAuth();
  const [changelogs, setChangelogs] = useState<Changelog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingChangelog, setEditingChangelog] = useState<Changelog | null>(null);

  const [version, setVersion] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [changesText, setChangesText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [type, setType] = useState<"feature" | "fix" | "improvement" | "patch">("feature");
  const [releasedAt, setReleasedAt] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    loadChangelogs();
  }, []);

  const loadChangelogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("changelogs")
        .select("*")
        .order("released_at", { ascending: false });

      if (error) throw error;
      setChangelogs((data || []) as Changelog[]);
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to load changelogs", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setVersion("");
    setTitle("");
    setDescription("");
    setChangesText("");
    setImageUrl("");
    setType("feature");
    setReleasedAt(new Date().toISOString().split("T")[0]);
    setEditingChangelog(null);
  };

  const handleCreate = async () => {
    if (!version || !title || !description) {
      toast({ title: "Missing fields", description: "Please fill in all required fields" });
      return;
    }

    try {
      setSaving(true);
      const changes = changesText
        .split("\n")
        .map((c) => c.trim())
        .filter((c) => c);

      await supabase.from("changelogs").insert({
        version,
        title,
        description,
        changes,
        type,
        image_url: imageUrl || null,
        released_at: releasedAt,
      });

      if (session?.access_token) {
        const slug = `changelog-${String(version).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`;
        sendAdminEmail({
          subject: `Changelog v${version}: ${title}`,
          html: `
            <h1>${title}</h1>
            <p><strong>Version:</strong> v${version}</p>
            <p>${description}</p>
            <p><a href="https://z-craft.xyz/events#${slug}">Read the changelog</a></p>
          `,
          accessToken: session.access_token,
          audience: "all_users",
        }).catch((emailError) => {
          console.warn("Failed to send changelog email:", emailError);
        });
      }

      toast({ title: "Success", description: "Changelog created" });
      resetForm();
      setIsCreateOpen(false);
      loadChangelogs();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to create changelog",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editingChangelog || !version || !title || !description) {
      toast({ title: "Missing fields", description: "Please fill in all required fields" });
      return;
    }

    try {
      setSaving(true);
      const changes = changesText
        .split("\n")
        .map((c) => c.trim())
        .filter((c) => c);

      await supabase
        .from("changelogs")
        .update({
          version,
          title,
          description,
          changes,
          type,
          image_url: imageUrl || null,
          released_at: releasedAt,
        })
        .eq("id", editingChangelog.id);

      toast({ title: "Success", description: "Changelog updated" });
      resetForm();
      setIsEditOpen(false);
      loadChangelogs();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to update changelog",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this changelog?")) return;

    try {
      await supabase.from("changelogs").delete().eq("id", id);
      toast({ title: "Success", description: "Changelog deleted" });
      loadChangelogs();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to delete changelog",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (changelog: Changelog) => {
    setEditingChangelog(changelog);
    setVersion(changelog.version);
    setTitle(changelog.title);
    setDescription(changelog.description);
    setChangesText(changelog.changes.join("\n"));
    setImageUrl(changelog.image_url || "");
    setType(changelog.type);
    setReleasedAt(changelog.released_at.split("T")[0]);
    setIsEditOpen(true);
  };

  const filteredChangelogs = changelogs.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.version.includes(searchQuery)
  );

  if (loading) {
    return (
      <AdminLayout title="Changelogs">
        <div className="flex items-center justify-center py-20">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Changelogs">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search changelogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button className="btn-primary-gradient gap-2 w-full md:w-auto" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            New Changelog
          </Button>
        </div>

        <Card className="border-0 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitCommit className="h-5 w-5 text-primary" />
              All Changelogs ({filteredChangelogs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredChangelogs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No changelogs found</p>
              ) : (
                filteredChangelogs.map((changelog) => {
                  const typeInfo = typeConfig[changelog.type as keyof typeof typeConfig];
                  return (
                    <div
                      key={changelog.id}
                      className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                            <span className="text-sm text-muted-foreground font-mono">v{changelog.version}</span>
                          </div>
                          <h3 className="font-semibold text-lg mb-1">{changelog.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-3 break-words">{changelog.description}</p>
                          {changelog.image_url && (
                            <p className="text-xs text-muted-foreground mt-1 truncate">{changelog.image_url}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            Released: {new Date(changelog.released_at).toLocaleDateString()}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditClick(changelog)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(changelog.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Create New Changelog</DialogTitle>
            <DialogDescription>
              Create a changelog entry without letting long text push the action buttons off-screen.
            </DialogDescription>
          </DialogHeader>
          <ChangelogFormFields
            version={version}
            setVersion={setVersion}
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            changesText={changesText}
            setChangesText={setChangesText}
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            type={type}
            setType={setType}
            releasedAt={releasedAt}
            setReleasedAt={setReleasedAt}
            imageIdentifier={version || title || "changelog"}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button className="btn-primary-gradient" onClick={handleCreate} disabled={saving}>
              {saving ? "Creating..." : "Create Changelog"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Edit Changelog</DialogTitle>
            <DialogDescription>
              Edit the release notes in a scrollable layout so long entries stay manageable.
            </DialogDescription>
          </DialogHeader>
          <ChangelogFormFields
            version={version}
            setVersion={setVersion}
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            changesText={changesText}
            setChangesText={setChangesText}
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            type={type}
            setType={setType}
            releasedAt={releasedAt}
            setReleasedAt={setReleasedAt}
            imageIdentifier={version || title || editingChangelog?.version || "changelog"}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button className="btn-primary-gradient" onClick={handleEdit} disabled={saving}>
              {saving ? "Saving..." : "Update Changelog"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
