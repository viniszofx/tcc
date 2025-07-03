import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Verificar autenticação
    const supabase = await createServerSupabaseClient();
    let user;

    if (process.env.NODE_ENV === "development") {
      user = {
        id: "88ae80f0-4c14-44ea-b98a-235cf37bf170",
        email: "dev@example.com",
      };
    } else {
      const {
        data: { user: realUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !realUser) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }
      user = realUser;
    }

    const data = await request.json();
    const {
      commissionId,
      number,
      description,
      brandModel,
      currentResponsibility,
      conservationState,
      location,
      tags,
      ed,
      sector,
    } = data;

    // Validar dados obrigatórios
    if (!commissionId || !description) {
      return NextResponse.json(
        { error: "Commission ID e descrição são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se a comissão existe e o usuário tem permissão
    const commission = await prisma.commission.findUnique({
      where: { id: commissionId },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!commission) {
      return NextResponse.json(
        { error: "Comissão não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se o usuário é membro da comissão
    const userMember = commission.members.find(
      (member) => member.user.email === user.email
    );

    if (!userMember) {
      return NextResponse.json(
        { error: "Usuário não é membro desta comissão" },
        { status: 403 }
      );
    }

    // Gerar número único se não fornecido
    const itemNumber =
      number || `ITEM-${Date.now()}-${Math.random().toString(36).substring(2)}`;

    // Criar o item no banco de dados
    const newItem = await prisma.inventoryItem.create({
      data: {
        commissionId,
        campusId: commission.campusId,
        number: itemNumber,
        description,
        brandModel: brandModel || null,
        currentResponsibility: currentResponsibility || null,
        conservationState: conservationState || "bom",
        location: location || null,
        tags: tags || [],
        ed: ed || null,
        sector: sector || null,
      },
      include: {
        commission: true,
        campus: true,
      },
    });

    console.log(`✅ Item criado com sucesso: ${newItem.id}`);

    return NextResponse.json({
      message: "Item criado com sucesso",
      item: newItem,
    });
  } catch (error) {
    console.error("❌ Erro ao criar item de inventário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    // Verificar autenticação
    const supabase = await createServerSupabaseClient();
    let user;

    if (process.env.NODE_ENV === "development") {
      user = {
        id: "88ae80f0-4c14-44ea-b98a-235cf37bf170",
        email: "dev@example.com",
      };
    } else {
      const {
        data: { user: realUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !realUser) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }
      user = realUser;
    }

    const data = await request.json();
    const {
      id,
      number,
      description,
      brandModel,
      currentResponsibility,
      conservationState,
      location,
      tags,
      ed,
      sector,
    } = data;

    if (!id) {
      return NextResponse.json(
        { error: "ID do item é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se o item existe
    const existingItem = await prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        commission: {
          include: {
            members: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Item não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o usuário é membro da comissão
    const userMember = existingItem.commission.members.find(
      (member) => member.user.email === user.email
    );

    if (!userMember) {
      return NextResponse.json(
        { error: "Usuário não é membro desta comissão" },
        { status: 403 }
      );
    }

    // Atualizar o item
    const updatedItem = await prisma.inventoryItem.update({
      where: { id },
      data: {
        number: number !== undefined ? number : existingItem.number,
        description:
          description !== undefined ? description : existingItem.description,
        brandModel:
          brandModel !== undefined ? brandModel : existingItem.brandModel,
        currentResponsibility:
          currentResponsibility !== undefined
            ? currentResponsibility
            : existingItem.currentResponsibility,
        conservationState:
          conservationState !== undefined
            ? conservationState
            : existingItem.conservationState,
        location: location !== undefined ? location : existingItem.location,
        tags: tags !== undefined ? tags : existingItem.tags,
        ed: ed !== undefined ? ed : existingItem.ed,
        sector: sector !== undefined ? sector : existingItem.sector,
        updatedAt: new Date(),
      },
      include: {
        commission: true,
        campus: true,
      },
    });

    console.log(`✅ Item atualizado com sucesso: ${updatedItem.id}`);

    return NextResponse.json({
      message: "Item atualizado com sucesso",
      item: updatedItem,
    });
  } catch (error) {
    console.error("❌ Erro ao atualizar item de inventário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // Verificar autenticação
    const supabase = await createServerSupabaseClient();
    let user;

    if (process.env.NODE_ENV === "development") {
      user = {
        id: "88ae80f0-4c14-44ea-b98a-235cf37bf170",
        email: "dev@example.com",
      };
    } else {
      const {
        data: { user: realUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !realUser) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }
      user = realUser;
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID do item é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se o item existe
    const existingItem = await prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        commission: {
          include: {
            members: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Item não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o usuário é membro da comissão
    const userMember = existingItem.commission.members.find(
      (member) => member.user.email === user.email
    );

    if (!userMember) {
      return NextResponse.json(
        { error: "Usuário não é membro desta comissão" },
        { status: 403 }
      );
    }

    // Deletar o item
    await prisma.inventoryItem.delete({
      where: { id },
    });

    console.log(`✅ Item deletado com sucesso: ${id}`);

    return NextResponse.json({
      message: "Item deletado com sucesso",
    });
  } catch (error) {
    console.error("❌ Erro ao deletar item de inventário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
