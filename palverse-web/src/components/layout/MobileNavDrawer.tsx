"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Search } from "lucide-react";
import { isMerchantRole } from "@/lib/auth/roles";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { usePublicAuth } from "@/contexts/AuthContext";

function MerchantMobileLink({ onClose }: { onClose: () => void }) {
  const { user, isAuthenticated } = usePublicAuth();
  
  if (!isAuthenticated || !user) return null;
  
  const isMerchant = isMerchantRole(user.roles);
  if (!isMerchant) return null;

  return (
    <div className="p-4 mt-auto border-t border-[#EAF3EC] dark:border-[#0F3D2E]">
      <Link 
        onClick={onClose} 
        href="/merchant" 
        className="flex items-center justify-center gap-2 w-full py-3 bg-[#0F3D2E] text-white rounded-xl font-bold hover:bg-[#1E7D4E] transition-colors"
      >
        لوحة التاجر
      </Link>
    </div>
  );
}

export function MobileNavDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const dict = getDictionary("ar");

  return (
    <div className="md:hidden flex items-center gap-4">
      {/* Search Icon */}
      <Link href="/stores" className="text-[#0F3D2E] dark:text-[#EAF3EC] p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
        <Search className="w-6 h-6" />
      </Link>

      {/* Hamburger Menu */}
      <button 
        onClick={() => setIsOpen(true)}
        className="text-[#0F3D2E] dark:text-[#EAF3EC] p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* RTL Drawer */}
      <div className={`fixed top-0 bottom-0 right-0 w-72 bg-white dark:bg-[#1F2522] z-50 transform transition-transform duration-300 ease-in-out shadow-2xl ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex flex-col h-full">
          
          <div className="flex items-center justify-between p-4 border-b border-[#EAF3EC] dark:border-[#0F3D2E]">
            <span className="font-bold text-lg text-[#0F3D2E] dark:text-[#EAF3EC]">القائمة الرئيسية</span>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 text-[#7FA789] hover:text-[#0F3D2E] dark:hover:text-[#EAF3EC] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 flex flex-col justify-between">
            <nav className="flex flex-col px-4 gap-2">
              <Link onClick={() => setIsOpen(false)} href="/" className="px-4 py-3 text-[#0F3D2E] dark:text-[#EAF3EC] hover:bg-[#EAF3EC] dark:hover:bg-[#0F3D2E]/50 rounded-xl font-medium transition-colors">
                {dict.navigation.home}
              </Link>
              <Link onClick={() => setIsOpen(false)} href="/categories" className="px-4 py-3 text-[#0F3D2E] dark:text-[#EAF3EC] hover:bg-[#EAF3EC] dark:hover:bg-[#0F3D2E]/50 rounded-xl font-medium transition-colors">
                {dict.navigation.categories}
              </Link>
              <Link onClick={() => setIsOpen(false)} href="/stores" className="px-4 py-3 text-[#0F3D2E] dark:text-[#EAF3EC] hover:bg-[#EAF3EC] dark:hover:bg-[#0F3D2E]/50 rounded-xl font-medium transition-colors">
                {dict.navigation.stores}
              </Link>
              <Link onClick={() => setIsOpen(false)} href="/offers" className="px-4 py-3 text-[#0F3D2E] dark:text-[#EAF3EC] hover:bg-[#EAF3EC] dark:hover:bg-[#0F3D2E]/50 rounded-xl font-medium transition-colors">
                {dict.navigation.offers}
              </Link>
            </nav>

            <MerchantMobileLink onClose={() => setIsOpen(false)} />
          </div>

        </div>
      </div>
    </div>
  );
}
