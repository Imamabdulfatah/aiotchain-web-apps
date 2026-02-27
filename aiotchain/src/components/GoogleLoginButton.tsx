"use client";

import { getUserRole, loginWithGoogle } from "@/lib/auth";
import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function GoogleLoginButton({ onSuccess, onError }: GoogleLoginButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSuccess = async (response: any) => {
    setIsLoading(true);
    try {
      const data = await loginWithGoogle(response.credential);
      if (onSuccess) onSuccess();

      if (data.is_new_user) {
        router.push("/onboarding");
      } else {
        const role = getUserRole();
        if (role === "admin") {
          router.push("/admin");
        } else {
          router.push("/profile");
        }
      }
    } catch (error: any) {
      if (onError) onError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center mt-4">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => {
          if (onError) onError("Gagal login dengan Google");
        }}
        useOneTap
        theme="outline"
        size="large"
        width="100%"
        text="signin_with"
        shape="rectangular"
      />
    </div>
  );
}
