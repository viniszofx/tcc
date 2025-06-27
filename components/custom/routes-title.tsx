export const routes = [
    // admin routes
    { prefix: "/admin/about", title: "Sobre o Sistema" },
    { prefix: "/admin/profile/[id]", title: "Perfil" },
    { prefix: "/admin/settings", title: "Configurações do Sistema" },
    { prefix: "/admin/comissions", title: "Comissões" },
    { prefix: "/admin/campus", title: "Gerenciar Campus" },
    { prefix: "/admin/campus/[campus_id]", title: "Detalhes do Campus" },
    { prefix: "/admin/users", title: "Gerenciar Usuários" },
    { prefix: "/admin/users/[usuario_id]", title: "Detalhes do Usuários" },
    { prefix: "/admin/organizations", title: "Gerenciar Organizações" },
    { prefix: "/admin/organizations/[organizacao_id]", title: "Detalhes da Organização" },
    { prefix: "/admin/comissions/[commission_id]", title: "Gerenciar Comissões" },
    { prefix: "/admin/comissions/[comissao_id]/upload", title: "Processamento de Arquivo" },
    { prefix: "/admin/comissions/[comissao_id]/members", title: "Gerenciar Membros" },
    { prefix: "/admin/comissions/[comissao_id]/history", title: "Histórico" },
    { prefix: "/admin/comissions/[comissao_id]/inventories", title: "Inventário do Presidente" },
    { prefix: "/admin/comissions/[comissao_id]/inventories/[id]", title: "Detalhes do Bem" },

    // dashboard routes
    { prefix: "/dashboard/about", title: "Sobre o Sistema" },
    { prefix: "/admin/settings", title: "Configurações do Sistema" },
    { prefix: "/dashboard/profile[id]", title: "Perfil" },
    { prefix: "/dashboard/comissions", title: "Comissões" },
    { prefix: "/dashboard/comissions/[commission_id]", title: "Comissões" },
    { prefix: "/dashboard/comissions/[comissao_id]/history", title: "Histórico" },
    { prefix: "/dashboard/comissions/[comissao_id]/inventories", title: "Inventário do Operador" },
    { prefix: "/dashboard/comissions/[comissao_id]/inventories/[id]", title: "Detalhes do Bem" },
]