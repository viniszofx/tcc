import { getItemById } from "@/lib/getItemById";
import type { Metadata } from "next";
import InventoryItemClient from "./inventory-item-client";

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const item = await getItemById(params.id);

  return {
    title: item ? `Item: ${item.DESCRICAO}` : "Item não encontrado",
    description: item ? `Detalhes do item ${item.NUMERO}` : "Detalhes do item de inventário",
  };
}

export default function InventoryItemPage({ params }: PageProps) {
  return <InventoryItemClient id={params.id} />;
}