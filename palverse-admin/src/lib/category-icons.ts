/**
 * Curated Lucide icons for Palverse business-directory categories.
 * Kept intentionally smaller than the full Lucide set (~2k) for faster browsing.
 */

export type CategoryIconGroupId =
  | "food"
  | "shopping"
  | "electronics"
  | "home"
  | "health"
  | "education"
  | "auto"
  | "gifts"
  | "services"
  | "sports"
  | "general";

export interface CategoryIconGroup {
  id: CategoryIconGroupId;
  labelAr: string;
}

export interface CategoryIconOption {
  name: string;
  labelAr: string;
  /** Extra Arabic/English terms matched by search (beyond name + labelAr). */
  keywords: string[];
  group: CategoryIconGroupId;
}

export const CATEGORY_ICON_GROUPS: CategoryIconGroup[] = [
  { id: "food", labelAr: "طعام ومشروبات" },
  { id: "shopping", labelAr: "تسوق وأزياء" },
  { id: "electronics", labelAr: "إلكترونيات" },
  { id: "home", labelAr: "منزل وخدمات" },
  { id: "health", labelAr: "صحة وجمال" },
  { id: "education", labelAr: "تعليم" },
  { id: "auto", labelAr: "سيارات" },
  { id: "gifts", labelAr: "هدايا وحرف" },
  { id: "services", labelAr: "خدمات وأعمال" },
  { id: "sports", labelAr: "رياضة وسفر" },
  { id: "general", labelAr: "عام" },
];

