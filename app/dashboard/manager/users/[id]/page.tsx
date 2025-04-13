"use client";

import { user } from "@/utils/user";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const params = useParams();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
     function fetchUser() {
      if (params?.id) {
        const data = user; // Supondo que `user` retorna um array
        const userJson = Array.isArray(data) ? data[0] : data; // Converte o array para o primeiro objeto
        setUserData(userJson);
      }
    }

    fetchUser();
  }, [params?.id]);

  if (!userData) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <h1>Detalhes do Usuário</h1>
      <p><strong>ID:</strong> {userData.id}</p>
      <p><strong>Nome:</strong> {userData.name}</p>
      <p><strong>Email:</strong> {userData.email}</p>
      {/* Adicione outros campos conforme necessário */}
    </div>
  );
}
