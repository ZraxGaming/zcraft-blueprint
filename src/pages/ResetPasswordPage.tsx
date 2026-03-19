import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { Loader, ShieldCheck } from "lucide-react";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { session, loading, changePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !session) {
      toast({
        title: "Recovery session missing",
        description: "Open the password reset link from your email again.",
        variant: "destructive",
      });
      navigate("/forgot-password", { replace: true });
    }
  }, [loading, navigate, session]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Enter the same password in both fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      await changePassword(password);
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
      navigate("/profile", { replace: true });
    } catch (error: any) {
      toast({
        title: "Password update failed",
        description: error?.message || "Unable to update your password.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout
      seo={{
        title: "Set New Password - ZCraft Network",
        description: "Finish resetting your ZCraft Network account password.",
        url: "/reset-password",
        type: "website",
        noindex: true,
        tags: ["password reset", "security"],
      }}
    >
      <section className="py-16 lg:py-24 min-h-[70vh] flex items-center">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto border-0 bg-card card-hover">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck className="h-7 w-7" />
                </div>
              </div>
              <CardTitle className="font-display text-2xl">Set A New Password</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Choose a new password for your account.
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter a strong password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Enter the password again"
                  />
                </div>
                <Button type="submit" className="w-full btn-primary-gradient" disabled={submitting || loading}>
                  {submitting ? <Loader className="h-4 w-4 animate-spin" /> : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
