"use client";

import { isLoggedIn } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function withAuth(Component: any) {
  return function ProtectedRoute(props: any) {
    const router = useRouter();
    const [verified, setVerified] = useState(false);

    useEffect(() => {
      const status = isLoggedIn();
      console.log("Status Login:", status);
      if (!status) {
        router.push("/auth/login");
      } else {
        setVerified(true);
      }
    }, [router]);

    if (!verified) {
      return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    return <Component {...props} />;
  };
}