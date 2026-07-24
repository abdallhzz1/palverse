"use client";

import { Send } from "lucide-react";
import { useState } from "react";

interface ContactFormProps {
  whatsappNumber?: string | null;
  formTitle?: string | null;
  submitLabel?: string | null;
}

export function ContactForm({
  whatsappNumber,
  formTitle,
  submitLabel,
}: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const phone = (whatsappNumber || "972593883932").replace(/[^\d]/g, "");
  const title = formTitle || "أرسل لنا رسالة";
  const buttonLabel = submitLabel || "إرسال عبر واتساب";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `الاسم: ${name}\nالبريد: ${email}\nالموضوع: ${subject}\n\nالرسالة:\n${message}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="bg-white rounded-[2rem] border border-[#EAF3EC] shadow-[0_1px_3px_rgba(15,61,46,0.04)] p-8 md:p-12">
      <h3 className="text-2xl font-bold text-[#0F3D2E] mb-6">{title}</h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-semibold text-[#0F3D2E]">
              الاسم الكامل
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="محمد أحمد"
              className="w-full bg-[#F9FBF9] border border-[#EAF3EC] rounded-xl px-4 py-3 outline-none focus:border-[#1E7D4E] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-semibold text-[#0F3D2E]">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="example@mail.com"
              className="w-full bg-[#F9FBF9] border border-[#EAF3EC] rounded-xl px-4 py-3 outline-none focus:border-[#1E7D4E] transition-colors dir-ltr text-right"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="subject" className="text-sm font-semibold text-[#0F3D2E]">
            الموضوع
          </label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            placeholder="كيف يمكننا مساعدتك؟"
            className="w-full bg-[#F9FBF9] border border-[#EAF3EC] rounded-xl px-4 py-3 outline-none focus:border-[#1E7D4E] transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="message" className="text-sm font-semibold text-[#0F3D2E]">
            الرسالة
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={6}
            placeholder="اكتب رسالتك هنا بالتفصيل..."
            className="w-full bg-[#F9FBF9] border border-[#EAF3EC] rounded-xl px-4 py-3 outline-none focus:border-[#1E7D4E] transition-colors resize-none"
          />
        </div>

        <button
          type="submit"
          className="mt-2 bg-[#1E7D4E] hover:bg-[#0F3D2E] text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2 self-start w-full sm:w-auto"
        >
          {buttonLabel}
          <Send className="w-5 h-5 rotate-180" />
        </button>
      </form>
    </div>
  );
}
