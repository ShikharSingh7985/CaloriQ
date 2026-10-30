import AsyncStorage from "@react-native-async-storage/async-storage";

const rawUrl = process.env.EXPO_PUBLIC_API_URL;
if (!rawUrl) {
  throw new Error(
    "Missing EXPO_PUBLIC_API_URL. Copy app/.env.example to app/.env and point " +
      "it at your running FastAPI backend (e.g. http://192.168.1.10:8000).",
  );
}
// Normalize: strip any trailing slash so path joins are clean.
export const API_URL = rawUrl.replace(/\/+$/, "");

const TOKEN_KEY = "nutrisnap_token";
let authToken: string | null = null;

export async function loadToken(): Promise<string | null> {
  authToken = await AsyncStorage.getItem(TOKEN_KEY);
  return authToken;
}

export async function setToken(token: string): Promise<void> {
  authToken = token;
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  authToken = null;
  await AsyncStorage.removeItem(TOKEN_KEY);
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean;
};

export async function api<T = any>(
  path: string,
  { method = "GET", body, auth = true }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth && authToken) headers.Authorization = `Bearer ${authToken}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  let data: any = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    throw new Error(formatApiError(data, res.status));
  }
  return data as T;
}

// Turn FastAPI error payloads into a readable, user-friendly message.
// - HTTPException → { detail: "string" }
// - Validation (422) → { detail: [{ loc, msg, ... }] }
function formatApiError(data: any, status: number): string {
  const detail = data?.detail;
  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    const messages = detail.map((d) => {
      const field = Array.isArray(d?.loc) ? d.loc[d.loc.length - 1] : undefined;
      const raw = String(d?.msg ?? "Invalid value").replace(/^Value error,\s*/i, "");
      // Friendlier copy for the most common cases.
      if (/valid email address/i.test(raw)) return "Please enter a valid email address.";
      if (field && field !== "body") {
        const label = String(field).replace(/_/g, " ");
        return `${label.charAt(0).toUpperCase()}${label.slice(1)}: ${raw}`;
      }
      return raw;
    });
    // De-dupe and keep it short.
    return [...new Set(messages)].slice(0, 3).join("\n");
  }

  if (typeof data?.message === "string") return data.message;
  return `Request failed (${status})`;
}
