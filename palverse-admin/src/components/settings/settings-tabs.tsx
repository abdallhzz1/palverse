"use client";

import { useState } from "react";
import { SettingsGroupName } from "@/types/settings";
import { SettingsGeneralForm } from "./settings-general-form";
import { SettingsContactForm } from "./settings-contact-form";
import { SettingsSocialForm } from "./settings-social-form";
import { SettingsBrandingForm } from "./settings-branding-form";
import { SettingsApplicationForm } from "./settings-application-form";
import { SettingsMaintenanceForm } from "./settings-maintenance-form";
import { useRouter, useSearchParams } from "next/navigation";
import { Settings, Phone, Share2, Palette, Smartphone, AlertTriangle } from "lucide-react";

export function SettingsTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = (searchParams.get("tab") as SettingsGroupName) || "general";
  
  const [activeTab, setActiveTab] = useState<SettingsGroupName>(
    ["general", "branding", "contact", "social", "application", "maintenance"].includes(defaultTab) 
      ? defaultTab 
      : "general"
  );

  const tabs: { id: SettingsGroupName; label: string; icon: React.ElementType }[] = [
    { id: "general", label: "الإعدادات العامة", icon: Settings },
    { id: "branding", label: "الهوية البصرية", icon: Palette },
    { id: "contact", label: "معلومات التواصل", icon: Phone },
    { id: "social", label: "التواصل الاجتماعي", icon: Share2 },
    { id: "application", label: "التطبيقات", icon: Smartphone },
    { id: "maintenance", label: "الصيانة والتسجيل", icon: AlertTriangle },
  ];

  const handleTabChange = (tabId: SettingsGroupName) => {
    setActiveTab(tabId);
    router.replace(`/settings?tab=${tabId}`, { scroll: false });
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar Tabs */}
      <div className="w-full md:w-64 shrink-0">
        <nav className="flex flex-col space-y-1 bg-card p-2 rounded-xl border border-border">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors text-right w-full
                  ${isActive 
                    ? "bg-[#1E7D4E]/10 text-[#1E7D4E]" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }
                `}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-[#1E7D4E]" : "text-muted-foreground"}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-card rounded-xl border border-border p-6">
        {activeTab === "general" && <SettingsGeneralForm />}
        {activeTab === "branding" && <SettingsBrandingForm />}
        {activeTab === "contact" && <SettingsContactForm />}
        {activeTab === "social" && <SettingsSocialForm />}
        {activeTab === "application" && <SettingsApplicationForm />}
        {activeTab === "maintenance" && <SettingsMaintenanceForm />}
      </div>
    </div>
  );
}
