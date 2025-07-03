"use client";

import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });
  const router = useRouter();

  useEffect(() => {
    // Verificar sessão inicial
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Erro ao obter sessão:", error);
          setState({ user: null, loading: false, error: error.message });
          return;
        }

        setState({ user: session?.user ?? null, loading: false, error: null });
      } catch (error) {
        console.error("Erro ao verificar sessão inicial:", error);
        setState({
          user: null,
          loading: false,
          error: "Erro ao verificar sessão",
        });
      }
    };

    getInitialSession();

    // Escutar mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      console.log("Auth state changed:", event, session?.user?.email);

      setState({
        user: session?.user ?? null,
        loading: false,
        error: null,
      });

      // Redirecionar baseado no evento
      if (event === "SIGNED_OUT") {
        router.push("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const signInWithValidation = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // 1. Verificar se o usuário está na lista de permitidos
      const allowedResponse = await fetch("/api/auth/validate-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!allowedResponse.ok) {
        const errorData = await allowedResponse.json();
        throw new Error(
          errorData.message || "Usuário não autorizado para acessar o sistema"
        );
      }

      // 2. Autenticar com Supabase
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) {
        throw new Error("Email ou senha incorretos");
      }

      if (!authData.user) {
        throw new Error("Falha na autenticação");
      }

      // 3. Aguardar a sessão ser estabelecida
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 4. Verificar se a sessão foi criada
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        throw new Error("Falha ao estabelecer sessão");
      }

      // 5. Buscar informações do usuário e determinar redirecionamento
      const userResponse = await fetch("/api/auth/get-user-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();

        // Redirecionar com base na role
        if (userData.role === "admin") {
          router.push("/application");
        } else {
          router.push("/application");
        }
      } else {
        // Fallback para application se não conseguir determinar a role
        router.push("/application");
      }

      setState({ user: authData.user, loading: false, error: null });
      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  // Sign in with email and password (método básico)
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Sign out
  const signOut = async () => {
    setState((prev) => ({ ...prev, loading: true }));

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setState({ user: null, loading: false, error: null });
      router.push("/login");
      return { error: null };
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false }));
      return { error };
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Update password
  const updatePassword = async (password: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  return {
    ...state,
    signIn,
    signInWithValidation,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };
}
