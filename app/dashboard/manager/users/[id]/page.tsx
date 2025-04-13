"use client";

import { user } from "@/utils/user";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Usuario } from "@/lib/interface";

export default function Page() {
  const params = useParams();
  const [userData, setUserData] = useState<Usuario | null>(null);

  useEffect(() => {
    function fetchUser() {
      if (params?.id) {
        const foundUser = user.find((u) => u.usuario_id === params.id);
        setUserData(foundUser || null);
      }
    }

    fetchUser();
  }, [params?.id]);

  if (!userData) {
    return <div>Usuário não encontrado</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Detalhes do Usuário</h1>
      <div className="space-y-2">
        <p>
          <strong>ID:</strong> {userData.usuario_id}
        </p>
        <p>
          <strong>Nome:</strong> {userData.nome}
        </p>
        <p>
          <strong>Email:</strong> {userData.email}
        </p>
        <p>
          <strong>Papel:</strong> {userData.papel}
        </p>
        <p>
          <strong>Status:</strong> {userData.habilitado ? "Ativo" : "Inativo"}
        </p>
        <p>
          <strong>Organização:</strong> {userData.organizacao_id}
        </p>
        <p>
          <strong>Campus:</strong> {userData.campus_id}
        </p>
        <p>
          <strong>Comissão:</strong> {userData.comissao_id}
        </p>
        {userData.data_inicio && (
          <p>
            <strong>Data de Início:</strong>{" "}
            {userData.data_inicio instanceof Date
              ? userData.data_inicio.toLocaleDateString()
              : userData.data_inicio}
          </p>
        )}
      </div>
    </div>
  );
}
