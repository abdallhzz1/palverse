"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Camera, Save, Lock, User, Phone, Mail } from "lucide-react";
import { authService } from "@/services/auth.service";
import { usePublicAuth } from "@/contexts/AuthContext";

export function ProfileSettings() {
  const { user, login } = usePublicAuth(); // To update user state, we might need a method from context or reload
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  const { register: registerProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors } } = useForm({
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
    }
  });

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset: resetPasswordForm, formState: { errors: passwordErrors } } = useForm();

  const onProfileSubmit = async (data: any) => {
    setIsUpdatingProfile(true);
    try {
      const res = await authService.updateProfile(data);
      toast.success("تم تحديث البيانات بنجاح");
      window.location.reload(); // Refresh to update context
    } catch (error: any) {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء التحديث");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onPasswordSubmit = async (data: any) => {
    if (data.password !== data.password_confirmation) {
      toast.error("كلمة المرور غير متطابقة");
      return;
    }
    
    setIsUpdatingPassword(true);
    try {
      await authService.updateProfile({
        name: user?.name,
        current_password: data.current_password,
        password: data.password,
        password_confirmation: data.password_confirmation,
      });
      toast.success("تم تغيير كلمة المرور بنجاح");
      resetPasswordForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء تغيير كلمة المرور");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploadingAvatar(true);
    try {
      await authService.updateAvatar(file);
      toast.success("تم تحديث الصورة الشخصية بنجاح");
      window.location.reload(); // Refresh to update context and UI
    } catch (error: any) {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء رفع الصورة");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl space-y-8 pb-10">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">
          الملف الشخصي
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          إدارة إعدادات حسابك الشخصي والصورة الرمزية وكلمة المرور.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Avatar Section */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col items-center text-center">
            <div className="relative mb-4 group">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-[#1a2520] shadow-lg flex items-center justify-center">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-[#1E7D4E]">{user.name.charAt(0)}</span>
                )}
              </div>
              <label 
                className="absolute bottom-0 right-0 w-10 h-10 bg-[#1E7D4E] hover:bg-[#0F3D2E] text-white rounded-full flex items-center justify-center cursor-pointer shadow-md transition-colors border-2 border-white dark:border-[#1A1A1A]"
                htmlFor="avatar-upload"
              >
                {isUploadingAvatar ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-5 h-5" />
                )}
              </label>
              <input 
                type="file" 
                id="avatar-upload" 
                accept="image/*" 
                className="hidden" 
                onChange={handleAvatarChange}
                disabled={isUploadingAvatar}
              />
            </div>
            <h2 className="text-lg font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">{user.name}</h2>
            <div className="inline-flex mt-1 items-center px-2 py-0.5 rounded text-xs font-medium bg-[#EAF3EC] text-[#1E7D4E] dark:bg-[#0F3D2E]/40 dark:text-[#EAF3EC]">
              {user.roles.join(", ")}
            </div>
            <p className="text-sm text-gray-500 mt-2">{user.email}</p>
          </div>
        </div>

        {/* Forms Section */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Profile Info Form */}
          <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-5 flex items-center gap-2">
              <User className="w-5 h-5 text-[#1E7D4E]" />
              المعلومات الأساسية
            </h3>
            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    الاسم الكامل
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...registerProfile("name", { required: "الاسم مطلوب" })}
                      type="text"
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-[#1E7D4E] focus:border-transparent outline-none dark:text-white"
                    />
                  </div>
                  {profileErrors.name && <p className="text-red-500 text-xs mt-1">{profileErrors.name.message as string}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    رقم الهاتف
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...registerProfile("phone")}
                      type="text"
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-[#1E7D4E] focus:border-transparent outline-none dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  البريد الإلكتروني (لا يمكن تغييره)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 pr-10 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="bg-[#1E7D4E] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#0F3D2E] transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {isUpdatingProfile ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-5 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#1E7D4E]" />
              تغيير كلمة المرور
            </h3>
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  كلمة المرور الحالية
                </label>
                <input
                  {...registerPassword("current_password", { required: "مطلوب لتغيير كلمة المرور" })}
                  type="password"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#1E7D4E] focus:border-transparent outline-none dark:text-white"
                />
                {passwordErrors.current_password && <p className="text-red-500 text-xs mt-1">{passwordErrors.current_password.message as string}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    كلمة المرور الجديدة
                  </label>
                  <input
                    {...registerPassword("password", { 
                      required: "مطلوب",
                      minLength: { value: 8, message: "يجب أن تكون 8 أحرف على الأقل" }
                    })}
                    type="password"
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#1E7D4E] focus:border-transparent outline-none dark:text-white"
                  />
                  {passwordErrors.password && <p className="text-red-500 text-xs mt-1">{passwordErrors.password.message as string}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    تأكيد كلمة المرور
                  </label>
                  <input
                    {...registerPassword("password_confirmation", { required: "مطلوب" })}
                    type="password"
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#1E7D4E] focus:border-transparent outline-none dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="bg-gray-800 text-white dark:bg-gray-700 dark:hover:bg-gray-600 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-900 transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {isUpdatingPassword ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Lock className="w-5 h-5" />
                  )}
                  تحديث كلمة المرور
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
