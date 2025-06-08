import data from "@/data/db.json"

export const getOrganizations = () => {
  return data.organizations
}

export const getCampuses = () => {
  return data.campuses
}

export const getCommissions = (campusId?: string) => {
  if (campusId) {
    return data.comissoes.filter((commission) => commission.campus_id === campusId)
  }
  return data.comissoes
}

export const getUsers = (campusId?: string) => {
  if (campusId) {
    return data.users.filter((user) => user.campus_id === campusId)
  }
  return data.users
}

export const getInventoryItems = (commissionId?: string) => {
  if (commissionId) {
    return data.inventory_items.filter((item) => item.comissao_id === commissionId)
  }
  return data.inventory_items
}
