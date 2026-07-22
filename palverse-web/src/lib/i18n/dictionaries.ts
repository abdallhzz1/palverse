export const dictionaries = {
  ar: {
    common: {
      searchPlaceholder: 'ابحث عن المتاجر، الخدمات...',
      search: 'بحث',
      viewAll: 'عرض الكل',
      readMore: 'اقرأ المزيد',
      location: 'المدينة',
      allCities: 'كل المدن',
      menu: 'القائمة',
    },
    home: {
      heroHeading: 'اكتشف أفضل الأعمال في فلسطين',
      heroSubheading: 'كل فلسطين في دليل واحد',
      featuredStores: 'أبرز الأنشطة',
      latestStores: 'أحدث المتاجر',
      partnerSpace: 'مساحة شريك مميز',
    },
    navigation: {
      home: 'الرئيسية',
      categories: 'الفئات',
      stores: 'المحلات',
      offers: 'العروض',
      more: 'المزيد',
    },
    store: {
      workingHours: 'ساعات العمل',
      gallery: 'المعرض',
      offers: 'العروض',
      contact: 'تواصل معنا',
      call: 'اتصال',
      whatsapp: 'واتساب',
      location: 'الموقع',
      share: 'مشاركة',
    },
    errors: {
      notFound: 'الصفحة غير موجودة',
      somethingWentWrong: 'حدث خطأ ما',
      retry: 'إعادة المحاولة',
    }
  }
};

export type Locale = keyof typeof dictionaries;
export type Dictionary = typeof dictionaries['ar'];

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] || dictionaries['ar'];
}
