"use client"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { Campus } from "@/lib/interface"
import { Eye, Pencil, Trash2 } from "lucide-react"

interface CampusCardProps {
  campus: Campus
  onEdit: () => void
  onDelete: () => void
  onClick: () => void
}

export default function CampusCard({ campus, onEdit, onDelete, onClick }: CampusCardProps) {
  return (
    <Card
      className="border border-[var(--border-color)] bg-[var(--bg-simple)] transition-all duration-300 rounded-xl shadow-sm flex flex-col justify-between min-h-[180px] cursor-pointer"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) return
        onClick()
      }}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-[var(--font-color)]">
          {campus.nome}
        </CardTitle>
        <CardDescription className="text-[var(--font-color)] opacity-80 space-y-1">
          <div>Código: {campus.campus_codigo}</div>
          <div>ID: {campus.campus_id}</div>
          <div className="mt-1">
            Status:{" "}
            <span
              className={
                campus.campus_ativo
                  ? "text-green-600 font-medium"
                  : "text-gray-500 font-medium"
              }
            >
              {campus.campus_ativo ? "Ativo" : "Inativo"}
            </span>
          </div>
        </CardDescription>
      </CardHeader>

      <CardFooter className="flex items-center justify-end gap-3 pt-0 pb-4 px-6 mt-auto">
        <Button
          className="bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-3-color)] hover:text-white"
          size="icon"
          variant="default"
          title="Ver"
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
        >
          <Eye size={18} />
          <span className="sr-only">Ver</span>
        </Button>
        <Button
          variant="outline"
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
          className="text-[var(--font-color)] border-[var(--border-color)]"
          size="icon"
          title="Editar"
        >
          <Pencil size={18} />
        </Button>
        <Button
          variant="destructive"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          size="icon"
          title="Excluir"
        >
          <Trash2 size={18} />
        </Button>
      </CardFooter>
    </Card>
  )
}