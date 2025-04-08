import InventoryList from "@/components/inventories/inventory-list"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Inventário - KDÊ",
}

export default function InventoryPage() {
  return (
    <div className="w-full">
      <InventoryList />
    </div>
  )
}

