// %%__NONCE_ADMIN_USERS_01_%%
// %%__RESOURCE_TITLE_%%
// %%__VERSION_%%

import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  MoreHorizontal, 
  Shield, 
  Ban, 
  Mail,
  Filter,
  Loader,
  Check,
  Pencil
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { isValidUsername } from "@/lib/security";

const ROLE_OPTIONS = ["owner", "admin", "moderator", "helper", "user"] as const;

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar_url: string | null;
  created_at: string;
}

export default function AdminUsersPage() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      const { data: usersData, error: usersError } = await supabase.rpc("get_admin_users");

      if (usersError) throw usersError;

      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("user_id, role");

      const rolesMap = new Map((rolesData || []).map(r => [r.user_id, r.role]));

      setAllUsers(
        (usersData || []).map((user: any) => ({
          ...user,
          role: rolesMap.get(user.id) || 'user',
        }))
      );
    } catch (err: any) {
      console.error('Error loading users:', err);
      toast({ title: "Error", description: "Failed to load users", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId: string, newRole: typeof ROLE_OPTIONS[number]) => {
    try {
      setUpdating(true);

      const { error: userError } = await supabase
        .from("users")
        .update({ role: newRole })
        .eq("id", userId);

      if (userError) throw userError;

      const authRole = newRole === "owner" ? "admin" : newRole === "helper" ? "user" : newRole;
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existingRole) {
        const { error } = await supabase
          .from("user_roles")
          .update({ role: authRole })
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: authRole });

        if (error) throw error;
      }

      toast({ title: "Success", description: `Role updated to ${newRole}` });
      setIsRoleDialogOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (err: any) {
      console.error('Error updating role:', err);
      toast({ title: "Error", description: err?.message || "Failed to update role", variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) return;

    try {
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", userId);

      if (error) throw error;

      toast({ title: "Success", description: "User deleted successfully" });
      loadUsers();
    } catch (err: any) {
      console.error('Error deleting user:', err);
      toast({ title: "Error", description: err?.message || "Failed to delete user", variant: "destructive" });
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setEditUsername(user.username);
    setIsEditDialogOpen(true);
  };

  const handleUpdateUsername = async () => {
    if (!editingUser) return;

    const nextUsername = editUsername.trim();
    if (!isValidUsername(nextUsername)) {
      toast({
        title: "Invalid username",
        description: "Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUpdating(true);

      const { data: existingUsers, error: lookupError } = await supabase
        .from("users")
        .select("id")
        .ilike("username", nextUsername)
        .neq("id", editingUser.id)
        .limit(1);

      if (lookupError) throw lookupError;
      if (existingUsers && existingUsers.length > 0) {
        throw new Error("That username is already taken.");
      }

      const { error } = await supabase
        .from("users")
        .update({
          username: nextUsername,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingUser.id);

      if (error) throw error;

      toast({ title: "Success", description: "Username updated successfully" });
      setIsEditDialogOpen(false);
      setEditingUser(null);
      loadUsers();
    } catch (err: any) {
      console.error("Error updating username:", err);
      toast({ title: "Error", description: err?.message || "Failed to update username", variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role.toLowerCase() === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case "owner": return "destructive";
      case "admin": return "destructive";
      case "moderator": return "default";
      case "helper": return "secondary";
      default: return "outline";
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Users">
        <div className="flex items-center justify-center py-20">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Users">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Total Users", value: allUsers.length.toString() },
            { label: "Admins", value: allUsers.filter(u => u.role === 'admin').length.toString() },
            { label: "Moderators", value: allUsers.filter(u => u.role === 'moderator').length.toString() },
            { label: "Members", value: allUsers.filter(u => u.role === 'user').length.toString() },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold font-display">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="helper">Helper</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              All Users ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">User</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Role</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Joined</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-muted-foreground">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt={user.username} className="h-10 w-10 rounded-full object-cover" />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="font-medium text-primary">{user.username[0]?.toUpperCase()}</span>
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{user.username}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">{user.role}</Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setSelectedUser(user); setIsRoleDialogOpen(true); }}>
                                <Shield className="h-4 w-4 mr-2" />
                                Change Role
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit Username
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleDeleteUser(user.id, user.username)}
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Change Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Select a new role for {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-4">
            {ROLE_OPTIONS.map((role) => (
              <Button
                key={role}
                variant={selectedUser?.role === role ? "default" : "outline"}
                className="w-full justify-between capitalize"
                onClick={() => selectedUser && handleChangeRole(selectedUser.id, role)}
                disabled={updating}
              >
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {role}
                </span>
                {selectedUser?.role === role && <Check className="h-4 w-4" />}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update the username for {editingUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                placeholder="Enter a new username"
              />
            </div>
            <Button className="w-full btn-primary-gradient" onClick={handleUpdateUsername} disabled={updating}>
              {updating ? "Saving..." : "Save Username"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
