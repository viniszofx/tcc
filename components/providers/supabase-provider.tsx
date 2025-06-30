"use client";

import { createContext, useContext } from "react";

interface SupabaseContextType {
  // Context simples, sem inicialização automática
}

const SupabaseContext = createContext<SupabaseContextType>({});

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
};

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseContext.Provider value={{}}>{children}</SupabaseContext.Provider>
  );
}
