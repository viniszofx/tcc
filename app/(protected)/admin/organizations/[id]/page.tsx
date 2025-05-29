"use client";

import { useParams, useRouter } from "next/navigation";
import data from "@/data/db.json";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrganizationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.id as string;

  const organization = (data.organizations || []).find((org: any) => org.id === orgId);

  if (!organization) {
    return (
      <div className="p-8">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
          <ArrowLeft size={18} className="mr-2" />
          Voltar
        </Button>
        <div className="text-xl font-bold text-red-500">Organização não encontrada.</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-2 sm:px-6 py-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft size={18} className="mr-2" />
        Voltar
      </Button>
      <div className="bg-white rounded-xl shadow p-8 border border-[var(--border-color)]">
        <h1 className="text-2xl font-bold mb-2 text-[var(--font-color)]">{organization.name}</h1>
        <div className="text-lg mb-1 text-[var(--font-color)]">
          <span className="font-semibold">Sigla:</span> {organization.shortName}
        </div>
        <div className="text-md text-[var(--font-color)]">
          <span className="font-semibold">ID:</span> {organization.id}
        </div>
        {organization.active !== undefined && (
          <div className="mt-2">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                organization.active
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {organization.active ? "Ativa" : "Inativa"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
