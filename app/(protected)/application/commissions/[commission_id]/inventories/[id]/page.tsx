import InventoryItemClient from "@/components/inventories/inventory-item-client";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { JSX } from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; commission_id: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  return {
    title: `Item ${id}`,
    description: "Detalhes do item de inventário",
  };
}

export default async function InventoryItemDetailPage({
  params,
}: {
  params: Promise<{ id: string; commission_id: string }>;
}): Promise<JSX.Element> {
  const resolvedParams = await params;
  const { id, commission_id } = resolvedParams;

  if (!id) {
    notFound();
  }

  return (
    <InventoryItemClient
      id={id}
      commissionId={commission_id}
      basePath="/application/commissions"
      backButtonText="Voltar para Inventário"
    />
  );
}
