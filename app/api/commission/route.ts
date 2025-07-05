import { withPermissions } from "@/lib/permissions/middleware";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    console.log("🔍 GET /api/commission - Buscando comissões");

    // Verificar permissões usando CASL
    const authResult = await withPermissions(request as any, [
      { action: "read", subject: "Commission" },
    ]);

    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const campusId = searchParams.get("campusId");
    const year = searchParams.get("year");

    console.log("📋 Parâmetros de busca:", { id, campusId, year });
    console.log("👤 Usuário:", { id: user.id, role: user.role });

    if (id) {
      console.log("🔍 Buscando comissão específica:", id);
      const commission = await prisma.commission.findUnique({
        where: { id },
        include: {
          campus: true,
          members: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!commission) {
        console.log("❌ Comissão não encontrada:", id);
        return NextResponse.json(
          { error: "Comissão não encontrada" },
          { status: 404 }
        );
      }

      console.log("✅ Comissão encontrada:", commission.name);
      return NextResponse.json(commission);
    }

    // Construir filtros dinamicamente
    const where: any = {};

    if (campusId) {
      where.campusId = campusId;
      console.log("🏫 Filtrando por campus:", campusId);
    }

    if (year) {
      where.year = parseInt(year);
      console.log("📅 Filtrando por ano:", year);
    }

    // Verificar se o usuário é admin global/sistema
    const isGlobalAdmin = user.ability.can("manage", "all");
    console.log("🔐 É admin global:", isGlobalAdmin);

    if (!isGlobalAdmin) {
      // Para usuários não-admin, filtrar apenas comissões onde são membros
      const userCommissionIds = user.commissionMembers?.map(member => member.commissionId) || [];
      
      if (userCommissionIds.length === 0) {
        console.log("❌ Usuário não é membro de nenhuma comissão");
        return NextResponse.json([]);
      }

      where.id = {
        in: userCommissionIds
      };
      console.log("🔒 Filtrando por comissões do usuário:", userCommissionIds);
    }

    console.log("🔍 Buscando comissões com filtros:", where);

    const commissions = await prisma.commission.findMany({
      where,
      include: {
        campus: {
          include: {
            organization: true,
          },
        },
        members: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("✅ Comissões encontradas:", commissions.length);
    console.log(
      "📋 Lista de comissões:",
      commissions.map((c) => ({
        id: c.id,
        name: c.name,
        campusId: c.campusId,
        campusName: c.campus?.name,
        organizationId: c.campus?.organizationId,
        organizationName: c.campus?.organization?.name,
      }))
    );

    return NextResponse.json(commissions);
  } catch (error) {
    console.error("❌ Erro ao buscar comissões:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Verificar permissões usando CASL
    const authResult = await withPermissions(request as any, [
      { action: "create", subject: "Commission" },
    ]);

    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await request.json();
    const { campusId, name, type, description, spreadsheet_url, active, year } =
      body;

    if (!campusId || !name || !type || !year) {
      return NextResponse.json(
        { error: "ID do campus, nome, tipo e ano são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o campus existe
    const campus = await prisma.campus.findUnique({
      where: { id: campusId },
    });

    if (!campus) {
      return NextResponse.json(
        { error: "Campus não encontrado" },
        { status: 404 }
      );
    }

    const newCommission = await prisma.commission.create({
      data: {
        campusId,
        name,
        type,
        description: description || "",
        spreadsheetUrl: spreadsheet_url || "",
        active: active !== undefined ? active : true,
        year,
      },
      include: {
        campus: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json(newCommission, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar comissão:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      campusId,
      name,
      type,
      description,
      spreadsheet_url,
      active,
      year,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    // Verificar se a comissão existe
    const existingCommission = await prisma.commission.findUnique({
      where: { id },
    });

    if (!existingCommission) {
      return NextResponse.json(
        { error: "Comissão não encontrada" },
        { status: 404 }
      );
    }

    // Se campusId for fornecido, verificar se o campus existe
    if (campusId) {
      const campus = await prisma.campus.findUnique({
        where: { id: campusId },
      });

      if (!campus) {
        return NextResponse.json(
          { error: "Campus não encontrado" },
          { status: 404 }
        );
      }
    }

    const updatedCommission = await prisma.commission.update({
      where: { id },
      data: {
        ...(campusId && { campusId }),
        ...(name && { name }),
        ...(type && { type }),
        ...(description !== undefined && { description }),
        ...(spreadsheet_url !== undefined && {
          spreadsheetUrl: spreadsheet_url,
        }),
        ...(active !== undefined && { active }),
        ...(year && { year }),
        updatedAt: new Date(),
      },
      include: {
        campus: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json(updatedCommission);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    // Verificar se a comissão existe e coletar informações sobre os dados relacionados
    const existingCommission = await prisma.commission.findUnique({
      where: { id },
      include: {
        inventoryItems: {
          select: { id: true },
        },
        members: {
          select: { userId: true },
        },
      },
    });

    if (!existingCommission) {
      return NextResponse.json(
        { error: "Comissão não encontrada" },
        { status: 404 }
      );
    }

    console.log(
      `🗑️ Iniciando exclusão da comissão: ${
        existingCommission.name || "Sem nome"
      }`
    );
    console.log(
      `📊 Itens de inventário a serem deletados: ${existingCommission.inventoryItems.length}`
    );
    console.log(
      `👥 Membros da comissão a serem removidos: ${existingCommission.members.length}`
    );

    // Deletar a comissão (CASCADE irá deletar automaticamente):
    // - Todos os InventoryItem relacionados
    // - Todo o InventoryHistory dos itens
    // - Todos os CommissionMember
    // Os UserProfile permanecem intactos
    await prisma.commission.delete({
      where: { id },
    });

    console.log(
      `✅ Comissão deletada com sucesso. ${existingCommission.inventoryItems.length} itens de inventário e ${existingCommission.members.length} relações de membro foram removidos. Usuários preservados.`
    );

    return NextResponse.json(
      {
        message: "Comissão deletada com sucesso",
        deletedItems: {
          inventoryItems: existingCommission.inventoryItems.length,
          commissionMembers: existingCommission.members.length,
        },
        preserved: {
          users: "Todos os usuários foram preservados nas organizações/campus",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao deletar comissão:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
