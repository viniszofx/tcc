"use client";

import { useAuth } from "@/hooks/use-auth";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  organization?: {
    id: string;
    name: string;
    shortName: string;
  };
  redirectPath: string;
}

interface UserContextType {
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchUserData = async () => {
    if (!user?.email || loading) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/get-user-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user.email }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Erro ao buscar dados do usuário");
      }
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
      setError("Erro ao buscar dados do usuário");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email && !userData) {
      fetchUserData();
    }
  }, [user?.email, userData]);

  const refetch = () => {
    setUserData(null);
    fetchUserData();
  };

  return (
    <UserContext.Provider value={{ userData, loading, error, refetch }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserData must be used within a UserProvider");
  }
  return context;
}
