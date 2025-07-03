"use client";

import { useQuery } from "@tanstack/react-query";

/**
 * Hook para obter uma lista única de campus a partir dos dados de inventário
 * Funciona de forma similar à extração de salas, mas retorna objetos com id e nome
 */
export function useUniqueCampusList(inventoryData: any[] = []) {
  return useQuery({
    queryKey: ["unique-campuses", inventoryData],
    queryFn: async () => {
      // 1. Filtrar itens que têm campus_id e CAMPUS_DA_LOTACAO_DO_BEM
      const validData = inventoryData.filter(
        (item) => item.campus_id && item.CAMPUS_DA_LOTACAO_DO_BEM
      );

      // 2. Extrair pares únicos de id e nome de campus
      const uniqueCampuses = Array.from(
        new Map(
          validData.map((item) => [
            item.campus_id,
            {
              id: item.campus_id,
              name: item.CAMPUS_DA_LOTACAO_DO_BEM,
            },
          ])
        ).values()
      );

      // 3. Se não tiver nenhum campus nos dados de inventário, tentar buscar da API
      if (uniqueCampuses.length === 0) {
        try {
          const response = await fetch("/api/campus");
          if (response.ok) {
            const campusesData = await response.json();
            return campusesData.map((campus: any) => ({
              id: campus.id,
              name: campus.name,
            }));
          }
        } catch (error) {
          console.error("Erro ao buscar campus da API:", error);
        }
      }

      // 4. Ordenar por nome
      return uniqueCampuses.sort((a, b) => a.name.localeCompare(b.name));
    },
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  });
}
