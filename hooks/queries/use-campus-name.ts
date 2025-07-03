"use client";

import type { Campus } from "@/interface";
import { useQuery } from "@tanstack/react-query";

/**
 * Custom hook to fetch campus name by campus ID
 */
export function useCampusName(campusId?: string) {
  return useQuery({
    queryKey: ["campus-name", campusId],
    queryFn: async (): Promise<string> => {
      if (!campusId) return "Campus não especificado";

      try {
        const response = await fetch(`/api/campus?id=${campusId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch campus");
        }
        const data: Campus = await response.json();
        return data.name || "Campus não especificado";
      } catch (error) {
        console.error("Error fetching campus name:", error);
        return "Campus não especificado";
      }
    },
    enabled: !!campusId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
}

/**
 * Utility function to get campus name from ID (to be used when a React hook isn't appropriate)
 */
export async function getCampusNameById(campusId?: string): Promise<string> {
  if (!campusId) return "Campus não especificado";

  try {
    const response = await fetch(`/api/campus?id=${campusId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch campus");
    }
    const data: Campus = await response.json();
    return data.name || "Campus não especificado";
  } catch (error) {
    console.error("Error fetching campus name:", error);
    return "Campus não especificado";
  }
}
