import { type NextRequest, NextResponse } from "next/server"

type ProfileType = {
  id: string
  nome: string
  email: string
  campus: string
  descricao: string
  cargo: "admin" | "operador" | "presidente"
  foto: string
}

const profiles: Record<string, ProfileType> = {
  "1": {
    id: "1",
    nome: "João Silva",
    email: "joao@email.com",
    campus: "IFMS Corumbá",
    descricao: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    cargo: "admin",
    foto: "/logo.svg",
  },
  "2": {
    id: "2",
    nome: "Maria Santos",
    email: "maria@email.com",
    campus: "IFMS Campo Grande",
    descricao: "Professora de Matemática com 10 anos de experiência.",
    cargo: "operador",
    foto: "/logo.svg",
  },
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  console.log(id)

  await new Promise((resolve) => setTimeout(resolve, 500))

  if (!profiles[id]) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 })
  }

  return NextResponse.json(profiles[id])
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params

  if (!profiles[id]) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 })
  }

  try {
    const updatedProfile = await request.json()

    if (!updatedProfile.nome || !updatedProfile.email) {
      return NextResponse.json({ error: "Nome and email are required" }, { status: 400 })
    }

    profiles[id] = {
      ...profiles[id],
      ...updatedProfile,
      id,
    }

    return NextResponse.json(profiles[id])
  } catch (error) {
    return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
  }
}