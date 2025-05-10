// import { PrismaClient } from "@prisma/client";
// import { hash } from "bcryptjs";

// const prisma = new PrismaClient();

// async function main() {
//   try {
//     console.log("Iniciando seed do banco de dados...");

//     // Limpar banco de dados
//     console.log("Limpando banco de dados...");
//     await prisma.$transaction([
//       prisma.user_roles.deleteMany(),
//       prisma.roles.deleteMany(),
//       // prisma.users.deleteMany(),
//       prisma.organizacoes.deleteMany(),
//     ]);

//     // Criar organização
//     console.log("Criando organização padrão...");
//     const org = await prisma.organizacoes.create({
//       data: {
//         nome: "IFMS",
//       },
//     });

//     // Criar role admin
//     console.log("Criando role admin...");
//     const adminRole = await prisma.roles.create({
//       data: {
//         role_name: "ADMIN",
//       },
//     });

//     // Criar usuário admin
//     console.log("Criando usuário admin...");
//     const adminUser = await prisma.users.create({
//       data: {
//         nome: "Administrador",
//         email: "admin@ifms.edu.br",
//         senha_hash: await hash("admin123", 10),
//         habilitado: true,
//         papel: "ADMIN",
//         organizacao_id: org.organizacao_id,
//         metodo_autenticacao: "EMAIL",
//       },
//     });

//     // Relacionar usuário com role
//     console.log("Vinculando usuário à role admin...");
//     await prisma.user_roles.create({
//       data: {
//         usuario_id: adminUser.usuario_id,
//         role_id: adminRole.role_id,
//       },
//     });

//     console.log("Seed concluído com sucesso!");
//   } catch (error) {
//     console.error("Erro durante o seed:", error);
//     throw error;
//   }
// }

// main()
//   .catch((e) => {
//     console.error("Erro fatal durante o seed:", e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
