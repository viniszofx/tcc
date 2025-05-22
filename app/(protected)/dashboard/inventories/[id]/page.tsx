import { notFound } from "next/navigation";
import { Metadata } from "next";
import InventoryItemClient from "./inventory-item-client";
import { JSX } from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  return {
    title: `Item: ${id}`,
    description: "Detalhes do item de inventário",
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  if (!id) {
    notFound();
  }

  return <InventoryItemClient id={id} />;
}
