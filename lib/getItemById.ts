// lib/getItemById.ts
import { bemCopiaItems } from "@/app/dashboard/inventories/data/copy-data"

export async function getItemById(id: string) {
  // Simula delay (se quiser)
  // await new Promise((r) => setTimeout(r, 100))
  return bemCopiaItems.find((item) => item.bem_id === id)
}
