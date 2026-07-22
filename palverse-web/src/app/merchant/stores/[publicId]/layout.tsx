import { StoreNav } from "@/components/merchant/StoreNav";

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ publicId: string }>;
}) {
  const resolvedParams = await params;
  
  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <StoreNav storePublicId={resolvedParams.publicId} />
      {children}
    </div>
  );
}
