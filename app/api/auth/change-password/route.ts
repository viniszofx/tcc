import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { currentPassword, newPassword, isPasswordReset } = await req.json();

    if (!newPassword) {
      return NextResponse.json(
        { error: "Nova senha é obrigatória" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "A nova senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Criar cliente Supabase com configuração adequada de cookies
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              // Ignore errors in server components
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set({ name, value: "", ...options });
            } catch (error) {
              // Ignore errors in server components
            }
          },
        },
      }
    );

    // Verificar se o usuário está autenticado
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    console.log("Tentando alterar senha para usuário:", user.email);
    console.log("É reset de senha:", isPasswordReset);

    // Se não é um reset de senha e currentPassword foi fornecida, validar usando uma instância separada
    if (!isPasswordReset && currentPassword) {
      try {
        const { createClient } = await import("@supabase/supabase-js");

        // Criar cliente separado para validação
        const validationClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        console.log("Validando senha atual para:", user.email);

        // Tentar fazer login com as credenciais atuais
        const { data: signInData, error: signInError } =
          await validationClient.auth.signInWithPassword({
            email: user.email!,
            password: currentPassword,
          });

        // Imediatamente fazer logout da sessão de validação
        if (signInData.session) {
          await validationClient.auth.signOut();
        }

        if (signInError) {
          console.log("Senha atual incorreta:", signInError.message);
          return NextResponse.json(
            { error: "Senha atual incorreta" },
            { status: 400 }
          );
        }

        console.log("Senha atual validada com sucesso");
      } catch (validationError) {
        console.error("Erro na validação:", validationError);
        return NextResponse.json(
          { error: "Erro ao validar senha atual" },
          { status: 500 }
        );
      }
    } else if (!isPasswordReset && !currentPassword) {
      // Se não é um reset de senha e não foi fornecida a senha atual
      return NextResponse.json(
        { error: "Senha atual é obrigatória" },
        { status: 400 }
      );
    }

    // Atualizar a senha usando a sessão original do usuário
    console.log("Atualizando senha...");
    const { data: updateData, error: updateError } =
      await supabase.auth.updateUser({
        password: newPassword,
      });

    if (updateError) {
      console.error("Erro ao atualizar senha:", updateError);
      return NextResponse.json(
        { error: `Erro ao atualizar senha: ${updateError.message}` },
        { status: 500 }
      );
    }

    console.log("Senha alterada com sucesso!");

    // Invalidar a sessão após alterar a senha
    try {
      await supabase.auth.signOut();
      console.log("Sessão invalidada com sucesso");
    } catch (signOutError) {
      console.warn("Erro ao invalidar sessão:", signOutError);
      // Não falhar a operação se não conseguir invalidar a sessão
    }

    return NextResponse.json({
      message: isPasswordReset ? "Nova senha definida com sucesso" : "Senha alterada com sucesso",
      user: updateData.user?.email,
      sessionInvalidated: true,
    });
  } catch (error) {
    console.error("Erro geral na API de mudança de senha:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
