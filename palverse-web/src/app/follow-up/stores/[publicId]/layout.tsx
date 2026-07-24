import { FollowUpStoreNav } from "@/components/follow-up/FollowUpStoreNav";

export default async function FollowUpStoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ publicId: string }>;
}) {
  const resolvedParams = await params;

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <FollowUpStoreNav storePublicId={resolvedParams.publicId} />
      {children}
    </div>
  );
}
