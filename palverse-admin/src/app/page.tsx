"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // The specific layouts will handle redirecting
    // We just push them to dashboard, and if unauthenticated, DashboardLayout catches and redirects to login
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Spinner size="lg" />
    </div>
  );
}
