import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useSettings } from "@/contexts/SettingsContext";
import { settingsService } from "@/services/settingsService";
import { toast } from "@/components/ui/use-toast";
import { BellRing, Copy, ExternalLink, Mail, Rss, Save, Wrench } from "lucide-react";
import { MediaPicker } from "@/components/admin/MediaPicker";

const tools = [
  { label: "Open News Feed", href: "/news/rss.xml" },
  { label: "Open Changelog Feed", href: "/changelogs/rss.xml" },
  { label: "Open FAQ Page", href: "/faq" },
  { label: "Open Support Page", href: "/support" },
];

export default function AdminToolsPage() {
  const { settings, refresh } = useSettings();
  const [bannerEnabled, setBannerEnabled] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [discordLink, setDiscordLink] = useState("");
  const [emailAudience, setEmailAudience] = useState<"subscribed" | "manual">("subscribed");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [manualEmails, setManualEmails] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setBannerEnabled(
      settings?.announcementEnabled ||
      settings?.announcement_enabled === "true" ||
      false
    );
    setBannerMessage(
      settings?.announcementMessage ||
      settings?.announcement_message ||
      ""
    );
    setBannerImage(
      settings?.announcementImage ||
      settings?.announcement_image ||
      ""
    );
    setDiscordLink(settings?.discord_link || "");
  }, [settings]);

  const saveTools = async () => {
    try {
      setSaving(true);
      await Promise.all([
        settingsService.setSetting("announcement_enabled", String(bannerEnabled)),
        settingsService.setSetting("announcement_message", bannerMessage.trim()),
        settingsService.setSetting("announcement_image", bannerImage.trim()),
        settingsService.setSetting("discord_link", discordLink.trim()),
      ]);
      await refresh();
      toast({ title: "Tools updated", description: "Banner and Discord settings were saved." });
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error?.message || "Failed to save admin tools settings.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const copyText = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast({ title: "Copied", description: `${label} copied to clipboard.` });
    } catch (error) {
      toast({ title: "Copy failed", description: `Could not copy ${label}.`, variant: "destructive" });
    }
  };

  const sendManualEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      toast({ title: "Missing fields", description: "Email subject and body are required.", variant: "destructive" });
      return;
    }

    const parsedEmails = manualEmails
      .split(/[\n,]/)
      .map((email) => email.trim())
      .filter(Boolean);

    if (emailAudience === "manual" && parsedEmails.length === 0) {
      toast({ title: "Missing recipients", description: "Add at least one email address.", variant: "destructive" });
      return;
    }

    try {
      setSendingEmail(true);
      const response = await fetch("/api/onesignal/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: emailSubject.trim(),
          html: emailBody.trim().replace(/\n/g, "<br />"),
          emails: emailAudience === "manual" ? parsedEmails : [],
          includedSegments: emailAudience === "subscribed" ? ["Subscribed Users"] : [],
        }),
      });

      const result = await response.json();
      if (!response.ok || result.error) {
        throw new Error(result.details || result.error || "Failed to send email");
      }

      toast({ title: "Email queued", description: "OneSignal accepted the email request." });
      setEmailSubject("");
      setEmailBody("");
      setManualEmails("");
    } catch (error: any) {
      toast({ title: "Email failed", description: error?.message || "Failed to send email.", variant: "destructive" });
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <AdminLayout title="Tools">
      <div className="space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BellRing className="h-5 w-5 text-primary" />
                Announcement Tools
              </CardTitle>
              <CardDescription>Manage the live announcement banner and preview its current state.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <Label className="text-base font-medium">Enable Banner</Label>
                  <p className="text-sm text-muted-foreground">Shown across all pages that use the shared layout.</p>
                </div>
                <Button variant={bannerEnabled ? "default" : "outline"} onClick={() => setBannerEnabled((v) => !v)}>
                  {bannerEnabled ? "Enabled" : "Disabled"}
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Banner Message</Label>
                <Textarea
                  value={bannerMessage}
                  onChange={(e) => setBannerMessage(e.target.value)}
                  rows={4}
                  placeholder="Server restart at 8 PM UTC. Vote rewards are doubled for the weekend."
                />
              </div>
              <div className="space-y-2">
                <Label>Banner Image</Label>
                <MediaPicker
                  label="Announcement Image"
                  value={bannerImage}
                  onChange={setBannerImage}
                  kind="site"
                  identifier="announcement-banner"
                />
              </div>
              <div className="rounded-xl border border-border bg-muted/40 p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Live Preview</div>
                {bannerEnabled && bannerMessage.trim() ? (
                  <div className="rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(30,41,59,0.92))] p-4 text-white">
                    <div className="flex items-center gap-4">
                      {bannerImage && (
                        <img src={bannerImage} alt="" className="hidden sm:block h-12 w-12 rounded-xl object-cover border border-white/10" aria-hidden="true" />
                      )}
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.24em] text-white/60 mb-1">Live Announcement</p>
                        <p className="text-sm text-white/95">{bannerMessage}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Banner will stay hidden until it is enabled and has a message.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-primary" />
                Quick Utilities
              </CardTitle>
              <CardDescription>Shortcuts for feeds, support pages, and live site checks.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {tools.map((tool) => (
                <div key={tool.label} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="font-medium">{tool.label}</p>
                    <p className="text-xs text-muted-foreground font-mono">{tool.href}</p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <a href={tool.href} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open
                    </a>
                  </Button>
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => copyText("play.zcraftmc.xyz", "server IP")}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Server IP
                </Button>
                <Button variant="outline" onClick={() => copyText(window.location.origin, "site URL")}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Site URL
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rss className="h-5 w-5 text-primary" />
                Feed and Community Links
              </CardTitle>
              <CardDescription>These links are used by public pages and admin shortcuts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Discord Invite URL</Label>
                <Input value={discordLink} onChange={(e) => setDiscordLink(e.target.value)} placeholder="https://discord.gg/yourinvite" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">News Feed: /news/rss.xml</Badge>
                <Badge variant="outline">Changelogs Feed: /changelogs/rss.xml</Badge>
                <Badge variant="outline">FAQ: /faq</Badge>
              </div>
              <Button className="btn-primary-gradient gap-2" onClick={saveTools} disabled={saving}>
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Tool Settings"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current State</CardTitle>
              <CardDescription>What the app is currently reading from settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Announcement enabled</span>
                <span>{String(bannerEnabled)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Message length</span>
                <span>{bannerMessage.trim().length}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Banner image set</span>
                <span>{bannerImage.trim() ? "yes" : "no"}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Discord link set</span>
                <span>{discordLink.trim() ? "yes" : "no"}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Manual Email Send
            </CardTitle>
            <CardDescription>Send a promotion, alert, or announcement through OneSignal email.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
              <div className="space-y-2">
                <Label>Audience</Label>
                <Select value={emailAudience} onValueChange={(value) => setEmailAudience(value as "subscribed" | "manual")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subscribed">Subscribed Users</SelectItem>
                    <SelectItem value="manual">Manual Emails</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {emailAudience === "manual" && (
                <div className="space-y-2">
                  <Label>Email Recipients</Label>
                  <Textarea
                    rows={3}
                    value={manualEmails}
                    onChange={(e) => setManualEmails(e.target.value)}
                    placeholder={"user1@example.com\nuser2@example.com"}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Email Subject</Label>
              <Input
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Weekend sale, server update, recruitment open..."
              />
            </div>

            <div className="space-y-2">
              <Label>Email Body</Label>
              <Textarea
                rows={8}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Write the email content here. Line breaks are preserved."
              />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-4 bg-muted/30">
              <div className="text-sm text-muted-foreground">
                Current automatic OneSignal email-ready events:
                `staff_application_submitted`, `staff_application_updated`, `staff_application_accepted`, `staff_application_rejected`
              </div>
              <Button className="btn-primary-gradient" onClick={sendManualEmail} disabled={sendingEmail}>
                {sendingEmail ? "Sending..." : "Send Email"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
