"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

export default function UnauthorizedPage() {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-danger/10 text-danger">
          <AlertCircle className="h-10 w-10" />
        </div>
      </div>
      <h1 className="mb-2 text-2xl font-bold text-foreground text-center">
        ليس لديك صلاحية للوصول إلى لوحة الإدارة
      </h1>
      <p className="mb-8 text-center text-muted-foreground">
        هذا القسم مخصص لمديري النظام فقط.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => router.push("/")} variant="outline">
          العودة للرئيسية
        </Button>
        <Button onClick={() => logout()} variant="primary">
          تسجيل الدخول كمدير
        </Button>
      </div>
    </div>
  );
}
