import { createSupabaseServer } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { currentPassword, newPassword } = await req.json();

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

    const supabase = await createSupabaseServer();

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

    // Se currentPassword foi fornecida, validar usando uma instância separada
    if (currentPassword) {
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

    return NextResponse.json({
      message: "Senha alterada com sucesso",
      user: updateData.user?.email,
    });
  } catch (error) {
    console.error("Erro geral na API de mudança de senha:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
