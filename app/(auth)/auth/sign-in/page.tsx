"use client";

import { useState } from "react";
import DarkModeToggle from "@/components/custom/dark-mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AuthForm from "@/components/auth/auth-form";

export default function AuthPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <div className="absolute top-2 left-2 md:bottom-4 md:right-4 md:top-auto">
        <DarkModeToggle />
      </div>
      <img
        className="mx-auto w-72 h-auto md:hidden"
        src="/Logotipo.svg"
        alt="logo"
      />
      <Card className="mx-auto max-w-3xl w-full mt-4 max-h-full md:p-8 border-[var(--border-color)] bg-[var(--bg-simple)]">
        <CardHeader className="w-full flex flex-col items-start md:items-center text-left md:text-center">
          <img
            className="w-88 h-auto hidden md:block mb-6"
            src="/Logotipo.svg"
            alt="logo"
          />
          <CardTitle className="text-4xl font-bold text-[var(--font-color)]">
            Entrar na conta
          </CardTitle>
          <CardDescription className="mt-2 text-[var(--font-color)]">
            Insira sua credenciais para acessar o sistema de inventário
          </CardDescription>
        </CardHeader>
        <CardContent className="w-full space-y-3 mt-4">
          <AuthForm />
        </CardContent>
      </Card>
    </div>
  );
}
