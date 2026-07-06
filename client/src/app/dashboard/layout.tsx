"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "./_components/Sidebar";
import Button from "@/components/UI/Button";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      signIn("google");
    }
  }, [session?.error]);

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-900">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  let pageTitle = "Dashboard Management";
  if (pathname.includes("/candidates")) pageTitle = "Candidates";
  else if (pathname.includes("/jobs")) pageTitle = "Jobs Management";

  return (
    <div className="min-h-screen flex bg-brand-50 text-brand-900 font-sans selection:bg-primary-500 selection:text-white">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto w-full md:w-auto">
        <header className="h-16 px-4 md:px-8 border-b border-brand-200 bg-white/75 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 md:hidden">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 -ml-1 text-brand-600 hover:bg-brand-100 rounded-md transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="w-6 h-6 rounded bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
              R
            </div>
            <span className="font-bold text-sm tracking-tight">
              RecruitFlow
            </span>
          </div>
          <h2 className="hidden md:block text-base font-bold text-brand-900 capitalize">
            {pageTitle}
          </h2>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold leading-none">
                {session?.user?.name || "Demo User"}
              </p>
              <p className="text-xs text-brand-400 mt-1">
                {session?.user?.email}
              </p>
            </div>
            {session?.user?.image ? (
              <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-brand-200 ">
                <Image
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  fill
                  sizes="(max-width: 768px) 48px, 64px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-primary-600 text-white font-bold flex items-center justify-center text-sm">
                {session?.user?.name ? session.user.name[0].toUpperCase() : "U"}
              </div>
            )}
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
