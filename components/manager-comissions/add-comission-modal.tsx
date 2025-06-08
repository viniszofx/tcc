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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Campus } from "@/lib/interface"
import { useState } from "react"

export interface AddComissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddComission: (newComission: {
    nome: string;
    descricao: string;
    tipo: string;
    campus_id?: string;
  }) => void;
  campuses: Campus[];
}

export function AddComissionModal({ isOpen, onClose, onAddComission }: AddComissionModalProps) {
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    tipo: "inventory"
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})

  const tiposComissao = [
    { value: "inventory", label: "Inventário" },
    { value: "disposal", label: "Desfazimento" },
    { value: "other", label: "Outra" }
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, tipo: value }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nome.trim()) {
      newErrors.nome = "Nome da comissão é obrigatório"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onAddComission({
        nome: formData.nome,
        descricao: formData.descricao,
        tipo: formData.tipo
      })

      setFormData({
        nome: "",
        descricao: "",
        tipo: "inventory"
      })

      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[var(--bg-simple)]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-[var(--font-color)]">Nova Comissão</DialogTitle>
            <DialogDescription className="text-[var(--font-color)]">
              Preencha os dados para criar uma nova comissão
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nome" className="text-[var(--font-color)]">
                Nome*
              </Label>
              <Input
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className="border-[var(--border-input)]"
                placeholder="Ex: Comissão de Inventário 2024"
              />
              {errors.nome && <p className="text-xs text-red-500">{errors.nome}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tipo" className="text-[var(--font-color)]">
                Tipo*
              </Label>
              <Select 
                value={formData.tipo} 
                onValueChange={handleSelectChange}
              >
                <SelectTrigger className="border-[var(--border-input)]">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--bg-simple)] border-[var(--border-input)]">
                  {tiposComissao.map((tipo) => (
                    <SelectItem 
                      key={tipo.value} 
                      value={tipo.value}
                      className="hover:bg-[var(--hover-color)]"
                    >
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="descricao" className="text-[var(--font-color)]">
                Descrição
              </Label>
              <Input
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                className="border-[var(--border-input)]"
                placeholder="Descreva a finalidade da comissão"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-[var(--border-color)] bg-[var(--bg-simple)] hover:bg-[var(--hover-color)] hover:text-white w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white w-full sm:w-auto"
            >
              Criar Comissão
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}