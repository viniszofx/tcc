export const users = [
  {
    id: 1,
    name: "John Admin",
    email: "admin@ifms.edu.br",
    role: "admin",
  },
  {
    id: 2,
    name: "Jane President",
    email: "president@ifms.edu.br",
    role: "president",
  },
  {
    id: 3,
    name: "Bob Operator",
    email: "operator1@ifms.edu.br",
    role: "operator",
  },
  {
    id: 4,
    name: "Alice Operator",
    email: "operator2@ifms.edu.br",
    role: "operator",
  },
];

import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Failed to get users" }, { status: 500 });
  }
}
