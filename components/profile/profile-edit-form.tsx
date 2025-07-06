"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { UserProfile } from '@/types';
import { Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ProfileEditFormProps {
  user: UserProfile;
  onUpdate: (updatedUser: Partial<UserProfile>) => void;
  isLoading?: boolean;
}

export function ProfileEditForm({
  user,
  onUpdate,
  isLoading = false,
}: ProfileEditFormProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    description: user.description || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("Enviando atualização de perfil:", formData);

      const response = await fetch(`/api/user`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: user.id,
          ...formData,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        console.log("Perfil atualizado com sucesso:", updatedUser);
        onUpdate(updatedUser);
        setIsEditModalOpen(false);
        toast.success("Perfil atualizado com sucesso!");
      } else {
        const errorData = await response.json();
        console.error("Erro na API:", errorData);
        toast.error(errorData.error || "Erro ao atualizar perfil");
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error("Erro inesperado ao atualizar perfil");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = () => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
      description: user.description || "",
    });
    setIsEditModalOpen(true);
  };

  return (
    <>
      <Card className="bg-[var(--bg-simple)] border-[var(--border-color)]">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-[var(--font-color)]">
              Informações Pessoais
            </CardTitle>
            <CardDescription className="text-[var(--font-color)] opacity-70">
              Suas informações básicas do perfil
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={openEditModal}
            disabled={isLoading}
            className="border-[var(--border-color)] hover:bg-[var(--hover-3-color)]"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-[var(--font-color)] opacity-70">
              Nome
            </Label>
            <p className="text-[var(--font-color)] font-medium">
              {user.name || "Não informado"}
            </p>
          </div>
          <div>
            <Label className="text-sm font-medium text-[var(--font-color)] opacity-70">
              Email
            </Label>
            <p className="text-[var(--font-color)]">
              {user.email || "Não informado"}
            </p>
          </div>
          <div>
            <Label className="text-sm font-medium text-[var(--font-color)] opacity-70">
              Descrição
            </Label>
            <p className="text-[var(--font-color)]">
              {user.description || "Nenhuma descrição fornecida"}
            </p>
          </div>
          <div>
            <Label className="text-sm font-medium text-[var(--font-color)] opacity-70">
              Status
            </Label>
            <p
              className={`font-medium ${
                user.active ? "text-green-600" : "text-red-600"
              }`}
            >
              {user.active ? "Ativo" : "Inativo"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
         <DialogContent className="sm:max-w-[500px] w-full max-w-[95vw] bg-[var(--bg-simple)] max-h-[90vh] overflow-y-auto overflow-x-hidden p-2 sm:p-4">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Seu nome completo"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="seu@email.com"
                className="mt-1"
                disabled={user.role !== "admin global" && user.role !== "admin"}
              />
              {user.role !== "admin global" && user.role !== "admin" && (
                <p className="text-xs text-[var(--font-color)] opacity-60 mt-1">
                  Apenas administradores podem alterar o email
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Conte um pouco sobre você..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-[var(--button-color)] text-[var(--font-color2)]"
              >
                {isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
