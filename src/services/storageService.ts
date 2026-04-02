/**
 * ============================================================
 * Storage Service - Protected by BuiltByBit Anti-Piracy
 * © 2024-2026 ZCraft. All rights reserved.
 * Unauthorized distribution or modification is prohibited.
 * ============================================================
 * This code is protected under international copyright law.
 * Removal of this notice or unauthorized copying will be detected.
 * __BUILTIN_ANTI_PIRACY_CHECK_STORAGE_001__
 */

import { supabase } from '@/integrations/supabase/client';

export interface UploadResult {
  url: string;
  path: string;
  error?: string;
}

export interface StoredImage {
  name: string;
  path: string;
  url: string;
  updated_at?: string;
}

/**
 * Upload news or changelog image to Supabase storage
 * Bucket: imgs
 */
export async function uploadNewsImage(file: File, newsSlug: string): Promise<UploadResult> {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Limit file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image must be smaller than 5MB');
    }

    const timestamp = Date.now();
    const fileName = `${newsSlug}-${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    const filePath = `news/${fileName}`;

    const { data, error } = await supabase.storage
      .from('imgs')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('imgs')
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      path: filePath,
    };
  } catch (err: any) {
    return {
      url: '',
      path: '',
      error: err?.message || 'Failed to upload image',
    };
  }
}

/**
 * Upload changelog image to Supabase storage
 * Bucket: imgs
 */
export async function uploadChangelogImage(file: File, version: string): Promise<UploadResult> {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image must be smaller than 5MB');
    }

    const timestamp = Date.now();
    const sanitizedVersion = version.replace(/[^a-zA-Z0-9.-]/g, '');
    const fileName = `changelog-${sanitizedVersion}-${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    const filePath = `changelogs/${fileName}`;

    const { data, error } = await supabase.storage
      .from('imgs')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from('imgs')
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      path: filePath,
    };
  } catch (err: any) {
    return {
      url: '',
      path: '',
      error: err?.message || 'Failed to upload image',
    };
  }
}

/**
 * Upload user profile picture to Supabase storage
 * Bucket: user_img
 */
export async function uploadProfilePicture(file: File, userId: string): Promise<UploadResult> {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image must be smaller than 5MB');
    }

    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'jpg';
    const fileName = `${timestamp}.${extension}`;
    const filePath = `${userId}/${fileName}`;

    // Delete old profile picture if exists
    try {
      const { data: files } = await supabase.storage
        .from('user_img')
        .list(userId);

      if (files) {
        if (files.length > 0) {
          await supabase.storage
            .from('user_img')
            .remove(files.map(f => `${userId}/${f.name}`));
        }
      }
    } catch (err) {
      console.warn('Failed to delete old profile picture:', err);
    }

    const { data, error } = await supabase.storage
      .from('user_img')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from('user_img')
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      path: filePath,
    };
  } catch (err: any) {
    return {
      url: '',
      path: '',
      error: err?.message || 'Failed to upload profile picture',
    };
  }
}

/**
 * Delete image from Supabase storage
 */
export async function deleteImage(bucket: 'imgs' | 'user_img', path: string): Promise<boolean> {
  try {
    if (!path) return false;

    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw error;
    }

    return true;
  } catch (err: any) {
    console.error('Failed to delete image:', err);
    return false;
  }
}

export async function listBucketImages(
  bucket: 'imgs' | 'user_img',
  prefixes: string[] = ['']
): Promise<StoredImage[]> {
  try {
    const results = await Promise.all(
      prefixes.map(async (prefix) => {
        const { data, error } = await supabase.storage
          .from(bucket)
          .list(prefix, {
            limit: 100,
            sortBy: { column: 'updated_at', order: 'desc' },
          });

        if (error) {
          throw error;
        }

        return (data || [])
          .filter((item) => item.id && item.name)
          .map((item) => {
            const path = prefix ? `${prefix}/${item.name}` : item.name;
            const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
            return {
              name: item.name,
              path,
              url: urlData.publicUrl,
              updated_at: item.updated_at,
            } as StoredImage;
          });
      })
    );

    return results
      .flat()
      .sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''));
  } catch (err) {
    console.error('Failed to list bucket images:', err);
    return [];
  }
}

/**
 * Get public URL for an image
 */
export function getImageUrl(bucket: 'imgs' | 'user_img', path: string): string {
  if (!path) return '';

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
}
