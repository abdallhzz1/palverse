import {
  Store,
  TrendingUp,
  Users,
  CheckCircle2,
  ArrowLeft,
  Shield,
  Zap,
  MapPin,
  Image as ImageIcon,
  BarChart3,
  Star,
} from "lucide-react";
import Link from "next/link";
import { PublicPageHero } from "@/components/public/PublicPageHero";

export const metadata = {
  title: "أضف نشاطك | بال فيرس",
  description:
    "انضم إلى أكبر دليل تجاري فلسطيني. سجّل نشاطك التجاري مجاناً وابدأ بالوصول إلى آلاف العملاء.",
};

const benefits = [
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "لوحة تحكم متكاملة",
    description: "أدر تفاصيل محلك، ساعات العمل، والصور بكل سهولة من مكان واحد.",
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: "نظام عروض ذكي",
    description: "أضف عروضك وخصوماتك لتصل إلى آلاف الزوار النشطين في منصتنا.",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "وصول أكبر للعملاء",
    description: "ظهر محلك في نتائج البحث وصفحات المدن لتزيد مبيعاتك وعملائك.",
  },
  {
    icon: <MapPin className="h-6 w-6" />,
    title: "موقع تفاعلي على الخريطة",
    description: "يجد عملاؤك موقعك بسهولة عبر الخريطة التفاعلية المدمجة في صفحتك.",
  },
  {
    icon: <ImageIcon className="h-6 w-6" />,
    title: "معرض صور احترافي",
    description: "اعرض منتجاتك وخدماتك بصور عالية الجودة في معرض جذاب.",
  },
  {
    icon: <Star className="h-6 w-6" />,
    title: "نظام تقييمات وآراء",
    description: "اجمع تقييمات عملائك وابن سمعتك التجارية الإلكترونية بثقة.",
  },
];

const steps = [
  {
    num: "01",
    icon: <Shield className="h-6 w-6" />,
    title: "أرسل طلب الانضمام",
    desc: "عبّئ نموذج بسيط ببيانات النشاط ورقم الهاتف — بدون اختيار باقات مسبقاً.",
  },
  {
    num: "02",
    icon: <Store className="h-6 w-6" />,
    title: "تواصل فريق المتابعة",
    desc: "يتواصل معك فريقنا، يوضح الباقات المناسبة، ويجهّز حسابك.",
  },
  {
    num: "03",
    icon: <Zap className="h-6 w-6" />,
    title: "التفعيل والانطلاق",
    desc: "بعد الموافقة وتعيين الباقة يظهر نشاطك في الدليل ويصل لعملائك.",
  },
];

export default function JoinUsPage() {
  return (
    <div className="flex flex-col bg-[#F7F9F8]">
      <PublicPageHero
        size="home"
        title="أضف نشاطك التجاري وصِل إلى آلاف العملاء"
        subtitle="أرسل طلب انضمام بسيط. فريق المتابعة يتواصل معك ويحدّد الباقة المناسبة عند التفعيل."
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/register/merchant"
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#2F6B4F] px-7 py-3.5 text-base font-bold text-white transition-colors hover:bg-[#1A3D32]"
          >
            ابدأ طلب الانضمام
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          </Link>
          <a
            href="#benefits"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E2EAE5] bg-white px-7 py-3.5 text-base font-medium text-[#1A3D32] transition-colors hover:border-[#2F6B4F]/40"
          >
            اكتشف المزايا
          </a>
        </div>
      </PublicPageHero>

      <section id="benefits" className="public-section bg-white">
        <div className="public-container">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-sm font-bold tracking-wide text-[#2F6B4F]">المزايا</p>
            <h2 className="mt-2 font-heading text-3xl font-extrabold text-[#1A3D32] md:text-4xl">
              لماذا تنضم إلى بال فيرس؟
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[#6B8578] md:text-lg">
              ميزات صُمّمت لنجاح نشاطك التجاري ونموّه.
            </p>
          </div>

          <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b) => (
              <div key={b.title} className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E2EAE5] bg-[#F7F9F8] text-[#2F6B4F]">
                  {b.icon}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-[#1A3D32]">{b.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#6B8578]">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="public-section bg-[#F7F9F8]">
        <div className="public-container">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="text-sm font-bold tracking-wide text-[#2F6B4F]">الخطوات</p>
            <h2 className="mt-2 font-heading text-3xl font-extrabold text-[#1A3D32] md:text-4xl">
              3 خطوات بسيطة للانطلاق
            </h2>
            <p className="mt-3 text-base text-[#6B8578] md:text-lg">
              طلب بسيط عبر الهاتف، ثم المتابعة تختار الباقة المناسبة لنشاطك
            </p>
          </div>

          <div className="relative mx-auto max-w-4xl">
            <div className="absolute top-8 left-[16%] right-[16%] hidden h-px bg-[#E2EAE5] md:block" />
            <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
              {steps.map((step) => (
                <div key={step.num} className="relative flex flex-col items-center gap-4 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#E2EAE5] bg-white text-[#2F6B4F]">
                    {step.icon}
                  </div>
                  <span className="text-xs font-black tracking-widest text-[#6B8578]">
                    {step.num}
                  </span>
                  <h3 className="font-heading text-lg font-bold text-[#1A3D32]">{step.title}</h3>
                  <p className="max-w-[240px] text-sm leading-relaxed text-[#6B8578]">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#E2EAE5] bg-[#1A3D32] py-16 md:py-20">
        <div className="public-container text-center text-white">
          <h2 className="font-heading text-3xl font-extrabold md:text-4xl">
            جاهز لتوسيع نطاق أعمالك؟
          </h2>
          <p className="mx-auto mb-8 mt-4 max-w-2xl text-base leading-relaxed text-[#E8EEEA]/90 md:text-lg">
            انضم الآن وابدأ بإدارة نشاطك التجاري وعروضك بفعالية. الانضمام مجاني تماماً.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/register/merchant"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-bold text-[#1A3D32] transition-colors hover:bg-[#E8EEEA]"
            >
              سجّل نشاطك الآن
              <CheckCircle2 className="h-5 w-5 text-[#2F6B4F]" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl border border-white/25 px-8 py-3.5 text-base font-medium text-white/85 transition-colors hover:border-white/50 hover:text-white"
            >
              تواصل مع فريقنا
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
