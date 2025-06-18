import InventoryItemClient from "@/components/inventories/inventory-item-client"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import type { JSX } from "react"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const resolvedParams = await params
  const { id } = resolvedParams

  return {
    title: `Item ${id}`,
    description: "Detalhes do item de inventário - Dashboard",
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<JSX.Element> {
  const resolvedParams = await params
  const { id } = resolvedParams

  if (!id) {
    notFound()
  }

  return <InventoryItemClient id={id} basePath="/dashboard/comissions" backButtonText="Voltar para Inventário" />
}