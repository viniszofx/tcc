import { saveInventoryItemsToDatabase } from "@/lib/inventory-database";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    console.log("Iniciando processamento da requisição de importação");

    // Verificar autenticação - desenvolvimento vs produção
    const supabase = await createServerSupabaseClient();
    let user;

    if (process.env.NODE_ENV === "development") {
      // Em desenvolvimento, usar um usuário fake
      user = {
        id: "dev-user-uuid",
        email: "dev@example.com",
      };
      console.log("Modo desenvolvimento - usuário fake:", user.id);
    } else {
      // Em produção, autenticação real
      const {
        data: { user: realUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !realUser) {
        console.log("Erro de autenticação:", authError);
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }
      user = realUser;
      console.log("Usuário autenticado:", user.id);
    }

    const body = await request.json();
    console.log("Body recebido:", {
      itemsCount: body.items?.length,
      commissionId: body.commissionId,
      campusId: body.campusId,
    });

    const { items, commissionId, campusId } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Items são obrigatórios e devem ser um array" },
        { status: 400 }
      );
    }

    if (!commissionId) {
      return NextResponse.json(
        { error: "Commission ID é obrigatório" },
        { status: 400 }
      );
    }

    if (!campusId) {
      return NextResponse.json(
        { error: "Campus ID é obrigatório" },
        { status: 400 }
      );
    }

    // Salvar os itens no banco
    console.log("Iniciando salvamento no banco de dados");
    const result = await saveInventoryItemsToDatabase(
      items,
      commissionId,
      campusId,
      user.id
    );

    console.log("Resultado do salvamento:", result);

    if (result.success) {
      return NextResponse.json({
        success: true,
        itemsCreated: result.itemsCreated,
        message: result.message,
      });
    } else {
      return NextResponse.json(
        {
          error: result.error,
          message: result.message,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erro na API de importação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
