"use client"

import { useAuth } from "@/lib/hooks/use-auth"
import { roleNames, type UserRole } from "@/types/auth"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const DEMO_USERS = [
  {
    id: "1",
    name: "João Silva",
    email: "joao@exemplo.com",
    role: "system_admin" as UserRole,
    organization: "IFMT",
    avatar: "/avatars/joao.png",
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria@exemplo.com",
    role: "org_admin" as UserRole,
    organization: "IFMT",
    avatar: "/avatars/maria.png",
  },
  {
    id: "3",
    name: "Pedro Oliveira",
    email: "pedro@exemplo.com",
    role: "manager" as UserRole,
    organization: "IFMT",
    avatar: "/avatars/pedro.png",
  },
  {
    id: "4",
    name: "Ana Costa",
    email: "ana@exemplo.com",
    role: "operator" as UserRole,
    organization: "IFMT",
    avatar: "/avatars/ana.png",
  },
]

export function UserSwitcher() {
  const { user, setUser } = useAuth()

  const handleUserChange = (userId: string) => {
    const selectedUser = DEMO_USERS.find((u) => u.id === userId)
    if (selectedUser) {
      setUser(selectedUser)
    }
  }

  return (
    <Select value={user?.id} onValueChange={handleUserChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Selecionar usuário" />
      </SelectTrigger>
      <SelectContent>
        {DEMO_USERS.map((demoUser) => (
          <SelectItem key={demoUser.id} value={demoUser.id}>
            <div className="flex items-center gap-2">
              <span>{demoUser.name}</span>
              <span className="text-xs text-muted-foreground">({roleNames[demoUser.role]})</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

