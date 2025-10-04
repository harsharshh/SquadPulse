"use client";

import { useSession } from "next-auth/react";
import ThemeToggle from "@/components/ThemeToggle";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import UserProfile from "@/components/UserProfile";
import PageNavigation from "@/components/PageNavigation";
import Logo from "./Logo";

export default function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-6">
      <div className="flex items-center gap-4">
        <Logo />
        <PageNavigation />
      </div>
      <div className="flex items-center gap-4">
        {status === "loading" ? (
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600 dark:border-gray-600 dark:border-t-gray-300"></div>
        ) : session ? (
          <UserProfile />
        ) : (
          <GoogleLoginButton />
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
