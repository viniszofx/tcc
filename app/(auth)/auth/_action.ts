"use server";

import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";

export async function signIn(formData: FormData): Promise<void> {
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  if (!data.email || !data.password) {
    throw new Error("Email e senha são obrigatórios");
  }

  try {
    // Primeiro, verificar se o usuário está na tabela allowed_users
    const allowedUser = await prisma.allowedUser.findUnique({
      where: { email: data.email },
    });

    if (!allowedUser || !allowedUser.status) {
      throw new Error("Usuário não autorizado para acessar o sistema");
    }

    // Autenticar com Supabase
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

    if (authError) {
      throw new Error("Email ou senha incorretos");
    }

    if (!authData.user) {
      throw new Error("Falha na autenticação");
    }

    // Verificar se o usuário existe na tabela user_profiles
    const userProfile = await prisma.userProfile.findUnique({
      where: { email: data.email },
    });

    if (!userProfile) {
      throw new Error(
        "Perfil do usuário não encontrado. Entre em contato com o administrador."
      );
    }

    console.log("Login realizado com sucesso:", data.email);
    redirect("/dashboard");
  } catch (error) {
    console.error("Erro no login:", error);
    throw error;
  }
}

export async function signUp(formData: FormData): Promise<void> {
  const data = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };
  console.log("signUp received:", data);
}

export async function signOut(): Promise<void> {
  console.log("signOut called");
}

export async function signInWithGoogle(): Promise<void> {
  console.log("signInWithGoogle called");
}

type MagicLinkResult = {
  error?: string;
  success?: boolean;
};

export async function signInWithMagicLink(
  formData: FormData
): Promise<MagicLinkResult> {
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email is required" };
  }

  if (
    !email.endsWith("@estudante.ifms.edu.br") &&
    !email.endsWith("@ifms.edu.br")
  ) {
    return { error: "Invalid email domain" };
  }

  try {
    console.log("signInWithMagicLink received:", {
      email,
      redirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/callback`,
      options: {
        data: { email },
      },
    });
    return { success: true };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export async function processOnboarding(formData: FormData): Promise<void> {
  const organizationName = formData.get("organizationName") as string;
  const organizationShortName = formData.get("organizationShortName") as string;
  const campusName = formData.get("campusName") as string;
  const campusCode = formData.get("campusCode") as string;
  const adminName = formData.get("adminName") as string;
  const adminEmail = formData.get("adminEmail") as string;

  // Validar campos obrigatórios
  if (
    !organizationName ||
    !organizationShortName ||
    !campusName ||
    !campusCode ||
    !adminName ||
    !adminEmail
  ) {
    throw new Error("Todos os campos são obrigatórios");
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(adminEmail)) {
    throw new Error("Email inválido");
  }

  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_URL || "http://localhost:3000"
      }/api/onboarding/setup`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organization: {
            name: organizationName,
            shortName: organizationShortName,
          },
          campus: {
            name: campusName,
            code: campusCode,
          },
          admin: {
            name: adminName,
            email: adminEmail,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao configurar sistema");
    }

    console.log("Setup concluído com sucesso");
    redirect("/login");
  } catch (error) {
    console.error("Erro no setup:", error);
    throw error;
  }
}
