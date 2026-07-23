import { Mail, MapPin, Phone } from "lucide-react";

export type CmsContactMeta = {
  info_card_title_ar?: string | null;
  phone?: string | null;
  phone_label_ar?: string | null;
  phone_hint_ar?: string | null;
  email?: string | null;
  email_label_ar?: string | null;
  email_hint_ar?: string | null;
  address_ar?: string | null;
  address_line2_ar?: string | null;
  address_label_ar?: string | null;
  map_embed_url?: string | null;
  map_lat?: string | null;
  map_lng?: string | null;
};

const DEFAULTS = {
  info_card_title_ar: "معلومات الاتصال",
  phone: "+972 59-388-3932",
  phone_label_ar: "رقم الهاتف",
  phone_hint_ar: "متاحون من 8 صباحاً حتى 5 مساءً",
  email: "info@palverse.ps",
  email_label_ar: "البريد الإلكتروني",
  email_hint_ar: "نرد على رسائلكم خلال 24 ساعة",
  address_ar: "فلسطين، الخليل",
  address_line2_ar: "دائرة السير",
  address_label_ar: "العنوان",
  map_lat: "31.557111",
  map_lng: "35.096111",
} as const;

function pick(value: string | null | undefined, fallback: string): string {
  return value && value.trim() !== "" ? value : fallback;
}

interface CmsContactPanelProps {
  meta?: CmsContactMeta | null;
}

export function CmsContactPanel({ meta }: CmsContactPanelProps) {
  const data = {
    info_card_title_ar: pick(meta?.info_card_title_ar, DEFAULTS.info_card_title_ar),
    phone: pick(meta?.phone, DEFAULTS.phone),
    phone_label_ar: pick(meta?.phone_label_ar, DEFAULTS.phone_label_ar),
    phone_hint_ar: pick(meta?.phone_hint_ar, DEFAULTS.phone_hint_ar),
    email: pick(meta?.email, DEFAULTS.email),
    email_label_ar: pick(meta?.email_label_ar, DEFAULTS.email_label_ar),
    email_hint_ar: pick(meta?.email_hint_ar, DEFAULTS.email_hint_ar),
    address_ar: pick(meta?.address_ar, DEFAULTS.address_ar),
    address_line2_ar: pick(meta?.address_line2_ar, DEFAULTS.address_line2_ar),
    address_label_ar: pick(meta?.address_label_ar, DEFAULTS.address_label_ar),
    map_lat: pick(meta?.map_lat, DEFAULTS.map_lat),
    map_lng: pick(meta?.map_lng, DEFAULTS.map_lng),
    map_embed_url: meta?.map_embed_url?.trim() || null,
  };

  const mapSrc =
    data.map_embed_url ||
    `https://maps.google.com/maps?q=${encodeURIComponent(`${data.map_lat},${data.map_lng}`)}&z=16&output=embed`;

  return (
    <div className="bg-white dark:bg-[#1F2522] rounded-[2rem] shadow-sm border border-[#EAF3EC] dark:border-[#0F3D2E] p-8 flex flex-col gap-8 h-full">
      <h3 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-2">
        {data.info_card_title_ar}
      </h3>

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-[#EAF3EC] dark:bg-[#0F3D2E] rounded-full flex items-center justify-center shrink-0 text-[#1E7D4E]">
          <Phone className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-1">{data.phone_label_ar}</h4>
          <p className="text-[#7FA789] dir-ltr text-right">{data.phone}</p>
          {data.phone_hint_ar ? <p className="text-[#7FA789] text-sm mt-1">{data.phone_hint_ar}</p> : null}
        </div>
      </div>

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-[#EAF3EC] dark:bg-[#0F3D2E] rounded-full flex items-center justify-center shrink-0 text-[#1E7D4E]">
          <Mail className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-1">{data.email_label_ar}</h4>
          <p className="text-[#7FA789]">{data.email}</p>
          {data.email_hint_ar ? <p className="text-[#7FA789] text-sm mt-1">{data.email_hint_ar}</p> : null}
        </div>
      </div>

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-[#EAF3EC] dark:bg-[#0F3D2E] rounded-full flex items-center justify-center shrink-0 text-[#1E7D4E]">
          <MapPin className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-1">{data.address_label_ar}</h4>
          <p className="text-[#7FA789]">{data.address_ar}</p>
          {data.address_line2_ar ? <p className="text-[#7FA789] text-sm mt-1">{data.address_line2_ar}</p> : null}
        </div>
      </div>

      <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-xl mt-auto overflow-hidden relative">
        <iframe
          src={mapSrc}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={true}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 grayscale hover:grayscale-0 transition-all duration-500"
        />
      </div>
    </div>
  );
}
