import { Metadata } from "next";
import { SettingsTabs } from "@/components/settings/settings-tabs";

export const metadata: Metadata = {
  title: "إعدادات النظام | Palverse",
  description: "إدارة إعدادات منصة بال فيرس",
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">إعدادات النظام</h1>
        <p className="text-sm text-muted-foreground mt-1">إدارة الإعدادات العامة للمنصة، وسائل التواصل، والتخصيص</p>
      </div>

      <SettingsTabs />
    </div>
  );
}
