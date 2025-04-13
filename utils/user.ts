import { Usuario } from "@/lib/interface";

export const user: Usuario[] = [
  {
    usuario_id: "dev-admin-001",
    nome: "Administrador Teste",
    papel: "admin",
    email: "admin@teste.local",
    senha_hash: "senha_fake_admin_123",
    habilitado: true,
    organizacao_id: "org-001",
    campus_id: "camp-001",
    comissao_id: "com-001",
  },
  {
    usuario_id: "dev-user-001",
    nome: "Operador Teste",
    papel: "operador",
    email: "operador@teste.local",
    senha_hash: "senha_fake_user_123",
    habilitado: true,
    organizacao_id: "org-001",
    campus_id: "camp-001",
    comissao_id: "com-001",
  },
  {
    usuario_id: "dev-pres-001",
    nome: "Presidente Teste",
    papel: "presidente",
    email: "presidente@teste.local",
    senha_hash: "senha_fake_pres_123",
    habilitado: true,
    organizacao_id: "org-001",
    campus_id: "camp-001",
    comissao_id: "com-001",
    data_inicio: "2023-07-01",
  },
];
