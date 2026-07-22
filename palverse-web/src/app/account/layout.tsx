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
      <div className="container mx-auto px-4 py-8 lg:py-12 pb-24 lg:pb-12 min-h-screen">
        <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="bg-white rounded-[2rem] p-3 shadow-[0_2px_20px_-3px_rgba(0,0,0,0.03)] border border-gray-50 sticky top-24">
              
              {/* User Profile Mini Header */}
              {user && (
                <div className="p-4 mb-2 flex items-center gap-4 border-b border-gray-50 pb-6 pt-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#EAF3EC] text-[#1E7D4E] flex items-center justify-center font-bold text-xl shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-bold text-[#0F3D2E] truncate">{user.name}</span>
                    <span className="text-xs text-[#7FA789] truncate">{user.email}</span>
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
                      className={`flex items-center justify-between px-4 py-3.5 rounded-2xl font-bold transition-all ${
                        isActive
                          ? "bg-[#EAF3EC]/60 text-[#1E7D4E]"
                          : "text-gray-500 hover:bg-gray-50 hover:text-[#0F3D2E]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={`w-5 h-5 ${isActive ? "text-[#1E7D4E]" : "text-gray-400"}`} />
                        {item.name}
                      </div>
                      {isActive && <ChevronLeft className="w-4 h-4 text-[#1E7D4E]" />}
                    </Link>
                  );
                })}
                
                <hr className="my-4 border-gray-50" />
                
                <button
                  onClick={() => logout()}
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="w-5 h-5 text-red-400" />
                    تسجيل الخروج
                  </div>
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="bg-white rounded-[2rem] p-6 lg:p-10 shadow-[0_2px_20px_-3px_rgba(0,0,0,0.03)] border border-gray-50 min-h-[500px]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
