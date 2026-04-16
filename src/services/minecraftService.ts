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
  type: 'head' | 'skin' | 'bust' = 'head',
  size: number = 64,
  pose: string = 'default'
): Promise<string> {
  if (!username || username.length < 3) {
    return getDefaultAvatar();
  }

  const normalizedUsername = username.trim();
  if (type === 'skin') {
    return `https://crafthead.net/skin/${encodeURIComponent(normalizedUsername)}`;
  }

  if (type === 'bust') {
    return getMinecraftPlayerBust(username, pose);
  }

  return `https://crafthead.net/avatar/${encodeURIComponent(normalizedUsername)}/${size}`;
}

/**
 * Get a 3D Minecraft player bust render URL (like voidsmp.co)
 */
export async function getMinecraftPlayerBust(
  username: string,
  pose: string = 'default'
): Promise<string> {
  if (!username || username.length < 3) {
    return getDefaultAvatar();
  }

  const normalizedUsername = username.trim();

  try {
    // Get UUID first (required for starlightskins)
    const uuid = await getPlayerUUID(normalizedUsername);
    if (!uuid) {
      // Fallback to crafthead if UUID fails
      return `https://crafthead.net/avatar/${encodeURIComponent(normalizedUsername)}/64`;
    }

    // Different poses with camera settings like voidsmp.co
    const poseConfigs: Record<string, string> = {
      default: 'bust?cameraPosition=%7B%22x%22%3A%22-11.92%22%2C%22y%22%3A%2215.81%22%2C%22z%22%3A%22-29.71%22%7D&cameraFocalPoint=%7B%22x%22%3A%22-0.31%22%2C%22y%22%3A%2218.09%22%2C%22z%22%3A%221.32%22%7D',
      sleeping: 'bust',
      pointing: 'bust',
      dungeons: 'bust?cameraPosition=%7B%22x%22%3A%22-15.26%22%2C%22y%22%3A%2219.62%22%2C%22z%22%3A%22-27.58%22%7D&cameraFocalPoint=%7B%22x%22%3A%221.06%22%2C%22y%22%3A%2217.6%22%2C%22z%22%3A%221.26%22%7D',
      crossed: 'bust'
    };

    const poseConfig = poseConfigs[pose] || poseConfigs.default;
    return `https://starlightskins.lunareclipse.studio/render/${pose}/${uuid}/${poseConfig}`;
  } catch (error) {
    console.warn(`Failed to get 3D bust for ${normalizedUsername}, falling back to 2D:`, error);
    // Fallback to crafthead 2D avatar
    return `https://crafthead.net/avatar/${encodeURIComponent(normalizedUsername)}/64`;
  }
}

/**
 * Get Minecraft player UUID from username
 */
async function getPlayerUUID(username: string): Promise<string | null> {
  try {
    const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(username)}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.id;
  } catch (err) {
    console.warn(`Failed to get UUID for ${username}:`, err);
    return null;
  }
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
  bust: string;
}> {
  if (!username || username.length < 3) {
    const fallback = getDefaultAvatar();
    return {
      head: fallback,
      skin: fallback,
      avatar: fallback,
      full: fallback,
      bust: fallback,
    };
  }

  const normalizedUsername = username.trim();
  const bust = await getMinecraftPlayerBust(normalizedUsername);

  return {
    head: `https://crafthead.net/avatar/${encodeURIComponent(normalizedUsername)}/64`,
    skin: `https://crafthead.net/skin/${encodeURIComponent(normalizedUsername)}`,
    avatar: `https://crafthead.net/avatar/${encodeURIComponent(normalizedUsername)}/32`,
    full: `https://crafthead.net/body/${encodeURIComponent(normalizedUsername)}/128`,
    bust: bust,
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
