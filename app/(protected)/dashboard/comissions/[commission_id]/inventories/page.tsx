"use client"

import InventoryPageBase from "@/components/inventories/inventory-page-base"
import { useParams } from "next/navigation"

export default function DashboardInventoriesPage() {
  const params = useParams()
  const commissionId = params?.commission_id as string
  return <InventoryPageBase backRoute={`/dashboard/comissions/${commissionId}`} errorRoute="/error?message=Inventário não encontrado ou inativo" />
}