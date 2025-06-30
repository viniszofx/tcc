"use client";

import LoadingScreen from "@/components/custom/loading";
import InventoryPageBase from "@/components/inventories/inventory-page-base";
import { useParams } from "next/navigation";

export default function AdminInventoriesPage() {
  const params = useParams();
  const commissionId = params?.commission_id as string;

  if (!commissionId) {
    return <LoadingScreen />;
  }

  return (
    <div className="container mx-auto px-4 py-6 flex items-center justify-center min-h-screen">
      <InventoryPageBase
        backRoute={`/admin/comissions/${commissionId}`}
        errorRoute={`/admin/comissions/${commissionId}/upload`}
        commissionId={commissionId}
      />
    </div>
  );
}
