// %%__NONCE_ADMIN_APPLICATIONS_07_%%
// %%__RESOURCE_TITLE_%%
// %%__TIMESTAMP_%%

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  getStaffApplicationSettings,
  listStaffApplications,
  reviewStaffApplication,
  saveStaffApplicationSettings,
  StaffApplication,
  StaffApplicationQuestion,
  StaffApplicationRoleConfig,
} from "@/services/staffApplicationService";
import { ClipboardList, Plus, Trash2 } from "lucide-react";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { sendAdminEmail } from "@/services/emailService";

function emptyQuestion(index: number): StaffApplicationQuestion {
  return {
    id: `question_${Date.now()}_${index}`,
    label: "",
    type: "textarea",
    required: true,
    placeholder: "",
    options: [],
    image_url: null,
  };
}

function emptyRole(index: number): StaffApplicationRoleConfig {
  return {
    id: `role_${Date.now()}_${index}`,
    label: "New Role",
    description: "",
    enabled: false,
    form: [emptyQuestion(0)],
  };
}

export default function AdminApplicationsPage() {
  const { user, session } = useAuth();
  const [roles, setRoles] = useState<StaffApplicationRoleConfig[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [applications, setApplications] = useState<StaffApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<StaffApplication | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [previousEnabledRoleIds, setPreviousEnabledRoleIds] = useState<string[]>([]);

  const load = async () => {
    try {
      setLoading(true);
      const [settings, items] = await Promise.all([
        getStaffApplicationSettings(),
        listStaffApplications(),
      ]);
      setRoles(settings.roles);
      setPreviousEnabledRoleIds(settings.roles.filter((role) => role.enabled).map((role) => role.id));
      setSelectedRoleId((current) => current || settings.roles[0]?.id || "");
      setApplications(items);
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to load applications", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateRole = (roleId: string, updater: (role: StaffApplicationRoleConfig) => StaffApplicationRoleConfig) => {
    setRoles((prev) => prev.map((role) => role.id === roleId ? updater(role) : role));
  };

  const updateQuestion = (
    roleId: string,
    questionId: string,
    updater: (question: StaffApplicationQuestion) => StaffApplicationQuestion
  ) => {
    updateRole(roleId, (role) => ({
      ...role,
      form: role.form.map((question) => question.id === questionId ? updater(question) : question),
    }));
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const cleanedRoles = roles
        .map((role, roleIndex) => ({
          ...role,
          id: role.id.trim().toLowerCase() || `role_${Date.now()}_${roleIndex}`,
          label: role.label.trim() || `Role ${roleIndex + 1}`,
          description: role.description.trim(),
          form: role.form
            .map((question, questionIndex) => ({
              ...question,
              id: question.id.trim() || `question_${questionIndex + 1}`,
              label: question.label.trim(),
              placeholder: question.placeholder?.trim() || "",
              options: (question.options || []).map((option) => option.trim()).filter(Boolean),
              image_url: question.image_url?.trim() || null,
            }))
            .filter((question) => question.label),
        }))
        .filter((role, index, array) => role.id && array.findIndex((item) => item.id === role.id) === index);

      await saveStaffApplicationSettings(cleanedRoles);
      setRoles(cleanedRoles);
      setSelectedRoleId((current) => cleanedRoles.find((role) => role.id === current)?.id || cleanedRoles[0]?.id || "");

      const nextEnabledRoles = cleanedRoles.filter((role) => role.enabled);
      const nextEnabledRoleIds = nextEnabledRoles.map((role) => role.id);
      const newlyOpenedRoles = nextEnabledRoles.filter((role) => !previousEnabledRoleIds.includes(role.id));
      const newlyClosedRoles = previousEnabledRoleIds.filter((roleId) => !nextEnabledRoleIds.includes(roleId));

      if (session?.access_token && newlyOpenedRoles.length > 0) {
        sendAdminEmail({
          subject: "Staff applications are now open",
          html: `
            <h1>Staff applications are open</h1>
            <p>The following roles are now accepting applications:</p>
            <ul>${newlyOpenedRoles.map((role) => `<li>${role.label}</li>`).join("")}</ul>
            <p><a href="https://z-craft.xyz/apply">Apply now</a></p>
          `,
          accessToken: session.access_token,
          audience: "all_users",
          category: "recruitment",
        }).catch((emailError) => {
          console.warn("Failed to send applications-open email:", emailError);
        });
      }

      if (session?.access_token && newlyClosedRoles.length > 0) {
        sendAdminEmail({
          subject: "Staff applications have changed",
          html: `
            <h1>Staff application availability updated</h1>
            <p>Some application roles have been closed or updated.</p>
            <p><a href="https://z-craft.xyz/staff">Check the staff page</a></p>
          `,
          accessToken: session.access_token,
          audience: "all_users",
          category: "recruitment",
        }).catch((emailError) => {
          console.warn("Failed to send applications-closed email:", emailError);
        });
      }

      setPreviousEnabledRoleIds(nextEnabledRoleIds);
      toast({ title: "Saved", description: "Application settings updated." });
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to save settings", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleReview = async (status: "accepted" | "rejected") => {
    if (!selected || !user?.id) return;
    try {
      await reviewStaffApplication(selected.id, status, reviewNotes, user.id);
      if (session?.access_token && selected.user?.email) {
        sendAdminEmail({
          subject: status === "accepted" ? "Your staff application was accepted" : "Your staff application was reviewed",
          html: `
            <h1>${status === "accepted" ? "Application accepted" : "Application reviewed"}</h1>
            <p>Your application for <strong>${selectedApplicationRole?.label || selected.target_role}</strong> was marked as <strong>${status}</strong>.</p>
            ${reviewNotes ? `<p><strong>Reviewer notes:</strong><br />${reviewNotes.replace(/\n/g, "<br />")}</p>` : ""}
          `,
          accessToken: session.access_token,
          audience: "manual",
          emails: [selected.user.email],
        }).catch((emailError) => {
          console.warn("Failed to send application review email:", emailError);
        });
      }
      toast({ title: "Application reviewed", description: `Marked as ${status}.` });
      setSelected(null);
      setReviewNotes("");
      await load();
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to review application", variant: "destructive" });
    }
  };

  const selectedRole = roles.find((role) => role.id === selectedRoleId) || null;
  const selectedApplicationRole = selected ? roles.find((role) => role.id === selected.target_role) || null : null;
  const selectedApplicationQuestions = selectedApplicationRole?.form || (
    selected
      ? Object.keys(selected.answers || {}).map((key) => ({
          id: key,
          label: key.replace(/_/g, " "),
          type: "textarea" as const,
          required: false,
          placeholder: "",
          options: [],
          image_url: null,
        }))
      : []
  );

  if (loading) {
    return (
      <AdminLayout title="Applications">
        <div className="py-20 text-center text-muted-foreground">Loading applications...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Applications">
      <div className="space-y-6">
        <div className="grid xl:grid-cols-[1.15fr_0.85fr] gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                Application Role Editor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                {roles.map((role) => (
                  <button
                    type="button"
                    key={role.id}
                    onClick={() => setSelectedRoleId(role.id)}
                    className={`rounded-2xl border p-4 text-left transition-colors ${selectedRoleId === role.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{role.label}</p>
                        <p className="text-sm text-muted-foreground mt-1">{role.description || "No description yet."}</p>
                      </div>
                      <Badge variant={role.enabled ? "default" : "outline"}>{role.enabled ? "Open" : "Closed"}</Badge>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    const next = [...roles, emptyRole(roles.length)];
                    setRoles(next);
                    setSelectedRoleId(next[next.length - 1].id);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Role
                </Button>
                <Button className="btn-primary-gradient" onClick={saveSettings} disabled={saving}>
                  {saving ? "Saving..." : "Save Roles"}
                </Button>
              </div>

              {selectedRole && (
                <div className="space-y-4 rounded-2xl border border-border p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <Label className="text-base font-medium">Role Availability</Label>
                      <p className="text-sm text-muted-foreground">Controls whether players can apply for this role from the public page.</p>
                    </div>
                    <Switch
                      checked={selectedRole.enabled}
                      onCheckedChange={(checked) => updateRole(selectedRole.id, (role) => ({ ...role, enabled: checked }))}
                    />
                  </div>

                  <div className="grid gap-3">
                    <div className="space-y-2">
                      <Label>Role Label</Label>
                      <Input
                        placeholder="Moderator"
                        value={selectedRole.label}
                        onChange={(e) => updateRole(selectedRole.id, (role) => ({ ...role, label: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Role Key</Label>
                      <Input
                        placeholder="moderator"
                        value={selectedRole.id}
                        onChange={(e) => updateRole(selectedRole.id, (role) => ({ ...role, id: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        rows={3}
                        placeholder="Explain what this role does."
                        value={selectedRole.description}
                        onChange={(e) => updateRole(selectedRole.id, (role) => ({ ...role, description: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const next = roles.filter((role) => role.id !== selectedRole.id);
                        setRoles(next);
                        setSelectedRoleId(next[0]?.id || "");
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove Role
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {selectedRole.form.map((question, index) => (
                      <div key={question.id} className="rounded-2xl border border-border p-4 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <Label className="font-medium">Question {index + 1}</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              updateRole(selectedRole.id, (role) => ({
                                ...role,
                                form: role.form.filter((item) => item.id !== question.id),
                              }))
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <Input
                            placeholder="Question label"
                            value={question.label}
                            onChange={(e) => updateQuestion(selectedRole.id, question.id, (item) => ({ ...item, label: e.target.value }))}
                          />
                          <Input
                            placeholder="Field id"
                            value={question.id}
                            onChange={(e) => updateQuestion(selectedRole.id, question.id, (item) => ({ ...item, id: e.target.value }))}
                          />
                        </div>

                        <Input
                          placeholder="Placeholder"
                          value={question.placeholder || ""}
                          onChange={(e) => updateQuestion(selectedRole.id, question.id, (item) => ({ ...item, placeholder: e.target.value }))}
                        />

                        <MediaPicker
                          label="Question Image"
                          value={question.image_url || ""}
                          onChange={(value) => updateQuestion(selectedRole.id, question.id, (item) => ({ ...item, image_url: value || null }))}
                          kind="site"
                          identifier={`${selectedRole.id}-${question.id}`}
                        />

                        <div className="flex flex-wrap items-center gap-3">
                          {(["text", "textarea", "select"] as const).map((typeOption) => (
                            <Button
                              key={typeOption}
                              variant={question.type === typeOption ? "default" : "outline"}
                              onClick={() =>
                                updateQuestion(selectedRole.id, question.id, (item) => ({
                                  ...item,
                                  type: typeOption,
                                  options: typeOption === "select" ? (item.options && item.options.length > 0 ? item.options : ["Option 1", "Option 2"]) : [],
                                }))
                              }
                            >
                              {typeOption === "select" ? "Multiple Choice" : typeOption === "textarea" ? "Textarea" : "Text"}
                            </Button>
                          ))}
                          <Button
                            variant={question.required ? "default" : "outline"}
                            onClick={() => updateQuestion(selectedRole.id, question.id, (item) => ({ ...item, required: !item.required }))}
                          >
                            {question.required ? "Required" : "Optional"}
                          </Button>
                        </div>

                        {question.type === "select" && (
                          <div className="space-y-2">
                            <Label>Choices (one per line)</Label>
                            <Textarea
                              rows={5}
                              value={(question.options || []).join("\n")}
                              onChange={(e) =>
                                updateQuestion(selectedRole.id, question.id, (item) => ({
                                  ...item,
                                  options: e.target.value.split("\n").map((option) => option.trim()).filter(Boolean),
                                }))
                              }
                              placeholder={"Helper\nModerator\nBuilder"}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => updateRole(selectedRole.id, (role) => ({ ...role, form: [...role.form, emptyQuestion(role.form.length)] }))}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Submission Queue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {applications.length === 0 ? (
                <p className="text-sm text-muted-foreground">No applications submitted yet.</p>
              ) : (
                applications.map((application) => (
                  <button
                    type="button"
                    key={application.id}
                    onClick={() => {
                      setSelected(application);
                      setReviewNotes(application.notes || "");
                    }}
                    className="w-full text-left rounded-xl border border-border p-4 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div>
                        <p className="font-medium">{application.user?.username || "Unknown User"}</p>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground mt-1">
                          {roles.find((role) => role.id === application.target_role)?.label || application.target_role}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{application.target_role}</Badge>
                        <Badge variant={application.status === "accepted" ? "default" : application.status === "rejected" ? "destructive" : "outline"}>
                          {application.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{application.user?.email}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Submitted {new Date(application.created_at).toLocaleString()}
                    </p>
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Review Application</DialogTitle>
            <DialogDescription>
              Review the submitted answers and choose whether to accept or reject this application.
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{selected.user?.username}</p>
                  <p className="text-sm text-muted-foreground">{selected.user?.email}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">{selectedApplicationRole?.label || selected.target_role}</Badge>
                  <Badge variant={selected.status === "accepted" ? "default" : selected.status === "rejected" ? "destructive" : "outline"}>
                    {selected.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4 max-h-[45vh] overflow-auto pr-1">
                {selectedApplicationQuestions.map((question) => (
                  <div key={question.id} className="rounded-xl border border-border p-4 space-y-3">
                    {question.image_url && (
                      <img src={question.image_url} alt="" className="w-full max-h-48 rounded-xl object-cover" aria-hidden="true" />
                    )}
                    <p className="font-medium">{question.label}</p>
                    <p className="text-muted-foreground whitespace-pre-wrap">{selected.answers?.[question.id] || "No answer provided."}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label>Reviewer Notes</Label>
                <Textarea value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} rows={4} />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => handleReview("rejected")}>Reject</Button>
                <Button className="btn-primary-gradient" onClick={() => handleReview("accepted")}>Accept</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
