import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Shield, Star, Heart, Loader, LucideIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { getMinecraftPlayerImage } from "@/services/minecraftService";
import { Link } from "react-router-dom";
import { getStaffApplicationSettings } from "@/services/staffApplicationService";
import type { StaffApplicationRoleConfig } from "@/services/staffApplicationService";

interface StaffMember {
  id: string;
  username: string;
  email: string;
  role: string;
  created_at: string;
  avatar_url?: string;
  minecraft_name?: string;
}

interface RoleGroup {
  name: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  members: StaffMember[];
}

export default function StaffPage() {
  const [staffGroups, setStaffGroups] = useState<RoleGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skinCache, setSkinCache] = useState<Record<string, string>>({});
  const [applicationRoles, setApplicationRoles] = useState<StaffApplicationRoleConfig[]>([]);

  useEffect(() => {
    loadStaff();
    loadApplicationStatus();
  }, []);

  const loadApplicationStatus = async () => {
    try {
      const settings = await getStaffApplicationSettings();
      setApplicationRoles(settings.roles.filter((role) => role.enabled));
    } catch (error) {
      console.warn("Failed to load application settings:", error);
    }
  };

  const getMinecraftHeadImage = async (username: string): Promise<string> => {
    // Check cache first
    if (skinCache[username]) {
      return skinCache[username];
    }

    try {
      const imageUrl = await getMinecraftPlayerImage(username, 'head', 64);
      setSkinCache((prev) => ({ ...prev, [username]: imageUrl }));
      return imageUrl;
    } catch (err) {
      console.error(`Failed to fetch Minecraft head for ${username}:`, err);
      // Return fallback emoji
      return "";
    }
  };

  const loadStaff = async () => {
    try {
      // Fetch all staff members (users with role other than 'player')
      const { data, error: queryError } = await supabase
        .from("users")
        .select("id, username, email, role, created_at, avatar_url, minecraft_name")
        .in("role", ["owner", "admin", "moderator", "helper"]);

      if (queryError) throw queryError;

      // Fetch skins for all staff members
      const membersWithSkins = await Promise.all(
        (data || []).map(async (user: StaffMember) => {
          const minecraftName = user.minecraft_name || user.username;
          const skinUrl = await getMinecraftHeadImage(minecraftName);
          return {
            ...user,
            avatar_url: skinUrl || user.avatar_url,
          };
        })
      );

      // Group staff by role
      const roleConfig: Record<string, { name: string; icon: LucideIcon; color: string; bgColor: string }> = {
        owner: { name: "Owners", icon: Crown, color: "text-amber-500", bgColor: "bg-amber-500/10" },
        admin: { name: "Administrators", icon: Shield, color: "text-red-500", bgColor: "bg-red-500/10" },
        moderator: { name: "Moderators", icon: Star, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
        helper: { name: "Helpers", icon: Heart, color: "text-primary", bgColor: "bg-primary/10" },
      };

      const grouped = Object.entries(roleConfig).map(([roleKey, roleInfo]) => ({
        ...roleInfo,
        members: membersWithSkins.filter((user: StaffMember) => user.role === roleKey),
      }));

      setStaffGroups(grouped.filter((group) => group.members.length > 0));
    } catch (err: any) {
      setError(err?.message || "Failed to load staff");
      toast({ title: "Error", description: "Failed to load staff members" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="py-20 text-center text-red-500">{error}</div>
      </Layout>
    );
  }

  return (
    <Layout seo={{
      title: "ZCraft Network Staff Team — Meet Our Admins & Moderators",
      description: "Meet the dedicated ZCraft Network staff team including admins, moderators, and helpers. Learn about our community management and server administration team.",
      keywords: "zcraft staff, minecraft server staff, server admins, moderators, server team, zcraft network team, minecraft administrators, server management",
      url: "/staff",
      type: "website",
      tags: ["staff", "team", "admins", "moderators", "community"]
    }}>
      {/* Hero */}
      <section className="py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Our <span className="text-gradient">Staff</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Meet the dedicated team that keeps ZCraft running smoothly.
            </p>
          </div>
        </div>
      </section>

      {/* Staff Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-12">
            {staffGroups.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No staff members found</p>
            ) : (
              staffGroups.map((role) => {
                const IconComponent = role.icon;
                return (
                  <div key={role.name}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${role.bgColor}`}>
                        <IconComponent className={`h-5 w-5 ${role.color}`} />
                      </div>
                      <h2 className="font-display text-2xl font-bold">{role.name}</h2>
                      <Badge variant="secondary" className="ml-auto">
                        {role.members.length} members
                      </Badge>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {role.members.map((member) => (
                        <Card key={member.id} className="card-hover border-0 bg-card">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-2xl">
                                {member.avatar_url ? (
                                  <img src={member.avatar_url} alt={member.username} className="h-full w-full rounded-xl object-cover" />
                                ) : "👤"}
                              </div>
                              <div>
                                <h3 className="font-semibold">{member.username}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Since {new Date(member.created_at).getFullYear()}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Join Staff CTA */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto border-0 bg-card">
            <CardContent className="p-8 text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-4xl mb-4">
                🚀
              </div>
              <h3 className="font-display text-2xl font-bold mb-2">Want to Join the Team?</h3>
              <p className="text-muted-foreground mb-6">
                We're always looking for dedicated players to help our community grow.
              </p>
              {applicationRoles.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap justify-center gap-2">
                    {applicationRoles.map((role) => (
                      <Badge key={role.id} variant="secondary" className="px-3 py-1">
                        {role.label}
                      </Badge>
                    ))}
                  </div>
                  <Button asChild className="btn-primary-gradient">
                    <Link to="/apply">Apply Now</Link>
                  </Button>
                </div>
              ) : (
                <Badge variant="outline" className="text-base px-4 py-2">
                  Applications currently closed
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
