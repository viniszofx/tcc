"use client";

import type { UserProfile } from "@/interface";
import { createContext, useContext, useEffect, useState } from "react";

interface UserContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Para desenvolvimento, usar um usuário padrão ou buscar da sessão/auth
        // Por enquanto vou usar a API de usuários
        const usersResponse = await fetch("/api/user");
        const usersData = await usersResponse.json();

        if (usersResponse.ok && usersData.length > 0) {
          // Usar o primeiro usuário por enquanto
          // Em produção, isso deveria vir da sessão/autenticação
          setUser(usersData[0]);
        } else {
          setError("Erro ao carregar dados do usuário");
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
        setError("Erro ao carregar dados do usuário");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, error }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
