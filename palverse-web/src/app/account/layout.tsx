"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { usePublicAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Shield, Bell, LogOut, ChevronLeft } from "lucide-react";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout, user } = usePublicAuth();

  const navigation = [
    { name: "الملف الشخصي", href: "/account", icon: User },
    { name: "الإشعارات", href: "/account/notifications", icon: Bell },
    { name: "الجلسات النشطة", href: "/account/sessions", icon: Shield },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F5F7F6] pb-24 lg:pb-12">
        <div className="public-container py-8 lg:py-12">
          <div className="mb-8">
            <p className="text-sm font-bold text-[#1E7D4E]">حسابك</p>
            <h1 className="mt-1 font-heading text-2xl font-extrabold text-[#0F3D2E] md:text-3xl">
              إعدادات الزائر
            </h1>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row">
            <aside className="w-full shrink-0 lg:w-72">
              <div className="sticky top-24 rounded-[1.75rem] border border-[#EAF3EC] bg-white p-3">
                {user && (
                  <div className="mb-2 flex items-center gap-4 border-b border-[#EAF3EC] p-4 pb-6 pt-2">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3EC] text-xl font-bold text-[#1E7D4E]">
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate font-bold text-[#0F3D2E]">{user.name}</span>
                      <span className="truncate text-xs text-[#7FA789]">{user.email}</span>
                    </div>
                  </div>
                )}

                <nav className="space-y-1.5 px-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center justify-between rounded-2xl px-4 py-3.5 font-bold transition-all ${
                          isActive
                            ? "bg-[#EAF3EC] text-[#1E7D4E]"
                            : "text-[#7FA789] hover:bg-[#F5F7F6] hover:text-[#0F3D2E]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className={`h-5 w-5 ${isActive ? "text-[#1E7D4E]" : "text-[#7FA789]"}`} />
                          {item.name}
                        </div>
                        {isActive && <ChevronLeft className="h-4 w-4 text-[#1E7D4E]" />}
                      </Link>
                    );
                  })}

                  <hr className="my-4 border-[#EAF3EC]" />

                  <button
                    onClick={() => logout()}
                    className="flex w-full items-center justify-between rounded-2xl px-4 py-3.5 font-bold text-red-500 transition-colors hover:bg-red-50"
                  >
                    <div className="flex items-center gap-3">
                      <LogOut className="h-5 w-5 text-red-400" />
                      تسجيل الخروج
                    </div>
                  </button>
                </nav>
              </div>
            </aside>

            <main className="flex-1">
              <div className="min-h-[500px] rounded-[1.75rem] border border-[#EAF3EC] bg-white p-6 lg:p-10">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
