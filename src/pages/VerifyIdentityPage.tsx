import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Loader, KeyRound, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

type VerifiedFactor = {
  id: string;
  friendly_name?: string;
  factor_type: "totp" | "webauthn" | "phone";
  status: "verified" | "unverified";
};

export default function VerifyIdentityPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [factors, setFactors] = useState<VerifiedFactor[]>([]);
  const [aalRequired, setAalRequired] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  const totpFactors = useMemo(
    () => factors.filter((factor) => factor.factor_type === "totp"),
    [factors],
  );
  const passkeyFactors = useMemo(
    () => factors.filter((factor) => factor.factor_type === "webauthn"),
    [factors],
  );

  useEffect(() => {
    const loadState = async () => {
      if (!user) {
        setPageLoading(false);
        return;
      }

      const [{ data: aalData, error: aalError }, { data: factorData, error: factorError }] = await Promise.all([
        supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
        supabase.auth.mfa.listFactors(),
      ]);

      if (aalError) {
        toast({
          title: "Verification check failed",
          description: aalError.message,
          variant: "destructive",
        });
      }

      if (factorError) {
        toast({
          title: "Unable to load security factors",
          description: factorError.message,
          variant: "destructive",
        });
      }

      const verifiedFactors = ((factorData?.all || []) as VerifiedFactor[]).filter(
        (factor) => factor.status === "verified",
      );
      setFactors(verifiedFactors);

      const needsMfa = aalData?.nextLevel === "aal2" && aalData?.currentLevel !== "aal2";
      setAalRequired(Boolean(needsMfa));

      if (!needsMfa || verifiedFactors.length === 0) {
        navigate("/profile", { replace: true });
        return;
      }

      setPageLoading(false);
    };

    if (!loading) {
      loadState();
    }
  }, [loading, navigate, user]);

  const handleTotpVerify = async (factorId: string) => {
    if (!totpCode.trim()) {
      toast({
        title: "Code required",
        description: "Enter the authenticator code first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setVerifyingId(factorId);
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeError || !challengeData) {
        throw challengeError || new Error("Unable to start verification.");
      }

      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: totpCode.trim(),
      });

      if (error) throw error;

      toast({
        title: "Verification complete",
        description: "Your session is now protected with MFA.",
      });
      navigate("/profile", { replace: true });
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error?.message || "Unable to verify the authenticator code.",
        variant: "destructive",
      });
    } finally {
      setVerifyingId(null);
    }
  };

  const handlePasskeyVerify = async (factorId: string) => {
    try {
      setVerifyingId(factorId);
      const { error } = await supabase.auth.mfa.webauthn.authenticate({ factorId });
      if (error) throw error;

      toast({
        title: "Passkey accepted",
        description: "Your sign-in is fully verified.",
      });
      navigate("/profile", { replace: true });
    } catch (error: any) {
      toast({
        title: "Passkey verification failed",
        description: error?.message || "Unable to verify the passkey.",
        variant: "destructive",
      });
    } finally {
      setVerifyingId(null);
    }
  };

  if (pageLoading) {
    return (
      <Layout seo={{ title: "Verify Identity - ZCraft Network", url: "/verify-identity", type: "website", noindex: true }}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!user || !aalRequired) {
    return null;
  }

  return (
    <Layout
      seo={{
        title: "Verify Identity - ZCraft Network",
        description: "Complete MFA verification for your ZCraft account.",
        url: "/verify-identity",
        type: "website",
        noindex: true,
        tags: ["mfa", "security"],
      }}
    >
      <section className="py-16 lg:py-24 min-h-[70vh] flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto grid gap-6 lg:grid-cols-2">
            <Card className="border-0 bg-card">
              <CardHeader>
                <CardTitle className="font-display text-xl flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Verify Your Identity
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Your account requires a second factor before the session is fully trusted.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Badge variant="secondary">MFA Required</Badge>
                <p className="text-sm text-muted-foreground">
                  Use one of your verified factors below. If malware steals an active session token, MFA alone cannot fully stop that device, but it does block password-only takeover.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-card">
              <CardHeader>
                <CardTitle className="font-display text-xl">Available Factors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {totpFactors.map((factor) => (
                  <div key={factor.id} className="rounded-xl border border-border/60 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{factor.friendly_name || "Authenticator app"}</p>
                        <p className="text-sm text-muted-foreground">Enter the 6-digit code from your authenticator app.</p>
                      </div>
                      <Badge>Authenticator</Badge>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`totp-${factor.id}`}>Authenticator Code</Label>
                      <Input
                        id={`totp-${factor.id}`}
                        inputMode="numeric"
                        maxLength={6}
                        value={totpCode}
                        onChange={(event) => setTotpCode(event.target.value)}
                        placeholder="123456"
                      />
                    </div>
                    <Button className="w-full" disabled={verifyingId !== null} onClick={() => handleTotpVerify(factor.id)}>
                      {verifyingId === factor.id ? <Loader className="h-4 w-4 animate-spin" /> : "Verify Code"}
                    </Button>
                  </div>
                ))}

                {passkeyFactors.map((factor) => (
                  <div key={factor.id} className="rounded-xl border border-border/60 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{factor.friendly_name || "Security key or passkey"}</p>
                        <p className="text-sm text-muted-foreground">Approve the passkey prompt on this device.</p>
                      </div>
                      <Badge variant="outline">Passkey</Badge>
                    </div>
                    <Button className="w-full" variant="secondary" disabled={verifyingId !== null} onClick={() => handlePasskeyVerify(factor.id)}>
                      {verifyingId === factor.id ? <Loader className="h-4 w-4 animate-spin" /> : <><KeyRound className="h-4 w-4" /> Use Passkey</>}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}
