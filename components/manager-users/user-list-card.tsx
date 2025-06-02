"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, Pencil } from "lucide-react"
import Link from "next/link"

interface UserListCardProps {
    users: any[]
    onEditUser: (user: any) => void
}

export function UserListCard({ users, onEditUser }: UserListCardProps) {
    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "admin":
                return "bg-blue-500 hover:bg-blue-600"
            case "presidente":
                return "bg-green-500 hover:bg-green-600"
            case "operador":
                return "bg-amber-500 hover:bg-amber-600"
            default:
                return "bg-gray-500 hover:bg-gray-600"
        }
    }

    return (
        <Card className="border-[var(--border-color)] bg-[var(--bg-simple)]">
            <CardHeader className="p-4 pb-0">
                <CardTitle className="text-lg font-medium text-[var(--font-color)]">Lista de Usuários</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <div className="rounded-md border border-[var(--border-color)]">
                    <div className="grid grid-cols-12 gap-2 bg-[var(--header-color)] p-4 font-medium text-[var(--font-color)]">
                        <div className="col-span-1 hidden md:block">Foto</div>
                        <div className="col-span-4 md:col-span-2">Nome</div>
                        <div className="col-span-4 md:col-span-3">Email</div>
                        <div className="col-span-2 hidden md:block">Campus</div>
                        <div className="col-span-2 hidden md:block">Papel</div>
                        <div className="col-span-4 md:col-span-2 text-right">Ações</div>
                    </div>

                    <div className="divide-y divide-[var(--border-color)]">
                        {users.length > 0 ? (
                            users.map((usuario) => (
                                <div
                                    key={usuario.id}
                                    className="grid grid-cols-12 items-center gap-2 p-4 text-[var(--font-color)]"
                                >
                                    <div className="col-span-1 hidden md:block">
                                        <Avatar className="h-10 w-10 border">
                                            <AvatarImage src={usuario.profile?.image || "/placeholder.svg?height=40&width=40"} alt={usuario.name || "Usuário"} />
                                            <AvatarFallback>{usuario.name ? usuario.name.charAt(0) : "?"}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <div className="col-span-4 md:col-span-2 truncate">
                                        <div className="flex items-center gap-2 md:hidden">
                                            <Avatar className="h-8 w-8 border">
                                                <AvatarImage src={usuario.profile?.image || "/placeholder.svg?height=32&width=32"} alt={usuario.name || "Usuário"} />
                                                <AvatarFallback>{usuario.name ? usuario.name.charAt(0) : "?"}</AvatarFallback>
                                            </Avatar>
                                            <span>{usuario.name || "Sem nome"}</span>
                                        </div>
                                        <span className="hidden md:inline">{usuario.name || "Sem nome"}</span>
                                    </div>
                                    <div className="col-span-4 md:col-span-3 truncate">{usuario.email || "Sem email"}</div>
                                    <div className="col-span-2 hidden md:block truncate">{usuario.campus_id || "Sem campus"}</div>
                                    <div className="col-span-2 hidden md:block">
                                        <Badge className={`${getRoleBadgeColor(usuario.role)} text-white`}>
                                            {usuario.role ? usuario.role.toUpperCase() : "SEM PAPEL"}
                                        </Badge>
                                    </div>
                                    <div className="col-span-4 md:col-span-2 flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 border-[var(--border-color)] bg-[var(--bg-simple)] hover:bg-[var(--hover-color)] hover:text-white"
                                            onClick={() => onEditUser(usuario)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Link href={`/admin/users/${usuario.id}`}>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 border-[var(--border-color)] bg-[var(--bg-simple)] hover:bg-[var(--hover-color)] hover:text-white"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-[var(--font-color)]">Nenhum usuário encontrado.</div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}