import { useEffect, useState } from "react";
import { Bell, Globe, Loader, Palette, Save, Search, Server, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminLayout from "@/components/admin/AdminLayout";
import { settingsService } from "@/services/settingsService";
import { useSettings } from "@/contexts/SettingsContext";
import { toast } from "@/components/ui/use-toast";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { refresh } = useSettings();

  const [serverName, setServerName] = useState("ZCraft Network");
  const [javaIp, setJavaIp] = useState("play.zcraftmc.xyz");
  const [bedrockIp, setBedrockIp] = useState("bedrock.zcraftmc.xyz");
  const [serverPort, setServerPort] = useState("25565");
  const [serverDescription, setServerDescription] = useState("");
  const [discordUrl, setDiscordUrl] = useState("");
  const [storeUrl, setStoreUrl] = useState("");

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [announcementEnabled, setAnnouncementEnabled] = useState(false);
  const [announcementMessage, setAnnouncementMessage] = useState("");

  const [seoTitle, setSeoTitle] = useState("ZCraft Network - Premium Minecraft Lifesteal & Skyblock SMP Server");
  const [seoDescription, setSeoDescription] = useState("Join ZCraft Network, the premier Minecraft network offering Lifesteal and Skyblock SMP, survival features, factions, economy, and competitive PvP.");
  const [seoKeywords, setSeoKeywords] = useState("zcraft, zcraft network, minecraft server, minecraft lifesteal, skyblock, lifesteal skyblock, minecraft survival, minecraft factions, minecraft economy, minecraft pvp, smp");
  const [seoImage, setSeoImage] = useState("/zcraft.png");
  const [seoType, setSeoType] = useState("website");

  const [homeSeoTitle, setHomeSeoTitle] = useState("ZCraft Network - Premium Minecraft Lifesteal & Skyblock SMP Server");
  const [homeSeoDescription, setHomeSeoDescription] = useState("Join ZCraft Network, the ultimate Minecraft network with Lifesteal and Skyblock SMP, survival gameplay, custom economy, factions, and active community events.");
  const [homeSeoKeywords, setHomeSeoKeywords] = useState("zcraft, zcraft network, minecraft server, minecraft lifesteal, skyblock, lifesteal skyblock, minecraft survival, minecraft factions, minecraft economy, minecraft pvp, minecraft smp, best minecraft server");
  const [supportSeoTitle, setSupportSeoTitle] = useState("Support - ZCraft Network");
  const [supportSeoDescription, setSupportSeoDescription] = useState("Get help, FAQs, and support for ZCraft Network.");
  const [supportSeoKeywords, setSupportSeoKeywords] = useState("support, help, faq, minecraft support");
  const [appealSeoTitle, setAppealSeoTitle] = useState("Appeal - ZCraft Network");
  const [appealSeoDescription, setAppealSeoDescription] = useState("Submit a ban or punishment appeal for ZCraft Network.");
  const [appealSeoKeywords, setAppealSeoKeywords] = useState("appeal, ban appeal, punishment appeal, minecraft appeal");

  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const [emailVerification, setEmailVerification] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await settingsService.getSettings();
      const settingsMap = new Map(settings.map((s) => [s.key, s.value]));

      setServerName(settingsMap.get("server_name") || "ZCraft Network");
      setJavaIp(settingsMap.get("java_ip") || "play.zcraftmc.xyz");
      setBedrockIp(settingsMap.get("bedrock_ip") || "bedrock.zcraftmc.xyz");
      setServerPort(settingsMap.get("server_port") || "25565");
      setServerDescription(settingsMap.get("server_description") || "");
      setDiscordUrl(settingsMap.get("discord_link") || "");
      setStoreUrl(settingsMap.get("store_url") || "");

      setSeoTitle(settingsMap.get("seo_title") || "ZCraft Network - Premium Minecraft Lifesteal & Skyblock SMP Server");
      setSeoDescription(settingsMap.get("seo_description") || "Join ZCraft Network, the premier Minecraft network offering Lifesteal and Skyblock SMP, survival features, factions, economy, and competitive PvP.");
      setSeoKeywords(settingsMap.get("seo_keywords") || "zcraft, zcraft network, minecraft server, minecraft lifesteal, skyblock, lifesteal skyblock, minecraft survival, minecraft factions, minecraft economy, minecraft pvp, smp");
      setSeoImage(settingsMap.get("seo_image") || "/zcraft.png");
      setSeoType(settingsMap.get("seo_type") || "website");

      setHomeSeoTitle(settingsMap.get("home_seo_title") || "ZCraft Network - Premium Minecraft Lifesteal & Skyblock SMP Server");
      setHomeSeoDescription(settingsMap.get("home_seo_description") || "Join ZCraft Network, the ultimate Minecraft network with Lifesteal and Skyblock SMP, survival gameplay, custom economy, factions, and active community events.");
      setHomeSeoKeywords(settingsMap.get("home_seo_keywords") || "zcraft, zcraft network, minecraft server, minecraft lifesteal, skyblock, lifesteal skyblock, minecraft survival, minecraft factions, minecraft economy, minecraft pvp, minecraft smp, best minecraft server");

      setSupportSeoTitle(settingsMap.get("support_seo_title") || "Support - ZCraft Network");
      setSupportSeoDescription(settingsMap.get("support_seo_description") || "Get help, FAQs, and support for ZCraft Network.");
      setSupportSeoKeywords(settingsMap.get("support_seo_keywords") || "support, help, faq, minecraft support");

      setAppealSeoTitle(settingsMap.get("appeal_seo_title") || "Appeal - ZCraft Network");
      setAppealSeoDescription(settingsMap.get("appeal_seo_description") || "Submit a ban or punishment appeal for ZCraft Network.");
      setAppealSeoKeywords(settingsMap.get("appeal_seo_keywords") || "appeal, ban appeal, punishment appeal, minecraft appeal");

      setMaintenanceMode(settingsMap.get("maintenance_mode") === "true");
      setAnnouncementEnabled(settingsMap.get("announcement_enabled") === "true");
      setAnnouncementMessage(settingsMap.get("announcement_message") || "");
      setRegistrationEnabled(settingsMap.get("registration_enabled") !== "false");
      setEmailVerification(settingsMap.get("email_verification") !== "false");
    } catch (err: any) {
      console.error("Error loading settings:", err);
      toast({ title: "Error", description: "Failed to load settings", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const saveGeneralSettings = async () => {
    try {
      setSaving(true);
      await Promise.all([
        settingsService.setSetting("server_name", serverName),
        settingsService.setSetting("java_ip", javaIp),
        settingsService.setSetting("bedrock_ip", bedrockIp),
        settingsService.setSetting("server_port", serverPort),
        settingsService.setSetting("server_description", serverDescription),
        settingsService.setSetting("discord_link", discordUrl),
        settingsService.setSetting("store_url", storeUrl),
      ]);
      toast({ title: "Success", description: "General settings saved" });
      await refresh().catch(() => undefined);
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to save settings", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const saveSeoSettings = async () => {
    try {
      setSaving(true);
      await Promise.all([
        settingsService.setSetting("seo_title", seoTitle),
        settingsService.setSetting("seo_description", seoDescription),
        settingsService.setSetting("seo_keywords", seoKeywords),
        settingsService.setSetting("seo_image", seoImage),
        settingsService.setSetting("seo_type", seoType),
        settingsService.setSetting("home_seo_title", homeSeoTitle),
        settingsService.setSetting("home_seo_description", homeSeoDescription),
        settingsService.setSetting("home_seo_keywords", homeSeoKeywords),
        settingsService.setSetting("support_seo_title", supportSeoTitle),
        settingsService.setSetting("support_seo_description", supportSeoDescription),
        settingsService.setSetting("support_seo_keywords", supportSeoKeywords),
        settingsService.setSetting("appeal_seo_title", appealSeoTitle),
        settingsService.setSetting("appeal_seo_description", appealSeoDescription),
        settingsService.setSetting("appeal_seo_keywords", appealSeoKeywords),
      ]);
      toast({ title: "Success", description: "SEO settings saved" });
      await refresh().catch(() => undefined);
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to save SEO settings", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const saveSiteStatus = async () => {
    try {
      setSaving(true);
      await Promise.all([
        settingsService.setSetting("maintenance_mode", maintenanceMode.toString()),
        settingsService.setSetting("announcement_enabled", announcementEnabled.toString()),
        settingsService.setSetting("announcement_message", announcementMessage),
      ]);
      toast({ title: "Success", description: "Site status saved" });
      await refresh().catch(() => undefined);
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to save settings", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const saveSecuritySettings = async () => {
    try {
      setSaving(true);
      await Promise.all([
        settingsService.setSetting("registration_enabled", registrationEnabled.toString()),
        settingsService.setSetting("email_verification", emailVerification.toString()),
      ]);
      toast({ title: "Success", description: "Security settings saved" });
      await refresh().catch(() => undefined);
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to save settings", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Settings">
        <div className="flex items-center justify-center py-20">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Settings">
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="general" className="gap-2">
            <Globe className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="seo" className="gap-2">
            <Search className="h-4 w-4" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" />
                Server Settings
              </CardTitle>
              <CardDescription>Configure basic server information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Server Name</Label>
                  <Input value={serverName} onChange={(e) => setServerName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Server Port</Label>
                  <Input value={serverPort} onChange={(e) => setServerPort(e.target.value)} type="number" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Java Edition IP</Label>
                  <Input value={javaIp} onChange={(e) => setJavaIp(e.target.value)} placeholder="play.zcraftmc.xyz" />
                </div>
                <div className="space-y-2">
                  <Label>Bedrock Edition IP</Label>
                  <Input value={bedrockIp} onChange={(e) => setBedrockIp(e.target.value)} placeholder="bedrock.zcraftmc.xyz" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Server Description</Label>
                <Textarea value={serverDescription} onChange={(e) => setServerDescription(e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Discord Invite URL</Label>
                <Input value={discordUrl} onChange={(e) => setDiscordUrl(e.target.value)} placeholder="https://discord.gg/..." />
              </div>
              <div className="space-y-2">
                <Label>Store URL</Label>
                <Input value={storeUrl} onChange={(e) => setStoreUrl(e.target.value)} placeholder="https://store.example.com" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Site Status</CardTitle>
              <CardDescription>Control site-wide features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Redirects all visitors to maintenance page</p>
                </div>
                <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Announcement Banner</Label>
                  <p className="text-sm text-muted-foreground">Display banner message on all pages</p>
                </div>
                <Switch checked={announcementEnabled} onCheckedChange={setAnnouncementEnabled} />
              </div>
              {announcementEnabled && (
                <div className="space-y-2 pl-4 border-l-2 border-primary">
                  <Label>Banner Message</Label>
                  <Input
                    value={announcementMessage}
                    onChange={(e) => setAnnouncementMessage(e.target.value)}
                    placeholder="Special announcement here"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button className="btn-primary-gradient gap-2" onClick={saveGeneralSettings} disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save General Settings"}
            </Button>
            <Button variant="outline" onClick={saveSiteStatus} disabled={saving}>
              Save Site Status
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                SEO Settings
              </CardTitle>
              <CardDescription>Control global SEO and page-specific metadata</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Global SEO</h3>
                <div className="space-y-2">
                  <Label>SEO Title</Label>
                  <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="ZCraft Network - ..." />
                </div>
                <div className="space-y-2">
                  <Label>SEO Description</Label>
                  <Textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={3} placeholder="Join ZCraft Network..." />
                </div>
                <div className="space-y-2">
                  <Label>SEO Keywords</Label>
                  <Input value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} placeholder="zcraft, minecraft, ..." />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>SEO Image URL</Label>
                    <Input value={seoImage} onChange={(e) => setSeoImage(e.target.value)} placeholder="/zcraft.png" />
                  </div>
                  <div className="space-y-2">
                    <Label>SEO Type</Label>
                    <Input value={seoType} onChange={(e) => setSeoType(e.target.value)} placeholder="website" />
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t border-border/60 pt-4">
                <h3 className="font-semibold">Page SEO Overrides</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Home Title</Label>
                    <Input value={homeSeoTitle} onChange={(e) => setHomeSeoTitle(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Home Description</Label>
                    <Textarea value={homeSeoDescription} onChange={(e) => setHomeSeoDescription(e.target.value)} rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label>Home Keywords</Label>
                    <Input value={homeSeoKeywords} onChange={(e) => setHomeSeoKeywords(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-4 border-t border-border/60 pt-4">
                  <div className="space-y-2">
                    <Label>Support Title</Label>
                    <Input value={supportSeoTitle} onChange={(e) => setSupportSeoTitle(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Support Description</Label>
                    <Textarea value={supportSeoDescription} onChange={(e) => setSupportSeoDescription(e.target.value)} rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label>Support Keywords</Label>
                    <Input value={supportSeoKeywords} onChange={(e) => setSupportSeoKeywords(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-4 border-t border-border/60 pt-4">
                  <div className="space-y-2">
                    <Label>Appeal Title</Label>
                    <Input value={appealSeoTitle} onChange={(e) => setAppealSeoTitle(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Appeal Description</Label>
                    <Textarea value={appealSeoDescription} onChange={(e) => setAppealSeoDescription(e.target.value)} rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label>Appeal Keywords</Label>
                    <Input value={appealSeoKeywords} onChange={(e) => setAppealSeoKeywords(e.target.value)} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button className="btn-primary-gradient gap-2" onClick={saveSeoSettings} disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save SEO Settings"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Theme Settings
              </CardTitle>
              <CardDescription>Customize the look and feel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Default Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Set dark mode as default for new visitors</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Allow Theme Toggle</Label>
                  <p className="text-sm text-muted-foreground">Let users switch between light and dark mode</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex gap-2">
                  {["#3b82f6", "#06b6d4", "#8b5cf6", "#ec4899", "#f59e0b"].map((color) => (
                    <button
                      key={color}
                      className="h-10 w-10 rounded-lg border-2 border-transparent transition-colors hover:border-foreground"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button className="btn-primary-gradient gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Email Notifications
              </CardTitle>
              <CardDescription>Configure email settings and notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>SMTP Host</Label>
                  <Input placeholder="smtp.example.com" disabled />
                </div>
                <div className="space-y-2">
                  <Label>SMTP Port</Label>
                  <Input placeholder="587" disabled />
                </div>
                <div className="space-y-2">
                  <Label>SMTP Username</Label>
                  <Input placeholder="user@example.com" disabled />
                </div>
                <div className="space-y-2">
                  <Label>SMTP Password</Label>
                  <Input type="password" placeholder="********" disabled />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Email notifications will be configured through Supabase.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Authentication Settings
              </CardTitle>
              <CardDescription>Manage user registration and login</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Allow Registration</Label>
                  <p className="text-sm text-muted-foreground">Enable new user signups</p>
                </div>
                <Switch checked={registrationEnabled} onCheckedChange={setRegistrationEnabled} />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Email Verification</Label>
                  <p className="text-sm text-muted-foreground">Require email verification for new accounts</p>
                </div>
                <Switch checked={emailVerification} onCheckedChange={setEmailVerification} />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
                </div>
                <Switch disabled />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button className="btn-primary-gradient gap-2" onClick={saveSecuritySettings} disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Security Settings"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
