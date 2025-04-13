"use client";

import MainSection from "@/components/MainSection";
import { user } from "@/utils/user";
import Link from "next/link";
import { JSX } from "react";

type Props = {
  title: string;
  children: React.ReactNode;
};

export default function Page(): JSX.Element {
  return (
    <MainSection title="Usuários" key={"usuarios"}>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border-b">Nome</th>
              <th className="px-4 py-2 border-b">Email</th>
              <th className="px-4 py-2 border-b">Papel</th>
              <th className="px-4 py-2 border-b">Status</th>
              <th className="px-4 py-2 border-b">Ações</th>
            </tr>
          </thead>
          <tbody>
            {user.map((usuario) => (
              <tr key={usuario.usuario_id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{usuario.nome}</td>
                <td className="px-4 py-2 border-b">{usuario.email}</td>
                <td className="px-4 py-2 border-b capitalize">
                  {usuario.papel}
                </td>
                <td className="px-4 py-2 border-b">
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      usuario.habilitado
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {usuario.habilitado ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-4 py-2 border-b">
                  <Link
                    href={`/dashboard/manager/users/${usuario.usuario_id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Detalhes
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainSection>
  );
}
