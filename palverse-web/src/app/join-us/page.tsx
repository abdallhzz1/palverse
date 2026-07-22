import {
  Store,
  TrendingUp,
  Users,
  CheckCircle2,
  ArrowLeft,
  Star,
  Shield,
  Zap,
  MapPin,
  Image as ImageIcon,
  BarChart3,
  Clock,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "أضف نشاطك | بال فيرس",
  description: "انضم إلى أكبر دليل تجاري فلسطيني. سجّل نشاطك التجاري مجاناً وابدأ بالوصول إلى آلاف العملاء.",
};

export default function JoinUsPage() {
  const benefits = [
    {
      icon: <BarChart3 className="w-7 h-7 text-[#1E7D4E]" />,
      title: "لوحة تحكم متكاملة",
      description: "أدر تفاصيل محلك، ساعات العمل، والصور بكل سهولة من مكان واحد.",
    },
    {
      icon: <TrendingUp className="w-7 h-7 text-[#1E7D4E]" />,
      title: "نظام عروض ذكي",
      description: "أضف عروضك وخصوماتك لتصل إلى آلاف الزوار النشطين في منصتنا.",
    },
    {
      icon: <Users className="w-7 h-7 text-[#1E7D4E]" />,
      title: "وصول أكبر للعملاء",
      description: "ظهر محلك في نتائج البحث وصفحات المدن لتزيد مبيعاتك وعملائك.",
    },
    {
      icon: <MapPin className="w-7 h-7 text-[#1E7D4E]" />,
      title: "موقع تفاعلي على الخريطة",
      description: "يجد عملاؤك موقعك بسهولة بالغة عبر الخريطة التفاعلية المدمجة في صفحتك.",
    },
    {
      icon: <ImageIcon className="w-7 h-7 text-[#1E7D4E]" />,
      title: "معرض صور احترافي",
      description: "اعرض منتجاتك وخدماتك بصور عالية الجودة في معرض جذاب.",
    },
    {
      icon: <Star className="w-7 h-7 text-[#1E7D4E]" />,
      title: "نظام تقييمات وآراء",
      description: "اجمع تقييمات عملائك وابن سمعتك التجارية الإلكترونية بثقة.",
    },
  ];

  const steps = [
    {
      num: "01",
      icon: <Shield className="w-6 h-6" />,
      title: "سجّل حسابك",
      desc: "أدخل معلوماتك الأساسية لإنشاء حساب تاجر في أقل من دقيقتين.",
      color: "from-[#1E7D4E] to-[#0F3D2E]",
    },
    {
      num: "02",
      icon: <Store className="w-6 h-6" />,
      title: "أضف تفاصيل نشاطك",
      desc: "قم بتعبئة بيانات نشاطك التجاري، موقعه، صوره، وساعات عمله.",
      color: "from-[#0F3D2E] to-[#1E7D4E]",
    },
    {
      num: "03",
      icon: <Zap className="w-6 h-6" />,
      title: "التفعيل والانطلاق",
      desc: "يراجع فريقنا الطلب ويفعّل حسابك سريعاً. أنت جاهز للظهور!",
      color: "from-[#1E7D4E] to-[#0a2e1e]",
    },
  ];


  return (
    <div className="flex flex-col min-h-screen">
      {/* ══════════════════ HERO ══════════════════ */}
      <section className="relative bg-[#0F3D2E] text-white overflow-hidden">
        {/* background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-[#1E7D4E]/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] bg-[#0a2e1e]/60 rounded-full blur-3xl" />
          {/* subtle grid */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <span className="inline-flex items-center gap-2 bg-white/10 text-[#EAF3EC] px-5 py-2 rounded-full text-sm font-semibold mb-8 border border-white/20 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
              أكبر دليل تجاري فلسطيني
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight">
              نمّي أعمالك،{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#4ade80] to-[#86efac]">
                وضاعف عملائك
              </span>{" "}
              معنا!
            </h1>

            <p className="text-[#A8C5B0] text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
              انضم إلى المئات من التجار الذين يستفيدون من منصتنا يومياً لعرض
              خدماتهم، منتجاتهم، وعروضهم لجمهور واسع من العملاء.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                href="/register/merchant"
                className="group relative bg-[#1E7D4E] hover:bg-[#15603A] text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all shadow-2xl shadow-[#1E7D4E]/40 hover:shadow-[#1E7D4E]/60 hover:-translate-y-1 flex items-center justify-center gap-3"
              >
                ابدأ التسجيل مجاناً
                <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              </Link>
              <a
                href="#how-it-works"
                className="text-white/70 hover:text-white px-8 py-4 rounded-2xl font-medium text-lg transition-colors border border-white/20 hover:border-white/40 flex items-center justify-center gap-2"
              >
                كيف يعمل؟
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════ BENEFITS ══════════════════ */}
      <section className="py-24 bg-[#F9FBF9] dark:bg-[#111714]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block bg-[#EAF3EC] dark:bg-[#0F3D2E]/50 text-[#1E7D4E] px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              المزايا
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-4">
              لماذا تنضم إلى بال فيرس؟
            </h2>
            <p className="text-[#7FA789] max-w-xl mx-auto text-lg">
              ميزات صممت خصيصاً لنجاح نشاطك التجاري ونموّه
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, idx) => (
              <div
                key={idx}
                className="group bg-white dark:bg-[#1F2522] p-8 rounded-3xl border border-[#EAF3EC] dark:border-[#0F3D2E] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-[#EAF3EC] dark:bg-[#0F3D2E]/60 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#1E7D4E]/10 transition-all">
                  {b.icon}
                </div>
                <h3 className="text-xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-3">
                  {b.title}
                </h3>
                <p className="text-[#7FA789] leading-relaxed text-sm">
                  {b.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ HOW IT WORKS ══════════════════ */}
      <section
        id="how-it-works"
        className="py-24 bg-white dark:bg-[#1a2520]"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block bg-[#EAF3EC] dark:bg-[#0F3D2E]/50 text-[#1E7D4E] px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              الخطوات
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-4">
              3 خطوات بسيطة للانطلاق
            </h2>
            <p className="text-[#7FA789] max-w-xl mx-auto text-lg">
              عملية تسجيل سهلة وسريعة، تستغرق أقل من دقيقتين
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* connecting line (desktop) */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-l from-[#1E7D4E]/30 via-[#1E7D4E]/60 to-[#1E7D4E]/30" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, idx) => (
                <div key={idx} className="flex flex-col items-center text-center">
                  <div
                    className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${step.color} flex flex-col items-center justify-center mb-6 shadow-lg text-white`}
                  >
                    {step.icon}
                    <span className="text-xs font-black mt-1 opacity-80">
                      {step.num}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-3">
                    {step.title}
                  </h4>
                  <p className="text-[#7FA789] text-sm leading-relaxed max-w-[220px]">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ TESTIMONIAL STRIP ══════════════════ */}
      <section className="py-16 bg-[#F9FBF9] dark:bg-[#111714] border-y border-[#EAF3EC] dark:border-[#0F3D2E]">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            {/* stacked mock avatars */}
            <div className="flex -space-x-3 rtl:space-x-reverse">
              {[
                "bg-emerald-400",
                "bg-teal-500",
                "bg-green-600",
                "bg-lime-500",
              ].map((c, i) => (
                <div
                  key={i}
                  className={`w-10 h-10 rounded-full border-2 border-white dark:border-[#111714] ${c} flex items-center justify-center text-white font-bold text-sm`}
                >
                  {["م", "أ", "ي", "س"][i]}
                </div>
              ))}
            </div>
            <div>
              <p className="font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">
                انضم إليهم اليوم
              </p>
              <p className="text-sm text-[#7FA789]">+500 تاجر يثقون بنا</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className="w-5 h-5 text-yellow-400 fill-yellow-400"
              />
            ))}
            <span className="ms-2 font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">
              4.9
            </span>
            <span className="text-[#7FA789] text-sm">متوسط تقييم التجار</span>
          </div>

          <Link
            href="/register/merchant"
            className="shrink-0 bg-[#1E7D4E] hover:bg-[#0F3D2E] text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
          >
            سجّل الآن مجاناً
          </Link>
        </div>
      </section>

      {/* ══════════════════ CTA ══════════════════ */}
      <section className="relative py-28 bg-[#0F3D2E] text-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#1E7D4E]/20 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <span className="inline-flex items-center gap-2 bg-white/10 text-[#EAF3EC] px-5 py-2 rounded-full text-sm font-semibold mb-8 border border-white/20">
            <Clock className="w-4 h-4" />
            التسجيل يستغرق أقل من دقيقتين
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            جاهز لتوسيع نطاق أعمالك؟
          </h2>
          <p className="text-[#A8C5B0] max-w-2xl mx-auto mb-12 text-lg leading-relaxed">
            انضم الآن وابدأ بإدارة نشاطك التجاري وعروضك بفعالية واحترافية.
            الانضمام مجاني تماماً.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register/merchant"
              className="group bg-white text-[#0F3D2E] hover:bg-[#EAF3EC] px-10 py-4 rounded-2xl font-bold text-lg transition-all shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-3"
            >
              سجّل نشاطك الآن
              <CheckCircle2 className="w-5 h-5 text-[#1E7D4E]" />
            </Link>
            <Link
              href="/contact"
              className="text-white/70 hover:text-white px-8 py-4 rounded-2xl font-medium text-lg transition-colors border border-white/20 hover:border-white/40 flex items-center justify-center"
            >
              تواصل مع فريقنا
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
