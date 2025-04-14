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
    campus_id: "1",
    foto: "/default-avatar.jpg",
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
    campus_id: "2",
    comissao_id: "Campus Campo Grande",
    foto: "/default-avatar.jpg",
  },
  {
    usuario_id: "dev-pres-001",
    nome: "Presidente Teste",
    papel: "presidente",
    email: "presidente@teste.local",
    senha_hash: "senha_fake_pres_123",
    habilitado: true,
    organizacao_id: "org-001",
    campus_id: "5",
    comissao_id: "com-001",
    foto: "/default-avatar.jpg",
  },
  {
    usuario_id: "dev-user-002",
    nome: "Operador Teste 2",
    papel: "operador",
    email: "operador2@teste.local",
    senha_hash: "senha_fake_user_123",
    habilitado: true,
    organizacao_id: "org-001",
    campus_id: "4",
    comissao_id: "com-001",
    foto: "/default-avatar.jpg",
  },
];

export const campusMap: Record<string, string> = {
  "1": "Campus Central",
  "2": "Campus Norte",
  "3": "Campus Sul",
  "4": "Campus Leste",
  "5": "Campus Oeste",
};

// Lista de campus para os selects
export const campusList = Object.entries(campusMap).map(([id, nome]) => ({
  id,
  nome,
}));

// Função para obter o nome do campus pelo ID
export function getCampusNameById(campusId: string): string {
  return campusMap[campusId] || "Sem campus";
}
