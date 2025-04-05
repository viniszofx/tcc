import { type NextRequest, NextResponse } from "next/server";

// Define the profile type
type ProfileType = {
  id: string;
  nome: string;
  email: string;
  campus: string;
  descricao: string;
  cargo: "admin" | "operador" | "presidente";
  foto: string;
};

// Mock database - in a real app, you would use a database
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
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

  if (!profiles[id]) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json(profiles[id]);
}

// PUT handler to update a profile
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

  if (!profiles[id]) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  try {
    const updatedProfile = await request.json();

    // Validate the data (simplified)
    if (!updatedProfile.nome || !updatedProfile.email) {
      return NextResponse.json(
        { error: "Nome and email are required" },
        { status: 400 }
      );
    }

    // Update the profile
    profiles[id] = {
      ...profiles[id],
      ...updatedProfile,
      id, // Ensure ID doesn't change
    };

    return NextResponse.json(profiles[id]);
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request data" },
      { status: 400 }
    );
  }
}
