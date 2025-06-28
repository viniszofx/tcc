import data from "@/data/new-db.json";

export const getOrganizations = () => {
  return data.organizations;
};

export const getCampuses = () => {
  return data.campus;
};

export const getCommissions = (campusId?: string) => {
  if (campusId) {
    return data.commissions.filter(
      (commission) => commission.campusId === campusId
    );
  }
  return data.commissions;
};

export const getUsers = (campusId?: string) => {
  if (campusId) {
    // Busca users que pertencem ao campus através da tabela campus_members
    const campusMembers = data.campus_members.filter(
      (member) => member.campusId === campusId
    );
    const userIds = campusMembers.map((member) => member.userId);
    return data.user_profiles.filter((user) => userIds.includes(user.id));
  }
  return data.user_profiles;
};

export const getUserCampus = (userId: string) => {
  const campusMember = data.campus_members.find(
    (member) => member.userId === userId
  );
  if (campusMember) {
    return data.campus.find((campus) => campus.id === campusMember.campusId);
  }
  return null;
};

export const getInventoryItems = (commissionId?: string) => {
  if (commissionId) {
    return data.inventory_items.filter(
      (item) => item.commissionId === commissionId
    );
  }
  return data.inventory_items;
};

// Funções para gerenciar comissões
export function getCommissionById(id: string) {
  return data.commissions.find((commission) => commission.id === id);
}

export function getUserById(id: string) {
  return data.user_profiles.find((user) => user.id === id);
}

export function getUsersByCommission(commissionId: string) {
  const commissionMembers = data.commission_members.filter(
    (member) => member.commissionId === commissionId
  );

  return commissionMembers
    .map((member) => {
      const user = getUserById(member.userId);
      if (user) {
        return {
          ...user,
          roleInCommission: member.roleInCommission,
        };
      }
      return null;
    })
    .filter(Boolean);
}

export function getCommissionMembers(commissionId: string) {
  return data.commission_members.filter(
    (member) => member.commissionId === commissionId
  );
}

export function getCampusByUser(userId: string) {
  const campusMember = data.campus_members.find(
    (member) => member.userId === userId
  );

  if (campusMember) {
    return data.campus.find((campus) => campus.id === campusMember.campusId);
  }

  return null;
}
