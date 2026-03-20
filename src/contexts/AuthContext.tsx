import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { sendWebhook, WebhookEvent } from '@/services/webhookService';
import { uploadProfilePicture } from '@/services/storageService';
import { sendLoginAlert } from '@/services/securityAlertService';
import {
  sanitizeInput,
  isValidEmail,
  isValidUsername,
  isValidPassword,
  validateFileUpload,
  checkRateLimit,
  logSecurityEvent
} from '@/lib/security';

export type AppRole = 'owner' | 'admin' | 'moderator' | 'helper' | 'user';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  role: AppRole;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  sendMagicLink: (identifier: string) => Promise<void>;
  changePassword: (password: string, nonce?: string) => Promise<void>;
  sendPasswordReauthCode: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateProfilePicture: (file: File) => Promise<string>;
  signInWithDiscord: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  isAdmin: boolean;
  isModerator: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const fallbackAuthContext: AuthContextType = {
  user: null,
  userProfile: null,
  session: null,
  loading: false,
  login: async () => {
    throw new Error('Auth provider is not ready yet.');
  },
  register: async () => {
    throw new Error('Auth provider is not ready yet.');
  },
  logout: async () => {},
  sendMagicLink: async () => {
    throw new Error('Auth provider is not ready yet.');
  },
  changePassword: async () => {
    throw new Error('Auth provider is not ready yet.');
  },
  sendPasswordReauthCode: async () => {
    throw new Error('Auth provider is not ready yet.');
  },
  updateProfile: async () => {
    throw new Error('Auth provider is not ready yet.');
  },
  updateProfilePicture: async () => {
    throw new Error('Auth provider is not ready yet.');
  },
  signInWithDiscord: async () => {
    throw new Error('Auth provider is not ready yet.');
  },
  signInWithGithub: async () => {
    throw new Error('Auth provider is not ready yet.');
  },
  signInWithGoogle: async () => {
    throw new Error('Auth provider is not ready yet.');
  },
  isAdmin: false,
  isModerator: false,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const resolveEmailOrUsername = async (identifier: string) => {
    const sanitizedIdentifier = sanitizeInput(identifier, 254);
    if (sanitizedIdentifier.includes('@')) {
      if (!isValidEmail(sanitizedIdentifier)) {
        throw new Error('Please enter a valid email address.');
      }
      return sanitizedIdentifier;
    }

    const { data, error } = await supabase
      .from('users')
      .select('email')
      .eq('username', sanitizedIdentifier)
      .single();

    if (error || !data?.email) {
      throw new Error('User not found.');
    }

    return data.email as string;
  };

  // Fetch user profile and role from database
  const fetchUserProfile = async (userId: string) => {
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return;
      }

      // If no avatar_url but we have OAuth metadata, try to get it
      let avatarUrl = profileData.avatar_url;
      if (!avatarUrl && user) {
        const metadata = user.user_metadata;
        if (metadata) {
          // GitHub avatar
          if (metadata.avatar_url) {
            avatarUrl = metadata.avatar_url;
          }
          // Google avatar
          else if (metadata.picture) {
            avatarUrl = metadata.picture;
          }
          // Discord avatar (would be handled by backend)
        }
      }

      // Update profile with OAuth avatar if we found one
      if (avatarUrl && avatarUrl !== profileData.avatar_url) {
        await supabase
          .from('users')
          .update({ avatar_url: avatarUrl })
          .eq('id', userId);
        profileData.avatar_url = avatarUrl;
      }

      // Fetch user role using secure RPC function
      const { data: roleData } = await supabase
        .rpc('get_user_role', { _user_id: userId });

      const fallbackRole = (profileData.role as AppRole | null) || 'user';
      const role: AppRole = (roleData as AppRole) || fallbackRole;

      setUserProfile({
        ...profileData,
        role,
      } as UserProfile);
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        // Defer profile fetch to avoid deadlocks
        if (newSession?.user) {
          setTimeout(() => {
            fetchUserProfile(newSession.user.id);
          }, 0);
        } else {
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      
      if (initialSession?.user) {
        fetchUserProfile(initialSession.user.id);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState !== 'visible') return;

      const { data: { session: visibleSession } } = await supabase.auth.getSession();
      setSession(visibleSession);
      setUser(visibleSession?.user ?? null);

      if (visibleSession?.user) {
        fetchUserProfile(visibleSession.user.id);
      } else {
        setUserProfile(null);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const login = async (email: string, password: string) => {
    // Rate limiting
    const rateLimitKey = `login:${email.toLowerCase()}`;
    if (!checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)) { // 5 attempts per 15 minutes
      logSecurityEvent('RATE_LIMIT_EXCEEDED', { action: 'login', identifier: email });
      throw new Error('Too many login attempts. Please try again later.');
    }

    // Input validation
    const sanitizedEmail = sanitizeInput(email, 254);
    if (!isValidEmail(sanitizedEmail)) {
      throw new Error('Please enter a valid email address.');
    }

    const { error, data } = await supabase.auth.signInWithPassword({
      email: sanitizedEmail,
      password,
    });

    if (error) {
      logSecurityEvent('LOGIN_FAILED', { email: sanitizedEmail, error: error.message });
      throw error;
    }

    // Send webhook for user login
    if (data.user) {
      await sendWebhook(WebhookEvent.USER_LOGIN, {
        userId: data.user.id,
        email: data.user.email,
        lastSignInAt: data.user.last_sign_in_at,
      });

      if (data.session?.access_token) {
        sendLoginAlert(
          data.session.access_token,
          'password',
          data.user.user_metadata?.username || data.user.email?.split('@')[0] || null
        ).catch((alertError) => {
          console.warn('Login alert email failed:', alertError);
        });
      }
    }
  };

  const register = async (email: string, password: string, username: string) => {
    // Rate limiting
    const rateLimitKey = `register:${email.toLowerCase()}`;
    if (!checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000)) { // 3 attempts per hour
      logSecurityEvent('RATE_LIMIT_EXCEEDED', { action: 'register', email });
      throw new Error('Too many registration attempts. Please try again later.');
    }

    // Input validation
    const sanitizedEmail = sanitizeInput(email, 254);
    const sanitizedUsername = sanitizeInput(username, 30);

    if (!isValidEmail(sanitizedEmail)) {
      throw new Error('Please enter a valid email address.');
    }

    if (!isValidUsername(sanitizedUsername)) {
      throw new Error('Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens.');
    }

    if (!isValidPassword(password)) {
      throw new Error('Password must be at least 8 characters with at least one uppercase letter, one lowercase letter, and one number.');
    }

    const redirectUrl = `${window.location.origin}/auth/callback`;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: sanitizedEmail,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          username: sanitizedUsername,
        },
      },
    });

    if (authError) {
      logSecurityEvent('REGISTRATION_FAILED', { email: sanitizedEmail, username: sanitizedUsername, error: authError.message });
      throw authError;
    }

    if (!authData.user) throw new Error('Failed to create user');

    // Send webhook for user registration
    await sendWebhook(WebhookEvent.USER_REGISTERED, {
      userId: authData.user.id,
      email: authData.user.email,
      username: sanitizedUsername,
      createdAt: authData.user.created_at,
    });

  };

  const logout = async () => {
    const userId = user?.id;
    const userEmail = user?.email;

    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    // Send webhook for user logout
    if (userId) {
      await sendWebhook(WebhookEvent.USER_LOGOUT, {
        userId,
        email: userEmail,
      });
    }

    setUser(null);
    setUserProfile(null);
    setSession(null);
  };

  const sendMagicLink = async (identifier: string) => {
    const email = await resolveEmailOrUsername(identifier);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        shouldCreateUser: false,
      },
    });

    if (error) throw error;
  };

  const sendPasswordReauthCode = async () => {
    const { error } = await supabase.auth.reauthenticate();
    if (error) throw error;
  };

  const changePassword = async (password: string, nonce?: string) => {
    if (!isValidPassword(password)) {
      throw new Error('Password must be at least 8 characters with at least one uppercase letter, one lowercase letter, and one number.');
    }

    const { error } = await supabase.auth.updateUser({
      password,
      ...(nonce ? { nonce } : {}),
    });

    if (error) throw error;
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');

    // Sanitize input data
    const sanitizedUpdates: any = {};
    if (updates.username) {
      const sanitizedUsername = updates.username.trim().replace(/[<>\"'&]/g, '');

      if (!isValidUsername(sanitizedUsername)) {
        throw new Error('Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens.');
      }

      const { data: existingUsers, error: usernameError } = await supabase
        .from('users')
        .select('id')
        .ilike('username', sanitizedUsername)
        .neq('id', user.id)
        .limit(1);

      if (usernameError) throw usernameError;
      if (existingUsers && existingUsers.length > 0) {
        throw new Error('That username is already taken.');
      }

      sanitizedUpdates.username = sanitizedUsername;
    }
    if (updates.bio) {
      sanitizedUpdates.bio = updates.bio.trim().substring(0, 500).replace(/[<>\"'&]/g, '');
    }
    if (updates.avatar_url) {
      // Validate URL format
      try {
        new URL(updates.avatar_url);
        sanitizedUpdates.avatar_url = updates.avatar_url;
      } catch {
        throw new Error('Invalid avatar URL format');
      }
    }

    const { error } = await supabase
      .from('users')
      .update({
        ...sanitizedUpdates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) throw error;

    setUserProfile((prev) => prev ? { ...prev, ...sanitizedUpdates } : null);

    // Send webhook for profile update
    await sendWebhook(WebhookEvent.USER_PROFILE_UPDATED, {
      userId: user.id,
      email: user.email,
      updatedFields: Object.keys(sanitizedUpdates),
      updates: sanitizedUpdates,
    });
  };

  const updateProfilePicture = async (file: File): Promise<string> => {
    if (!user) throw new Error('No user logged in');

    // Validate file upload
    const validation = validateFileUpload(file, {
      maxSize: 2 * 1024 * 1024, // 2MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp']
    });

    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Upload image to storage
    const result = await uploadProfilePicture(file, user.id);
    if (result.error) {
      logSecurityEvent('FILE_UPLOAD_FAILED', { userId: user.id, error: result.error });
      throw new Error(result.error);
    }

    // Update user profile with new avatar URL
    await updateProfile({ avatar_url: result.url });

    return result.url;
  };

  const signInWithDiscord = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: import.meta.env.VITE_DISCORD_OAUTH_SCOPES || 'identify email guilds.join',
      },
    });

    if (error) throw error;
  };

  const signInWithGithub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  };

  const isAdmin = userProfile?.role === 'owner' || userProfile?.role === 'admin';
  const isModerator = userProfile?.role === 'moderator' || isAdmin;

  const value: AuthContextType = {
    user,
    userProfile,
    session,
    loading,
    login,
    register,
    logout,
    sendMagicLink,
    changePassword,
    sendPasswordReauthCode,
    updateProfile,
    updateProfilePicture,
    signInWithDiscord,
    signInWithGithub,
    signInWithGoogle,
    isAdmin,
    isModerator,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.warn('useAuth was called outside AuthProvider. Returning fallback auth context.');
    return fallbackAuthContext;
  }
  return context;
}
