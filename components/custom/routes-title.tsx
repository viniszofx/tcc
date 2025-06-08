export const routes = [
    // admin routes
    { prefix: "/admin/about", title: "Sobre o Sistema" },
    { prefix: "/admin/profile", title: "Perfil" },
    { prefix: "/admin/settings", title: "Configurações do Sistema" },
    { prefix: "/admin/comissions", title: "Comissões" },
    { prefix: "/admin/campus", title: "Gerenciar Campus" },
    { prefix: "/admin/users", title: "Gerenciar Usuários" },
    { prefix: "/admin/organizations", title: "Gerenciar Organizações" },
    // { prefix: "/admin/comissions/[commission_id]/history", title: "Histórico" },

    // dashboard routes
    { prefix: "/dashboard/about", title: "Sobre o Sistema" },
    { prefix: "/admin/settings", title: "Configurações do Sistema" },
    { prefix: "/dashboard/profile", title: "Perfil" },
    { prefix: "/dashboard/comissions", title: "Comissões" },
    { prefix: "/admin/comissions/[comissao_id]/upload", title: "Processamento do Arquivo" },
    { prefix: "/admin/comissions/[comissao_id]/inventories", title: "Inventário" },
]