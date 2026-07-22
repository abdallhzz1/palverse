import { ProfileSettings } from "@/components/account/ProfileSettings";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "الملف الشخصي | قسم المتابعة",
  description: "إعدادات الملف الشخصي",
};

export default function FollowUpProfilePage() {
  return (
    <ProfileSettings />
  );
}
