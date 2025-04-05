"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ProfileFormProps {
  nome: string
  email: string
  campus: string
  descricao: string
  onNomeChange: (value: string) => void
  onEmailChange: (value: string) => void
  onDescricaoChange: (value: string) => void
}

export default function ProfileForm({
  nome,
  email,
  campus,
  descricao,
  onNomeChange,
  onEmailChange,
  onDescricaoChange,
}: ProfileFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="nome" className="text-sm font-medium text-[var(--font-color)]">
          Nome
        </Label>
        <Input
          id="nome"
          value={nome}
          onChange={(e) => onNomeChange(e.target.value)}
          className="bg-[var(--bg-simple)] border-[var(--border-input)] text-[var(--font-color)]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-[var(--font-color)]">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className="bg-[var(--bg-simple)] border-[var(--border-input)] text-[var(--font-color)]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="campus" className="text-sm font-medium text-[var(--font-color)]">
          Campus
        </Label>
        <Input
          id="campus"
          value={campus}
          disabled
          className="bg-[var(--bg-simple)] border-[var(--border-input)] text-[var(--font-color)] opacity-70"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao" className="text-sm font-medium text-[var(--font-color)]">
          Descrição
        </Label>
        <Textarea
          id="descricao"
          value={descricao}
          onChange={(e) => onDescricaoChange(e.target.value)}
          className="min-h-[120px] bg-[var(--bg-simple)] border-[var(--border-input)] text-[var(--font-color)]"
        />
      </div>
    </div>
  )
}