"use client";

import { fetchAPI } from "@/lib/api";
import { useEffect } from "react";

export default function CSRFInitializer() {
  useEffect(() => {
    const initCSRF = async () => {
      try {
        const data = await fetchAPI<{ token: string }>("/csrf-cookie", { method: "GET" });
        if (data.token) {
          localStorage.setItem("aiot_csrf_token", data.token);
          console.log("CSRF token stored in localStorage");
        }
        console.log("CSRF cookie initialized");
      } catch (err) {
        console.error("Failed to initialize CSRF cookie", err);
      }
    };

    initCSRF();
  }, []);

  return null;
}
