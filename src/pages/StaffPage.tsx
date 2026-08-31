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

interface StaffSection {
  name: string;
  members: Array<{
    member: StaffMember;
    displayRole: string;
    icon: LucideIcon;
    color: string;
    bgColor: string;
  }>;
}

const STAFF_ROLE_CONFIG: Record<
  string,
  {
    displayRole: string;
    section: string;
    icon: LucideIcon;
    color: string;
    bgColor: string;
  }
> = {
  owner: {
    displayRole: "OWNER",
    section: "Leadership",
    icon: Crown,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  admin: {
    displayRole: "ADMIN",
    section: "Leadership",
    icon: Shield,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  developer: {
    displayRole: "DEVELOPER",
    section: "Development",
    icon: Star,
    color: "text-sky-500",
    bgColor: "bg-sky-500/10",
  },
  builder: {
    displayRole: "BUILDER",
    section: "Development",
    icon: Heart,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
  },
  moderator: {
    displayRole: "MODERATOR",
    section: "Moderation",
    icon: Star,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  helper: {
    displayRole: "HELPER",
    section: "Moderation",
    icon: Heart,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
};

const normalizeStaffRole = (role: string | null | undefined) => String(role || "").trim().toLowerCase();

const getStaffRoleConfig = (role: string) => {
  const normalizedRole = normalizeStaffRole(role);
  return (
    STAFF_ROLE_CONFIG[normalizedRole] ?? {
      displayRole: normalizedRole ? normalizedRole.toUpperCase() : "STAFF",
      section: "Team",
      icon: Star,
      color: "text-slate-500",
      bgColor: "bg-slate-500/10",
    }
  );
};

const resolveEffectiveStaffRole = (user: StaffMember, authRoleMap: Map<string, string>) => {
  const authRole = normalizeStaffRole(authRoleMap.get(user.id));
  if (authRole && STAFF_ROLE_CONFIG[authRole]) {
    return authRole;
  }

  const normalizedUserRole = normalizeStaffRole(user.role);
  if (normalizedUserRole && STAFF_ROLE_CONFIG[normalizedUserRole]) {
    return normalizedUserRole;
  }

  return "staff";
};

export default function StaffPage() {
  const [staffGroups, setStaffGroups] = useState<StaffSection[]>([]);
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
      const imageUrl = await getMinecraftPlayerImage(username, 'bust', 64, 'default');
      setSkinCache((prev) => ({ ...prev, [username]: imageUrl }));
      return imageUrl;
    } catch (err) {
      console.error(`Failed to fetch Minecraft bust for ${username}:`, err);
      // Return fallback 2D avatar
      return `https://crafthead.net/avatar/${encodeURIComponent(username)}/64`;
    }
  };

  const loadStaff = async () => {
    try {
      const staffRoles = ["owner", "admin", "moderator", "helper", "developer", "builder"];

      const { data: authRolesData, error: authRolesError } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .neq("role", "user");

      if (authRolesError) throw authRolesError;

      const authRoleMap = new Map((authRolesData || []).map((entry: any) => [entry.user_id, entry.role]));

      const { data, error: queryError } = await supabase
        .from("users")
        .select("id, username, role, created_at, avatar_url, minecraft_name")
        .in("role", staffRoles);

      if (queryError) throw queryError;

      const existingUserIds = new Set((data || []).map((user: StaffMember) => user.id));
      const extraStaffIds = Array.from(authRoleMap.keys()).filter((userId) => !existingUserIds.has(userId));

      let extraUsers: StaffMember[] = [];
      if (extraStaffIds.length > 0) {
        const { data: extraData, error: extraError } = await supabase
          .from("users")
          .select("id, username, role, created_at, avatar_url, minecraft_name")
          .in("id", extraStaffIds);

        if (extraError) throw extraError;
        extraUsers = extraData || [];
      }

      const allUsers = [...(data || []), ...extraUsers];

      const staffMembersWithRoles = allUsers
        .map((user: StaffMember) => ({
          ...user,
          role: resolveEffectiveStaffRole(user, authRoleMap) || user.role,
        }))
        .filter((user) => Boolean(getStaffRoleConfig(user.role).displayRole));

      const membersWithSkins = await Promise.all(
        staffMembersWithRoles.map(async (user) => {
          const minecraftName = user.minecraft_name || user.username;
          const skinUrl = await getMinecraftHeadImage(minecraftName);
          return {
            ...user,
            avatar_url: skinUrl || user.avatar_url,
          };
        })
      );

      const sectionedGroups: Record<
        string,
        {
          name: string;
          members: Array<{ member: StaffMember; displayRole: string; icon: LucideIcon; color: string; bgColor: string }>;
        }
      > = {};

      // Role priority for sorting (higher = earlier)
      const rolePriority: Record<string, number> = {
        owner: 6,
        admin: 5,
        moderator: 4,
        developer: 3,
        builder: 2,
        helper: 1,
      };

      membersWithSkins.forEach((member) => {
        const roleInfo = getStaffRoleConfig(member.role);
        if (!roleInfo) return;

        if (!sectionedGroups[roleInfo.section]) {
          sectionedGroups[roleInfo.section] = {
            name: roleInfo.section,
            members: [],
          };
        }

        sectionedGroups[roleInfo.section].members.push({
          member,
          displayRole: roleInfo.displayRole,
          icon: roleInfo.icon,
          color: roleInfo.color,
          bgColor: roleInfo.bgColor,
        });
      });

      // Sort members within each section by role priority (descending)
      Object.values(sectionedGroups).forEach((section) => {
        section.members.sort((a, b) => {
          const aPriority = rolePriority[a.member.role.toLowerCase()] || 0;
          const bPriority = rolePriority[b.member.role.toLowerCase()] || 0;
          return bPriority - aPriority;
        });
      });

      // Define section order
      const sectionOrder = ["Leadership", "Development", "Moderation", "Team"];
      const grouped = sectionOrder
        .map((section) => sectionedGroups[section])
        .filter((group) => group && group.members.length > 0);

      setStaffGroups(grouped);
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
      title: "ZCraft Network Staff Team — Owners, Admins, Moderators & Helpers",
      description: "Meet the ZCraft Network staff team and see the actual owner, admin, moderator, and helper roles for each member.",
      keywords: "zcraft staff, minecraft server staff, server owners, admins, moderators, helpers, server team, zcraft network team",
      url: "/staff",
      type: "website",
      tags: ["staff", "team", "owners", "admins", "moderators", "helpers"]
    }}>
      {/* Hero */}
      <section className="py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Our <span className="text-gradient">Team</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Meet the actual owners, admins, moderators, and helpers keeping ZCraft running smoothly.
            </p>
          </div>
        </div>
      </section>

      {/* Staff Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {staffGroups.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No staff members found</p>
            ) : (
              <>
                {staffGroups.map((section) => (
                  <div key={section.name} className="mb-12">
                    <div className="text-center mb-8">
                      <h2 className="font-display text-3xl font-bold mb-2">{section.name}</h2>
                      <p className="text-muted-foreground">
                        {section.name === "Leadership"
                          ? "The core team managing and leading the server"
                          : "Staff members helping maintain the community"
                        }
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {section.members.map(({ member, displayRole, icon: IconComponent, color, bgColor }) => (
                        <Card key={member.id} className="card-hover border-0 bg-card/50 backdrop-blur-sm">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted overflow-hidden">
                                {member.avatar_url ? (
                                  <img
                                    src={member.avatar_url}
                                    alt={`${member.username}'s Minecraft skin`}
                                    className="h-full w-full object-contain"
                                    onError={(e) => {
                                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"%3E%3Crect width="64" height="64" fill="%23888"%3E%3C/rect%3E%3Ctext x="32" y="40" font-size="32" text-anchor="middle" fill="white"%3E👤%3C/text%3E%3C/svg%3E';
                                    }}
                                  />
                                ) : (
                                  <div className="text-2xl">👤</div>
                                )}
                              </div>
                                      <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-lg truncate">{member.username}</h3>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm uppercase tracking-wide">
                                  <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${color} ${bgColor}`}>
                                    <IconComponent className="h-3.5 w-3.5" />
                                    {displayRole}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-3">
                                  Joined {new Date(member.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short'
                                  })}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1 capitalize">
                                  Raw role: {member.role}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </>
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
