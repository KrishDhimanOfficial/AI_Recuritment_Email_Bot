"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import LoginScreen from "@/components/LoginScreen";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const navigate = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session) {
      navigate.push("/dashboard");
    }
  }, [status, session, navigate]);

  // 1. LOADING STATE
  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-900 text-white">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-brand-300 font-medium tracking-wide">Loading AI Recruitment Portal...</p>
      </div>
    );
  }

  // 2. UNAUTHENTICATED (LOGIN SCREEN)
  if (!session) {
    return <LoginScreen />;
  }

  // 3. AUTHENTICATED (HR RECRUITER DASHBOARD)
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-900 text-white">
      <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-brand-300 font-medium tracking-wide">Redirecting to Dashboard...</p>
    </div>
  );
}