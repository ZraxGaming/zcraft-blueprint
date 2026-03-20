import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, MessageSquare, FileText, Bell, User, Loader, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { ProfilePicture } from "@/components/ui/ProfilePicture";
import { toast } from "@/components/ui/use-toast";
import { getMyEmailPreferences, setMyEmailPreference, type EmailPreferenceMap } from "@/services/emailPreferenceService";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, userProfile, loading: authLoading, updateProfile, changePassword, sendPasswordReauthCode } = useAuth();
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordNonce, setPasswordNonce] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [sendingNonce, setSendingNonce] = useState(false);
  const [emailPreferences, setEmailPreferences] = useState<EmailPreferenceMap>({
    marketing: true,
    recruitment: true,
  });
  const [savingEmailPreference, setSavingEmailPreference] = useState<null | "marketing" | "recruitment">(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    const fetchUserPosts = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("forum_posts")
          .select("id, title, created_at, forum:forum_id(title)")
          .eq("author_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (!error && data) {
          setUserPosts(data);
        }
      } catch (err) {
        console.error("Error fetching user posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [user, authLoading, navigate]);

  useEffect(() => {
    setUsername(userProfile?.username || "");
    setBio(userProfile?.bio || "");
  }, [userProfile?.bio, userProfile?.username]);

  useEffect(() => {
    const loadEmailPreferences = async () => {
      if (!user?.id) return;

      try {
        const next = await getMyEmailPreferences(user.id);
        setEmailPreferences(next);
      } catch (error) {
        console.error("Failed to load email preferences:", error);
      }
    };

    loadEmailPreferences();
  }, [user?.id]);

  if (authLoading || loading) {
    return (
      <Layout
        seo={{
          title: "ZCraft Network Profile â€” Manage Your Minecraft Account",
          description: "View and manage your ZCraft Network profile, forum posts, account settings, and Minecraft lifesteal SMP server statistics.",
          keywords: "zcraft profile, minecraft profile, player profile, account settings, forum posts, lifesteal profile, server statistics",
          url: "/profile",
          type: "profile",
          noindex: false,
          tags: ["profile", "account", "settings", "forum posts"],
        }}
      >
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!user || !userProfile) {
    return (
      <Layout
        seo={{
          title: "ZCraft Network Profile â€” Manage Your Minecraft Account",
          description: "View and manage your ZCraft Network profile, forum posts, account settings, and Minecraft lifesteal SMP server statistics.",
          keywords: "zcraft profile, minecraft profile, player profile, account settings, forum posts, lifesteal profile, server statistics",
          url: "/profile",
          type: "profile",
          noindex: false,
          tags: ["profile", "account", "settings", "forum posts"],
        }}
      >
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Please log in to view your profile.</p>
          <Button className="mt-4" onClick={() => navigate("/login")}>Go to Login</Button>
        </div>
      </Layout>
    );
  }

  const joinDate = new Date(userProfile.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      await updateProfile({ username, bio });
      toast({
        title: "Profile updated",
        description: "Your profile changes have been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error?.message || "Failed to update your profile.",
        variant: "destructive",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!userProfile.email) return;

    try {
      setSendingReset(true);
      const { error } = await supabase.auth.resetPasswordForEmail(userProfile.email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Reset email sent",
        description: "Check your inbox for a password reset link.",
      });
    } catch (error: any) {
      toast({
        title: "Reset failed",
        description: error?.message || "Failed to send password reset email.",
        variant: "destructive",
      });
    } finally {
      setSendingReset(false);
    }
  };

  const handleSendPasswordNonce = async () => {
    try {
      setSendingNonce(true);
      await sendPasswordReauthCode();
      toast({
        title: "Security code sent",
        description: "Check your email for the password change verification code.",
      });
    } catch (error: any) {
      toast({
        title: "Unable to send code",
        description: error?.message || "Password re-authentication could not be started.",
        variant: "destructive",
      });
    } finally {
      setSendingNonce(false);
    }
  };

  const handleChangePassword = async () => {
    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Enter the same password in both fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUpdatingPassword(true);
      await changePassword(password, passwordNonce.trim() || undefined);
      setPassword("");
      setConfirmPassword("");
      setPasswordNonce("");
      toast({
        title: "Password changed",
        description: "Your account password has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Password update failed",
        description: error?.message || "Unable to update your password.",
        variant: "destructive",
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleToggleEmailPreference = async (category: "marketing" | "recruitment", enabled: boolean) => {
    if (!user?.id) return;

    try {
      setSavingEmailPreference(category);
      await setMyEmailPreference(user.id, category, enabled);
      setEmailPreferences((prev) => ({ ...prev, [category]: enabled }));
      toast({
        title: "Email preference updated",
        description: `${category === "marketing" ? "Marketing" : "Recruitment"} emails ${enabled ? "enabled" : "disabled"}.`,
      });
    } catch (error: any) {
      toast({
        title: "Preference update failed",
        description: error?.message || "Could not update your email preference.",
        variant: "destructive",
      });
    } finally {
      setSavingEmailPreference(null);
    }
  };

  return (
    <Layout
      seo={{
        title: `${userProfile.username}'s Profile â€” ZCraft Network Minecraft Player`,
        description: `View ${userProfile.username}'s profile on ZCraft Network. Check out forum posts, join date, and activity on our premier Minecraft lifesteal SMP server.`,
        keywords: `zcraft profile, ${userProfile.username} profile, minecraft player profile, lifesteal player, server member, forum posts, ${userProfile.username}`,
        url: "/profile",
        type: "profile",
        tags: ["profile", "player", "forum posts", "minecraft"],
      }}
    >
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 bg-card mb-8">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <ProfilePicture size="xl" className="h-24 w-24 rounded-2xl" />
                  <div className="text-center md:text-left flex-1">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                      <h1 className="font-display text-2xl font-bold">{userProfile.username}</h1>
                      <Badge className={`${userProfile.role === "admin" ? "bg-red-500/10 text-red-600" : userProfile.role === "moderator" ? "bg-blue-500/10 text-blue-600" : "bg-primary/10 text-primary"}`}>
                        {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">Member since {joinDate}</p>
                    {userProfile.bio && <p className="text-foreground mb-4">{userProfile.bio}</p>}
                    <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm">
                      <div>
                        <span className="font-semibold text-foreground">{userPosts.length}</span>{" "}
                        <span className="text-muted-foreground">Posts</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="gap-2" onClick={() => setActiveTab("settings")}>
                    <Settings className="h-4 w-4" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full flex-wrap h-auto gap-2 bg-transparent p-0 mb-6">
                <TabsTrigger value="posts" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <MessageSquare className="h-4 w-4" />
                  Posts
                </TabsTrigger>
                <TabsTrigger value="threads" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <FileText className="h-4 w-4" />
                  Threads
                </TabsTrigger>
                <TabsTrigger value="notifications" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Bell className="h-4 w-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="posts">
                <Card className="border-0 bg-card">
                  <CardHeader>
                    <CardTitle className="font-display text-lg">Recent Posts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {userPosts.length > 0 ? (
                      userPosts.map((post) => (
                        <div key={post.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                          <div>
                            <h4 className="font-medium">{post.title}</h4>
                            <p className="text-sm text-muted-foreground">in {post.forum?.title || "General"}</p>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No posts yet</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="threads">
                <Card className="border-0 bg-card">
                  <CardHeader>
                    <CardTitle className="font-display text-lg">Your Threads</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center py-8">
                      You have created {userPosts.length} threads.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications">
                <Card className="border-0 bg-card">
                  <CardHeader>
                    <CardTitle className="font-display text-lg">Notifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center py-8">No new notifications</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card className="border-0 bg-card">
                  <CardHeader>
                    <CardTitle className="font-display text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Account Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <ProfilePicture size="lg" className="h-16 w-16 rounded-xl" editable={true} />
                        <div>
                          <h3 className="font-medium">Profile Picture</h3>
                          <p className="text-sm text-muted-foreground">
                            Upload a custom avatar or use your OAuth provider's image
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input disabled value={userProfile.email} />
                      </div>
                      <div className="space-y-2">
                        <Label>Username</Label>
                        <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your username" />
                      </div>
                      <div className="space-y-2">
                        <Label>Bio</Label>
                        <Input value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself" />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button className="btn-primary-gradient" onClick={handleSaveProfile} disabled={savingProfile}>
                        {savingProfile ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button variant="outline" onClick={handlePasswordReset} disabled={sendingReset}>
                        {sendingReset ? "Sending..." : "Send Reset Link"}
                      </Button>
                    </div>

                    <div className="rounded-2xl border border-border/60 bg-muted/20 p-5 space-y-5">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="font-semibold flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                            Security
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            This account uses email-based reset and re-authentication codes.
                          </p>
                        </div>
                        <Badge variant="secondary">Email verification</Badge>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="new-password-profile">New Password</Label>
                          <Input
                            id="new-password-profile"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter a strong password"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password-profile">Confirm Password</Label>
                          <Input
                            id="confirm-password-profile"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter your password"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password-nonce">Email Security Code (optional)</Label>
                        <Input
                          id="password-nonce"
                          value={passwordNonce}
                          onChange={(e) => setPasswordNonce(e.target.value)}
                          placeholder="Use this if secure password change asks for re-authentication"
                        />
                        <div className="flex flex-wrap gap-3">
                          <Button variant="outline" onClick={handleSendPasswordNonce} disabled={sendingNonce}>
                            {sendingNonce ? "Sending..." : "Send Security Code"}
                          </Button>
                          <Button onClick={handleChangePassword} disabled={updatingPassword}>
                            {updatingPassword ? "Updating..." : "Update Password"}
                          </Button>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        Authenticator app and passkey setup were removed from this page because your current Supabase project is not reliably supporting them. Email-based security actions remain available.
                      </p>

                      <div className="space-y-4 rounded-xl border border-border/60 bg-background/70 p-4">
                        <div>
                          <h4 className="font-medium">Optional Email Preferences</h4>
                          <p className="text-sm text-muted-foreground">
                            You can opt out of marketing and recruitment emails. Security, password, manual admin alerts, and core site updates still send.
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-medium">Marketing Emails</p>
                            <p className="text-sm text-muted-foreground">Promotions, sales, and similar optional campaigns.</p>
                          </div>
                          <Switch
                            checked={emailPreferences.marketing}
                            disabled={savingEmailPreference !== null}
                            onCheckedChange={(checked) => handleToggleEmailPreference("marketing", checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-medium">Recruitment Emails</p>
                            <p className="text-sm text-muted-foreground">Application opening and recruitment availability notices.</p>
                          </div>
                          <Switch
                            checked={emailPreferences.recruitment}
                            disabled={savingEmailPreference !== null}
                            onCheckedChange={(checked) => handleToggleEmailPreference("recruitment", checked)}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
    </Layout>
  );
}
