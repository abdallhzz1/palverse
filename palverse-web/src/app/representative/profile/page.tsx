import { ProfileSettings } from "@/components/account/ProfileSettings";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "الملف الشخصي | المندوبين",
  description: "إعدادات الملف الشخصي",
};

export default function RepresentativeProfilePage() {
  return (
    <ProfileSettings />
  );
}
