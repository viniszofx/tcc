import { withPermissions } from "@/lib/permissions/middleware";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/user/{id}/reset-password:
 *   post:
 *     tags:
 *       - Users
 *     summary: Resetar senha do usuário
 *     description: Gera uma nova senha temporária para o usuário
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Senha resetada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tempPassword:
 *                   type: string
 *                   description: Nova senha temporária
 *                 message:
 *                   type: string
 *                   description: Mensagem de sucesso
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verificar permissões usando CASL
  const permissionResult = await withPermissions(request, [
    { action: "update", subject: "User" },
  ]);

  if (!permissionResult.success) {
    return NextResponse.json(
      { error: permissionResult.error },
      { status: permissionResult.status }
    );
  }

  const { user: currentUser } = permissionResult;

  try {
    const { id } = await params;

    // Verificar se o usuário existe
    const user = await prisma.userProfile.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Admin comum não pode resetar senha de admin global
    if (user.role === "admin global" && currentUser.role !== "admin global") {
      return NextResponse.json(
        { error: "Apenas administradores globais podem resetar senhas de outros administradores globais" },
        { status: 403 }
      );
    }

    // Verificar se pode resetar senha deste usuário específico
    if (!currentUser.ability.can("update", "User")) {
      return NextResponse.json(
        { error: "Sem permissão para resetar senha deste usuário" },
        { status: 403 }
      );
    }

    // Gerar nova senha temporária
    const tempPassword = `kde${Math.random().toString(36).slice(-6)}!`;

    // Atualizar senha no Supabase Auth
    const supabaseAdmin = createSupabaseAdmin();
    const { error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(id, {
        password: tempPassword,
      });

    if (updateError) {
      console.error("Erro ao atualizar senha no Supabase:", updateError);
      return NextResponse.json(
        { error: `Erro ao atualizar senha: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      tempPassword,
      message: "Senha resetada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao resetar senha:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
