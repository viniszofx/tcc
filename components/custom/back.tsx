"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Back() {
  const router = useRouter();

  return (
    <Button
      type="button"
      onClick={() => router.push("/")}
      className="w-full py-2 text-[var(--font-color)] border border-[var(--border-color)] bg-[var(--bg-simple)] cursor-pointer hover:!bg-[var(--hover-color)] hover:!text-white transition-all"
    >
      Voltar
    </Button>
  );
}