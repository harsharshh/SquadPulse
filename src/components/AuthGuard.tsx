"use client";

import { useSession } from "next-auth/react";
import { ReactNode } from "react";
import GoogleLoginButton from "./GoogleLoginButton";

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600 dark:border-gray-600 dark:border-t-gray-300 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center space-y-6">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] bg-clip-text text-transparent">
            SquadPulse
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please sign in to access this feature
          </p>
        </div>

        {fallback || (
          <div className="space-y-4 flex flex-col items-center justify-center">
            <div className="flex justify-center">
              <GoogleLoginButton />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-500 text-center">
              Sign in with your Google account to continue
            </p>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
