const RAW_API_BASE_URL = import.meta.env.VITE_SERVER_API_URL?.trim() || '';

export const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, '');

export function buildApiUrl(path: string) {
  if (!path.startsWith('/')) {
    throw new Error(`API path must start with "/": ${path}`);
  }

  return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
}
