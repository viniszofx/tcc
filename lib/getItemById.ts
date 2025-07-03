import type { BemCopia } from "@/lib/interface";
import { getProcessedData } from "@/utils/data-storage";

export async function getItemById(id: string, commissionId?: string) {
  const { data, metadata } = await getProcessedData();

  // Verificar se os dados pertencem à comissão correta
  if (
    commissionId &&
    metadata?.commissionId &&
    metadata.commissionId !== commissionId
  ) {
    console.log(
      `⚠️ Dados locais pertencem à comissão ${metadata.commissionId}, mas foi solicitada comissão ${commissionId}`
    );
    return undefined;
  }

  return data.find(
    (item: BemCopia) => item.bem_id === id || item.NUMERO === id
  );
}
