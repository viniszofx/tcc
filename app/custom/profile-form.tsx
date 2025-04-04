"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
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
    <div className="w-full flex flex-col gap-4">
      <div>
        <label className="text-sm font-medium">Nome</label>
        <Input
          value={nome}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onNomeChange(e.target.value)}
          className="mt-1 border-[var(--border-input)]"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Email</label>
        <Input
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onEmailChange(e.target.value)}
          className="mt-1 border-[var(--border-input)]"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Campus</label>
        <Input disabled value={campus} className="mt-1 border-[var(--border-input)]" />
      </div>
      <div>
        <label className="text-sm font-medium">Descrição</label>
        <Textarea
          value={descricao}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onDescricaoChange(e.target.value)}
          placeholder="Digite sua descrição"
          className="mt-1 min-h-[120px] border-[var(--border-input)]"
        />
      </div>
    </div>
  )
}