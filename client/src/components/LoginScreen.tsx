"use client";

import { signIn } from "next-auth/react";
import Button from "./UI/Button";

export default function LoginScreen() {
  return (
    <main className="min-h-screen flex flex-col lg:flex-row bg-brand-950 font-sans text-brand-100 selection:bg-primary-500 selection:text-white">
      {/* Left pane - Brand Presentation */}
      <div className="lg:w-3/5 relative hidden lg:flex flex-col justify-between p-16 overflow-hidden bg-gradient-to-tr from-brand-950 via-primary-950 to-indigo-950 border-r border-brand-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px]"></div>
        
        <div className="z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-500 to-indigo-400 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-brand-300 bg-clip-text text-transparent">RecruitFlow AI</span>
        </div>

        <div className="z-10 my-auto max-w-xl">
          <h1 className="text-5xl font-black tracking-tight text-white leading-tight mb-6">
            Automate Talent <br />
            <span className="bg-gradient-to-r from-primary-400 to-accent-teal-500 bg-clip-text text-transparent">Outreach Instantly</span>
          </h1>
          <p className="text-lg text-brand-300 leading-relaxed mb-8">
            Engage candidate pipelines with high-context, ultra-personalized emails generated dynamically. Experience the future of intelligent candidate sourcing.
          </p>
        </div>

        <div className="z-10 flex justify-between text-xs text-brand-500 border-t border-brand-850 pt-4">
          <p className="text-white">&copy; {new Date().getFullYear()} RecruitFlow. All rights reserved.</p>
        </div>
      </div>

      {/* Right pane - Authentication Login */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20 xl:px-24 bg-brand-900 lg:bg-brand-950">
        <div className="mx-auto w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">RecruitFlow AI</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">Welcome Back</h2>
          <p className="text-brand-400 text-sm mb-8">Login with your corporate Google credentials to access your outreach panel.</p>

          <Button
            onClick={() => signIn("google")}
            variant="white"
            className="w-full hover:scale-[1.01] active:scale-[0.99] gap-3"
            leftIcon={
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            }
            size="lg"
          >
            Continue with Google
          </Button>
          
          <div className="mt-8 text-center text-xs text-brand-500">
            By logging in, you agree to our Terms of Service. Secure connection managed by Google OAuth Identity Services.
          </div>
        </div>
      </div>
    </main>
  );
}
