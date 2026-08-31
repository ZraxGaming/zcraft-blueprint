// %%__NONCE_AUTH_CALLBACK_20_%%
// %%__VERSION_%%
// %%__RESOURCE_%%

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Loader } from 'lucide-react';
import { sendLoginAlert } from '@/services/securityAlertService';
import { trackAnalyticsEvent } from '@/services/analyticsService';

/**
 * OAuth Callback Handler
 * Handles redirects from Supabase OAuth providers (Google, GitHub, Discord)
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Completing authentication...');

  const getBrowserContext = () => ({
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
    locale: navigator.language || navigator.languages?.[0] || null,
    browser: navigator.userAgent || null,
  });

  const shouldSendLoginAlert = (userId: string) => {
    if (typeof window === 'undefined') return true;
    const key = `zcraft-login-alert-${userId}`;
    const lastSent = Number(window.localStorage.getItem(key) || 0);
    const tenMinutes = 10 * 60 * 1000;
    if (Date.now() - lastSent > tenMinutes) {
      window.localStorage.setItem(key, Date.now().toString());
      return true;
    }
    return false;
  };

  const formatLoginMethod = (method: string) => {
    const normalized = method.toLowerCase().trim();

    if (normalized === 'password' || normalized === 'email') return 'Email / Password';
    if (normalized === 'magiclink' || normalized === 'otp') return 'Magic Link / OTP';
    if (normalized === 'discord') return 'Discord OAuth';
    if (normalized === 'github') return 'GitHub OAuth';
    if (normalized === 'google') return 'Google OAuth';

    return method
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const queryParams = new URLSearchParams(window.location.search);
        const authType = hashParams.get('type') || queryParams.get('type');

        // Get session from URL hash (Supabase adds tokens there after OAuth)
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (session?.user) {
          if (authType === 'recovery') {
            navigate('/reset-password', { replace: true });
            return;
          }

          const discordIdentity = session.user.identities?.find((identity) => identity.provider === 'discord');
          const discordId =
            discordIdentity?.id ||
            session.user.user_metadata?.provider_id ||
            session.user.user_metadata?.sub ||
            null;
          const provider =
            session.user.identities?.[0]?.provider || session.user.app_metadata?.provider;
          const avatarUrl =
            session.user.user_metadata?.avatar_url ||
            session.user.user_metadata?.picture ||
            null;
          const username =
            session.user.user_metadata?.preferred_username ||
            session.user.user_metadata?.user_name ||
            session.user.user_metadata?.username ||
            session.user.user_metadata?.name ||
            session.user.user_metadata?.full_name ||
            session.user.email?.split('@')[0] ||
            'User';

          // Check if user profile exists
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('username')
            .eq('id', session.user.id)
            .single();

          if (profileError && profileError.code === 'PGRST116') {
            // Profile doesn't exist, create it (trigger should have done this but just in case)
            setMessage('Setting up your profile...');
            
            await supabase.from('users').insert({
              id: session.user.id,
              email: session.user.email || '',
              username,
              avatar_url: avatarUrl,
              discord_id: provider === 'discord' ? discordId : null,
            });
          } else if (!profileError) {
            const updates: Record<string, string> = {};

            if (avatarUrl) {
              updates.avatar_url = avatarUrl;
            }

            if (provider === 'discord' && discordId) {
              updates.discord_id = discordId;
            }

            if (Object.keys(updates).length > 0) {
              await supabase
                .from('users')
                .update(updates)
                .eq('id', session.user.id);
            }
          } else if (profileError) {
            throw profileError;
          }

          toast({ 
            title: 'Signed in successfully!', 
            description: `Welcome${profile?.username ? `, ${profile.username}` : ''}!` 
          });
          trackAnalyticsEvent("user_login", {
            method: formatLoginMethod(provider || authType || 'email'),
            provider: provider || authType || 'email',
            user_id: session.user.id,
            email: session.user.email || undefined,
          });
          if (session.access_token && shouldSendLoginAlert(session.user.id)) {
            const browserContext = getBrowserContext();
            sendLoginAlert(
              session.access_token,
              formatLoginMethod(provider || authType || 'email'),
              username,
              browserContext
            ).catch((alertError) => {
              console.warn('Login alert email failed:', alertError);
            });
          }
          const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
          navigate(aalData?.nextLevel === 'aal2' && aalData?.currentLevel !== 'aal2' ? '/verify-identity' : '/profile');
        } else {
          // No session, something went wrong
          toast({ 
            title: 'Authentication failed', 
            description: 'Unable to complete sign-in. Please try again.' 
          });
          navigate('/login');
        }
      } catch (err: any) {
        console.error('Auth callback error:', err);
        toast({ 
          title: 'Authentication error', 
          description: err?.message || 'An error occurred during sign-in.' 
        });
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader className="h-8 w-8 text-primary animate-spin" />
            </div>
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          </div>
        </div>
        <p className="text-muted-foreground animate-pulse">{message}</p>
      </div>
    </div>
  );
}
