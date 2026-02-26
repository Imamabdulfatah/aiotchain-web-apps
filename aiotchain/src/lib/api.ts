export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

/** Helper to get cookie by name from document.cookie */
function getCookie(name: string): string {
  if (typeof window === "undefined") return "";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || "";
  return "";
}

export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const isServer = typeof window === "undefined";

  let csrfToken = "";
  let authToken = "";

  if (!isServer) {
    // Read CSRF token from the live cookie first, then fall back to localStorage
    csrfToken =
      getCookie("aiot_csrf_token") ||
      localStorage.getItem("aiot_csrf_token") ||
      "";

    authToken = localStorage.getItem("adminToken") || "";
  }

  const headers = (options.headers || {}) as Record<string, string>;

  const finalHeaders: Record<string, string> = {
    ...headers,
    // Always send CSRF token so cookie-based flows work
    ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
  };

  // Add Authorization header if token exists and not already provided
  if (authToken && !finalHeaders["Authorization"]) {
    finalHeaders["Authorization"] = `Bearer ${authToken}`;
  }

  // FormData: let browser set Content-Type + boundary automatically
  if (headers["Content-Type"] === undefined && options.body instanceof FormData) {
    delete finalHeaders["Content-Type"];
  } else if (!finalHeaders["Content-Type"] && !(options.body instanceof FormData)) {
    finalHeaders["Content-Type"] = "application/json";
  }

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: finalHeaders,
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage = `API error: ${res.status}`;
      try {
        errorMessage = JSON.parse(errorText)?.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return res.json() as Promise<T>;
  } catch (err) {
    console.error("Fetch error:", err);
    throw err;
  }
}
