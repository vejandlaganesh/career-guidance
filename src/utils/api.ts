/**
 * Client-side authenticated fetch wrapper
 * Automatically sends Authorization: Bearer <token> from localStorage
 * and credentials: 'include' for secure httpOnly cookies.
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = typeof window !== "undefined" ? localStorage.getItem("newedu_token") : null;
  const headers = new Headers(options.headers || {});

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: "include"
  });
}
