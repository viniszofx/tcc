import type { BemCopia } from "@/lib/interface"
import { getProcessedData } from "@/utils/data-storage"

export async function getItemById(id: string) {
  const { data } = await getProcessedData()

  return data.find((item: BemCopia) => item.bem_id === id || item.NUMERO === id)
}
