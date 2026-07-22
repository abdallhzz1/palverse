import { RepresentativeGuard } from "@/components/representative/RepresentativeGuard";
import { RepresentativeSidebar } from "@/components/representative/RepresentativeSidebar";
import { RepresentativeMobileNav } from "@/components/representative/RepresentativeMobileNav";

export default function RepresentativeLayout({ children }: { children: React.ReactNode }) {
  return (
    <RepresentativeGuard>
      <div className="flex min-h-screen bg-[#F9FBF9] dark:bg-[#121212]">
        <RepresentativeSidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          <RepresentativeMobileNav />
          
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </RepresentativeGuard>
  );
}
