"use client";

import { Plus, Trash2 } from "lucide-react";

export type SocialLinkDraft = {
  platform: string;
  url: string;
  username?: string;
};

export type WorkingHoursDraft = {
  days: Array<{
    day_of_week: number;
    is_closed: boolean;
    periods: Array<{ opens_at: string; closes_at: string }>;
  }>;
};

const DAYS = [
  { id: 6, name: "السبت" },
  { id: 0, name: "الأحد" },
  { id: 1, name: "الإثنين" },
  { id: 2, name: "الثلاثاء" },
  { id: 3, name: "الأربعاء" },
  { id: 4, name: "الخميس" },
  { id: 5, name: "الجمعة" },
];

const PLATFORMS = [
  { value: "facebook", label: "فيسبوك" },
  { value: "instagram", label: "إنستغرام" },
  { value: "tiktok", label: "تيك توك" },
  { value: "youtube", label: "يوتيوب" },
  { value: "x", label: "X" },
  { value: "snapchat", label: "سناب شات" },
  { value: "linkedin", label: "لينكدإن" },
  { value: "telegram", label: "تيليغرام" },
  { value: "other", label: "أخرى" },
];

export function defaultWorkingHours(): WorkingHoursDraft {
  return {
    days: Array.from({ length: 7 }, (_, day_of_week) => ({
      day_of_week,
      is_closed: day_of_week === 5,
      periods:
        day_of_week === 5
          ? []
          : [{ opens_at: "09:00", closes_at: "17:00" }],
    })),
  };
}

interface StoreRequestExtrasSectionsProps {
  workingHours: WorkingHoursDraft | null;
  onWorkingHoursChange: (value: WorkingHoursDraft | null) => void;
  socialLinks: SocialLinkDraft[];
  onSocialLinksChange: (value: SocialLinkDraft[]) => void;
  disabled?: boolean;
}

export function StoreRequestExtrasSections({
  workingHours,
  onWorkingHoursChange,
  socialLinks,
  onSocialLinksChange,
  disabled = false,
}: StoreRequestExtrasSectionsProps) {
  const enabledHours = workingHours !== null;

  const toggleHours = (enabled: boolean) => {
    onWorkingHoursChange(enabled ? defaultWorkingHours() : null);
  };

  const updateDay = (dayOfWeek: number, patch: Partial<WorkingHoursDraft["days"][number]>) => {
    if (!workingHours) return;
    onWorkingHoursChange({
      days: workingHours.days.map((day) =>
        day.day_of_week === dayOfWeek ? { ...day, ...patch } : day
      ),
    });
  };

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#EAF3EC] dark:border-[#1F2522] pb-2">
          <h2 className="text-lg font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">
            أوقات العمل (اختياري)
          </h2>
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <input
              type="checkbox"
              checked={enabledHours}
              onChange={(e) => toggleHours(e.target.checked)}
              disabled={disabled}
            />
            تعبئة أوقات العمل الآن
          </label>
        </div>
        {enabledHours && workingHours && (
          <div className="space-y-3">
            {DAYS.map((day) => {
              const row = workingHours.days.find((d) => d.day_of_week === day.id)!;
              return (
                <div
                  key={day.id}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 space-y-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-[#0F3D2E] dark:text-[#EAF3EC]">{day.name}</span>
                    <label className="text-sm flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={row.is_closed}
                        disabled={disabled}
                        onChange={(e) =>
                          updateDay(day.id, {
                            is_closed: e.target.checked,
                            periods: e.target.checked ? [] : [{ opens_at: "09:00", closes_at: "17:00" }],
                          })
                        }
                      />
                      مغلق
                    </label>
                  </div>
                  {!row.is_closed &&
                    row.periods.map((period, index) => (
                      <div key={index} className="flex flex-wrap items-center gap-2">
                        <input
                          type="time"
                          value={period.opens_at}
                          disabled={disabled}
                          onChange={(e) => {
                            const periods = [...row.periods];
                            periods[index] = { ...periods[index], opens_at: e.target.value };
                            updateDay(day.id, { periods });
                          }}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#252525]"
                        />
                        <span className="text-gray-400">إلى</span>
                        <input
                          type="time"
                          value={period.closes_at}
                          disabled={disabled}
                          onChange={(e) => {
                            const periods = [...row.periods];
                            periods[index] = { ...periods[index], closes_at: e.target.value };
                            updateDay(day.id, { periods });
                          }}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#252525]"
                        />
                      </div>
                    ))}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#EAF3EC] dark:border-[#1F2522] pb-2">
          <h2 className="text-lg font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">
            روابط التواصل (اختياري)
          </h2>
          <button
            type="button"
            disabled={disabled}
            onClick={() =>
              onSocialLinksChange([
                ...socialLinks,
                { platform: "instagram", url: "", username: "" },
              ])
            }
            className="inline-flex items-center gap-1 text-sm text-[#1E7D4E] font-medium"
          >
            <Plus className="w-4 h-4" />
            إضافة رابط
          </button>
        </div>
        {socialLinks.length === 0 ? (
          <p className="text-sm text-gray-500">لم تتم إضافة روابط بعد.</p>
        ) : (
          <div className="space-y-3">
            {socialLinks.map((link, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">المنصة</label>
                  <select
                    value={link.platform}
                    disabled={disabled}
                    onChange={(e) => {
                      const next = [...socialLinks];
                      next[index] = { ...next[index], platform: e.target.value };
                      onSocialLinksChange(next);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#252525]"
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs text-gray-500">الرابط</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      dir="ltr"
                      value={link.url}
                      disabled={disabled}
                      placeholder="https://"
                      onChange={(e) => {
                        const next = [...socialLinks];
                        next[index] = { ...next[index], url: e.target.value };
                        onSocialLinksChange(next);
                      }}
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#252525]"
                    />
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onSocialLinksChange(socialLinks.filter((_, i) => i !== index))}
                      className="p-2 text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
