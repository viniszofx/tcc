"use client"

import LoadingScreen from "@/components/custom/loading"
import InventoryPageBase from "@/components/inventories/inventory-page-base"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function DashboardInventoriesPage() {
  const params = useParams()
  const commissionId = params?.commission_id as string
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }
  return <InventoryPageBase backRoute={`/dashboard/comissions/${commissionId}`} errorRoute="/error?message=Inventário não encontrado ou inativo" />
}