import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Verificar autenticação - desenvolvimento vs produção
    const supabase = await createServerSupabaseClient();
    let user;

    if (process.env.NODE_ENV === "development") {
      // Em desenvolvimento, usar um usuário fake
      user = {
        id: "dev-user-uuid",
        email: "dev@example.com",
      };
    } else {
      // Em produção, autenticação real
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
    const commissionId = searchParams.get("commissionId");
    const campusId = searchParams.get("campusId");
    const sector = searchParams.get("sector");
    const ed = searchParams.get("ed");

    if (id) {
      const item = await prisma.inventoryItem.findUnique({
        where: { id },
        include: {
          commission: true,
          campus: true,
        },
      });

      if (!item) {
        return NextResponse.json(
          { error: "Item de inventário não encontrado" },
          { status: 404 }
        );
      }
      return NextResponse.json(item);
    }

    // Buscar itens com filtros
    const where: any = {};

    if (commissionId) {
      where.commissionId = commissionId;
    }

    if (campusId) {
      where.campusId = campusId;
    }

    if (sector) {
      where.sector = sector;
    }

    if (ed) {
      where.ed = ed;
    }

    const items = await prisma.inventoryItem.findMany({
      where,
      include: {
        commission: true,
        campus: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Erro na API de inventário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Verificar autenticação - desenvolvimento vs produção
    const supabase = await createServerSupabaseClient();
    let user;

    if (process.env.NODE_ENV === "development") {
      user = { id: "dev-user-uuid", email: "dev@example.com" };
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

    const body = await request.json();
    const {
      commissionId,
      campusId,
      number,
      description,
      brandModel,
      currentResponsibility,
      conservationState,
      location,
      tags,
      ed,
      sector,
    } = body;

    if (!commissionId || !campusId || !number || !description) {
      return NextResponse.json(
        {
          error:
            "ID da comissão, ID do campus, número e descrição são obrigatórios",
        },
        { status: 400 }
      );
    }

    const newItem = await prisma.inventoryItem.create({
      data: {
        commissionId,
        campusId,
        number,
        description,
        brandModel: brandModel || null,
        currentResponsibility: currentResponsibility || null,
        conservationState: conservationState || null,
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

    // Criar registro no histórico
    await prisma.inventoryHistory.create({
      data: {
        inventoryItemId: newItem.id,
        userId: user.id,
        action: "create",
        changes: JSON.stringify({ created: newItem }),
        observation: "Item criado",
        imageUrl: [],
      },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar item:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    // Verificar autenticação - desenvolvimento vs produção
    const supabase = await createServerSupabaseClient();
    let user;

    if (process.env.NODE_ENV === "development") {
      user = { id: "dev-user-uuid", email: "dev@example.com" };
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

    const body = await request.json();
    const {
      id,
      commissionId,
      campusId,
      number,
      description,
      brandModel,
      currentResponsibility,
      conservationState,
      location,
      tags,
      ed,
      sector,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    // Buscar item atual para comparar mudanças
    const currentItem = await prisma.inventoryItem.findUnique({
      where: { id },
    });

    if (!currentItem) {
      return NextResponse.json(
        { error: "Item de inventário não encontrado" },
        { status: 404 }
      );
    }

    const updatedItem = await prisma.inventoryItem.update({
      where: { id },
      data: {
        ...(commissionId && { commissionId }),
        ...(campusId && { campusId }),
        ...(number && { number }),
        ...(description && { description }),
        ...(brandModel !== undefined && { brandModel }),
        ...(currentResponsibility !== undefined && { currentResponsibility }),
        ...(conservationState !== undefined && { conservationState }),
        ...(location !== undefined && { location }),
        ...(tags !== undefined && { tags }),
        ...(ed !== undefined && { ed }),
        ...(sector !== undefined && { sector }),
      },
      include: {
        commission: true,
        campus: true,
      },
    });

    // Criar registro no histórico
    await prisma.inventoryHistory.create({
      data: {
        inventoryItemId: id,
        userId: user.id,
        action: "update",
        changes: JSON.stringify({
          before: currentItem,
          after: updatedItem,
        }),
        observation: "Item atualizado",
        imageUrl: [],
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Erro ao atualizar item:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // Verificar autenticação - desenvolvimento vs produção
    const supabase = await createServerSupabaseClient();
    let user;

    if (process.env.NODE_ENV === "development") {
      user = { id: "dev-user-uuid", email: "dev@example.com" };
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
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    // Buscar item antes de deletar para o histórico
    const itemToDelete = await prisma.inventoryItem.findUnique({
      where: { id },
    });

    if (!itemToDelete) {
      return NextResponse.json(
        { error: "Item de inventário não encontrado" },
        { status: 404 }
      );
    }

    // Criar registro no histórico antes de deletar
    await prisma.inventoryHistory.create({
      data: {
        inventoryItemId: id,
        userId: user.id,
        action: "delete",
        changes: JSON.stringify({ deleted: itemToDelete }),
        observation: "Item removido",
        imageUrl: [],
      },
    });

    await prisma.inventoryItem.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Item removido com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar item:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
