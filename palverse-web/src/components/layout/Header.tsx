import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { AuthNav } from "@/components/auth/AuthNav";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { PublicNavLinks } from "./PublicNavLinks";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#EAF3EC]/80 bg-white/85 backdrop-blur-xl transition-shadow">
      <div className="mx-auto flex h-[4.5rem] w-full max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex shrink-0 items-center">
          <BrandLogo />
        </Link>

        <PublicNavLinks />

        <div className="flex items-center gap-2 md:gap-3">
          <AuthNav />
          <MobileNavDrawer />
        </div>
      </div>
    </header>
  );
}
