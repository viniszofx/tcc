"use server";

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
    // Primeiro, verificar se o sistema precisa de onboarding
    const systemResponse = await fetch(
      `${
        process.env.NEXT_PUBLIC_URL || "http://localhost:3000"
      }/api/auth/check-system`
    );

    if (systemResponse.ok) {
      const { needsOnboarding, isFirstRun } = await systemResponse.json();

      if (needsOnboarding && isFirstRun) {
        throw new Error("Sistema precisa ser configurado primeiro");
      }
    }

    // Verificar se o usuário está autorizado
    const validateResponse = await fetch(
      `${
        process.env.NEXT_PUBLIC_URL || "http://localhost:3000"
      }/api/auth/validate-user`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      }
    );

    if (!validateResponse.ok) {
      if (validateResponse.status === 403) {
        const { message } = await validateResponse.json();
        throw new Error(
          message || "Usuário não autorizado para acessar o sistema"
        );
      }
      throw new Error("Erro ao validar usuário");
    }

    // TODO: Integrar com Supabase Auth em produção
    if (process.env.NODE_ENV === "development") {
      console.log("Login simulado para desenvolvimento:", data.email);
      redirect("/dashboard");
    } else {
      // Em produção, fazer login real com Supabase
      throw new Error("Integração com Supabase não implementada");
    }
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
  const data = {
    organizationName: formData.get("organizationName") as string,
    organizationShortName: formData.get("organizationShortName") as string,
    campusName: formData.get("campusName") as string,
    campusCode: formData.get("campusCode") as string,
    adminName: formData.get("adminName") as string,
    adminEmail: formData.get("adminEmail") as string,
  };

  // Validar campos obrigatórios
  const requiredFields = [
    "organizationName",
    "organizationShortName",
    "campusName",
    "campusCode",
    "adminName",
    "adminEmail",
  ];

  for (const field of requiredFields) {
    if (!data[field as keyof typeof data]) {
      throw new Error(`Campo ${field} é obrigatório`);
    }
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.adminEmail)) {
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
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erro ao configurar sistema");
    }

    console.log("Onboarding concluído com sucesso");
    redirect("/login");
  } catch (error) {
    console.error("Erro no onboarding:", error);
    throw error;
  }
}
