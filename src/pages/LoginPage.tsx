// %%__NONCE_LOGIN_PAGE_11_%%
// %%__RESOURCE_%%
// %%__TIMESTAMP_%%
/**
 * ============================================================
 * Login Page - Protected by BuiltByBit Anti-Piracy
 * © 2024-2026 ZCraft. All rights reserved.
 * ============================================================
 */

import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Loader, Mail } from "lucide-react";
import { ensureIntegrityPulse } from "@/lib/_ig";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, sendMagicLink, signInWithDiscord, signInWithGithub, signInWithGoogle } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  useEffect(() => {
    ensureIntegrityPulse();
  }, []);

  const resolveEmail = async (ident: string) => {
    const normalized = ident.trim();
    if (!normalized) {
      throw new Error('Email or username required');
    }

    if (normalized.includes("@")) {
      return normalized.toLowerCase();
    }

    const { data, error } = await supabase.rpc('get_email_by_username', {
      lookup_username: normalized,
    });

    if (error || !data) {
      throw new Error('User not found. Try signing in with your email address.');
    }

    return data as string;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const email = await resolveEmail(identifier.trim());
      await login(email, password);
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      toast({ title: 'Signed in', description: 'Welcome back!' });
      navigate(aalData?.nextLevel === 'aal2' && aalData?.currentLevel !== 'aal2' ? '/verify-identity' : '/profile');
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Sign in failed', description: err?.message || 'Check your credentials.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleMagicLink = async () => {
    if (!identifier.trim()) {
      toast({ title: 'Email or username required', description: 'Enter your email or username first.', variant: 'destructive' });
      return;
    }

    try {
      setMagicLinkLoading(true);
      await sendMagicLink(identifier.trim());
      toast({
        title: 'Magic link sent',
        description: 'Check your inbox for a sign-in link.',
      });
    } catch (err: any) {
      toast({
        title: 'Magic link failed',
        description: err?.message || 'Unable to send the magic link.',
        variant: 'destructive',
      });
    } finally {
      setMagicLinkLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'discord' | 'github' | 'google') => {
    setOauthLoading(provider);
    try {
      if (provider === 'discord') {
        await signInWithDiscord();
      } else if (provider === 'github') {
        await signInWithGithub();
      } else if (provider === 'google') {
        await signInWithGoogle();
      }
    } catch (err: any) {
      toast({ title: `${provider} sign-in failed`, description: err?.message });
      setOauthLoading(null);
    }
  };
  return (
    <Layout seo={{
      title: "Login to ZCraft Network — Access Your Minecraft Account",
      description: "Sign in to your ZCraft Network account to access forums, profile management, and exclusive Minecraft lifesteal SMP server features.",
      keywords: "login zcraft, minecraft login, account login, zcraft network login, server account, lifesteal login",
      url: "/login",
      type: "website",
      noindex: false,
      tags: ["login", "account", "authentication"]
    }}>
      <section className="py-16 lg:py-24 min-h-[70vh] flex items-center">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto border-0 bg-card card-hover">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-400 shadow-lg">
                  <span className="font-display text-2xl font-bold text-white">Z</span>
                </div>
              </div>
              <CardTitle className="font-display text-2xl">Welcome Back</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Sign in to your ZCraft account</p>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="identifier">Email or Username</Label>
                  <Input id="identifier" value={identifier} onChange={(e) => setIdentifier(e.target.value)} type="text" placeholder="Enter your email or username" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input id="password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Enter your password" />
                </div>
                <Button type="submit" disabled={submitting} className="w-full btn-primary-gradient">{submitting ? 'Signing in...' : 'Sign In'}</Button>
              </form>
              <Button
                type="button"
                variant="secondary"
                className="w-full gap-2"
                onClick={handleMagicLink}
                disabled={magicLinkLoading || submitting}
              >
                {magicLinkLoading ? <Loader className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                {magicLinkLoading ? 'Sending magic link...' : 'Email Me A Magic Link'}
              </Button>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full gap-1 text-xs" 
                  disabled={oauthLoading !== null}
                  onClick={() => handleOAuthSignIn('discord')}
                >
                  {oauthLoading === 'discord' ? <Loader className="h-4 w-4 animate-spin" /> : 
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>}
                  Discord
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full gap-1 text-xs"
                  disabled={oauthLoading !== null}
                  onClick={() => handleOAuthSignIn('github')}
                >
                  {oauthLoading === 'github' ? <Loader className="h-4 w-4 animate-spin" /> :
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>}
                  GitHub
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full gap-1 text-xs"
                  disabled={oauthLoading !== null}
                  onClick={() => handleOAuthSignIn('google')}
                >
                  {oauthLoading === 'google' ? <Loader className="h-4 w-4 animate-spin" /> :
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>}
                  Google
                </Button>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
