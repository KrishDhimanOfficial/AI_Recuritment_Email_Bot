"use client";

import { signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Button from "@/components/UI/Button";
import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import api from "@/config/axios.config";

export default function Sidebar({ isOpen = false, onClose }: { isOpen?: boolean, onClose?: () => void }) {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (onClose) onClose();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    const logoutMutation = useMutation({
        mutationFn: async () => {
            const res = await api.delete("/api/delete/user", {
                withCredentials: true,
                withXSRFToken: true,
            } as any);
            return res.data;
        },
        onSuccess: () => {
            signOut({ redirect: false }).then(() => {
                router.push('/');
            });
        },
        onError: (error) => {
            console.error("Logout failed:", error);
            // Sign out anyway to clear local session
            signOut({ redirect: false }).then(() => {
                router.push('/');
            });
        },
    });

    const navItems = [
        {
            name: "Dashboard",
            href: "/dashboard",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
                </svg>
            )
        },
        {
            name: "Candidates",
            href: "/dashboard/candidates",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            )
        },
        {
            name: "Job Requirements",
            href: "/dashboard/jobs",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            )
        }
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-brand-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    onClick={onClose}
                />
            )}
            
            <aside className={`w-64 border-r border-brand-200 bg-white/95 md:bg-white/80 backdrop-blur-xl flex flex-col justify-between p-6 shrink-0 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)] fixed md:sticky md:top-0 h-screen inset-y-0 left-0 transition-transform duration-300 md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="space-y-8">
                    <div className="flex items-center justify-between gap-2 px-2">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-linear-to-r from-brand-900 to-brand-600 ">RecruitFlow</span>
                        </div>
                        {/* Close button for mobile */}
                        <button onClick={onClose} className="md:hidden p-1.5 text-brand-500 hover:text-brand-900 bg-brand-100 rounded-lg">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                <nav className="space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Button
                                key={item.name}
                                onClick={() => router.push(item.href)}
                                variant={isActive ? "primary" : "ghost"}
                                className={`w-full justify-start gap-3 transition-all duration-300 ${isActive ? "shadow-md shadow-primary-500/20 translate-x-1" : "hover:translate-x-1"}`}
                                leftIcon={item.icon}
                            >
                                {item.name}
                            </Button>
                        );
                    })}
                </nav>
            </div>

            {/* LOGOUT BUTTON */}
            <div className="border-t border-brand-100 pt-6">
                <Button
                    onClick={() => logoutMutation.mutate()}
                    variant="ghost"
                    className="w-full gap-2 text-brand-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                    leftIcon={
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    }
                >
                    Sign Out
                </Button>
            </div>
            </aside>
        </>
    );
}
