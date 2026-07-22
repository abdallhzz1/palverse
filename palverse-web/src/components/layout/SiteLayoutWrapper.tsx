"use client";

import { usePathname } from "next/navigation";

export function SiteLayoutWrapper({ 
  children,
  header,
  footer,
  bottomNav
}: { 
  children: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
  bottomNav: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Define routes that should NOT have the public site header/footer
  const isDashboardRoute = 
    pathname?.startsWith('/follow-up') || 
    pathname?.startsWith('/admin') || 
    pathname?.startsWith('/representative') ||
    pathname?.startsWith('/merchant');

  const isAuthRoute = 
    pathname === '/login' ||
    pathname?.startsWith('/forgot-password') ||
    pathname?.startsWith('/reset-password') ||
    pathname?.startsWith('/verify-email');

  if (isDashboardRoute || isAuthRoute) {
    return (
      <main className="flex-grow flex flex-col relative min-h-screen bg-[#F9FBF9] dark:bg-[#121212]">
        {children}
      </main>
    );
  }

  return (
    <>
      {header}
      <main className="flex-grow flex flex-col relative">
        {children}
      </main>
      {footer}
      {bottomNav}
    </>
  );
}
