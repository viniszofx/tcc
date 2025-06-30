"use server";

import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase";
import { cookies } from "next/headers";
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

    // Criar cliente do servidor
    const cookieStore = await cookies();
    const supabase = createSupabaseServerClient(cookieStore);

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

    // Verificar se o usuário existe na tabela user_profiles e buscar sua role
    const userProfile = await prisma.userProfile.findUnique({
      where: { email: data.email },
      include: {
        organizationMembers: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!userProfile) {
      throw new Error(
        "Perfil do usuário não encontrado. Entre em contato com o administrador."
      );
    }

    // Determinar o redirecionamento com base na role do usuário
    let redirectPath = "/dashboard"; // Default para members

    if (
      userProfile.organizationMembers &&
      userProfile.organizationMembers.length > 0
    ) {
      // Se o usuário tem múltiplas organizações, pegar a primeira onde ele é admin
      // ou a primeira de qualquer forma
      const adminMembership = userProfile.organizationMembers.find(
        (member) => member.role === "admin"
      );

      if (adminMembership) {
        redirectPath = "/admin";
      } else {
        // Se não é admin em nenhuma organização, verificar se é member
        const memberMembership = userProfile.organizationMembers.find(
          (member) => member.role === "member"
        );
        redirectPath = memberMembership ? "/dashboard" : "/dashboard";
      }
    }

    console.log("Login realizado com sucesso:", {
      email: data.email,
      role: userProfile.organizationMembers[0]?.role,
      redirectTo: redirectPath,
    });

    redirect(redirectPath);
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
  try {
    const cookieStore = await cookies();
    const supabase = createSupabaseServerClient(cookieStore);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Erro ao fazer logout:", error);
      throw error;
    }

    console.log("Logout realizado com sucesso");
    redirect("/login");
  } catch (error) {
    console.error("Erro no logout:", error);
    throw error;
  }
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

// Função para validar usuário após login client-side e determinar redirecionamento
export async function validateUserAndRedirect(email: string): Promise<string> {
  try {
    // Verificar se o usuário está na tabela allowed_users
    const allowedUser = await prisma.allowedUser.findUnique({
      where: { email },
    });

    if (!allowedUser || !allowedUser.status) {
      throw new Error("Usuário não autorizado para acessar o sistema");
    }

    // Verificar se o usuário existe na tabela user_profiles e buscar sua role
    const userProfile = await prisma.userProfile.findUnique({
      where: { email },
      include: {
        organizationMembers: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!userProfile) {
      throw new Error(
        "Perfil do usuário não encontrado. Entre em contato com o administrador."
      );
    }

    // Determinar o redirecionamento com base na role do usuário
    const organizationMember = userProfile.organizationMembers[0];

    if (!organizationMember) {
      throw new Error("Usuário não está vinculado a nenhuma organização");
    }

    // Redirecionamento inteligente baseado na role
    switch (organizationMember.role) {
      case "admin":
        return "/admin";
      case "member":
      default:
        return "/dashboard";
    }
  } catch (error) {
    console.error("Erro na validação do usuário:", error);
    throw error;
  }
}
