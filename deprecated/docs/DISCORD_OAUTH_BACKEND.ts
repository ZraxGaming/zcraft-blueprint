/**
 * Discord OAuth Exchange Endpoint
 * 
 * This should be implemented in your backend (Node.js/Express, Python/FastAPI, etc.)
 * 
 * Endpoint: POST /api/auth/discord/exchange
 * Body: { code: string, state?: string }
 * 
 * Usage in frontend (already coded in DiscordCallbackPage.tsx):
 * const response = await fetch('/api/auth/discord/exchange', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ code, state })
 * });
 */

// ==================== EXPRESS.JS IMPLEMENTATION ====================

import express, { Router, Request, Response } from 'express';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

const router = Router();
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for admin operations
);

interface DiscordTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

interface DiscordUser {
  id: string;
  username: string;
  email?: string;
  avatar?: string | null;
  discriminator: string;
  public_flags?: number;
}

/**
 * POST /api/auth/discord/exchange
 * 
 * Exchange Discord authorization code for user session
 */
router.post('/auth/discord/exchange', async (req: Request, res: Response) => {
  try {
    const { code, state } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Missing authorization code' });
    }

    // Step 1: Exchange code for Discord access token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.VITE_DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.PUBLIC_URL || 'http://localhost:5173'}/auth/discord/callback`,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error('Discord token exchange failed:', error);
      return res.status(401).json({ error: 'Failed to exchange Discord code' });
    }

    const tokens = (await tokenResponse.json()) as DiscordTokenResponse;

    // Step 2: Fetch Discord user profile
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userResponse.ok) {
      return res.status(401).json({ error: 'Failed to fetch Discord profile' });
    }

    const discordUser = (await userResponse.json()) as DiscordUser;

    // Step 3: Generate password from Discord ID (for Supabase auth)
    // In production, use a secure random password and store Discord ID as identifier
    const discordAuthPassword = `discord_${discordUser.id}_${process.env.DISCORD_PASSWORD_SALT || 'salt'}`;

    // Step 4: Create or update user in Supabase
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, email')
      .eq('discord_id', discordUser.id)
      .single();

    let user, userError;
    let isNewUser = false;

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = no rows returned (expected for new users)
      console.error('Error fetching user:', fetchError);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!existingUser) {
      // Create new user
      isNewUser = true;
      const email = discordUser.email || `discord_${discordUser.id}@zcraft.local`;

      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email,
          username: discordUser.username,
          discord_id: discordUser.id,
          avatar_url: discordUser.avatar
            ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
            : null,
          role: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        return res.status(500).json({ error: 'Failed to create user' });
      }

      user = newUser;
    } else {
      // Update existing user with latest Discord data
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          username: discordUser.username,
          avatar_url: discordUser.avatar
            ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
            : null,
          updated_at: new Date().toISOString(),
        })
        .eq('discord_id', discordUser.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating user:', updateError);
        return res.status(500).json({ error: 'Failed to update user' });
      }

      user = updatedUser;
    }

    // Step 5: Create Supabase session
    // Option A: Use native Supabase auth (recommended)
    const email = user.email;
    
    // For OAuth users, we use a generated password based on Discord ID
    const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: discordAuthPassword,
    });

    // If sign-in fails for new user, create auth user first
    if (signInError && isNewUser) {
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: discordAuthPassword,
        email_confirm: true, // Confirm Discord emails by default
        user_metadata: {
          discord_id: discordUser.id,
          discord_username: discordUser.username,
        },
      });

      if (authError) {
        console.error('Error creating auth user:', authError);
        return res.status(500).json({ error: 'Failed to create session' });
      }

      // Now sign in
      const { data: newSession, error: signInError2 } = await supabase.auth.signInWithPassword({
        email,
        password: discordAuthPassword,
      });

      if (signInError2) {
        console.error('Error signing in after user creation:', signInError2);
        return res.status(500).json({ error: 'Failed to create session' });
      }

      return res.json({
        user,
        session: newSession.session,
        isNewUser: true,
      });
    } else if (signInError) {
      console.error('Error signing in:', signInError);
      return res.status(401).json({ error: 'Failed to create session' });
    }

    // Success!
    res.json({
      user,
      session: sessionData?.session,
      isNewUser,
    });
  } catch (error) {
    console.error('Discord OAuth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

// ==================== FASTAPI/PYTHON IMPLEMENTATION ====================

/**
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
import os
from datetime import datetime
from supabase import create_client, Client

router = APIRouter()
supabase: Client = create_client(
    os.getenv("VITE_SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

class DiscordCodeRequest(BaseModel):
    code: str
    state: str = None

@router.post("/api/auth/discord/exchange")
async def exchange_discord_code(request: DiscordCodeRequest):
    try:
        # Step 1: Exchange code for token
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://discord.com/api/oauth2/token",
                data={
                    "client_id": os.getenv("VITE_DISCORD_CLIENT_ID"),
                    "client_secret": os.getenv("DISCORD_CLIENT_SECRET"),
                    "grant_type": "authorization_code",
                    "code": request.code,
                    "redirect_uri": f"{os.getenv('PUBLIC_URL', 'http://localhost:5173')}/auth/discord/callback"
                }
            )
            
            if token_response.status_code != 200:
                raise HTTPException(status_code=401, detail="Failed to exchange code")
            
            tokens = token_response.json()
            
            # Step 2: Fetch user
            user_response = await client.get(
                "https://discord.com/api/users/@me",
                headers={"Authorization": f"Bearer {tokens['access_token']}"}
            )
            
            if user_response.status_code != 200:
                raise HTTPException(status_code=401, detail="Failed to fetch user")
            
            discord_user = user_response.json()
        
        # Step 3: Create/update user in Supabase
        discord_id = discord_user["id"]
        email = discord_user.get("email") or f"discord_{discord_id}@zcraft.local"
        
        existing_user = supabase.table("users").select("*").eq("discord_id", discord_id).execute()
        
        if not existing_user.data:
            # Create new user
            user_data = {
                "email": email,
                "username": discord_user["username"],
                "discord_id": discord_id,
                "avatar_url": f"https://cdn.discordapp.com/avatars/{discord_id}/{discord_user['avatar']}.png" if discord_user.get("avatar") else None,
                "role": "user",
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            user = supabase.table("users").insert(user_data).execute().data[0]
            is_new = True
        else:
            # Update existing user
            user = existing_user.data[0]
            is_new = False
        
        # Step 4: Create session (would need custom implementation)
        # Return user data and session info
        return {
            "user": user,
            "isNewUser": is_new
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
*/

// ==================== ENVIRONMENT VARIABLES ====================

/**
# Backend .env file:

# Discord OAuth
VITE_DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_PASSWORD_SALT=your_secure_random_salt

# Supabase
VITE_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App
PUBLIC_URL=https://yourdomain.com
NODE_ENV=production
PORT=3001
*/

// ==================== TESTING ====================

/**
# Test with curl:

curl -X POST http://localhost:3001/api/auth/discord/exchange \
  -H "Content-Type: application/json" \
  -d '{"code":"AUTHORIZATION_CODE_FROM_DISCORD"}'

# Response should be:
{
  "user": {
    "id": "uuid",
    "email": "user@discord.com",
    "username": "discordusername",
    "discord_id": "123456789",
    "avatar_url": "https://cdn.discordapp.com/...",
    "role": "user"
  },
  "session": {
    "access_token": "...",
    "refresh_token": "...",
    "expires_in": 3600
  },
  "isNewUser": true
}
*/
