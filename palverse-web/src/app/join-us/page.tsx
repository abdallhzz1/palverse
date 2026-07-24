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
import Image from "next/image";
import { PublicPageHero } from "@/components/public/PublicPageHero";
import { BRAND_PHOTOS } from "@/lib/brand-photos";

export const metadata = {
  title: "أضف نشاطك | بال فيرس",
  description: "انضم إلى أكبر دليل تجاري فلسطيني. سجّل نشاطك التجاري مجاناً وابدأ بالوصول إلى آلاف العملاء.",
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
    title: "سجّل حسابك",
    desc: "أدخل معلوماتك الأساسية لإنشاء حساب تاجر في أقل من دقيقتين.",
  },
  {
    num: "02",
    icon: <Store className="h-6 w-6" />,
    title: "أضف تفاصيل نشاطك",
    desc: "قم بتعبئة بيانات نشاطك التجاري، موقعه، صوره، وساعات عمله.",
  },
  {
    num: "03",
    icon: <Zap className="h-6 w-6" />,
    title: "التفعيل والانطلاق",
    desc: "يراجع فريقنا الطلب ويفعّل حسابك سريعاً. أنت جاهز للظهور!",
  },
];

export default function JoinUsPage() {
  return (
    <div className="flex flex-col">
      <PublicPageHero
        size="home"
        priority
        imageSrc={BRAND_PHOTOS.join}
        imageAlt="تاجر فلسطيني يدير نشاطه التجاري"
        title="أضف نشاطك التجاري وصِل إلى آلاف العملاء"
        subtitle="انضم إلى أكبر دليل تجاري فلسطيني، واعرض متجرك ومنتجاتك وعروضك أمام جمهور واسع في مختلف المدن."
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/register/merchant"
            className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-[#1E7D4E] px-8 py-4 text-lg font-bold text-white shadow-2xl shadow-[#1E7D4E]/30 transition-all hover:-translate-y-1 hover:bg-[#15603A] hover:shadow-[#1E7D4E]/50"
          >
            ابدأ التسجيل مجاناً
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          </Link>
          <a
            href="#benefits"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/25 px-8 py-4 text-lg font-medium text-white/85 transition-colors hover:border-white/50 hover:text-white"
          >
            اكتشف المزايا
          </a>
        </div>
      </PublicPageHero>

      {/* ══════════════════ BENEFITS ══════════════════ */}
      <section id="benefits" className="public-section bg-white">
        <div className="public-container grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="relative order-2 min-h-[320px] overflow-hidden rounded-[2rem] shadow-[0_20px_60px_-24px_rgba(15,61,46,0.35)] lg:order-1 lg:h-full">
            <Image
              src={BRAND_PHOTOS.joinBenefit}
              alt="أجواء تجارية فلسطينية"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F3D2E]/50 via-transparent to-transparent" />
          </div>

          <div className="order-1 flex flex-col gap-8 lg:order-2">
            <div>
              <p className="text-sm font-bold tracking-[0.2em] text-[#1E7D4E]">المزايا</p>
              <h2 className="mt-3 font-heading text-3xl font-extrabold text-[#0F3D2E] md:text-4xl">
                لماذا تنضم إلى بال فيرس؟
              </h2>
              <p className="mt-3 text-lg leading-relaxed text-[#5B6F63]">
                ميزات صممت خصيصاً لنجاح نشاطك التجاري ونموّه.
              </p>
            </div>

            <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
              {benefits.map((b) => (
                <div key={b.title} className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF3EC] text-[#1E7D4E]">
                    {b.icon}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-[#0F3D2E]">{b.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-[#6C8478]">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ HOW IT WORKS ══════════════════ */}
      <section id="how-it-works" className="public-section bg-[#F5F7F6]">
        <div className="public-container">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="text-sm font-bold tracking-[0.2em] text-[#1E7D4E]">الخطوات</p>
            <h2 className="mt-3 font-heading text-3xl font-extrabold text-[#0F3D2E] md:text-4xl">
              3 خطوات بسيطة للانطلاق
            </h2>
            <p className="mt-3 text-lg text-[#6C8478]">
              عملية تسجيل سهلة وسريعة، تستغرق أقل من دقيقتين
            </p>
          </div>

          <div className="relative mx-auto max-w-4xl">
            <div className="absolute top-8 left-[16%] right-[16%] hidden h-px bg-[#1E7D4E]/25 md:block" />
            <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
              {steps.map((step) => (
                <div key={step.num} className="relative flex flex-col items-center gap-4 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#1E7D4E] bg-white text-[#1E7D4E] shadow-sm">
                    {step.icon}
                  </div>
                  <span className="text-xs font-black tracking-widest text-[#7FA789]">
                    {step.num}
                  </span>
                  <h3 className="font-heading text-lg font-bold text-[#0F3D2E]">{step.title}</h3>
                  <p className="max-w-[240px] text-sm leading-relaxed text-[#6C8478]">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ FINAL CTA ══════════════════ */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <Image
          src={BRAND_PHOTOS.join}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F3D2E]/95 via-[#0F3D2E]/90 to-[#1E7D4E]/85" />
        <div className="public-container relative z-10 text-center text-white">
          <h2 className="font-heading text-3xl font-extrabold md:text-5xl">
            جاهز لتوسيع نطاق أعمالك؟
          </h2>
          <p className="mx-auto mb-10 mt-5 max-w-2xl text-lg leading-relaxed text-[#EAF3EC]/90">
            انضم الآن وابدأ بإدارة نشاطك التجاري وعروضك بفعالية واحترافية. الانضمام مجاني تماماً.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/register/merchant"
              className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-10 py-4 text-lg font-bold text-[#0F3D2E] shadow-2xl transition-all hover:-translate-y-1 hover:bg-[#EAF3EC]"
            >
              سجّل نشاطك الآن
              <CheckCircle2 className="h-5 w-5 text-[#1E7D4E]" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-2xl border border-white/25 px-8 py-4 text-lg font-medium text-white/85 transition-colors hover:border-white/50 hover:text-white"
            >
              تواصل مع فريقنا
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
