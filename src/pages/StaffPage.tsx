import { BentoPageLayout } from "@/components/layout/BentoPageLayout";
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
import { motion } from "framer-motion";

interface StaffMember {
  id: string; username: string; email: string; role: string; created_at: string; avatar_url?: string; minecraft_name?: string;
}
interface RoleGroup {
  name: string; icon: LucideIcon; color: string; bgColor: string; members: StaffMember[];
}

export default function StaffPage() {
  const [staffGroups, setStaffGroups] = useState<RoleGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skinCache, setSkinCache] = useState<Record<string, string>>({});
  const [applicationRoles, setApplicationRoles] = useState<StaffApplicationRoleConfig[]>([]);

  useEffect(() => { loadStaff(); loadApplicationStatus(); }, []);

  const loadApplicationStatus = async () => {
    try {
      const settings = await getStaffApplicationSettings();
      setApplicationRoles(settings.roles.filter((r) => r.enabled));
    } catch {}
  };

  const getHead = async (username: string) => {
    if (skinCache[username]) return skinCache[username];
    try {
      const url = await getMinecraftPlayerImage(username, "head", 64);
      setSkinCache((p) => ({ ...p, [username]: url }));
      return url;
    } catch { return ""; }
  };

  const loadStaff = async () => {
    try {
      const { data, error: e } = await supabase.from("users").select("id, username, email, role, created_at, avatar_url, minecraft_name").in("role", ["owner", "admin", "moderator", "helper"]);
      if (e) throw e;
      const members = await Promise.all((data || []).map(async (u: StaffMember) => {
        const skin = await getHead(u.minecraft_name || u.username);
        return { ...u, avatar_url: skin || u.avatar_url };
      }));
      const cfg: Record<string, { name: string; icon: LucideIcon; color: string; bgColor: string }> = {
        owner: { name: "Owners", icon: Crown, color: "text-amber-500", bgColor: "bg-amber-500/10" },
        admin: { name: "Administrators", icon: Shield, color: "text-red-500", bgColor: "bg-red-500/10" },
        moderator: { name: "Moderators", icon: Star, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
        helper: { name: "Helpers", icon: Heart, color: "text-primary", bgColor: "bg-primary/10" },
      };
      setStaffGroups(Object.entries(cfg).map(([k, v]) => ({ ...v, members: members.filter((m: StaffMember) => m.role === k) })).filter((g) => g.members.length > 0));
    } catch (err: any) { setError(err?.message || "Failed"); toast({ title: "Error", description: "Failed to load staff" }); } finally { setLoading(false); }
  };

  if (loading) return <BentoPageLayout title="Staff"><div className="flex justify-center py-20"><Loader className="h-8 w-8 animate-spin text-primary" /></div></BentoPageLayout>;
  if (error) return <BentoPageLayout title="Staff"><div className="py-20 text-center text-red-400">{error}</div></BentoPageLayout>;

  return (
    <BentoPageLayout
      title="Our Staff"
      subtitle="Meet the dedicated team that keeps ZCraft running smoothly."
      seo={{
        title: "ZCraft Network Staff Team — Meet Our Admins & Moderators",
        description: "Meet the dedicated ZCraft Network staff team.",
        keywords: "zcraft staff, minecraft server staff, server admins, moderators",
        url: "/staff", type: "website",
      }}
    >
      <div className="max-w-5xl mx-auto space-y-10">
        {staffGroups.map((role, gi) => {
          const Icon = role.icon;
          return (
            <motion.div key={role.name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.1 }}>
              <div className="flex items-center gap-3 mb-5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${role.bgColor}`}>
                  <Icon className={`h-5 w-5 ${role.color}`} />
                </div>
                <h2 className="font-display text-2xl font-bold text-primary-foreground">{role.name}</h2>
                <Badge className="ml-auto bg-bento-card border-bento-border text-primary-foreground/60">{role.members.length}</Badge>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {role.members.map((m, i) => (
                  <motion.div key={m.id} className="bento-card p-5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.1 + i * 0.05 }}>
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-bento-bg overflow-hidden">
                        {m.avatar_url ? <img src={m.avatar_url} alt={m.username} className="h-full w-full rounded-xl object-cover" /> : <span className="text-2xl">👤</span>}
                      </div>
                      <div>
                        <h3 className="font-semibold text-primary-foreground">{m.username}</h3>
                        <p className="text-sm text-primary-foreground/40">Since {new Date(m.created_at).getFullYear()}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}

        {/* Apply CTA */}
        <div className="bento-card p-8 text-center mt-8">
          <div className="text-4xl mb-4">🚀</div>
          <h3 className="font-display text-2xl font-bold text-primary-foreground mb-2">Want to Join the Team?</h3>
          <p className="text-primary-foreground/50 mb-6">We're always looking for dedicated players.</p>
          {applicationRoles.length > 0 ? (
            <div className="space-y-4">
              <div className="flex flex-wrap justify-center gap-2">
                {applicationRoles.map((r) => <Badge key={r.id} className="bg-primary/10 text-primary border-0 px-3 py-1">{r.label}</Badge>)}
              </div>
              <Button asChild className="btn-primary-gradient"><Link to="/apply">Apply Now</Link></Button>
            </div>
          ) : (
            <Badge className="bg-bento-card border-bento-border text-primary-foreground/60 px-4 py-2">Applications currently closed</Badge>
          )}
        </div>
      </div>
    </BentoPageLayout>
  );
}
