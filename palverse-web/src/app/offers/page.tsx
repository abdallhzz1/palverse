import { PublicPageHero } from "@/components/public/PublicPageHero";
import { EmptyStateArt } from "@/components/public/EmptyStateArt";
import { BRAND_PHOTOS } from "@/lib/brand-photos";
import { serverFetch } from "@/lib/api/server";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "العروض والخصومات | بال فيرس",
  description: "اكتشف أفضل العروض والخصومات من المتاجر المشاركة على منصة بال فيرس.",
};

type PublicOffer = {
  public_id: string;
  title_ar?: string | null;
  title_en?: string | null;
  description_ar?: string | null;
  description_en?: string | null;
  price?: string | number | null;
  old_price?: string | number | null;
  currency?: string | null;
  discount_percentage?: number | null;
  ends_at?: string | null;
  image_url?: string | null;
  store?: {
    public_id?: string | null;
    slug?: string | null;
    name_ar?: string | null;
    logo?: { url?: string | null } | null;
  } | null;
};

export default async function OffersPage() {
  let offers: PublicOffer[] = [];

  try {
    const res = await serverFetch<{ data: PublicOffer[] }>("/offers", {
      params: { page: 1, per_page: 50 },
      cache: "no-store",
    });
    offers = Array.isArray(res?.data) ? res.data : [];
  } catch (error) {
    console.error("Failed to fetch global offers:", error);
  }

  const mappedOffers = offers.map((o) => ({
    publicId: o.public_id,
    title: o.title_ar || o.title_en || "",
    description: o.description_ar || o.description_en || undefined,
    price: o.price ? `${o.price} ${o.currency || "ILS"}` : undefined,
    oldPrice: o.old_price ? `${o.old_price} ${o.currency || "ILS"}` : undefined,
    discountPercentage: o.discount_percentage ? `${o.discount_percentage}%` : undefined,
    expiresAt: o.ends_at ? new Date(o.ends_at).toLocaleDateString("ar-SA") : undefined,
    imageUrl: o.image_url,
    store: o.store,
    storeHref: o.store?.slug || o.store?.public_id || null,
  }));

  return (
    <div className="min-h-screen bg-[#F7F9F8]">
      <PublicPageHero
        title="أحدث العروض والخصومات"
        subtitle="اكتشف أفضل العروض من المتاجر المشاركة على منصة بال فيرس."
        size="page"
      />

      <section className="public-container pb-28 pt-8">
        {mappedOffers.length === 0 ? (
          <EmptyStateArt
            title="لا توجد عروض عامة حالياً"
            description="يبدو أنه لا توجد عروض نشطة في الوقت الحالي. يرجى التحقق مرة أخرى لاحقاً!"
            className="max-w-2xl mx-auto"
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {mappedOffers.map((offer) => (
              <div key={offer.publicId} className="public-card group flex flex-col">
                <div className="relative h-44 w-full overflow-hidden bg-[#E8EEEA] md:h-48">
                  <Image
                    src={offer.imageUrl || BRAND_PHOTOS.offers}
                    alt={offer.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    unoptimized
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A3D32]/45 via-transparent to-transparent" />
                  {offer.discountPercentage && (
                    <div className="absolute top-3 end-3 rounded-lg bg-red-500 px-3 py-1 text-sm font-bold text-white">
                      خصم {offer.discountPercentage}
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-2 p-5">
                  <h4 className="line-clamp-1 font-heading text-lg font-bold text-[#1A3D32]">{offer.title}</h4>
                  {offer.description && (
                    <p className="line-clamp-2 flex-1 text-sm text-[#6B8578]">{offer.description}</p>
                  )}

                  <div className="mt-auto flex flex-col gap-3 border-t border-[#E2EAE5] pt-4">
                    {offer.price && (
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-xl font-bold text-[#2F6B4F]">{offer.price}</span>
                        {offer.oldPrice && (
                          <span className="text-sm text-gray-400 line-through">{offer.oldPrice}</span>
                        )}
                      </div>
                    )}

                    {offer.expiresAt && (
                      <span className="w-fit rounded-lg bg-red-50 px-2 py-1 text-xs font-medium text-red-500">
                        ينتهي: {offer.expiresAt}
                      </span>
                    )}

                    {offer.store && offer.storeHref ? (
                      <Link
                        href={`/stores/${offer.storeHref}`}
                        className="mt-1 flex items-center gap-2 rounded-xl bg-[#F7F9F8] p-2 transition-colors hover:bg-[#E8EEEA]"
                      >
                        {offer.store.logo?.url ? (
                          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-[#E2EAE5] bg-white">
                            <Image
                              src={offer.store.logo.url}
                              alt={offer.store.name_ar || ""}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#E2EAE5] bg-white">
                            <span className="text-xs font-bold text-[#2F6B4F]">
                              {offer.store.name_ar?.charAt(0) || "م"}
                            </span>
                          </div>
                        )}
                        <span className="truncate text-sm font-semibold text-[#1A3D32]">
                          {offer.store.name_ar}
                        </span>
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
