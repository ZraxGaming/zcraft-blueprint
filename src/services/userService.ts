import { supabase } from '@/integrations/supabase/client';
import { sendWebhook, WebhookEvent } from './webhookService';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  minecraft_name: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

// Get all users
export async function getAllUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as User[];
}

// Get single user by ID
export async function getUser(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data as User;
}

// Get user by username
export async function getUserByUsername(username: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (error) throw error;
  return data as User;
}

// Update user
export async function updateUser(userId: string, updates: Partial<User>) {
  const { data, error } = await supabase
    .from('users')
    .update({
      username: updates.username,
      avatar_url: updates.avatar_url,
      bio: updates.bio,
      minecraft_name: updates.minecraft_name,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as User;
}

// Delete user
export async function deleteUser(userId: string) {
  // Get user info before deleting
  const user = await getUser(userId);

  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);

  if (error) throw error;

  // Send webhook for user deletion
  await sendWebhook(WebhookEvent.USER_DELETED, {
    userId: user.id,
    username: user.username,
    email: user.email,
    deletedAt: new Date().toISOString(),
  });
}

// Get user roles
export async function getUserRoles(userId: string) {
  const { data, error } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return (data || []) as UserRole[];
}

// Assign role to user
export async function assignRole(userId: string, role: string) {
  const { data, error } = await supabase
    .from('user_roles')
    .insert({
      user_id: userId,
      role,
    })
    .select()
    .single();

  if (error) throw error;

  // Send webhook for role assignment
  const user = await getUser(userId);
  await sendWebhook(WebhookEvent.USER_ROLE_ASSIGNED, {
    userId,
    username: user.username,
    role,
    assignedAt: new Date().toISOString(),
  });

  return data as UserRole;
}

// Remove role from user
export async function removeRole(userId: string, role: string) {
  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
    .eq('role', role);

  if (error) throw error;

  // Send webhook for role removal
  const user = await getUser(userId);
  await sendWebhook(WebhookEvent.USER_ROLE_REMOVED, {
    userId,
    username: user.username,
    role,
    removedAt: new Date().toISOString(),
  });
}

export const userService = {
  getAllUsers,
  getUser,
  getUserByUsername,
  updateUser,
  deleteUser,
  getUserRoles,
  assignRole,
  removeRole,
};
