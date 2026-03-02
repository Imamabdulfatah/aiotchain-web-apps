import { jwtDecode } from "jwt-decode";
import { fetchAPI } from "./api";

export const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("adminToken");
  }
  return null;
};

export function isLoggedIn() {
  const token = getToken();
  
  if (!token || token === "undefined" || token === "null") return false;

  try {
    const decoded: { exp: number } = jwtDecode(token);
    return decoded.exp * 1000 > Date.now();
  } catch (error) {
    console.error("JWT Decode Error:", error);
    return false;
  }
}

export function getUserRole() {
  const token = getToken();
  if (!token) return null;
  try {
    const decoded: { role: string } = jwtDecode(token);
    return decoded.role;
  } catch (error) {
    return null;
  }
}

export function getUserId() {
  const token = getToken();
  if (!token) return null;
  try {
    const decoded: { user_id: number } = jwtDecode(token);
    return decoded.user_id;
  } catch (error) {
    return null;
  }
}

export async function login(username: string, password: string, captchaToken?: string, captchaAnswer?: string) {
  try {
    const data = await fetchAPI<{token: string; error?: string}>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ 
        username, 
        password,
        captcha_token: captchaToken,
        captcha_answer: captchaAnswer
      }),
    });

    localStorage.setItem("adminToken", data.token);
    return data;
  } catch (err: any) {
    throw new Error(err.message || "Gagal masuk ke sistem");
  }
}

export function logout() {
  localStorage.removeItem("adminToken");
  window.location.href = "/";
}
