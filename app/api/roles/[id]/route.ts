import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "GET not implemented" });
}

export async function POST() {
  return NextResponse.json({ message: "POST not implemented" });
}

export async function PUT() {
  return NextResponse.json({ message: "PUT not implemented" });
}

export async function DELETE() {
  return NextResponse.json({ message: "DELETE not implemented" });
}
