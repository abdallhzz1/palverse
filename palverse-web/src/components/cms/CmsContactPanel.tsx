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
    <div className="flex h-full flex-col gap-7 rounded-[2rem] border border-[#E2EAE5] bg-white p-8 shadow-[0_1px_3px_rgba(26,61,50,0.04)]">
      <h3 className="mb-1 text-2xl font-bold text-[#1A3D32]">{data.info_card_title_ar}</h3>

      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F7F9F8] text-[#2F6B4F]">
          <Phone className="h-5 w-5" />
        </div>
        <div>
          <h4 className="mb-1 font-bold text-[#1A3D32]">{data.phone_label_ar}</h4>
          <a href={`tel:${data.phone.replace(/\s/g, "")}`} className="text-right text-[#6B8578]" dir="ltr">
            {data.phone}
          </a>
          {data.phone_hint_ar ? <p className="mt-1 text-sm text-[#6B8578]">{data.phone_hint_ar}</p> : null}
        </div>
      </div>

      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F7F9F8] text-[#2F6B4F]">
          <Mail className="h-5 w-5" />
        </div>
        <div>
          <h4 className="mb-1 font-bold text-[#1A3D32]">{data.email_label_ar}</h4>
          <a href={`mailto:${data.email}`} className="break-all text-[#6B8578]">
            {data.email}
          </a>
          {data.email_hint_ar ? <p className="mt-1 text-sm text-[#6B8578]">{data.email_hint_ar}</p> : null}
        </div>
      </div>

      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F7F9F8] text-[#2F6B4F]">
          <MapPin className="h-5 w-5" />
        </div>
        <div>
          <h4 className="mb-1 font-bold text-[#1A3D32]">{data.address_label_ar}</h4>
          <p className="text-[#6B8578]">{data.address_ar}</p>
          {data.address_line2_ar ? <p className="mt-1 text-sm text-[#6B8578]">{data.address_line2_ar}</p> : null}
        </div>
      </div>

      <div className="relative mt-auto h-48 w-full overflow-hidden rounded-2xl border border-[#E2EAE5] bg-[#F7F9F8]">
        <iframe
          src={mapSrc}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={true}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 grayscale transition-all duration-500 hover:grayscale-0"
        />
      </div>
    </div>
  );
}
