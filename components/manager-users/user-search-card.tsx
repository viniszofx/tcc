"use client"

import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"

interface UserSearchCardProps {
    searchTerm: string
    setSearchTerm: (term: string) => void
}

export function UserSearchCard({ searchTerm, setSearchTerm }: UserSearchCardProps) {
    return (
        <Card className="border-[var(--border-color)] bg-[var(--bg-simple)]">
            <CardContent className="p-4">
                <div className="relative">
                    <Input
                        placeholder="Buscar usuários por nome, email, papel ou campus..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border-[var(--border-input)] pl-10 w-full"
                    />
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--font-color)] opacity-70" />
                </div>
            </CardContent>
        </Card>
    )
}
