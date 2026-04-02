// %%__NONCE_DISCORD_CALLBACK_19_%%
// %%__RESOURCE_TITLE_%%
// %%__BUILTBYBIT_%%

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Loader } from 'lucide-react';

/**
 * Discord OAuth Callback Handler
 * Handles the callback from Discord OAuth after user authorizes the app
 */
export default function DiscordCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Processing Discord authentication...');

  useEffect(() => {
    const handleDiscordCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const state = searchParams.get('state');

        if (error) {
          console.error('Discord OAuth error:', error);
          toast({
            title: 'Discord authentication failed',
            description: 'Authentication was cancelled or failed.',
            variant: 'destructive',
          });
          navigate('/login');
          return;
        }

        if (!code) {
          console.error('No authorization code received from Discord');
          toast({
            title: 'Authentication failed',
            description: 'No authorization code received.',
            variant: 'destructive',
          });
          navigate('/login');
          return;
        }

        setMessage('Redirecting to auth callback...');
        navigate(`/auth/callback${window.location.search}`);
      } catch (err: any) {
        console.error('Discord callback error:', err);
        toast({
          title: 'Authentication error',
          description: err?.message || 'An error occurred during Discord sign-in.',
          variant: 'destructive',
        });
        navigate('/login');
      }
    };

    handleDiscordCallback();
  }, [navigate, searchParams]);

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
        <p className="text-sm text-muted-foreground">
          Discord now uses the shared OAuth callback flow.
        </p>
      </div>
    </div>
  );
}
