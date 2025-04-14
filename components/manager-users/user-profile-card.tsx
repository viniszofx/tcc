"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserProfileCardProps {
    nome: string
    papel: string
    foto?: string
}

export function UserProfileCard({ nome, papel, foto }: UserProfileCardProps) {
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
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <Avatar className="h-24 w-24 border mx-auto md:mx-0">
                        <AvatarImage src={foto || "/placeholder.svg?height=96&width=96"} alt={nome} />
                        <AvatarFallback className="text-2xl">{nome.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <h2 className="text-2xl font-bold text-[var(--font-color)]">{nome}</h2>
                        <Badge className={`${getRoleBadgeColor(papel)} text-white`}>{papel.toUpperCase()}</Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}