export const CATEGORY_ICON_CATALOG: CategoryIconOption[] = [
  // Food & drinks
  { name: "utensils", labelAr: "مطعم", keywords: ["مطاعم", "أكل", "طعام", "restaurant", "food"], group: "food" },
  { name: "utensils-crossed", labelAr: "مطبخ", keywords: ["مطعم", "طاهي", "طبخ"], group: "food" },
  { name: "chef-hat", labelAr: "شيف", keywords: ["طاهي", "مطبخ", "chef"], group: "food" },
  { name: "cooking-pot", labelAr: "قدر طبخ", keywords: ["طبخ", "مطبخ", "منزلية"], group: "food" },
  { name: "pizza", labelAr: "بيتزا", keywords: ["وجبات", "restaurant"], group: "food" },
  { name: "salad", labelAr: "سلطة", keywords: ["صحي", "خضار"], group: "food" },
  { name: "sandwich", labelAr: "ساندويش", keywords: ["وجبات سريعة", "فست فود"], group: "food" },
  { name: "soup", labelAr: "شوربة", keywords: ["طعام"], group: "food" },
  { name: "beef", labelAr: "لحوم", keywords: ["جزارة", "لحمة", "مشاوي"], group: "food" },
  { name: "fish", labelAr: "سمك", keywords: ["مأكولات بحرية", "سمك"], group: "food" },
  { name: "ice-cream-cone", labelAr: "آيس كريم", keywords: ["حلويات", "مثلجات"], group: "food" },
  { name: "cake-slice", labelAr: "كيك", keywords: ["حلويات", "مخبز", "معجنات"], group: "food" },
  { name: "coffee", labelAr: "قهوة", keywords: ["مقهى", "كافيه", "cafe", "مشروبات"], group: "food" },
  { name: "cup-soda", labelAr: "مشروبات", keywords: ["عصير", "مشروب", "مشروبات"], group: "food" },
  { name: "wine", labelAr: "نبيذ", keywords: ["مشروبات", "بار"], group: "food" },
  { name: "beer", labelAr: "مشروب", keywords: ["بار", "مشروبات"], group: "food" },
  { name: "martini", labelAr: "كوكتيل", keywords: ["بار", "مشروبات"], group: "food" },
  { name: "popcorn", labelAr: "فشار", keywords: ["سناك", "ترفيه"], group: "food" },
  { name: "apple", labelAr: "فواكه", keywords: ["خضار", "بقالة", "مواد غذائية", "groceries"], group: "food" },
  { name: "carrot", labelAr: "خضار", keywords: ["بقالة", "سوق", "مواد غذائية"], group: "food" },
  { name: "banana", labelAr: "موز", keywords: ["فواكه", "بقالة"], group: "food" },
  { name: "milk", labelAr: "ألبان", keywords: ["حليب", "أجبان", "بقالة"], group: "food" },
  { name: "wheat", labelAr: "حبوب", keywords: ["مخبز", "طحين", "مطحنة"], group: "food" },
  { name: "shopping-basket", labelAr: "سلة تسوق", keywords: ["بقالة", "سوبرماركت", "مواد غذائية"], group: "food" },

  // Shopping & fashion
  { name: "shopping-bag", labelAr: "تسوق", keywords: ["متجر", "مول", "شراء", "shopping"], group: "shopping" },
  { name: "shopping-cart", labelAr: "عربة تسوق", keywords: ["سوبرماركت", "تسوق"], group: "shopping" },
  { name: "store", labelAr: "محل", keywords: ["متجر", "دكان", "shop", "store"], group: "shopping" },
  { name: "shirt", labelAr: "ملابس", keywords: ["أزياء", "موضة", "fashion", "clothing"], group: "shopping" },
  { name: "watch", labelAr: "ساعات", keywords: ["إكسسوارات", "ساعة"], group: "shopping" },
  { name: "glasses", labelAr: "نظارات", keywords: ["بصريات", "عيون"], group: "shopping" },
  { name: "gem", labelAr: "مجوهرات", keywords: ["ذهب", "فضة", "ألماس"], group: "shopping" },
  { name: "footprints", labelAr: "أحذية", keywords: ["حذاء", "جزمة"], group: "shopping" },
  { name: "backpack", labelAr: "حقائب", keywords: ["شنطة", "حقيبة"], group: "shopping" },
  { name: "briefcase", labelAr: "حقيبة عمل", keywords: ["أعمال", "مكتب"], group: "shopping" },
  { name: "package", labelAr: "طرود", keywords: ["توصيل", "شحن", "بضائع"], group: "shopping" },
  { name: "boxes", labelAr: "صناديق", keywords: ["مستودع", "تخزين", "جملة"], group: "shopping" },
  { name: "tag", labelAr: "عرض", keywords: ["سعر", "خصم", "وسم"], group: "shopping" },

  // Electronics
  { name: "smartphone", labelAr: "هواتف", keywords: ["جوال", "موبايل", "إلكترونيات", "mobile"], group: "electronics" },
  { name: "laptop", labelAr: "لابتوب", keywords: ["كمبيوتر", "حاسوب", "إلكترونيات"], group: "electronics" },
  { name: "tablet", labelAr: "تابلت", keywords: ["آيباد", "لوحي"], group: "electronics" },
  { name: "headphones", labelAr: "سماعات", keywords: ["صوت", "إكسسوارات"], group: "electronics" },
  { name: "camera", labelAr: "كاميرا", keywords: ["تصوير", "فوتوغراف"], group: "electronics" },
  { name: "monitor", labelAr: "شاشات", keywords: ["كمبيوتر", "عرض"], group: "electronics" },
  { name: "printer", labelAr: "طابعة", keywords: ["مكتبية", "طباعة"], group: "electronics" },
  { name: "tv", labelAr: "تلفزيون", keywords: ["شاشة", "أجهزة منزلية"], group: "electronics" },
  { name: "gamepad-2", labelAr: "ألعاب", keywords: ["بلايستيشن", "جيمنج"], group: "electronics" },
  { name: "cpu", labelAr: "معالج", keywords: ["كمبيوتر", "هاردوير"], group: "electronics" },
  { name: "hard-drive", labelAr: "تخزين", keywords: ["هارد", "ذاكرة"], group: "electronics" },
  { name: "battery-charging", labelAr: "شحن", keywords: ["بطارية", "باور بانك"], group: "electronics" },
  { name: "wifi", labelAr: "إنترنت", keywords: ["شبكة", "واي فاي", "اتصالات"], group: "electronics" },
  { name: "cloud", labelAr: "سحابة", keywords: ["استضافة", "تقني"], group: "electronics" },
  { name: "code", labelAr: "برمجة", keywords: ["تطوير", "برمجيات", "تقني"], group: "electronics" },

  // Home & services
  { name: "house", labelAr: "منزل", keywords: ["بيت", "عقارات", "home"], group: "home" },
  { name: "sofa", labelAr: "أثاث", keywords: ["كنب", "مفروشات", "furniture"], group: "home" },
  { name: "bed", labelAr: "غرف نوم", keywords: ["سرير", "مفروشات"], group: "home" },
  { name: "lamp", labelAr: "إضاءة", keywords: ["لمبة", "ديكور"], group: "home" },
  { name: "armchair", labelAr: "مفروشات", keywords: ["كرسي", "أثاث"], group: "home" },
  { name: "door-open", labelAr: "أبواب", keywords: ["دخول", "نجارة"], group: "home" },
  { name: "paintbrush", labelAr: "دهان", keywords: ["طلاء", "صباغة", "ديكور"], group: "home" },
  { name: "paint-bucket", labelAr: "صباغة", keywords: ["دهان", "طلاء"], group: "home" },
  { name: "hammer", labelAr: "نجارة", keywords: ["أدوات", "تصليح", "بناء"], group: "home" },
  { name: "wrench", labelAr: "صيانة", keywords: ["خدمات", "تصليح", "سباكة", "services"], group: "home" },
  { name: "drill", labelAr: "أدوات", keywords: ["مثقاب", "تصليح"], group: "home" },
  { name: "key", labelAr: "مفاتيح", keywords: ["أقفال", "أمن"], group: "home" },
  { name: "lock", labelAr: "أقفال", keywords: ["أمن", "حماية"], group: "home" },
  { name: "washing-machine", labelAr: "غسالات", keywords: ["أجهزة منزلية", "غسيل"], group: "home" },
  { name: "refrigerator", labelAr: "ثلاجات", keywords: ["أجهزة منزلية", "تبريد"], group: "home" },
  { name: "microwave", labelAr: "مايكروويف", keywords: ["أجهزة منزلية", "مطبخ"], group: "home" },
  { name: "droplets", labelAr: "سباكة", keywords: ["ماء", "تمديدات"], group: "home" },

  // Health & beauty
  { name: "heart-pulse", labelAr: "صحة", keywords: ["طبي", "عيادة", "health"], group: "health" },
  { name: "heart", labelAr: "قلب", keywords: ["صحة", "رعاية"], group: "health" },
  { name: "hospital", labelAr: "مستشفى", keywords: ["عيادة", "طبي"], group: "health" },
  { name: "stethoscope", labelAr: "طبيب", keywords: ["عيادة", "فحص", "طبي"], group: "health" },
  { name: "pill", labelAr: "صيدلية", keywords: ["دواء", "أدوية"], group: "health" },
  { name: "syringe", labelAr: "تطعيم", keywords: ["حقن", "مختبر"], group: "health" },
  { name: "activity", labelAr: "فحوصات", keywords: ["مختبر", "نبض"], group: "health" },
  { name: "sparkles", labelAr: "جمال", keywords: ["تجميل", "عناية", "beauty"], group: "health" },
  { name: "sparkle", labelAr: "عناية", keywords: ["تجميل", "بشرة"], group: "health" },
  { name: "scissors", labelAr: "حلاقة", keywords: ["صالون", "شعر", "مقص"], group: "health" },
  { name: "spray-can", labelAr: "عطور", keywords: ["تجميل", "روائح"], group: "health" },
  { name: "bath", labelAr: "سبا", keywords: ["استرخاء", "عناية"], group: "health" },
  { name: "smile", labelAr: "أسنان", keywords: ["ابتسامة", "عيادة أسنان"], group: "health" },
  { name: "hand-heart", labelAr: "رعاية", keywords: ["خدمات اجتماعية", "دعم"], group: "health" },

  // Education
  { name: "book-open", labelAr: "تعليم", keywords: ["كتب", "دراسة", "education"], group: "education" },
  { name: "book", labelAr: "كتاب", keywords: ["مكتبة", "قراءة"], group: "education" },
  { name: "graduation-cap", labelAr: "تخرج", keywords: ["جامعة", "شهادة", "تدريب"], group: "education" },
  { name: "school", labelAr: "مدرسة", keywords: ["تعليم", "طلاب"], group: "education" },
  { name: "library", labelAr: "مكتبة", keywords: ["كتب", "قراءة"], group: "education" },
  { name: "pencil", labelAr: "قرطاسية", keywords: ["قلم", "أدوات مدرسية"], group: "education" },
  { name: "notebook-pen", labelAr: "دفاتر", keywords: ["كتابة", "ملاحظات"], group: "education" },
  { name: "languages", labelAr: "لغات", keywords: ["ترجمة", "دورات"], group: "education" },
  { name: "calculator", labelAr: "محاسبة", keywords: ["حساب", "رياضيات"], group: "education" },

  // Automotive
  { name: "car", labelAr: "سيارات", keywords: ["مركبة", "معرض", "automotive"], group: "auto" },
  { name: "car-front", labelAr: "مركبة", keywords: ["سيارة", "معرض"], group: "auto" },
  { name: "car-taxi-front", labelAr: "تاكسي", keywords: ["نقل", "مواصلات"], group: "auto" },
  { name: "bus", labelAr: "حافلات", keywords: ["مواصلات", "نقل"], group: "auto" },
  { name: "bike", labelAr: "دراجات", keywords: ["دراجة", "هوائية"], group: "auto" },
  { name: "truck", labelAr: "شاحنات", keywords: ["نقل", "لوجستيات"], group: "auto" },
  { name: "fuel", labelAr: "وقود", keywords: ["محطة", "بنزين"], group: "auto" },
  { name: "circle-parking", labelAr: "مواقف", keywords: ["موقف", "سيارات"], group: "auto" },
  { name: "gauge", labelAr: "عداد", keywords: ["صيانة", "فحص"], group: "auto" },

  // Gifts & crafts
  { name: "gift", labelAr: "هدايا", keywords: ["هدية", "تغليف", "gifts"], group: "gifts" },
  { name: "flower-2", labelAr: "ورود", keywords: ["زهور", "أزهار", "flowers"], group: "gifts" },
  { name: "flower", labelAr: "زهرة", keywords: ["ورود", "نباتات"], group: "gifts" },
  { name: "party-popper", labelAr: "حفلات", keywords: ["مناسبات", "أفراح"], group: "gifts" },
  { name: "balloon", labelAr: "بالونات", keywords: ["حفلات", "زينة"], group: "gifts" },
  { name: "heart-handshake", labelAr: "تكريم", keywords: ["شكر", "هدايا"], group: "gifts" },
  { name: "palette", labelAr: "فنون", keywords: ["رسم", "إبداع", "حرف"], group: "gifts" },
  { name: "paintbrush", labelAr: "حرف يدوية", keywords: ["صناعات محلية", "crafts", "رسم"], group: "gifts" },
  { name: "anvil", labelAr: "حدادة", keywords: ["صناعة", "حرف"], group: "gifts" },
  { name: "amphora", labelAr: "فخار", keywords: ["تراث", "حرف محلية"], group: "gifts" },

  // Business & services
  { name: "handshake", labelAr: "شراكة", keywords: ["أعمال", "خدمات", "اتفاق"], group: "services" },
  { name: "clipboard-list", labelAr: "خدمات", keywords: ["طلبات", "قائمة"], group: "services" },
  { name: "settings", labelAr: "إعدادات", keywords: ["صيانة", "تقني"], group: "services" },
  { name: "phone", labelAr: "اتصال", keywords: ["هاتف", "دعم"], group: "services" },
  { name: "mail", labelAr: "بريد", keywords: ["رسائل", "مراسلات"], group: "services" },
  { name: "map-pin", labelAr: "موقع", keywords: ["عنوان", "خريطة", "مكان"], group: "services" },
  { name: "building-2", labelAr: "مبنى", keywords: ["شركات", "مكاتب"], group: "services" },
  { name: "building", labelAr: "شركة", keywords: ["مكتب", "مؤسسة"], group: "services" },
  { name: "landmark", labelAr: "بنك", keywords: ["معلم", "مؤسسة", "مالي"], group: "services" },
  { name: "hotel", labelAr: "فندق", keywords: ["إقامة", "ضيافة"], group: "services" },
  { name: "banknote", labelAr: "مالية", keywords: ["نقود", "مصاري", "فلوس"], group: "services" },
  { name: "credit-card", labelAr: "دفع", keywords: ["بطاقة", "مدفوعات"], group: "services" },
  { name: "wallet", labelAr: "محفظة", keywords: ["أموال", "مالية"], group: "services" },
  { name: "scale", labelAr: "محاماة", keywords: ["قانون", "عدالة", "ميزان"], group: "services" },
  { name: "gavel", labelAr: "قضاء", keywords: ["محكمة", "قانون"], group: "services" },
  { name: "stamp", labelAr: "توثيق", keywords: ["ختم", "أوراق"], group: "services" },
  { name: "megaphone", labelAr: "إعلان", keywords: ["تسويق", "دعاية"], group: "services" },
  { name: "newspaper", labelAr: "إعلام", keywords: ["أخبار", "صحافة"], group: "services" },
  { name: "radio", labelAr: "راديو", keywords: ["بث", "إعلام"], group: "services" },
  { name: "music", labelAr: "موسيقى", keywords: ["فنون", "أفراح"], group: "services" },
  { name: "film", labelAr: "أفلام", keywords: ["سينما", "إنتاج"], group: "services" },
  { name: "clapperboard", labelAr: "إنتاج", keywords: ["تصوير", "ميديا"], group: "services" },

  // Sports & travel
  { name: "dumbbell", labelAr: "رياضة", keywords: ["جيم", "لياقة", "نادي"], group: "sports" },
  { name: "volleyball", labelAr: "كرة", keywords: ["رياضة", "ملعب"], group: "sports" },
  { name: "trophy", labelAr: "بطولة", keywords: ["فوز", "جوائز"], group: "sports" },
  { name: "person-standing", labelAr: "شخص", keywords: ["لياقة", "تدريب"], group: "sports" },
  { name: "plane", labelAr: "سفر", keywords: ["طيران", "سياحة"], group: "sports" },
  { name: "train-front", labelAr: "قطار", keywords: ["نقل", "سفر"], group: "sports" },
  { name: "luggage", labelAr: "أمتعة", keywords: ["سفر", "حقائب"], group: "sports" },
  { name: "tent", labelAr: "تخييم", keywords: ["رحلات", "برية"], group: "sports" },
  { name: "mountain", labelAr: "جبال", keywords: ["طبيعة", "سياحة"], group: "sports" },
  { name: "trees", labelAr: "حدائق", keywords: ["طبيعة", "أشجار"], group: "sports" },
  { name: "tree-palm", labelAr: "نخيل", keywords: ["طبيعة", "فلسطين"], group: "sports" },
  { name: "umbrella", labelAr: "مظلة", keywords: ["شاطئ", "حماية"], group: "sports" },
  { name: "dog", labelAr: "كلاب", keywords: ["حيوانات", "حيوانات أليفة"], group: "sports" },
  { name: "cat", labelAr: "قطط", keywords: ["حيوانات", "حيوانات أليفة"], group: "sports" },
  { name: "paw-print", labelAr: "حيوانات", keywords: ["بيطري", "أليفة", "pets"], group: "sports" },
  { name: "bird", labelAr: "طيور", keywords: ["حيوانات"], group: "sports" },
  { name: "baby", labelAr: "أطفال", keywords: ["رضع", "أمومة", "kids"], group: "sports" },
  { name: "toy-brick", labelAr: "ألعاب أطفال", keywords: ["لعب", "أطفال"], group: "sports" },

  // General
  { name: "layout-grid", labelAr: "عام", keywords: ["تصنيف", "افتراضي", "grid"], group: "general" },
  { name: "layers", labelAr: "طبقات", keywords: ["عام", "فئات"], group: "general" },
  { name: "grid-2x2", labelAr: "شبكة", keywords: ["تصنيف", "عرض"], group: "general" },
  { name: "star", labelAr: "مميز", keywords: ["تقييم", "نجمة"], group: "general" },
  { name: "circle-dot", labelAr: "نقطة", keywords: ["عام", "رمز"], group: "general" },
  { name: "hand", labelAr: "يد", keywords: ["مساعدة", "خدمة"], group: "general" },
];

