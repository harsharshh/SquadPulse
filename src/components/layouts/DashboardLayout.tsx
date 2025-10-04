"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Logo from "../Logo";
import ThemeToggle from "../ThemeToggle";
import Image from "next/image";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  colorActive?: string;
  colorHover?: string;
}

const navigation: NavItem[] = [
  {
    label: "Mood Check-in",
    href: "/checkin",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    colorActive: "text-[#f97316] dark:text-[#f97316]",
    colorHover: "group-hover:text-[#f97316] dark:group-hover:text-[#f97316]",
  },
  {
    label: "Cheer Up Zone",
    href: "/cheerup",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
    ),
    colorActive: "text-[#fb7185] dark:text-[#fb7185]",
    colorHover: "group-hover:text-[#fb7185] dark:group-hover:text-[#fb7185]",
  },
  {
    label: "Whispers Wall",
    href: "/whispers",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
        />
      </svg>
    ),
    colorActive: "text-[#c084fc] dark:text-[#c084fc]",
    colorHover: "group-hover:text-[#c084fc] dark:group-hover:text-[#c084fc]",
  },
  {
    label: "Team Dashboard",
    href: "/team-dashboard",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 10h4V3H3v7zm0 11h4v-7H3v7zm7 0h4V10h-4v11zm7 0h4v-4h-4v4zm0-7h4v-4h-4v4z"
        />
      </svg>
    ),
    colorActive: "text-[#38bdf8] dark:text-[#38bdf8]",
    colorHover: "group-hover:text-[#38bdf8] dark:group-hover:text-[#38bdf8]",
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="relative flex h-screen bg-background text-foreground">
      {/* soft vignette + arc accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute -top-24 -left-24 h-[520px] w-[520px] rounded-full blur-3xl opacity-[.25] dark:opacity-[.18] bg-gradient-to-br from-[#f97316] via-[#fb7185] to-[#c084fc]" />
        <div className="absolute -bottom-32 -right-32 h-[420px] w-[420px] rounded-full blur-3xl opacity-[.20] dark:opacity-[.14] bg-gradient-to-tr from-[#c084fc] via-[#fb7185] to-[#f97316]" />
      </div>

      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } transition-all duration-300 ease-in-out bg-gradient-to-b from-[#fff7ed] via-[#f3e8ff] to-[#e0e7ff] dark:bg-gradient-to-b dark:from-[#232136] dark:via-[#2d2250] dark:to-[#1a1a2e] border-r border-gray-200 dark:border-gray-700 flex flex-col justify-between items-center z-10`}
      >
        <div className="flex items-center p-4 w-full">
          <div className="flex items-center justify-between w-full">
            <Logo variant={isSidebarOpen ? 'full' : 'compact'} />
            <button
              onClick={toggleSidebar}
              className="p-2 "
            >
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto w-full">
          <ul className="py-4">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cx(
                    "group flex items-center py-3 transition-colors",
                    isSidebarOpen ? "px-4 justify-start" : "justify-center w-full",
                    pathname === item.href
                      ? cx("font-semibold bg-[#fb7185]/20 dark:bg-[#c084fc]/20", item.colorActive)
                      : cx("text-gray-700 dark:text-gray-300 hover:bg-surface/10 dark:hover:bg-surface/10", item.colorHover)
                  )}
                  title={isSidebarOpen ? undefined : item.label}
                >
                  <span
                    className={cx(
                      "mr-0 inline-flex items-center justify-center transition-transform duration-200 ease-out",
                      "group-hover:scale-110",
                      pathname === item.href
                        ? item.colorActive
                        : "text-gray-500 dark:text-gray-400"
                    )}
                  >
                    {/* ensure SVG inherits currentColor for stroke/fill */}
                    {item.icon}
                  </span>
                  {isSidebarOpen && (
                    <span className="ml-3 text-sm font-medium">
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile, Logout, and Theme Toggle */}
        <div className="w-full flex flex-col items-center">
          <div className="flex justify-center p-4  w-full">
            <ThemeToggle variant={isSidebarOpen ? 'full' : 'icon'} />
          </div>
          <div className="border-t border-gray-300 dark:border-gray-700 p-4 w-full flex flex-col items-center">
            <div className="flex flex-col items-center mb-4 w-full">
              {session?.user?.image && (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full mx-auto"
                  priority
                />
              )}
              {isSidebarOpen && session && (
                <div className="ml-3 text-center w-full">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {session?.user?.email}
                  </p>
                </div>
              )}
            </div>
            {session && (
              <button
                onClick={() => signOut()}
                className={`flex items-center justify-center text-sm text-red-700 dark:text-red-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg ${
                  isSidebarOpen ? "w-full" : "w-fit"
                } px-3 py-2 mx-auto`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                {isSidebarOpen && <span className="ml-3">Logout</span>}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto  z-10">{children}</main>
    </div>
  );
}