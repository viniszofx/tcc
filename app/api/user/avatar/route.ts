import { prisma } from "@/lib/prisma";
import { deleteAvatar, uploadAvatar } from "@/lib/supabase-avatars";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const supabase = await createServerSupabaseClient();

    const {
      data: { user: currentUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !currentUser) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Obter dados do formulário
    const formData = await request.formData();
    const file = formData.get("avatar") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Arquivo não fornecido" },
        { status: 400 }
      );
    }

    // Usar o ID do usuário atual
    const userId = currentUser.id;

    // Validar tipo e tamanho do arquivo
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de arquivo não permitido. Use JPEG, PNG ou WebP." },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Máximo 5MB." },
        { status: 400 }
      );
    }

    // Verificar se o usuário existe no banco
    const userProfile = await prisma.userProfile.findUnique({
      where: { id: userId },
    });

    if (!userProfile) {
      return NextResponse.json(
        { error: "Perfil de usuário não encontrado no sistema" },
        { status: 404 }
      );
    }

    // Deletar avatar anterior se existir
    if (userProfile.avatar) {
      await deleteAvatar(userId);
    }

    // Fazer upload do novo avatar
    const avatarUrl = await uploadAvatar(userId, file);

    if (!avatarUrl) {
      return NextResponse.json(
        { error: "Erro ao fazer upload do avatar" },
        { status: 500 }
      );
    }

    // Atualizar URL do avatar no banco de dados
    const updatedUser = await prisma.userProfile.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
    });

    return NextResponse.json({
      message: "Avatar atualizado com sucesso",
      avatarUrl,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Erro ao fazer upload do avatar:", error);

    // Tratamento específico para erro P2025 (registro não encontrado)
    if (error instanceof Error && "code" in error && error.code === "P2025") {
      return NextResponse.json(
        { error: "Usuário não encontrado no banco de dados" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticação
    const supabase = await createServerSupabaseClient();

    const {
      data: { user: currentUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !currentUser) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Usar o ID do usuário atual
    const userId = currentUser.id;

    // Verificar se o usuário existe no banco
    const userProfile = await prisma.userProfile.findUnique({
      where: { id: userId },
    });

    if (!userProfile) {
      return NextResponse.json(
        { error: "Perfil de usuário não encontrado no sistema" },
        { status: 404 }
      );
    }

    // Deletar avatar do storage
    const deleted = await deleteAvatar(userId);

    if (!deleted) {
      return NextResponse.json(
        { error: "Erro ao deletar avatar" },
        { status: 500 }
      );
    }

    // Remover URL do avatar no banco de dados
    const updatedUser = await prisma.userProfile.update({
      where: { id: userId },
      data: { avatar: null },
    });

    return NextResponse.json({
      message: "Avatar removido com sucesso",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Erro ao deletar avatar:", error);

    // Tratamento específico para erro P2025 (registro não encontrado)
    if (error instanceof Error && "code" in error && error.code === "P2025") {
      return NextResponse.json(
        { error: "Usuário não encontrado no banco de dados" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
