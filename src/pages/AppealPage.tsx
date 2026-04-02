import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, Shield, Sparkles } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getPageSeo, siteConfig } from "@/config/siteEnv";
import { useSettings } from "@/contexts/SettingsContext";

type FormState = {
  minecraftUsername: string;
  discordUsername: string;
  email: string;
  punishmentType: string;
  punishmentReason: string;
  punishmentDate: string;
  appealReason: string;
  evidenceLinks: string;
  additionalInfo: string;
};

const initialState: FormState = {
  minecraftUsername: "",
  discordUsername: "",
  email: "",
  punishmentType: "ban",
  punishmentReason: "",
  punishmentDate: "",
  appealReason: "",
  evidenceLinks: "",
  additionalInfo: "",
};

export default function AppealPage() {
  const { user, userProfile } = useAuth();
  const { settings } = useSettings();
  const isRedirectMode = siteConfig.appeal.mode === "redirect" && Boolean(siteConfig.appeal.redirectUrl);
  const [form, setForm] = useState<FormState>({
    ...initialState,
    minecraftUsername: userProfile?.username || "",
    email: userProfile?.email || user?.email || "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const requiredFilled = useMemo(() => {
    return (
      form.minecraftUsername.trim() &&
      form.discordUsername.trim() &&
      form.punishmentReason.trim() &&
      form.appealReason.trim()
    );
  }, [form]);

  useEffect(() => {
    if (isRedirectMode) {
      window.location.replace(siteConfig.appeal.redirectUrl);
    }
  }, [isRedirectMode]);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!requiredFilled) {
      toast({
        title: "Missing details",
        description: "Please fill in the required fields before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch("/api/appeals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Failed to submit appeal.");
      }

      setSubmitted(true);
      toast({
        title: "Appeal submitted",
        description: "Your appeal has been sent to staff for review.",
      });
      setForm({ ...initialState, minecraftUsername: form.minecraftUsername, discordUsername: form.discordUsername, email: form.email });
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: error?.message || "We could not submit your appeal right now.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout
      seo={{
        ...getPageSeo("appeal", {
          title: settings?.appealSeoTitle,
          description: settings?.appealSeoDescription,
          keywords: settings?.appealSeoKeywords,
        }),
        url: "/appeal",
        type: "website",
        noindex: false,
        tags: ["appeal", "ban appeal", "support", "moderation"],
      }}
    >
      {isRedirectMode ? (
        <section className="relative overflow-hidden py-20 lg:py-28">
          <div className="container mx-auto px-4">
            <Card className="mx-auto max-w-2xl border-0 bg-card/95 shadow-[0_28px_90px_rgba(15,23,42,0.14)]">
              <CardContent className="p-10 text-center space-y-6">
                <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
                  <Shield className="h-8 w-8" />
                </div>
                <div className="space-y-3">
                  <h1 className="font-display text-3xl font-bold">Redirecting to the appeal portal</h1>
                  <p className="text-muted-foreground">
                    This appeal page is configured to send you to an external link instead of the built-in form.
                  </p>
                </div>
                <Button asChild className="btn-primary-gradient">
                  <a href={siteConfig.appeal.redirectUrl} target="_blank" rel="noopener noreferrer">
                    Continue to Appeal Portal
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      ) : (
      <section className="relative overflow-hidden py-14 lg:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.16),transparent_42%),linear-gradient(180deg,rgba(15,23,42,0.04),transparent)]" />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-2 text-sm font-medium text-amber-600 mb-5">
                <Shield className="h-4 w-4" />
                Appeals Review
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                Submit an <span className="text-gradient">Appeal</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Use this form for ban, mute, or punishment appeals. Be clear, respectful, and specific.
              </p>
            </div>

            {submitted && (
              <Card className="mb-6 border-emerald-500/20 bg-emerald-500/5">
                <CardContent className="flex items-start gap-3 p-5">
                  <Sparkles className="mt-0.5 h-5 w-5 text-emerald-500" />
                  <div>
                    <p className="font-semibold">Appeal received</p>
                    <p className="text-sm text-muted-foreground">Staff will review your submission as soon as possible.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <Card className="border-0 bg-card/95 shadow-[0_28px_90px_rgba(15,23,42,0.14)]">
                <CardHeader className="border-b border-border/60">
                  <CardTitle className="font-display text-2xl">Appeal Form</CardTitle>
                </CardHeader>
                <CardContent className="p-6 lg:p-8 space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="minecraftUsername">Minecraft Username *</Label>
                      <Input
                        id="minecraftUsername"
                        value={form.minecraftUsername}
                        onChange={(e) => updateField("minecraftUsername", e.target.value)}
                        placeholder="Your in-game name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discordUsername">Discord Username *</Label>
                      <Input
                        id="discordUsername"
                        value={form.discordUsername}
                        onChange={(e) => updateField("discordUsername", e.target.value)}
                        placeholder="name#1234 or @name"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        placeholder="Optional contact email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="punishmentType">Punishment Type</Label>
                      <select
                        id="punishmentType"
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                        value={form.punishmentType}
                        onChange={(e) => updateField("punishmentType", e.target.value)}
                      >
                        <option value="ban">Ban</option>
                        <option value="mute">Mute</option>
                        <option value="warn">Warning</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="punishmentDate">Punishment Date</Label>
                      <Input
                        id="punishmentDate"
                        type="date"
                        value={form.punishmentDate}
                        onChange={(e) => updateField("punishmentDate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="punishmentReason">Punishment Reason *</Label>
                      <Input
                        id="punishmentReason"
                        value={form.punishmentReason}
                        onChange={(e) => updateField("punishmentReason", e.target.value)}
                        placeholder="What were you punished for?"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="appealReason">Why should this appeal be accepted? *</Label>
                    <Textarea
                      id="appealReason"
                      rows={6}
                      value={form.appealReason}
                      onChange={(e) => updateField("appealReason", e.target.value)}
                      placeholder="Explain your side calmly and in detail."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="evidenceLinks">Evidence Links</Label>
                    <Textarea
                      id="evidenceLinks"
                      rows={3}
                      value={form.evidenceLinks}
                      onChange={(e) => updateField("evidenceLinks", e.target.value)}
                      placeholder="Paste any screenshots, clips, or message links here."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="additionalInfo">Additional Information</Label>
                    <Textarea
                      id="additionalInfo"
                      rows={3}
                      value={form.additionalInfo}
                      onChange={(e) => updateField("additionalInfo", e.target.value)}
                      placeholder="Anything else staff should know."
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button className="btn-primary-gradient gap-2" onClick={handleSubmit} disabled={submitting}>
                      <Send className="h-4 w-4" />
                      {submitting ? "Submitting..." : "Submit Appeal"}
                    </Button>
                    <Badge variant="outline" className="px-4 py-2">
                      Sent to staff Discord webhook
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card className="border-0 bg-card">
                  <CardContent className="p-5">
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-3">Guidelines</p>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li>Keep your appeal respectful and honest.</li>
                      <li>Do not spam multiple submissions.</li>
                      <li>Include context, screenshots, or clips if they help your case.</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="border-0 bg-card">
                  <CardContent className="p-5">
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-3">What happens next</p>
                    <p className="text-sm text-muted-foreground leading-6">
                      Your appeal is delivered to staff through Discord, then reviewed manually. You can check back later for updates.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-0 bg-card">
                  <CardContent className="p-5">
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-3">Site Config</p>
                    <p className="text-sm text-muted-foreground leading-6">
                      Appears on {siteConfig.name} and uses the same env-backed branding plus admin SEO overrides as the rest of the site.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}
    </Layout>
  );
}
