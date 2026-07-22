"use client";

import { useEffect, useState } from "react";
import { Save, Settings as SettingsIcon, AlertCircle, RefreshCw } from "lucide-react";
import { useSettings, useSettingsActions } from "@/hooks/use-settings";
import { SETTINGS_GROUPS, SettingsGroupName, SettingField, SettingsGroup } from "@/types/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const GROUP_LABELS: Record<SettingsGroupName, string> = {
  general: "الإعدادات العامة",
  branding: "الهوية البصرية",
  contact: "معلومات التواصل",
  social: "روابط التواصل الاجتماعي",
  application: "إعدادات التطبيق",
  maintenance: "وضع الصيانة",
  financial: "الإعدادات المالية",
};

type GroupValues = Record<string, unknown>;

function fieldLabel(key: string, field: SettingField): string {
  if (field.description_ar) return field.description_ar;
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function GroupCard({
  group,
  fields,
  onSaved,
}: {
  group: SettingsGroupName;
  fields: SettingsGroup;
  onSaved: () => void;
}) {
  const { updateGroup, isUpdating } = useSettingsActions();
  const [values, setValues] = useState<GroupValues>({});
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const initial: GroupValues = {};
    Object.entries(fields).forEach(([key, field]) => {
      initial[key] = field.value;
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValues(initial);
    setDirty(false);
  }, [fields]);

  const setValue = (key: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await updateGroup(group, values, () => {
      setDirty(false);
      onSaved();
    });
    return ok;
  };

  const entries = Object.entries(fields);

  return (
    <form
      onSubmit={handleSave}
      className="bg-card dark:bg-slate-900 rounded-xl border border-border dark:border-slate-800 shadow-sm"
    >
      <div className="px-6 py-4 border-b border-border dark:border-slate-800 flex items-center justify-between">
        <h3 className="font-semibold text-foreground dark:text-white">{GROUP_LABELS[group] ?? group}</h3>
        <span className="text-xs text-muted-foreground text-latin" dir="ltr">
          {group}
        </span>
      </div>

      <div className="p-6 space-y-5">
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا توجد إعدادات في هذه المجموعة.</p>
        ) : (
          entries.map(([key, field]) => {
            const label = fieldLabel(key, field);
            const value = values[key];

            if (field.type === "boolean") {
              return (
                <div key={key} className="flex items-center justify-between gap-4">
                  <div>
                    <Label className="font-medium">{label}</Label>
                    {field.description_en && (
                      <p className="text-xs text-muted-foreground mt-0.5" dir="ltr">{field.description_en}</p>
                    )}
                  </div>
                  <Switch checked={Boolean(value)} onCheckedChange={(checked) => setValue(key, checked)} disabled={isUpdating} />
                </div>
              );
            }

            if (field.type === "json") {
              return (
                <div key={key} className="space-y-2">
                  <Label htmlFor={`${group}-${key}`}>{label}</Label>
                  <Textarea
                    id={`${group}-${key}`}
                    dir="ltr"
                    className="text-left font-mono text-xs"
                    value={typeof value === "string" ? value : JSON.stringify(value ?? "", null, 2)}
                    onChange={(e) => setValue(key, e.target.value)}
                    disabled={isUpdating}
                  />
                </div>
              );
            }

            const inputType =
              field.type === "integer" || field.type === "decimal"
                ? "number"
                : field.type === "email"
                ? "email"
                : field.type === "url"
                ? "url"
                : "text";

            const isLtr = field.type === "email" || field.type === "url";

            return (
              <div key={key} className="space-y-2">
                <Label htmlFor={`${group}-${key}`}>{label}</Label>
                <Input
                  id={`${group}-${key}`}
                  type={inputType}
                  step={field.type === "decimal" ? "any" : undefined}
                  dir={isLtr ? "ltr" : undefined}
                  className={isLtr ? "text-right" : undefined}
                  value={value == null ? "" : String(value)}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (field.type === "integer") {
                      setValue(key, raw === "" ? "" : parseInt(raw, 10));
                    } else if (field.type === "decimal") {
                      setValue(key, raw === "" ? "" : parseFloat(raw));
                    } else {
                      setValue(key, raw);
                    }
                  }}
                  disabled={isUpdating}
                />
                {field.description_en && (
                  <p className="text-xs text-muted-foreground" dir="ltr">{field.description_en}</p>
                )}
              </div>
            );
          })
        )}
      </div>

      {entries.length > 0 && (
        <div className="px-6 py-4 border-t border-border dark:border-slate-800 flex justify-end">
          <Button type="submit" disabled={isUpdating || !dirty} className="bg-[#1E7D4E] hover:bg-[#0F3D2E] text-white gap-2">
            <Save className="w-4 h-4" />
            {isUpdating ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
        </div>
      )}
    </form>
  );
}

export default function SettingsPage() {
  const { data, isLoading, error, refresh } = useSettings();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground dark:text-white flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-[#1E7D4E]" />
            إعدادات النظام
          </h2>
          <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">
            إدارة إعدادات المنصة العامة والتواصل والهوية البصرية.
          </p>
        </div>
        <Button onClick={refresh} variant="outline" size="icon" disabled={isLoading} aria-label="تحديث">
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-56 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 p-6 rounded-lg border border-red-200 dark:border-red-800 flex flex-col items-center text-center">
          <AlertCircle className="w-10 h-10 mb-3" />
          <p>{error.message || "حدث خطأ أثناء تحميل الإعدادات"}</p>
          <Button variant="outline" className="mt-4" onClick={refresh}>
            إعادة المحاولة
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
          {SETTINGS_GROUPS.filter((group) => data?.[group]).map((group) => (
            <GroupCard key={group} group={group} fields={data![group]} onSaved={refresh} />
          ))}
        </div>
      )}
    </div>
  );
}
