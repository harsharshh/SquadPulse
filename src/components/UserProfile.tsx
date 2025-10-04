"use client";

import { signOut, useSession } from "next-auth/react";
import Image from "next/image";

export default function UserProfile() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        {session.user.image && (
          <Image
            src={session.user.image}
            alt={session.user.name || "User"}
            width={32}
            height={32}
            className="rounded-full"
          />
        )}
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
          {session.user.name}
        </span>
      </div>
      <button
        onClick={handleSignOut}
        className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
      >
        Sign out
      </button>
    </div>
  );
}
