"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Store, MapPin, Percent, CreditCard } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { NormalizedApiError } from "@/lib/api/error";
import { Button } from "@/components/ui/button";

export interface AdminDashboardSummary {
  users_count: number;
  merchants_count: number;
  stores_count: number;
  pending_stores_count: number;
  active_subscriptions_count: number;
  active_offers_count: number;
}

interface DashboardResponse {
  data: AdminDashboardSummary;
}

export default function DashboardPage() {
  const [data, setData] = useState<AdminDashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // The interceptor returns the data directly
      const response = await apiClient.get<unknown, DashboardResponse>("/admin/dashboard/summary");
      setData(response.data);
    } catch (err) {
      const apiError = err as NormalizedApiError;
      setError(apiError.message || "حدث خطأ أثناء جلب بيانات لوحة التحكم");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <div className="text-danger font-medium">{error}</div>
        <Button onClick={fetchDashboardData} variant="outline">
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    { title: "إجمالي المستخدمين", value: data.users_count, icon: Users },
    { title: "إجمالي التجار", value: data.merchants_count, icon: Store },
    { title: "إجمالي المحلات", value: data.stores_count, icon: Store },
    { title: "المحلات قيد المراجعة", value: data.pending_stores_count, icon: MapPin },
    { title: "الاشتراكات النشطة", value: data.active_subscriptions_count, icon: CreditCard },
    { title: "العروض النشطة", value: data.active_offers_count, icon: Percent },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">نظرة عامة</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-primary">
                <stat.icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-latin">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
