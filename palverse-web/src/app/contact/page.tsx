"use client";

import { Mail, Phone, MapPin, Send } from "lucide-react";
import { BrandSectionHeading } from "@/components/brand/BrandSectionHeading";
import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const phone = "972593883932"; // +972 59-388-3932 without symbols
    const text = `الاسم: ${name}\nالبريد: ${email}\nالموضوع: ${subject}\n\nالرسالة:\n${message}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="container mx-auto px-4 py-16 min-h-[70vh]">
      <BrandSectionHeading 
        title="تواصل معنا" 
        subtitle="نحن هنا لمساعدتك! لا تتردد في التواصل معنا لأي استفسار أو اقتراح." 
        className="mb-16" 
      />

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-16">
        
        {/* Contact Info (Left Side / Right in RTL) */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className="bg-white dark:bg-[#1F2522] rounded-[2rem] shadow-sm border border-[#EAF3EC] dark:border-[#0F3D2E] p-8 flex flex-col gap-8 h-full">
            <h3 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-2">معلومات الاتصال</h3>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#EAF3EC] dark:bg-[#0F3D2E] rounded-full flex items-center justify-center shrink-0 text-[#1E7D4E]">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-1">رقم الهاتف</h4>
                <p className="text-[#7FA789] dir-ltr text-right">+972 59-388-3932</p>
                <p className="text-[#7FA789] text-sm mt-1">متاحون من 8 صباحاً حتى 5 مساءً</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#EAF3EC] dark:bg-[#0F3D2E] rounded-full flex items-center justify-center shrink-0 text-[#1E7D4E]">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-1">البريد الإلكتروني</h4>
                <p className="text-[#7FA789]">info@palverse.ps</p>
                <p className="text-[#7FA789] text-sm mt-1">نرد على رسائلكم خلال 24 ساعة</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#EAF3EC] dark:bg-[#0F3D2E] rounded-full flex items-center justify-center shrink-0 text-[#1E7D4E]">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-1">العنوان</h4>
                <p className="text-[#7FA789]">فلسطين، الخليل</p>
                <p className="text-[#7FA789] text-sm mt-1">دائرة السير</p>
              </div>
            </div>
            
            {/* Map Placeholder */}
            <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-xl mt-auto overflow-hidden relative">
              <iframe 
                src="https://maps.google.com/maps?q=31.557111,35.096111&z=16&output=embed"
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 grayscale hover:grayscale-0 transition-all duration-500"
              ></iframe>
            </div>
          </div>
        </div>

        {/* Contact Form (Right Side / Left in RTL) */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white dark:bg-[#1F2522] rounded-[2rem] shadow-sm border border-[#EAF3EC] dark:border-[#0F3D2E] p-8 md:p-12">
            <h3 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-6">أرسل لنا رسالة</h3>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-sm font-semibold text-[#0F3D2E] dark:text-[#EAF3EC]">الاسم الكامل</label>
                  <input 
                    type="text" 
                    id="name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="محمد أحمد" 
                    className="w-full bg-[#F9FBF9] dark:bg-[#171717] border border-[#EAF3EC] dark:border-[#0F3D2E] rounded-xl px-4 py-3 outline-none focus:border-[#1E7D4E] transition-colors"
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-sm font-semibold text-[#0F3D2E] dark:text-[#EAF3EC]">البريد الإلكتروني</label>
                  <input 
                    type="email" 
                    id="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="example@mail.com" 
                    className="w-full bg-[#F9FBF9] dark:bg-[#171717] border border-[#EAF3EC] dark:border-[#0F3D2E] rounded-xl px-4 py-3 outline-none focus:border-[#1E7D4E] transition-colors dir-ltr text-right"
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <label htmlFor="subject" className="text-sm font-semibold text-[#0F3D2E] dark:text-[#EAF3EC]">الموضوع</label>
                <input 
                  type="text" 
                  id="subject" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder="كيف يمكننا مساعدتك؟" 
                  className="w-full bg-[#F9FBF9] dark:bg-[#171717] border border-[#EAF3EC] dark:border-[#0F3D2E] rounded-xl px-4 py-3 outline-none focus:border-[#1E7D4E] transition-colors"
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label htmlFor="message" className="text-sm font-semibold text-[#0F3D2E] dark:text-[#EAF3EC]">الرسالة</label>
                <textarea 
                  id="message" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={6}
                  placeholder="اكتب رسالتك هنا بالتفصيل..." 
                  className="w-full bg-[#F9FBF9] dark:bg-[#171717] border border-[#EAF3EC] dark:border-[#0F3D2E] rounded-xl px-4 py-3 outline-none focus:border-[#1E7D4E] transition-colors resize-none"
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                className="mt-2 bg-[#1E7D4E] hover:bg-[#0F3D2E] text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2 self-start w-full sm:w-auto"
              >
                إرسال عبر واتساب
                <Send className="w-5 h-5 rotate-180" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
