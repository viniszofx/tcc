"use client";

import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useState } from "react";

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useSimpleAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: false,
    error: null,
  });
  const router = useRouter();

  const signIn = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      console.log("Iniciando processo de login...");

      // Teste simples do Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Erro de autenticação:", error);
        throw error;
      }

      if (!data.user) {
        throw new Error("Usuário não encontrado");
      }

      console.log("Login bem-sucedido:", data.user.email);
      setState({ user: data.user, loading: false, error: null });

      // Redirecionamento simples
      router.push("/application");

      return { success: true };
    } catch (error: any) {
      console.error("Erro no login:", error);
      const errorMessage = error.message || "Erro desconhecido";
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  return {
    ...state,
    signIn,
  };
}
