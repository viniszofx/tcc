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
    } = supabase.auth.onAuthStateChange(async (event, session) => {
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
      console.log("Iniciando processo de login para:", email);

      // 1. Autenticar com Supabase primeiro
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) {
        console.error("Erro de autenticação:", authError);
        throw new Error("Email ou senha incorretos");
      }

      if (!authData.user) {
        throw new Error("Falha na autenticação");
      }

      console.log("Autenticação bem-sucedida para:", authData.user.email);

      // 2. Aguardar a sessão ser estabelecida
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 3. Verificar se a sessão foi criada
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        throw new Error("Falha ao estabelecer sessão");
      }

      console.log("Sessão estabelecida com sucesso");

      // 4. Verificar se o usuário está na lista de permitidos (não crítico)
      try {
        const allowedResponse = await fetch("/api/auth/validate-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        if (!allowedResponse.ok) {
          const errorData = await allowedResponse.json();
          console.warn(
            "Usuário não está na lista de permitidos:",
            errorData.message
          );
          // Não vamos falhar aqui - vamos apenas logar e prosseguir
        }
      } catch (validationError) {
        console.warn(
          "Erro na validação do usuário (continuando):",
          validationError
        );
      }

      // 5. Buscar informações do usuário e determinar redirecionamento
      try {
        const userResponse = await fetch("/api/auth/get-user-role", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log("===== DEBUG REDIRECIONAMENTO =====");
          console.log("userData completo:", userData);
          console.log("userData.user:", userData.user);
          console.log("userData.user.role:", userData.user?.role);
          console.log("userData.role:", userData.role);
          console.log(
            "userData.user.redirectPath:",
            userData.user?.redirectPath
          );

          // Redirecionar com base na role - verificar múltiplas propriedades
          const userRole = userData.user?.role || userData.role;
          console.log("Role final detectada:", userRole);

          if (userRole === "admin") {
            console.log("✅ Redirecionando ADMIN para /application");
            router.push("/application");
          } else {
            console.log(
              "➡️ Redirecionando USER para /application (role:",
              userRole,
              ")"
            );
            router.push("/application");
          }
          console.log("=================================");
        } else {
          console.warn(
            "Não foi possível determinar a role, redirecionando para dashboard"
          );
          router.push("/application");
        }
      } catch (roleError) {
        console.warn(
          "Erro ao buscar role (redirecionando para dashboard):",
          roleError
        );
        router.push("/application");
      }

      setState({ user: authData.user, loading: false, error: null });
      return { success: true };
    } catch (error) {
      console.error("Erro no processo de login:", error);
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
