/**
 * Minecraft Player Image Service
 * Builds direct image URLs instead of browser-side cross-origin API fetches.
 * This avoids CORS failures on pages like Staff.
 */

/**
 * Get a Minecraft player image URL.
 */
export async function getMinecraftPlayerImage(
  username: string,
  type: 'head' | 'skin' = 'head',
  size: number = 64
): Promise<string> {
  if (!username || username.length < 3) {
    return getDefaultAvatar();
  }

  const normalizedUsername = username.trim();
  if (type === 'skin') {
    return `https://crafthead.net/skin/${encodeURIComponent(normalizedUsername)}`;
  }

  return `https://crafthead.net/avatar/${encodeURIComponent(normalizedUsername)}/${size}`;
}

/**
 * Get default avatar when player image can't be fetched
 */
function getDefaultAvatar(): string {
  // Return a placeholder image URL or emoji
  return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"%3E%3Crect width="64" height="64" fill="%23888"%3E%3C/rect%3E%3Ctext x="32" y="40" font-size="32" text-anchor="middle" fill="white"%3E👤%3C/text%3E%3C/svg%3E';
}

/**
 * Get multiple formats of Minecraft player images
 */
export async function getMinecraftPlayerImages(
  username: string
): Promise<{
  head: string;
  skin: string;
  avatar: string;
  full: string;
}> {
  if (!username || username.length < 3) {
    const fallback = getDefaultAvatar();
    return {
      head: fallback,
      skin: fallback,
      avatar: fallback,
      full: fallback,
    };
  }

  const normalizedUsername = username.trim();
  return {
    head: `https://crafthead.net/avatar/${encodeURIComponent(normalizedUsername)}/64`,
    skin: `https://crafthead.net/skin/${encodeURIComponent(normalizedUsername)}`,
    avatar: `https://crafthead.net/avatar/${encodeURIComponent(normalizedUsername)}/32`,
    full: `https://crafthead.net/body/${encodeURIComponent(normalizedUsername)}/128`,
  };
}

/**
 * Preload Minecraft player images
 * Useful for improving perceived performance
 */
export async function preloadMinecraftImage(username: string): Promise<void> {
  try {
    const url = await getMinecraftPlayerImage(username, 'head');
    const img = new Image();
    img.src = url;
  } catch (err) {
    console.warn(`Failed to preload image for ${username}:`, err);
  }
}
