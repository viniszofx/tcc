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
import { Textarea } from "@/components/ui/textarea"
import { EstadoConservacao, StatusBem, type BemCopia } from "@/lib/interface"
import { useState } from "react"

interface NewItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (item: BemCopia) => void
}

export default function NewItemModal({ isOpen, onClose, onSave }: NewItemModalProps) {
  const [formData, setFormData] = useState<Partial<BemCopia>>({
    NUMERO: "",
    DESCRICAO: "",
    MARCA_MODELO: "",
    RESPONSABILIDADE_ATUAL: "",
    SETOR_DO_RESPONSAVEL: "",
    CAMPUS_DA_LOTACAO_DO_BEM: "",
    SALA: "",
    ESTADO_DE_CONSERVACAO: EstadoConservacao.NOVO,
    STATUS: StatusBem.ATIVO,
    ED: "",
    ROTULOS: "",
    observacoes: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: keyof BemCopia, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.NUMERO) newErrors.NUMERO = "Número é obrigatório"
    if (!formData.DESCRICAO) newErrors.DESCRICAO = "Descrição é obrigatória"
    if (!formData.RESPONSABILIDADE_ATUAL) newErrors.RESPONSABILIDADE_ATUAL = "Responsável é obrigatório"
    if (!formData.SETOR_DO_RESPONSAVEL) newErrors.SETOR_DO_RESPONSAVEL = "Setor é obrigatório"
    if (!formData.SALA) newErrors.SALA = "Sala é obrigatória"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    setIsSubmitting(true)

    const newItem: BemCopia = {
      bem_id: `bem-${Date.now()}`,
      inventario_id: `inv-${Date.now()}`,
      grupo_id: `grp-${Date.now()}`,
      campus_id: `campus-1`,
      NUMERO: formData.NUMERO || "",
      DESCRICAO: formData.DESCRICAO || "",
      MARCA_MODELO: formData.MARCA_MODELO || "",
      RESPONSABILIDADE_ATUAL: formData.RESPONSABILIDADE_ATUAL || "",
      SETOR_DO_RESPONSAVEL: formData.SETOR_DO_RESPONSAVEL || "",
      CAMPUS_DA_LOTACAO_DO_BEM: formData.CAMPUS_DA_LOTACAO_DO_BEM || "Principal",
      SALA: formData.SALA || "",
      ESTADO_DE_CONSERVACAO: formData.ESTADO_DE_CONSERVACAO as EstadoConservacao,
      STATUS: formData.STATUS as StatusBem,
      ED: formData.ED || "",
      ROTULOS: formData.ROTULOS || "",
      DESCRICAO_PRINCIPAL: formData.DESCRICAO || "",
      ultimo_atualizado_por: "Usuário",
      data_ultima_atualizacao: new Date(),
      observacoes: formData.observacoes || "",
    }

    onSave(newItem)

    setFormData({
      NUMERO: "",
      DESCRICAO: "",
      MARCA_MODELO: "",
      RESPONSABILIDADE_ATUAL: "",
      SETOR_DO_RESPONSAVEL: "",
      CAMPUS_DA_LOTACAO_DO_BEM: "",
      SALA: "",
      ESTADO_DE_CONSERVACAO: EstadoConservacao.NOVO,
      STATUS: StatusBem.ATIVO,
      ED: "",
      ROTULOS: "",
      observacoes: "",
    })
    setIsSubmitting(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-[var(--font-color)]">Adicionar Novo Item</DialogTitle>
          <DialogDescription className="text-[var(--font-color)]/70">
            Preencha os detalhes do novo item de inventário.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numero" className="text-[var(--font-color)]">
                Número <span className="text-red-500">*</span>
              </Label>
              <Input
                id="numero"
                value={formData.NUMERO}
                onChange={(e) => handleChange("NUMERO", e.target.value)}
                className={`bg-[var(--bg-simple)] border-[var(--border-input)] text-[var(--font-color)] ${
                  errors.NUMERO ? "border-red-500" : ""
                }`}
              />
              {errors.NUMERO && <p className="text-xs text-red-500">{errors.NUMERO}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ed" className="text-[var(--font-color)]">
                ED
              </Label>
              <Input
                id="ed"
                value={formData.ED}
                onChange={(e) => handleChange("ED", e.target.value)}
                className="bg-[var(--bg-simple)] border-[var(--border-input)] text-[var(--font-color)]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao" className="text-[var(--font-color)]">
              Descrição <span className="text-red-500">*</span>
            </Label>
            <Input
              id="descricao"
              value={formData.DESCRICAO}
              onChange={(e) => handleChange("DESCRICAO", e.target.value)}
              className={`bg-[var(--bg-simple)] border-[var(--border-input)] text-[var(--font-color)] ${
                errors.DESCRICAO ? "border-red-500" : ""
              }`}
            />
            {errors.DESCRICAO && <p className="text-xs text-red-500">{errors.DESCRICAO}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="marca-modelo" className="text-[var(--font-color)]">
              Marca/Modelo
            </Label>
            <Input
              id="marca-modelo"
              value={formData.MARCA_MODELO}
              onChange={(e) => handleChange("MARCA_MODELO", e.target.value)}
              className="bg-[var(--bg-simple)] border-[var(--border-input)] text-[var(--font-color)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="responsavel" className="text-[var(--font-color)]">
                Responsável <span className="text-red-500">*</span>
              </Label>
              <Input
                id="responsavel"
                value={formData.RESPONSABILIDADE_ATUAL}
                onChange={(e) => handleChange("RESPONSABILIDADE_ATUAL", e.target.value)}
                className={`bg-[var(--bg-simple)] border-[var(--border-input)] text-[var(--font-color)] ${
                  errors.RESPONSABILIDADE_ATUAL ? "border-red-500" : ""
                }`}
              />
              {errors.RESPONSABILIDADE_ATUAL && <p className="text-xs text-red-500">{errors.RESPONSABILIDADE_ATUAL}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="setor" className="text-[var(--font-color)]">
                Setor <span className="text-red-500">*</span>
              </Label>
              <Input
                id="setor"
                value={formData.SETOR_DO_RESPONSAVEL}
                onChange={(e) => handleChange("SETOR_DO_RESPONSAVEL", e.target.value)}
                className={`bg-[var(--bg-simple)] border-[var(--border-input)] text-[var(--font-color)] ${
                  errors.SETOR_DO_RESPONSAVEL ? "border-red-500" : ""
                }`}
              />
              {errors.SETOR_DO_RESPONSAVEL && <p className="text-xs text-red-500">{errors.SETOR_DO_RESPONSAVEL}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="campus" className="text-[var(--font-color)]">
                Campus
              </Label>
              <Input
                id="campus"
                value={formData.CAMPUS_DA_LOTACAO_DO_BEM}
                onChange={(e) => handleChange("CAMPUS_DA_LOTACAO_DO_BEM", e.target.value)}
                className="bg-[var(--bg-simple)] border-[var(--border-input)] text-[var(--font-color)]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sala" className="text-[var(--font-color)]">
                Sala <span className="text-red-500">*</span>
              </Label>
              <Input
                id="sala"
                value={formData.SALA}
                onChange={(e) => handleChange("SALA", e.target.value)}
                className={`bg-[var(--bg-simple)] border-[var(--border-input)] text-[var(--font-color)] ${
                  errors.SALA ? "border-red-500" : ""
                }`}
              />
              {errors.SALA && <p className="text-xs text-red-500">{errors.SALA}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estado" className="text-[var(--font-color)]">
                Estado de Conservação
              </Label>
              <Select
                value={formData.ESTADO_DE_CONSERVACAO}
                onValueChange={(value) => handleChange("ESTADO_DE_CONSERVACAO", value)}
              >
                <SelectTrigger className="bg-[var(--bg-simple)] border-[var(--border-input)] text-[var(--font-color)]">
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EstadoConservacao.NOVO}>Novo</SelectItem>
                  <SelectItem value={EstadoConservacao.BOM}>Bom</SelectItem>
                  <SelectItem value={EstadoConservacao.REGULAR}>Regular</SelectItem>
                  <SelectItem value={EstadoConservacao.RUIM}>Ruim</SelectItem>
                  <SelectItem value={EstadoConservacao.INSERVIVEL}>Inservível</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-[var(--font-color)]">
                Status
              </Label>
              <Select value={formData.STATUS} onValueChange={(value) => handleChange("STATUS", value)}>
                <SelectTrigger className="bg-[var(--bg-simple)] border-[var(--border-input)] text-[var(--font-color)]">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={StatusBem.ATIVO}>Ativo</SelectItem>
                  <SelectItem value={StatusBem.EM_USO}>Em Uso</SelectItem>
                  <SelectItem value={StatusBem.BAIXA_SOLICITADA}>Baixa Solicitada</SelectItem>
                  <SelectItem value={StatusBem.BAIXADO}>Baixado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rotulos" className="text-[var(--font-color)]">
              Rótulos
            </Label>
            <Input
              id="rotulos"
              value={formData.ROTULOS}
              onChange={(e) => handleChange("ROTULOS", e.target.value)}
              className="bg-[var(--bg-simple)] border-[var(--border-input)] text-[var(--font-color)]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes" className="text-[var(--font-color)]">
              Observações
            </Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes ?? ""}
              onChange={(e) => handleChange("observacoes", e.target.value)}
              className="bg-[var(--bg-simple)] border-[var(--border-input)] text-[var(--font-color)]"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[var(--border-input)] bg-[var(--card-color)] text-[var(--font-color)] hover:bg-[var(--hover-3-color)] hover:text-white"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[var(--button-color)] text-[var(--font-color2)] hover:bg-[var(--hover-2-color)] hover:text-white"
          >
            {isSubmitting ? "Salvando..." : "Salvar Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}