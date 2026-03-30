import { useState, useEffect } from "react";
import { 
  Globe, 
  Bell, 
  Shield, 
  Palette,
  Server,
  Save,
  Loader
} from "lucide-react";
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

  // General settings
  const [serverName, setServerName] = useState("ZCraft Network");
  const [javaIp, setJavaIp] = useState("play.zcraftmc.xyz");
  const [bedrockIp, setBedrockIp] = useState("bedrock.zcraftmc.xyz");
  const [serverPort, setServerPort] = useState("25565");
  const [serverDescription, setServerDescription] = useState("");
  const [discordUrl, setDiscordUrl] = useState("");
  const [storeUrl, setStoreUrl] = useState("");

  // Site status
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [announcementEnabled, setAnnouncementEnabled] = useState(false);
  const [announcementMessage, setAnnouncementMessage] = useState("");

  // SEO
  const [seoTitle, setSeoTitle] = useState("ZCraft Network — Premium Minecraft Lifesteal & Skyblock SMP Server");
  const [seoDescription, setSeoDescription] = useState("Join ZCraft Network, the premier Minecraft network offering Lifesteal and Skyblock SMP, survival features, factions, economy, and competitive PvP.");
  const [seoKeywords, setSeoKeywords] = useState("zcraft, zcraft network, minecraft server, minecraft lifesteal, skyblock, lifesteal skyblock, minecraft survival, minecraft factions, minecraft economy, minecraft pvp, smp");
  const [seoImage, setSeoImage] = useState("/zcraft.png");
  const [seoType, setSeoType] = useState("website");

  // Security
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const [emailVerification, setEmailVerification] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await settingsService.getSettings();
      const settingsMap = new Map(settings.map(s => [s.key, s.value]));

      setServerName(settingsMap.get('server_name') || 'ZCraft Network');
      setJavaIp(settingsMap.get('java_ip') || 'play.zcraftmc.xyz');
      setBedrockIp(settingsMap.get('bedrock_ip') || 'bedrock.zcraftmc.xyz');
      setServerPort(settingsMap.get('server_port') || '25565');
      setServerDescription(settingsMap.get('server_description') || '');
      setDiscordUrl(settingsMap.get('discord_link') || '');
      setStoreUrl(settingsMap.get('store_url') || '');
      setSeoTitle(settingsMap.get('seo_title') || 'ZCraft Network — Premium Minecraft Lifesteal & Skyblock SMP Server');
      setSeoDescription(settingsMap.get('seo_description') || 'Join ZCraft Network, the premier Minecraft network offering Lifesteal and Skyblock SMP, survival features, factions, economy, and competitive PvP.');
      setSeoKeywords(settingsMap.get('seo_keywords') || 'zcraft, zcraft network, minecraft server, minecraft lifesteal, skyblock, lifesteal skyblock, minecraft survival, minecraft factions, minecraft economy, minecraft pvp, smp');
      setSeoImage(settingsMap.get('seo_image') || '/zcraft.png');
      setSeoType(settingsMap.get('seo_type') || 'website');
      setMaintenanceMode(settingsMap.get('maintenance_mode') === 'true');
      setAnnouncementEnabled(settingsMap.get('announcement_enabled') === 'true');
      setAnnouncementMessage(settingsMap.get('announcement_message') || '');
      setRegistrationEnabled(settingsMap.get('registration_enabled') !== 'false');
      setEmailVerification(settingsMap.get('email_verification') !== 'false');
    } catch (err: any) {
      console.error('Error loading settings:', err);
      toast({ title: "Error", description: "Failed to load settings", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const saveGeneralSettings = async () => {
    try {
      setSaving(true);
      await Promise.all([
        settingsService.setSetting('server_name', serverName),
        settingsService.setSetting('java_ip', javaIp),
        settingsService.setSetting('bedrock_ip', bedrockIp),
        settingsService.setSetting('server_port', serverPort),
        settingsService.setSetting('server_description', serverDescription),
        settingsService.setSetting('discord_link', discordUrl),
        settingsService.setSetting('store_url', storeUrl),
        settingsService.setSetting('seo_title', seoTitle),
        settingsService.setSetting('seo_description', seoDescription),
        settingsService.setSetting('seo_keywords', seoKeywords),
        settingsService.setSetting('seo_image', seoImage),
        settingsService.setSetting('seo_type', seoType),
      ]);
      toast({ title: "Success", description: "General settings saved" });
      // refresh global settings
      try { await refresh(); } catch (e) { /* ignore */ }
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to save settings", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const saveSiteStatus = async () => {
    try {
      setSaving(true);
      await Promise.all([
        settingsService.setSetting('maintenance_mode', maintenanceMode.toString()),
        settingsService.setSetting('announcement_enabled', announcementEnabled.toString()),
        settingsService.setSetting('announcement_message', announcementMessage),
      ]);
      toast({ title: "Success", description: "Site status saved" });
      try { await refresh(); } catch (e) { /* ignore */ }
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
        settingsService.setSetting('registration_enabled', registrationEnabled.toString()),
        settingsService.setSetting('email_verification', emailVerification.toString()),
      ]);
      toast({ title: "Success", description: "Security settings saved" });
      try { await refresh(); } catch (e) { /* ignore */ }
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
      {/* Ensure global settings are refreshed from admin actions */}
      {/* refresh is provided by SettingsContext */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="general" className="gap-2">
            <Globe className="h-4 w-4" />
            General
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
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Server Name</Label>
                  <Input value={serverName} onChange={(e) => setServerName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Server Port</Label>
                  <Input value={serverPort} onChange={(e) => setServerPort(e.target.value)} type="number" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
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
                <Label>SEO Title</Label>
                <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="ZCraft Network — ..." />
              </div>
              <div className="space-y-2">
                <Label>SEO Description</Label>
                <Textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={3} placeholder="Join ZCraft Network..." />
              </div>
              <div className="space-y-2">
                <Label>SEO Keywords</Label>
                <Input value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} placeholder="zcraft, minecraft, ..." />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SEO Image URL</Label>
                  <Input value={seoImage} onChange={(e) => setSeoImage(e.target.value)} placeholder="/zcraft.png" />
                </div>
                <div className="space-y-2">
                  <Label>SEO Type</Label>
                  <Input value={seoType} onChange={(e) => setSeoType(e.target.value)} placeholder="website" />
                </div>
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
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Redirects all visitors to maintenance page
                  </p>
                </div>
                <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Announcement Banner</Label>
                  <p className="text-sm text-muted-foreground">
                    Display banner message on all pages
                  </p>
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
              {saving ? 'Saving...' : 'Save General Settings'}
            </Button>
            <Button variant="outline" onClick={saveSiteStatus} disabled={saving}>
              Save Site Status
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
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Default Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Set dark mode as default for new visitors
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Allow Theme Toggle</Label>
                  <p className="text-sm text-muted-foreground">
                    Let users switch between light and dark mode
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex gap-2">
                  {["#3b82f6", "#06b6d4", "#8b5cf6", "#ec4899", "#f59e0b"].map((color) => (
                    <button
                      key={color}
                      className="h-10 w-10 rounded-lg border-2 border-transparent hover:border-foreground transition-colors"
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
              <div className="grid md:grid-cols-2 gap-4">
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
                  <Input type="password" placeholder="••••••••" disabled />
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
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Allow Registration</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable new user signups
                  </p>
                </div>
                <Switch checked={registrationEnabled} onCheckedChange={setRegistrationEnabled} />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Email Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Require email verification for new accounts
                  </p>
                </div>
                <Switch checked={emailVerification} onCheckedChange={setEmailVerification} />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Require 2FA for admin accounts
                  </p>
                </div>
                <Switch disabled />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button className="btn-primary-gradient gap-2" onClick={saveSecuritySettings} disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Security Settings'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}

