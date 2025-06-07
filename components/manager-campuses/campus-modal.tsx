"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { Campus } from "@/lib/interface"
import { AlertTriangle } from "lucide-react"
import type React from "react"
import { useEffect, useState } from "react"

interface CampusModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (campus: Campus) => void
  onDelete: (campusId: string) => void
  campus: Campus | null
  mode: "create" | "edit" | "delete"
}

export default function CampusModal({ isOpen, onClose, onSave, onDelete, campus, mode }: CampusModalProps) {
  const [formData, setFormData] = useState<Campus>({
    campus_id: "",
    nome: "",
    campus_codigo: "",
    campus_ativo: false,
  })

  useEffect(() => {
    if (campus) {
      setFormData(campus)
    } else {
      setFormData({
        campus_id: "",
        nome: "",
        campus_codigo: "",
        campus_ativo: false,
      })
    }
  }, [campus, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      campus_ativo: checked
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleDelete = () => {
    if (campus) {
      onDelete(campus.campus_id)
    }
  }

  const renderContent = () => {
    if (mode === "delete") {
      return (
        <>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[var(--font-color)]">Excluir Campus</DialogTitle>
            <DialogDescription className="text-[var(--font-color)] opacity-70">
              Tem certeza que deseja excluir este campus? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 sm:my-6 flex items-center justify-center">
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-8 w-8 sm:h-10 sm:w-10 text-red-500" />
            </div>
          </div>
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 sm:p-4 text-center">
            <p className="font-medium text-red-800 break-words">
              {campus?.nome} ({campus?.campus_codigo})
            </p>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-center mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto text-[var(--font-color)] transition-all"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="w-full sm:w-auto bg-red-500 text-white hover:bg-red-600 transition-all"
            >
              Excluir
            </Button>
          </DialogFooter>
        </>
      )
    }

    return (
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[var(--font-color)]">
            {mode === "create" ? "Novo Campus" : "Editar Campus"}
          </DialogTitle>
          <DialogDescription className="text-[var(--font-color)] opacity-70">
            {mode === "create" ? "Preencha os campos para criar um novo campus." : "Edite as informações do campus."}
          </DialogDescription>
        </DialogHeader>
        <div className="my-4 sm:my-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-[var(--font-color)]">
              Nome
            </Label>
            <Input
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Nome do campus"
              required
              className="border-[var(--border-color)] bg-[var(--input-bg-color)] text-[var(--font-color)]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="campus_codigo" className="text-[var(--font-color)]">
              Código
            </Label>
            <Input
              id="campus_codigo"
              name="campus_codigo"
              value={formData.campus_codigo}
              onChange={handleChange}
              placeholder="Código do campus"
              required
              className="border-[var(--border-color)] bg-[var(--input-bg-color)] text-[var(--font-color)]"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="campus_ativo" className="text-[var(--font-color)]">
              Campus Ativo
            </Label>
            <Switch 
              id="campus_ativo"
              checked={formData.campus_ativo} 
              onCheckedChange={handleSwitchChange}
            />
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto text-[var(--font-color)] transition-all"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="w-full sm:w-auto bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white transition-all"
          >
            {mode === "create" ? "Criar" : "Salvar"}
          </Button>
        </DialogFooter>
      </form>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-w-[95vw] p-4 sm:p-6">{renderContent()}</DialogContent>
    </Dialog>
  )
}