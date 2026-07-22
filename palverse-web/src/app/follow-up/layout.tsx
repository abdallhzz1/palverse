import { FollowUpGuard } from "@/components/follow-up/FollowUpGuard";
import { FollowUpSidebar } from "@/components/follow-up/FollowUpSidebar";
import { FollowUpMobileNav } from "@/components/follow-up/FollowUpMobileNav";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "قسم المتابعة | بال فيرس",
  description: "لوحة تحكم قسم المتابعة لطلبات المحلات والاشتراكات في بال فيرس",
};

export default function FollowUpLayout({ children }: { children: React.ReactNode }) {
  return (
    <FollowUpGuard>
      <div className="flex min-h-screen bg-[#F9FBF9] dark:bg-[#121212]">
        <FollowUpSidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          <FollowUpMobileNav />
          
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </FollowUpGuard>
  );
}
