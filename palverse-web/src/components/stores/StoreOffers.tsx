import Image from "next/image";

interface Offer {
  publicId: string;
  title: string;
  description?: string;
  price?: string;
  oldPrice?: string;
  discountPercentage?: string;
  expiresAt?: string;
  imageUrl?: string;
}

interface StoreOffersProps {
  offers: Offer[];
}

export function StoreOffers({ offers }: StoreOffersProps) {
  if (!offers || offers.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {offers.map((offer) => (
        <article
          key={offer.publicId}
          className="flex flex-col overflow-hidden rounded-xl border border-[#E2EAE5] bg-[#F7F9F8]"
        >
          {offer.imageUrl ? (
            <div className="relative h-40 w-full overflow-hidden bg-[#E8EEEA]">
              <Image
                src={offer.imageUrl}
                alt={offer.title}
                fill
                className="object-cover"
                unoptimized
              />
              {offer.discountPercentage ? (
                <div className="absolute top-3 end-3 rounded-lg bg-red-500 px-2.5 py-1 text-xs font-bold text-white">
                  خصم {offer.discountPercentage}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-1 flex-col gap-2 p-4">
            <h4 className="line-clamp-1 font-heading text-base font-bold text-[#1A3D32]">
              {offer.title}
            </h4>
            {offer.description ? (
              <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-[#6B8578]">
                {offer.description}
              </p>
            ) : null}

            <div className="mt-auto space-y-2 border-t border-[#E2EAE5] pt-3">
              {offer.price ? (
                <div className="flex items-center gap-2">
                  <span className="font-heading text-lg font-bold text-[#2F6B4F]">{offer.price}</span>
                  {offer.oldPrice ? (
                    <span className="text-sm text-[#6B8578] line-through">{offer.oldPrice}</span>
                  ) : null}
                </div>
              ) : null}
              {offer.expiresAt ? (
                <p className="text-xs font-medium text-red-500">ينتهي: {offer.expiresAt}</p>
              ) : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
