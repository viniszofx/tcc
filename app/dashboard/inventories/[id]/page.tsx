import { getItemById } from "@/lib/getItemById";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JSX } from "react";
import InventoryItemClient from "./inventory-item-client";

export async function generateMetadata({
  params,
}: {
  params: any;
}): Promise<Metadata> {
  const item = await getItemById(params.id);

  return {
    title: item ? `Item: ${item.DESCRICAO}` : "Item não encontrado",
    description: item
      ? `Detalhes do item ${item.NUMERO}`
      : "Detalhes do item de inventário",
  };
}

export default async function Page({
  params,
}: {
  params: any;
}): Promise<JSX.Element> {
  const item = await getItemById(params.id);

  if (!item) {
    notFound();
  }

  return <InventoryItemClient id={params.id} />;
}
