// import { PrismaClient } from "@prisma/client";
// import { hash } from "bcryptjs";

// const prisma = new PrismaClient();

// async function main() {
//   // Limpar todas as tabelas em ordem reversa de dependência
//   await prisma.$transaction([
//     prisma.role_permissions.deleteMany(),
//     prisma.user_roles.deleteMany(),
//     prisma.permissions.deleteMany(),
//     prisma.roles.deleteMany(),
//     prisma.autenticacao_social.deleteMany(),
//     prisma.settings.deleteMany(),
//     prisma.historico_bens.deleteMany(),
//     prisma.bens_copias.deleteMany(),
//     prisma.bens_originais.deleteMany(),
//     prisma.inventarios.deleteMany(),
//     prisma.comissoes.deleteMany(),
//     prisma.responsaveis.deleteMany(),
//     prisma.campus.deleteMany(),
//     prisma.usuarios.deleteMany(), // MOVIDO PARA CIMA
//     prisma.organizacoes.deleteMany(),
//     prisma.grupos.deleteMany(),
//   ]);

//   console.log("Banco de dados limpo com sucesso.");

//   // Criar role ADMIN
//   const adminRole = await prisma.roles.create({
//     data: {
//       role_name: "ADMIN",
//     },
//   });

//   // Criar organização e usuário administrador
//   const adminUser = await prisma.usuarios.create({
//     data: {
//       nome: "Administrador",
//       email: "admin@ecco.app",
//       senha_hash: await hash("admin123", 10),
//       habilitado: true,
//       papel: "ADMIN",
//       organizacao: {
//         create: {
//           nome: "Organização Padrão",
//         },
//       },
//       metodo_autenticacao: "EMAIL",
//     },
//   });

//   // Relacionar usuário à role ADMIN
//   await prisma.user_roles.create({
//     data: {
//       usuario_id: adminUser.usuario_id,
//       role_id: adminRole.role_id,
//     },
//   });

//   console.log("Usuário administrador criado com sucesso.");
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
