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
    <div className="flex flex-col gap-3">
      {offers.map((offer) => (
        <article
          key={offer.publicId}
          className="overflow-hidden rounded-lg border border-[#E4E6EB] bg-white"
        >
          {offer.imageUrl ? (
            <div className="relative h-48 w-full overflow-hidden bg-[#E4E6EB]">
              <Image
                src={offer.imageUrl}
                alt={offer.title}
                fill
                className="object-cover"
                unoptimized
              />
              {offer.discountPercentage ? (
                <div className="absolute top-3 end-3 rounded-md bg-[#F02849] px-2.5 py-1 text-xs font-bold text-white">
                  خصم {offer.discountPercentage}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-2 p-3">
            <h4 className="text-[17px] font-semibold text-[#050505]">{offer.title}</h4>
            {offer.description ? (
              <p className="text-[15px] leading-5 text-[#65676B]">{offer.description}</p>
            ) : null}
            {offer.price ? (
              <div className="flex items-center gap-2">
                <span className="text-[17px] font-bold text-[#050505]">{offer.price}</span>
                {offer.oldPrice ? (
                  <span className="text-sm text-[#65676B] line-through">{offer.oldPrice}</span>
                ) : null}
              </div>
            ) : null}
            {offer.expiresAt ? (
              <p className="text-xs font-medium text-[#F02849]">ينتهي: {offer.expiresAt}</p>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