export const CATEGORY_ICON_NAMES: string[] = CATEGORY_ICON_CATALOG.map((item) => item.name);

const catalogByName = new Map(CATEGORY_ICON_CATALOG.map((item) => [item.name, item]));

export function getCategoryIconOptionMeta(name: string): CategoryIconOption | undefined {
  return catalogByName.get(name);
}

/** Normalize Arabic/English text for tolerant icon search. */
export function normalizeIconSearchText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[أإآٱ]/g, "ا")
    .replace(/[ى]/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/[\u064B-\u065F]/g, "")
    .replace(/\s+/g, " ");
}

const groupLabelById = new Map(CATEGORY_ICON_GROUPS.map((group) => [group.id, group.labelAr]));

export function matchesCategoryIcon(option: CategoryIconOption, rawQuery: string): boolean {
  const query = normalizeIconSearchText(rawQuery);
  if (!query) return true;

  const haystack = normalizeIconSearchText(
    [
      option.name,
      option.labelAr,
      option.group,
      groupLabelById.get(option.group) ?? "",
      ...option.keywords,
    ].join(" ")
  );

  if (haystack.includes(query)) {
    return true;
  }

  // Match space-separated tokens in any order (e.g. "محل ملابس").
  const tokens = query.split(" ").filter(Boolean);
  return tokens.every((token) => haystack.includes(token));
}
