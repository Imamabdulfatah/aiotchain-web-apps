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
  
  // Validasi tambahan: pastikan token bukan string kosong atau tulisan "undefined"
  if (!token || token === "undefined" || token === "null") return false;

  try {
    const decoded: { exp: number } = jwtDecode(token);
    
    // Log untuk debugging (Hapus jika sudah jalan)
    console.log("Token Exp:", new Date(decoded.exp * 1000).toLocaleString());
    console.log("Current Time:", new Date().toLocaleString());

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

    // Simpan token. Gunakan prefix 'Bearer ' jika backend Go membutuhkannya
    localStorage.setItem("adminToken", data.token);
    return data;
  } catch (err: any) {
    // Menangkap pesan error "Invalid username or password" dari Go
    throw new Error(err.message || "Gagal masuk ke sistem");
  }
}

export async function loginWithGoogle(token: string) {
  try {
    const data = await fetchAPI<{token: string; is_new_user: boolean; error?: string}>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ token }),
    });

    localStorage.setItem("adminToken", data.token);
    return data;
  } catch (err: any) {
    throw new Error(err.message || "Gagal masuk dengan Google");
  }
}

export async function register(userData: {
  username: string;
  email: string;
  password: string;
}) {
  try {
    return await fetchAPI("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  } catch (err: any) {
    throw new Error(err.message || "Gagal mendaftar");
  }
}

export async function forgotPassword(email: string) {
  try {
    return await fetchAPI<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  } catch (err: any) {
    throw new Error(err.message || "Gagal mengirim email reset");
  }
}

export async function resetPassword(token: string, new_password: string) {
  try {
    return await fetchAPI("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, new_password }),
    });
  } catch (err: any) {
    throw new Error(err.message || "Gagal mereset password");
  }
}

export function logout() {
  localStorage.removeItem("adminToken");
  window.location.href = "/";
}