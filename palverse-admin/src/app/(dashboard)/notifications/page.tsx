import { Metadata } from "next";
import { NotificationsList } from "@/components/notifications/notifications-list";

export const metadata: Metadata = {
  title: "الإشعارات | Palverse",
  description: "إدارة الإشعارات في منصة بال فيرس",
};

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">الإشعارات</h1>
        <p className="text-sm text-slate-500 mt-1">عرض الإشعارات المستلمة وإدارتها</p>
      </div>

      <NotificationsList />
    </div>
  );
}
