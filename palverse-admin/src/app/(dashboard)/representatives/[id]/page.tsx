"use client";

import { useRepresentative } from "@/hooks/use-representatives";
import { useZonesList } from "@/hooks/use-zones";
import { useCitiesList } from "@/hooks/use-cities";
import { representativesService } from "@/services/representatives.service";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, MapPin, Save, User } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

export default function RepresentativeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const publicId = params.id as string;
  const isNew = publicId === "new";

  const { data: rep, isLoading: repLoading, refresh } = useRepresentative(isNew ? null : publicId);
  
  const { data: citiesData } = useCitiesList({ per_page: 100 }, false);
  const { data: zonesData, setFilter: setZoneFilter } = useZonesList({ per_page: 100 }, false);

  const [selectedCityId, setSelectedCityId] = useState<string>("");

  useEffect(() => {
    setZoneFilter("city", selectedCityId);
  }, [selectedCityId, setZoneFilter]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    employee_code: "",
    password: "",
  });

  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (rep) {
      setFormData({
        name: rep.name || "",
        email: rep.email || "",
        phone: rep.phone || "",
        employee_code: rep.employee_code || "",
        password: "",
      });
      setSelectedZones(rep.active_zones.map(z => z.public_id));
    }
  }, [rep]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      if (isNew) {
        await representativesService.createRepresentative(formData);
        router.push("/representatives");
      } else {
        await representativesService.updateRepresentative(publicId, formData);
        await representativesService.assignZones(publicId, selectedZones);
        refresh();
        alert("تم الحفظ بنجاح");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "حدث خطأ غير متوقع");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleZone = (zoneId: string) => {
    if (selectedZones.includes(zoneId)) {
      setSelectedZones(prev => prev.filter(id => id !== zoneId));
    } else {
      setSelectedZones(prev => [...prev, zoneId]);
    }
  };

  if (repLoading && !isNew) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">جاري التحميل...</div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/representatives"
          className="p-2 hover:bg-muted dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground dark:text-white">
            {isNew ? "إضافة مندوب جديد" : "تعديل بيانات المندوب"}
          </h2>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-lg border border-red-200 dark:border-red-500/20 text-sm">
          {error}
        </div>
      )}

      <div className="bg-card dark:bg-slate-900 border border-border dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2">
              <User className="w-5 h-5 text-emerald-600" />
              البيانات الأساسية
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">الاسم الكامل</label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="اسم المندوب" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">رقم الموظف</label>
                <Input required value={formData.employee_code} onChange={e => setFormData({...formData, employee_code: e.target.value})} placeholder="مثال: EMP-101" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
                <Input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="email@example.com" dir="ltr" className="text-right" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">رقم الهاتف</label>
                <Input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="0590000000" dir="ltr" className="text-right" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">كلمة المرور {isNew ? "" : "(اتركها فارغة إذا لم ترد تغييرها)"}</label>
                <Input type="password" required={isNew} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="كلمة المرور" dir="ltr" />
              </div>
            </div>
          </div>

          {!isNew && (
            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                مناطق العمل (Zones)
              </h3>
              <p className="text-sm text-muted-foreground">اختر المدينة أولاً لفرز المناطق، ثم حدد المناطق المسموح للمندوب العمل بها.</p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">تصفية حسب المدينة</label>
                <select
                  className="w-full md:w-1/3 h-10 px-3 py-2 rounded-md border border-border dark:border-slate-800 bg-card dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={selectedCityId}
                  onChange={(e) => setSelectedCityId(e.target.value)}
                >
                  <option value="">جميع المدن</option>
                  {citiesData?.data?.map(city => (
                    <option key={city.public_id} value={city.public_id}>{city.name_ar}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {zonesData?.data?.map(zone => {
                  const isSelected = selectedZones.includes(zone.public_id);
                  return (
                    <label 
                      key={zone.public_id}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected 
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' 
                          : 'border-border dark:border-slate-800 hover:bg-muted dark:hover:bg-slate-800'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        className="hidden"
                        checked={isSelected}
                        onChange={() => toggleZone(zone.public_id)}
                      />
                      <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600'}`}>
                        {isSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
                      </div>
                      <span className={`text-sm font-medium ${isSelected ? 'text-emerald-700 dark:text-emerald-400' : ''}`}>
                        {zone.name_ar}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-border dark:border-slate-800">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50"
            >
              {isSaving ? "جاري الحفظ..." : (
                <>
                  <Save className="w-4 h-4" />
                  حفظ البيانات
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
