import { NextRequest, NextResponse } from "next/server";

/**
 * API para configurar políticas RLS para buckets de storage
 * Esta API configura as políticas necessárias para que uploads funcionem corretamente
 */
export async function POST(request: NextRequest) {
  try {
    console.log("🔒 Configurando políticas RLS para buckets...");

    const policies = {
      "inventory-files": {
        name: "inventory-files",
        policies: [
          {
            name: "Users can upload inventory files",
            operation: "INSERT",
            check: "bucket_id = 'inventory-files' AND auth.uid() IS NOT NULL",
          },
          {
            name: "Anyone can view inventory files",
            operation: "SELECT",
            using: "bucket_id = 'inventory-files'",
          },
          {
            name: "Users can update inventory files",
            operation: "UPDATE",
            using: "bucket_id = 'inventory-files' AND auth.uid() IS NOT NULL",
          },
          {
            name: "Users can delete inventory files",
            operation: "DELETE",
            using: "bucket_id = 'inventory-files' AND auth.uid() IS NOT NULL",
          },
        ],
      },
      avatars: {
        name: "avatars",
        policies: [
          {
            name: "Users can upload their own avatars",
            operation: "INSERT",
            check:
              "bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]",
          },
          {
            name: "Anyone can view avatars",
            operation: "SELECT",
            using: "bucket_id = 'avatars'",
          },
          {
            name: "Users can update their own avatars",
            operation: "UPDATE",
            using:
              "bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]",
          },
          {
            name: "Users can delete their own avatars",
            operation: "DELETE",
            using:
              "bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]",
          },
        ],
      },
    };

    const sqlStatements = [];

    // Gerar statements SQL para cada bucket
    for (const [bucketName, config] of Object.entries(policies)) {
      for (const policy of config.policies) {
        // Remover política existente
        sqlStatements.push(
          `DROP POLICY IF EXISTS "${policy.name}" ON storage.objects;`
        );

        // Criar nova política
        let statement = `CREATE POLICY "${policy.name}" ON storage.objects FOR ${policy.operation}`;

        if (policy.operation === "INSERT") {
          statement += ` WITH CHECK (${policy.check});`;
        } else {
          statement += ` USING (${policy.using});`;
        }

        sqlStatements.push(statement);
      }
    }

    // Adicionar statements para habilitar RLS
    const rlsStatements = [
      "ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;",
      "ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;",
    ];

    const allStatements = [...rlsStatements, ...sqlStatements];

    return NextResponse.json({
      success: true,
      message:
        "Políticas RLS geradas. Execute os comandos SQL abaixo no Supabase SQL Editor:",
      sqlStatements: allStatements,
      instructions: [
        "1. Acesse https://app.supabase.com",
        "2. Selecione seu projeto",
        "3. Vá para SQL Editor",
        "4. Execute os comandos SQL fornecidos",
        "5. As políticas RLS serão aplicadas automaticamente",
      ],
    });
  } catch (error: any) {
    console.error("❌ Erro ao gerar políticas RLS:", error);
    return NextResponse.json(
      {
        error: "Erro ao gerar políticas RLS",
        details: error?.message || "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

/**
 * GET para obter informações sobre as políticas
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "API para configuração de políticas RLS dos buckets de storage",
    buckets: ["inventory-files", "avatars"],
    usage: "POST para gerar comandos SQL das políticas RLS",
  });
}
