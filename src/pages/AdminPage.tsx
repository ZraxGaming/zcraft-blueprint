/**
 * ============================================================
 * Admin Dashboard - Protected by BuiltByBit Anti-Piracy
 * © 2024-2026 ZCraft. All rights reserved.
 * Unauthorized distribution or modification is prohibited.
 * ============================================================
 * This code is protected under international copyright law.
 * Removal of this notice or unauthorized copying will be detected.
 * __BUILTIN_ANTI_PIRACY_CHECK_ADMIN_PAGE_001__
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare,
  Newspaper,
  BookOpen,
  Calendar,
  Settings,
  Server,
  Shield,
  Activity,
  Loader,
  LucideIcon
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { settingsService } from "@/services/settingsService";
import { useSettings } from "@/contexts/SettingsContext";
import { toast } from "@/components/ui/use-toast";
import { fetchMinecraftServerStatus } from "@/services/serverService";

interface Stat {
  label: string;
  value: string;
  change: string;
  icon: LucideIcon;
}

interface ActivityItem {
  id: string;
  user_id: string;
  action: string;
  created_at: string;
  username: string;
}

export default function AdminPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [announcementEnabled, setAnnouncementEnabled] = useState(true);
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const { refresh } = useSettings();
  const [stats, setStats] = useState<Stat[]>([
    { label: "Total Users", value: "0", change: "+0%", icon: Users },
    { label: "Forum Posts", value: "0", change: "+0%", icon: MessageSquare },
    { label: "Wiki Articles", value: "0", change: "+0%", icon: BookOpen },
    { label: "Changelogs", value: "0", change: "+0", icon: Calendar },
  ]);
  const [serviceStatus, setServiceStatus] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
    loadServiceStatus();
  }, []);

  useEffect(() => {
    // load quick site flags
    (async () => {
      try {
        const rows = await settingsService.getSettings();
        const m = rows.find((r: any) => r.key === 'maintenance_mode')?.value === 'true';
        const a = rows.find((r: any) => r.key === 'announcement_enabled')?.value === 'true';
        const message = rows.find((r: any) => r.key === 'announcement_message')?.value || '';
        setMaintenanceMode(!!m);
        setAnnouncementEnabled(!!a);
        setAnnouncementMessage(message);
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  // fetch live status for services
  async function pingUrl(url: string) {
    const controller = new AbortController();
    const start = performance.now();
    const id = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch(url, { signal: controller.signal, method: 'HEAD' });
      const ms = Math.max(0, Math.round(performance.now() - start));
      return { ok: res.ok, latency: ms };
    } catch (e) {
      return { ok: false, latency: null };
    } finally {
      clearTimeout(id);
    }
  }

  async function loadServiceStatus() {
    setStatusLoading(true);
    try {
      const server = await fetchMinecraftServerStatus('play.zcraftmc.xyz');
      const canPingPublicSite = !import.meta.env.DEV;
      const website = canPingPublicSite
        ? await pingUrl('https://z-craft.xyz')
        : { ok: true, latency: null, note: 'Skipped in local dev' };
      const forums = canPingPublicSite
        ? await pingUrl('https://z-craft.xyz/forums')
        : { ok: true, latency: null, note: 'Skipped in local dev' };

      setServiceStatus([
        { name: 'Minecraft Server', status: server.online ? 'online' : 'offline', players: server.players ? `${server.players.online}/${server.players.max}` : '—' },
        { name: 'Website', status: website.ok ? 'online' : 'offline', uptime: website.ok ? 'Available' : 'Unavailable', latency: website.latency, note: website.note },
        { name: 'Forums', status: forums.ok ? 'online' : 'offline', uptime: forums.ok ? 'Available' : 'Unavailable', latency: forums.latency, note: forums.note },
      ]);
    } catch (err) {
      setServiceStatus([
        { name: 'Minecraft Server', status: 'unknown', players: '—' },
        { name: 'Website', status: 'unknown', uptime: '—' },
        { name: 'Forums', status: 'unknown', uptime: '—' },
      ]);
    } finally {
      setStatusLoading(false);
    }
  }

  const loadDashboardData = async () => {
    try {
      // Fetch all counts in parallel
      const [usersData, postsData, articlesData, changelogsData] = await Promise.all([
        supabase.from("users").select("id", { count: "exact", head: true }),
        supabase.from("forum_posts").select("id", { count: "exact", head: true }),
        supabase.from("wiki").select("id", { count: "exact", head: true }),
        supabase.from("changelogs").select("id", { count: "exact", head: true }),
      ]);

      const totalUsers = usersData.count || 0;
      const totalPosts = postsData.count || 0;
      const totalArticles = articlesData.count || 0;
      const totalChangelogs = changelogsData.count || 0;

      setStats([
        { label: "Total Users", value: totalUsers.toLocaleString(), change: "+12%", icon: Users },
        { label: "Forum Posts", value: totalPosts.toLocaleString(), change: "+8%", icon: MessageSquare },
        { label: "Wiki Articles", value: totalArticles.toLocaleString(), change: "+3%", icon: BookOpen },
        { label: "Changelogs", value: totalChangelogs.toString(), change: "+2", icon: Calendar },
      ]);
    } catch (err: any) {
      setError(err?.message || "Failed to load dashboard data");
      toast({ title: "Error", description: "Failed to load dashboard data" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center py-20">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Dashboard">
        <div className="py-20 text-center text-red-500">{error}</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <Card key={stat.label} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold font-display">{stat.value}</p>
                      <p className="text-xs text-emerald-500 font-medium">{stat.change}</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="settings">Quick Settings</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivity.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">No recent activity</p>
                  ) : (
                    recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.username}</p>
                          <p className="text-xs text-muted-foreground">{activity.action}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(activity.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Server Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-primary" />
                    Server Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {statusLoading ? (
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-muted/50 animate-pulse h-12" />
                      <div className="p-3 rounded-lg bg-muted/50 animate-pulse h-12" />
                      <div className="p-3 rounded-lg bg-muted/50 animate-pulse h-12" />
                      <div className="p-3 rounded-lg bg-muted/50 animate-pulse h-12" />
                    </div>
                  ) : (
                    serviceStatus.map((service, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className={`h-3 w-3 rounded-full ${
                            service.status === 'online' ? 'bg-emerald-500' :
                            service.status === 'degraded' ? 'bg-amber-500' : service.status === 'offline' ? 'bg-red-500' : 'bg-muted'
                          }`} />
                          <span className="font-medium">{service.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {service.players ?? service.uptime ?? service.note ?? '—'} {service.latency ? `• ${service.latency}ms` : ''}
                        </span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Quick Settings
                </CardTitle>
                <CardDescription>Manage global site settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable to show maintenance page to all visitors
                    </p>
                  </div>
                  <Switch
                    checked={maintenanceMode}
                    onCheckedChange={async (v) => {
                      setMaintenanceMode(v);
                      try {
                        await settingsService.setSetting('maintenance_mode', v.toString());
                        await refresh();
                        toast({ title: 'Success', description: 'Maintenance mode updated' });
                      } catch (err: any) {
                        toast({ title: 'Error', description: err?.message || 'Failed to update', variant: 'destructive' });
                      }
                    }}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Announcement Banner</Label>
                    <p className="text-sm text-muted-foreground">
                      Show announcement banner on all pages
                    </p>
                  </div>
                  <Switch
                    checked={announcementEnabled}
                    onCheckedChange={async (v) => {
                      setAnnouncementEnabled(v);
                      try {
                        await settingsService.setSetting('announcement_enabled', v.toString());
                        await refresh();
                        toast({ title: 'Success', description: 'Announcement flag updated' });
                      } catch (err: any) {
                        toast({ title: 'Error', description: err?.message || 'Failed to update', variant: 'destructive' });
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-medium">Announcement Message</Label>
                  <input
                    value={announcementMessage}
                    onChange={(e) => setAnnouncementMessage(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Live banner message shown across the site"
                  />
                </div>

                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Banner Preview</p>
                  {announcementEnabled && announcementMessage.trim() ? (
                    <div className="bg-primary/10 text-primary px-4 py-3 rounded-md border border-primary/20">
                      {announcementMessage}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">The banner stays hidden until it is enabled and has a message.</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        await settingsService.setSetting('announcement_message', announcementMessage);
                        await refresh();
                        toast({ title: 'Success', description: 'Announcement message updated' });
                      } catch (err: any) {
                        toast({ title: 'Error', description: err?.message || 'Failed to update message', variant: 'destructive' });
                      }
                    }}
                  >
                    Save Announcement Text
                  </Button>
                  <Button asChild variant="ghost">
                    <Link to="/admin/tools">Open Admin Tools</Link>
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Default Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Set dark mode as default for new visitors
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {[
                { title: "News Posts", count: 45, icon: Newspaper, href: "/admin/news" },
                { title: "Wiki Articles", count: 234, icon: BookOpen, href: "/admin/wiki" },
                { title: "Forum Topics", count: 1892, icon: MessageSquare, href: "/admin/forums" },
              ].map((item) => {
                const IconComponent = item.icon;
                return (
                  <Card key={item.title} className="card-hover">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <IconComponent className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-2xl font-bold font-display">{item.count}</p>
                        </div>
                      </div>
                      <Link to={item.href}>
                        <Button variant="outline" className="w-full">Manage</Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
