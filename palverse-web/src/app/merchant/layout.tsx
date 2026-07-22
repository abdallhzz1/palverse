import { MerchantGuard } from "@/components/merchant/MerchantGuard";
import { MerchantSidebar } from "@/components/merchant/MerchantSidebar";
import { MerchantMobileNav } from "@/components/merchant/MerchantMobileNav";

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  return (
    <MerchantGuard>
      <div className="flex min-h-screen bg-[#F9FBF9] dark:bg-[#121212]">
        <MerchantSidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          <MerchantMobileNav />
          
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </MerchantGuard>
  );
}
