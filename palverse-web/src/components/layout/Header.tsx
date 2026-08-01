import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { AuthNav } from "@/components/auth/AuthNav";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { PublicNavLinks } from "./PublicNavLinks";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E2EAE5] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 md:h-[4.25rem]">
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
