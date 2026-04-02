// %%__NONCE_APPLY_PAGE_18_%%
// %%__TIMESTAMP_%%
// %%__VERSION_NUMBER_%%

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import {
  getMyStaffApplications,
  getStaffApplicationSettings,
  submitStaffApplication,
  StaffApplication,
  StaffApplicationQuestion,
  StaffApplicationRoleConfig,
} from "@/services/staffApplicationService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ApplyPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState<StaffApplicationRoleConfig[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [applications, setApplications] = useState<Record<string, StaffApplication>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const [settings, existing] = await Promise.all([
          getStaffApplicationSettings(),
          getMyStaffApplications(user.id),
        ]);

        const enabledRoles = settings.roles.filter((role) => role.enabled);
        const existingByRole = Object.fromEntries(existing.map((item) => [item.target_role, item]));

        setRoles(enabledRoles);
        setApplications(existingByRole);

        const initialRoleId = enabledRoles[0]?.id || "";
        setSelectedRoleId(initialRoleId);

        if (initialRoleId) {
          const initialRole = enabledRoles.find((role) => role.id === initialRoleId);
          const initialApplication = existingByRole[initialRoleId];
          setAnswers(initialApplication?.answers || Object.fromEntries((initialRole?.form || []).map((q) => [q.id, ""])));
        }
      } catch (error: any) {
        toast({ title: "Error", description: error?.message || "Failed to load application form", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const selectedRole = useMemo(
    () => roles.find((role) => role.id === selectedRoleId) || null,
    [roles, selectedRoleId]
  );

  const selectedApplication = selectedRole ? applications[selectedRole.id] || null : null;
  const questions: StaffApplicationQuestion[] = selectedRole?.form || [];
  const status = selectedApplication?.status || null;

  useEffect(() => {
    if (!selectedRole) {
      setAnswers({});
      return;
    }

    const existing = applications[selectedRole.id];
    setAnswers(existing?.answers || Object.fromEntries(selectedRole.form.map((q) => [q.id, ""])));
  }, [selectedRole, applications]);

  const allRequiredFilled = useMemo(
    () => questions.every((question) => !question.required || answers[question.id]?.trim()),
    [questions, answers]
  );

  const handleSubmit = async () => {
    if (!user || !selectedRole) return;
    if (!allRequiredFilled) {
      toast({ title: "Missing answers", description: "Please complete all required questions.", variant: "destructive" });
      return;
    }

    try {
      setSaving(true);
      const result = await submitStaffApplication(user.id, selectedRole.id, answers);
      setApplications((prev) => ({ ...prev, [result.target_role]: result }));
      toast({ title: "Application submitted", description: "Your application was saved successfully." });
    } catch (error: any) {
      toast({ title: "Submission failed", description: error?.message || "Failed to save application.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <Layout seo={{ title: "Staff Applications", url: "/apply", noindex: true }}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (roles.length === 0) {
    return (
      <Layout seo={{ title: "Staff Applications Closed", url: "/apply", noindex: true }}>
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-3xl mx-auto border-0 bg-card">
            <CardContent className="p-10 text-center">
              <h1 className="font-display text-3xl font-bold mb-3">Applications Are Closed</h1>
              <p className="text-muted-foreground">Check back later or watch announcements for the next recruitment round.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      seo={{
        title: "Apply For Staff",
        description: "Apply for a staff role on ZCraft Network.",
        url: "/apply",
        type: "website",
      }}
    >
      <section className="relative overflow-hidden py-14 lg:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.14),transparent_48%),linear-gradient(180deg,rgba(15,23,42,0.04),transparent)]" />
        <div className="container relative mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary mb-5">
                <Sparkles className="h-4 w-4" />
                Join The Team
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Apply For A Role</h1>
              <p className="text-lg text-muted-foreground">
                Pick the team role that fits you best, then submit a focused application built for that position.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {roles.map((role) => {
                const roleApplication = applications[role.id];
                const isActive = selectedRoleId === role.id;

                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRoleId(role.id)}
                    className={`rounded-3xl border p-5 text-left transition-all ${isActive ? "border-primary bg-primary/8 shadow-[0_24px_80px_rgba(59,130,246,0.14)]" : "border-border bg-card hover:bg-muted/40"}`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h2 className="font-display text-2xl font-semibold">{role.label}</h2>
                      {roleApplication && (
                        <Badge variant={roleApplication.status === "accepted" ? "default" : roleApplication.status === "rejected" ? "destructive" : "outline"}>
                          {roleApplication.status}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-6">{role.description}</p>
                  </button>
                );
              })}
            </div>

            <Card className="border-0 bg-card/95 shadow-[0_28px_90px_rgba(15,23,42,0.14)]">
              <CardHeader className="border-b border-border/60">
                <CardTitle className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-display text-2xl">{selectedRole?.label || "Staff"} Application</span>
                  {status && <Badge variant={status === "accepted" ? "default" : status === "rejected" ? "destructive" : "outline"}>{status}</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 lg:p-8">
                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
                  <div className="space-y-5">
                    {selectedRole?.description && (
                      <div className="rounded-2xl border border-border bg-muted/30 p-4">
                        <p className="text-sm text-muted-foreground leading-6">{selectedRole.description}</p>
                      </div>
                    )}

                    {questions.map((question) => (
                      <div key={question.id} className="rounded-2xl border border-border p-4 sm:p-5 space-y-4">
                        {question.image_url && (
                          <img src={question.image_url} alt="" className="w-full max-h-56 rounded-2xl object-cover" aria-hidden="true" />
                        )}
                        <div className="space-y-2">
                          <Label className="text-base font-medium">
                            {question.label}
                            {question.required && <span className="text-destructive ml-1">*</span>}
                          </Label>
                          {question.type === "textarea" ? (
                            <Textarea
                              rows={5}
                              placeholder={question.placeholder}
                              value={answers[question.id] || ""}
                              disabled={status === "accepted"}
                              onChange={(e) => setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))}
                            />
                          ) : question.type === "select" ? (
                            <Select
                              value={answers[question.id] || ""}
                              onValueChange={(value) => setAnswers((prev) => ({ ...prev, [question.id]: value }))}
                              disabled={status === "accepted"}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={question.placeholder || "Choose an option"} />
                              </SelectTrigger>
                              <SelectContent>
                                {(question.options || []).map((option) => (
                                  <SelectItem key={option} value={option}>{option}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              placeholder={question.placeholder}
                              value={answers[question.id] || ""}
                              disabled={status === "accepted"}
                              onChange={(e) => setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))}
                            />
                          )}
                        </div>
                      </div>
                    ))}

                    <div className="flex flex-wrap gap-3">
                      <Button className="btn-primary-gradient" onClick={handleSubmit} disabled={saving || status === "accepted"}>
                        {saving ? "Saving..." : status ? "Update Application" : "Submit Application"}
                      </Button>
                      <Button variant="outline" onClick={() => navigate("/staff")}>Back To Staff Page</Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl border border-border bg-muted/30 p-5">
                      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-3">Application Tips</p>
                      <ul className="space-y-3 text-sm text-muted-foreground">
                        <li>Answer directly and be specific.</li>
                        <li>Use examples from moderation, support, or community work.</li>
                        <li>Pick the role that matches your strongest skillset.</li>
                      </ul>
                    </div>
                    <div className="rounded-2xl border border-border bg-muted/30 p-5">
                      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-3">Current Status</p>
                      <p className="text-sm text-foreground capitalize">{status || "Not submitted yet"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}
