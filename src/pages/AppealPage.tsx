import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, Shield, CheckCircle2, AlertTriangle, MessageSquare, FileSearch } from "lucide-react";
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

const typeOptions = [
  { value: "ban", label: "Ban", color: "text-red-400" },
  { value: "mute", label: "Mute", color: "text-amber-400" },
  { value: "warn", label: "Warning", color: "text-yellow-400" },
  { value: "report", label: "Player Report", color: "text-purple-400" },
  { value: "other", label: "Other", color: "text-blue-400" },
];

const guidelines = [
  { icon: Shield, title: "Be Respectful", body: "Honest, calm appeals get reviewed faster than aggressive ones." },
  { icon: FileSearch, title: "Add Evidence", body: "Screenshots, clip links and chat logs make staff's job easier." },
  { icon: MessageSquare, title: "One Submission", body: "Don't spam — duplicates push your case to the back of the queue." },
];

export default function AppealPage() {
  const { user, userProfile } = useAuth();
  const { settings } = useSettings();
  const isRedirectMode =
    siteConfig.appeal.mode === "redirect" && Boolean(siteConfig.appeal.redirectUrl);

  const [form, setForm] = useState<FormState>({
    ...initialState,
    minecraftUsername: userProfile?.username || "",
    email: userProfile?.email || user?.email || "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{ ticketId?: string } | null>(null);

  const requiredFilled = useMemo(
    () =>
      Boolean(
        form.minecraftUsername.trim() &&
          form.discordUsername.trim() &&
          form.punishmentReason.trim() &&
          form.appealReason.trim(),
      ),
    [form],
  );

  useEffect(() => {
    if (isRedirectMode) {
      window.location.replace(siteConfig.appeal.redirectUrl);
    }
  }, [isRedirectMode]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
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
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error || "Failed to submit appeal.");
      setSubmitted({ ticketId: payload?.ticketId });
      toast({
        title: "Appeal submitted",
        description: payload?.ticketId
          ? `Ticket ${payload.ticketId} sent to staff.`
          : "Your appeal has been sent to staff for review.",
      });
      setForm({
        ...initialState,
        minecraftUsername: form.minecraftUsername,
        discordUsername: form.discordUsername,
        email: form.email,
      });
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
        tags: ["appeal", "ban appeal", "support", "moderation"],
      }}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Appeal" },
      ]}
    >
      {isRedirectMode ? (
        <section className="container mx-auto px-4 py-24">
          <Card className="mx-auto max-w-2xl border-border/60 bg-card/80 backdrop-blur">
            <CardContent className="space-y-5 p-10 text-center">
              <Shield className="mx-auto h-10 w-10 text-amber-400" />
              <h1 className="font-display text-3xl font-bold">Redirecting to the Appeal Portal…</h1>
              <p className="text-muted-foreground">If you aren't redirected, use the button below.</p>
              <Button asChild className="btn-primary-gradient">
                <a href={siteConfig.appeal.redirectUrl} target="_blank" rel="noopener noreferrer">
                  Continue to Appeal Portal
                </a>
              </Button>
            </CardContent>
          </Card>
        </section>
      ) : (
        <section className="relative overflow-hidden py-12 lg:py-16">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.12),transparent_55%)]" aria-hidden="true" />
          <div className="container relative mx-auto max-w-6xl px-4">
            <motion.header
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-10 text-center"
            >
              <span className="mc-chip mb-4 inline-flex items-center gap-2 border-amber-500/30 bg-amber-500/10 text-amber-400">
                <Shield className="h-3.5 w-3.5" /> Appeals · Reports
              </span>
              <h1 className="font-display text-4xl font-bold md:text-5xl">
                Submit an <span className="text-gradient">Appeal</span>
              </h1>
              <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
                Ban, mute, warning or player report — fill it out clearly and staff will review it.
              </p>
            </motion.header>

            {submitted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6"
              >
                <Card className="border-emerald-500/30 bg-emerald-500/10">
                  <CardContent className="flex items-center gap-3 p-5">
                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                    <div className="flex-1">
                      <p className="font-semibold">Appeal received</p>
                      <p className="text-sm text-muted-foreground">
                        {submitted.ticketId ? (
                          <>Ticket <code className="rounded bg-card/80 px-1.5 py-0.5 text-xs">{submitted.ticketId}</code> · staff will reply via Discord.</>
                        ) : (
                          "Staff will reply via Discord soon."
                        )}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
              {/* MAIN FORM */}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
              >
                <Card className="overflow-hidden border-border/60 bg-card/80 backdrop-blur">
                  <div className="border-b border-border/50 bg-gradient-to-r from-primary/10 via-transparent to-transparent px-6 py-4">
                    <h2 className="font-display text-xl font-semibold">Appeal Details</h2>
                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">All fields marked * are required</p>
                  </div>
                  <CardContent className="space-y-5 p-6 lg:p-8">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Minecraft Username *" htmlFor="mc">
                        <Input id="mc" value={form.minecraftUsername} onChange={(e) => update("minecraftUsername", e.target.value)} placeholder="In-game name" />
                      </Field>
                      <Field label="Discord Username *" htmlFor="dc">
                        <Input id="dc" value={form.discordUsername} onChange={(e) => update("discordUsername", e.target.value)} placeholder="@username" />
                      </Field>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Email" htmlFor="em">
                        <Input id="em" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="Optional contact email" />
                      </Field>
                      <Field label="Type" htmlFor="type">
                        <Select value={form.punishmentType} onValueChange={(v) => update("punishmentType", v)}>
                          <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {typeOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                <span className={opt.color}>{opt.label}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Date" htmlFor="date">
                        <Input id="date" type="date" value={form.punishmentDate} onChange={(e) => update("punishmentDate", e.target.value)} />
                      </Field>
                      <Field label="Punishment Reason *" htmlFor="pr">
                        <Input id="pr" value={form.punishmentReason} onChange={(e) => update("punishmentReason", e.target.value)} placeholder="What were you punished for?" />
                      </Field>
                    </div>

                    <Field label="Why should this be accepted? *" htmlFor="ar">
                      <Textarea id="ar" rows={6} value={form.appealReason} onChange={(e) => update("appealReason", e.target.value)} placeholder="Explain calmly and in detail." />
                    </Field>

                    <Field label="Evidence Links" htmlFor="ev">
                      <Textarea id="ev" rows={3} value={form.evidenceLinks} onChange={(e) => update("evidenceLinks", e.target.value)} placeholder="Paste screenshots, clips, message links…" />
                    </Field>

                    <Field label="Additional Information" htmlFor="ai">
                      <Textarea id="ai" rows={3} value={form.additionalInfo} onChange={(e) => update("additionalInfo", e.target.value)} placeholder="Anything else staff should know." />
                    </Field>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <Button onClick={handleSubmit} disabled={submitting} className="btn-primary-gradient gap-2">
                        <Send className="h-4 w-4" />
                        {submitting ? "Submitting…" : "Submit Appeal"}
                      </Button>
                      <Badge variant="outline" className="rounded-full px-4 py-1.5 text-xs">
                        Sent securely to staff Discord
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* SIDEBAR */}
              <motion.aside
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-4"
              >
                {guidelines.map((g) => (
                  <Card key={g.title} className="border-border/60 bg-card/70 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-card/90">
                    <CardContent className="flex gap-3 p-5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                        <g.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-display text-sm font-semibold uppercase tracking-[0.2em]">{g.title}</p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">{g.body}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Card className="border-amber-500/20 bg-amber-500/5">
                  <CardContent className="flex gap-3 p-5">
                    <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
                    <p className="text-sm leading-6 text-muted-foreground">
                      False reports or abusive language may extend your punishment.
                    </p>
                  </CardContent>
                </Card>
              </motion.aside>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}
