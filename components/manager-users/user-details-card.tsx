"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Building2, UserCircle, BadgeIcon as IdCard } from "lucide-react"

interface UserDetailsCardProps {
    id: string
    email: string
    campus: string
    role: string // Changed from papel to match db.json
}

export function UserDetailsCard({ id, email, campus, role }: UserDetailsCardProps) {
    return (
        <Card className="border-[var(--border-color)] bg-[var(--bg-simple)]">
            <CardHeader className="p-4 pb-0">
                <CardTitle className="text-lg font-medium text-[var(--font-color)]">Informações do Usuário</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-md border border-[var(--border-color)]">
                        <IdCard className="h-5 w-5 text-[var(--font-color)] opacity-70" />
                        <div>
                            <p className="text-sm font-medium text-[var(--font-color)]">ID</p>
                            <p className="text-[var(--font-color)]">{id}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-md border border-[var(--border-color)]">
                        <Mail className="h-5 w-5 text-[var(--font-color)] opacity-70" />
                        <div>
                            <p className="text-sm font-medium text-[var(--font-color)]">Email</p>
                            <p className="text-[var(--font-color)]">{email}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-md border border-[var(--border-color)]">
                        <Building2 className="h-5 w-5 text-[var(--font-color)] opacity-70" />
                        <div>
                            <p className="text-sm font-medium text-[var(--font-color)]">Campus</p>
                            <p className="text-[var(--font-color)]">{campus}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-md border border-[var(--border-color)]">
                        <UserCircle className="h-5 w-5 text-[var(--font-color)] opacity-70" />
                        <div>
                            <p className="text-sm font-medium text-[var(--font-color)]">Função</p>
                            <p className="text-[var(--font-color)]">{role}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}