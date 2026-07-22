"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { usePublicAuth } from "@/contexts/AuthContext";

interface MoreBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MoreBottomSheet({ isOpen, onClose }: MoreBottomSheetProps) {
  const { isAuthenticated } = usePublicAuth();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 md:hidden" 
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1F2522] z-50 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] transition-transform duration-300 transform md:hidden ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex flex-col p-6 max-h-[80vh] overflow-y-auto">
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">
              المزيد
            </h2>
            <button onClick={onClose} className="p-2 text-[#7FA789] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <Link onClick={onClose} href="/pages/about-us" className="block p-4 bg-[#F9FBF9] dark:bg-[#171717] rounded-xl text-[#0F3D2E] dark:text-[#EAF3EC] font-semibold hover:bg-[#EAF3EC] dark:hover:bg-[#0F3D2E]/50 transition-colors">
              من نحن
            </Link>
            <Link onClick={onClose} href="/pages/privacy-policy" className="block p-4 bg-[#F9FBF9] dark:bg-[#171717] rounded-xl text-[#0F3D2E] dark:text-[#EAF3EC] font-semibold hover:bg-[#EAF3EC] dark:hover:bg-[#0F3D2E]/50 transition-colors">
              سياسة الخصوصية
            </Link>
            <Link onClick={onClose} href="/pages/terms-and-conditions" className="block p-4 bg-[#F9FBF9] dark:bg-[#171717] rounded-xl text-[#0F3D2E] dark:text-[#EAF3EC] font-semibold hover:bg-[#EAF3EC] dark:hover:bg-[#0F3D2E]/50 transition-colors">
              الشروط والأحكام
            </Link>
            <Link onClick={onClose} href="/pages/contact-us" className="block p-4 bg-[#F9FBF9] dark:bg-[#171717] rounded-xl text-[#0F3D2E] dark:text-[#EAF3EC] font-semibold hover:bg-[#EAF3EC] dark:hover:bg-[#0F3D2E]/50 transition-colors">
              اتصل بنا
            </Link>
            <Link onClick={onClose} href="/faqs" className="block p-4 bg-[#F9FBF9] dark:bg-[#171717] rounded-xl text-[#0F3D2E] dark:text-[#EAF3EC] font-semibold hover:bg-[#EAF3EC] dark:hover:bg-[#0F3D2E]/50 transition-colors">
              الأسئلة الشائعة
            </Link>

            <hr className="border-[#EAF3EC] dark:border-[#1F2522] my-2" />

            {isAuthenticated && (
              <Link onClick={onClose} href="/account" className="block p-4 bg-gray-50 dark:bg-[#171717] rounded-xl text-[#1E7D4E] font-bold hover:bg-[#EAF3EC] dark:hover:bg-[#0F3D2E]/50 transition-colors text-center border border-[#1E7D4E]/20">
                حسابي
              </Link>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
