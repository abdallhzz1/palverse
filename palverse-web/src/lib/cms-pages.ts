/**
 * Canonical CMS page slugs used by the public site.
 * Production (DemoContentSeeder) uses the short set; StaticPageSeeder used longer variants.
 */
export const CMS_PAGE_SLUGS = {
  about: "about",
  privacy: "privacy",
  terms: "terms",
  contact: "contact",
} as const;

export type CmsPageSummary = {
  slug: string;
  title_ar: string;
  title_en?: string | null;
  excerpt_ar?: string | null;
};

export function cmsPageHref(slug: string): string {
  if (slug === CMS_PAGE_SLUGS.contact) {
    return "/contact";
  }
  return `/pages/${slug}`;
}
