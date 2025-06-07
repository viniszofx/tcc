"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import type { Campus } from "@/lib/interface"
import { Edit, Trash2 } from "lucide-react"

interface CampusCardProps {
  campus: Campus
  onEdit: () => void
  onDelete: () => void
  onClick: () => void
}

export default function CampusCard({ campus, onEdit, onDelete, onClick }: CampusCardProps) {
  return (
    <Card
      className="cursor-pointer overflow-hidden transition-all hover:shadow-md h-full flex flex-col"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) return
        onClick()
      }}
    >
      <CardContent className="p-4 sm:p-6 flex-grow">
        <div className="mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-[var(--font-color)] break-words">{campus.nome}</h3>
          <Badge
            variant={campus.campus_ativo ? "default" : "outline"}
            className={
              campus.campus_ativo ? "bg-green-500 text-white hover:bg-green-600" : "text-gray-500 whitespace-nowrap"
            }
          >
            {campus.campus_ativo ? "Ativo" : "Inativo"}
          </Badge>
        </div>
        <div className="mt-4 space-y-2 text-sm text-[var(--font-color)]">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
            <span className="font-medium">Código:</span>
            <span className="break-words">{campus.campus_codigo}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
            <span className="font-medium">ID:</span>
            <span className="break-words">{campus.campus_id}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 border-t bg-muted/20 p-2 mt-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
          className="h-8 w-8 p-0 text-[var(--font-color)] transition-all"
        >
          <Edit className="h-4 w-4" />
          <span className="sr-only">Editar</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Excluir</span>
        </Button>
      </CardFooter>
    </Card>
  )
}