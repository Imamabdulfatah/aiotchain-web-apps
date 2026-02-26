"use client";

import { isLoggedIn, logout } from "@/lib/auth";
import { useCallback, useEffect, useRef, useState } from "react";

const TIMEOUT_IN_MS = 30 * 60 * 1000; // 30 minutes

export default function SessionTimeoutHandler() {
  const [isAuth, setIsAuth] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync auth state on mount and via storage events
  useEffect(() => {
    const checkState = () => {
      setIsAuth(isLoggedIn());
    };

    checkState();
    window.addEventListener("storage", checkState);
    return () => window.removeEventListener("storage", checkState);
  }, []);

  const handleLogout = useCallback(() => {
    if (isLoggedIn()) {
      console.log("Inactivity detected. Logging out...");
      logout();
    }
  }, []);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(handleLogout, TIMEOUT_IN_MS);
  }, [handleLogout]);

  useEffect(() => {
    // Only set up listeners if logged in
    if (!isAuth) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }

    // Initial timer setup
    resetTimer();

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click"
    ];

    const eventListener = () => resetTimer();

    events.forEach((event) => {
      window.addEventListener(event, eventListener);
    });

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, eventListener);
      });
    };
  }, [isAuth, resetTimer]);

  return null;
}
