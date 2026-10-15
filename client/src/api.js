let token = '';
export function setToken(value) { token = value; }
export function hasToken() { return Boolean(token); }
export async function api(path, options = {}) {
  const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });
  const body = await response.json().catch(() => ({ error: 'The server could not be reached. Please try again.' }));
  if (!response.ok) throw new Error(body.error || 'Request failed');
  return body;
}
