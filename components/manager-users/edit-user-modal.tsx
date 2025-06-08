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
import type { Campus, Usuario } from "@/lib/interface"
import { useEffect, useState } from "react"

interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  user: Usuario | null
  onEditUser: (user: Partial<Usuario>) => void
  campusList: Campus[]
}

export function EditUserModal({ isOpen, onClose, user, onEditUser, campusList }: EditUserModalProps) {
  const [formData, setFormData] = useState<Partial<Usuario>>({
    usuario_id: "",
    nome: "",
    email: "",
    papel: "",
    campus_id: "",
    perfil: {
      imagem_url: "/logo.svg",
      descricao: ""
    }
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (user) {
      setFormData({
        usuario_id: user.usuario_id,
        nome: user.nome,
        email: user.email,
        papel: user.papel,
        campus_id: user.campus_id,
        perfil: user.perfil || {
          imagem_url: "/logo.svg",
          descricao: ""
        }
      })
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.nome?.trim()) newErrors.nome = "Nome é obrigatório"
    if (!formData.email?.trim()) newErrors.email = "Email é obrigatório"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email inválido"
    if (!formData.papel) newErrors.papel = "Papel é obrigatório"
    if (!formData.campus_id) newErrors.campus_id = "Campus é obrigatório"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onEditUser(formData)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[var(--bg-simple)]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-[var(--font-color)]">Editar Usuário</DialogTitle>
            <DialogDescription className="text-[var(--font-color)]">
              Atualize os dados do usuário
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nome" className="text-[var(--font-color)]">Nome</Label>
              <Input
                id="nome"
                name="nome"
                value={formData.nome || ""}
                onChange={handleChange}
                className="border-[var(--border-input)]"
              />
              {errors.nome && <p className="text-xs text-red-500">{errors.nome}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email" className="text-[var(--font-color)]">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={handleChange}
                className="border-[var(--border-input)]"
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            <div className="grid gap-2">
              <Label className="text-[var(--font-color)]">Campus</Label>
              <Select 
                value={formData.campus_id || ""}
                onValueChange={value => handleSelectChange("campus_id", value)}
              >
                <SelectTrigger className="border-[var(--border-input)]">
                  <SelectValue placeholder="Selecione um campus" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--bg-simple)]">
                  {campusList.map(campus => (
                    <SelectItem key={campus.campus_id} value={campus.campus_id}>
                      {campus.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.campus_id && <p className="text-xs text-red-500">{errors.campus_id}</p>}
            </div>

            <div className="grid gap-2">
              <Label className="text-[var(--font-color)]">Papel</Label>
              <Select
                value={formData.papel || ""}
                onValueChange={value => handleSelectChange("papel", value)}
              >
                <SelectTrigger className="border-[var(--border-input)]">
                  <SelectValue placeholder="Selecione um papel" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--bg-simple)]">
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="presidente">Presidente</SelectItem>
                  <SelectItem value="operador">Operador</SelectItem>
                </SelectContent>
              </Select>
              {errors.papel && <p className="text-xs text-red-500">{errors.papel}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="border-[var(--border-color)]"
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="bg-[var(--button-color)] text-[var(--font-color2)]"
            >
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}