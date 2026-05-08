export interface AllowedOriginsPayload {
  appOrigins: string[];
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export async function fetchAllowedOrigins(): Promise<AllowedOriginsPayload> {
  const response = await fetch(`${API_BASE}/api/config`);
  if (!response.ok) {
    throw new Error('Failed to load auth configuration');
  }
  return response.json() as Promise<AllowedOriginsPayload>;
}
