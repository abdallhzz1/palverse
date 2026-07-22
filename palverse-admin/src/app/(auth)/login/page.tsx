"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/providers/auth-provider";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { NormalizedApiError, getFieldErrors } from "@/lib/api/error";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email({ message: "البريد الإلكتروني غير صالح" }),
  password: z.string().min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await authService.login({
        ...values,
        device_name: "Admin Dashboard",
      });

      if (!response.user) {
        toast.error("لم يتم استلام بيانات المستخدم من الخادم");
        setIsLoading(false);
        return;
      }

      const userRoles = response.user.roles || [];
      if (!userRoles.includes("admin")) {
        toast.error("هذا الحساب لا يملك صلاحية الإدارة");
        setIsLoading(false);
        return;
      }

      login(response.user);
      toast.success("تم تسجيل الدخول بنجاح");
      
      // Explicit deterministic redirect
      router.replace("/dashboard");
    } catch (error) {
      const apiError = error as NormalizedApiError;
      
      if (apiError.code === "VALIDATION_ERROR") {
        const emailErrors = getFieldErrors(apiError, "email");
        const passwordErrors = getFieldErrors(apiError, "password");
        
        if (emailErrors) form.setError("email", { message: emailErrors[0] });
        if (passwordErrors) form.setError("password", { message: passwordErrors[0] });
        
        if (!emailErrors && !passwordErrors) {
          toast.error(apiError.message);
        }
      } else {
        toast.error(apiError.message || "حدث خطأ أثناء تسجيل الدخول");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="relative h-16 w-16">
              <Image
                src="/brand/palverse-icon.png"
                alt="Palverse"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl">تسجيل الدخول</CardTitle>
            <CardDescription>إدارة منصة Palverse</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2 text-right">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                dir="ltr"
                disabled={isLoading}
                {...form.register("email")}
                className={form.formState.errors.email ? "border-danger" : ""}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-danger">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2 text-right">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  dir="ltr"
                  disabled={isLoading}
                  {...form.register("password")}
                  className={form.formState.errors.password ? "border-danger pl-10" : "pl-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-danger">{form.formState.errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              تسجيل الدخول
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
