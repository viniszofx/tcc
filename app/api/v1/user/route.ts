import data from "@/data/db.json";

export async function GET() {
  const user = data.users.find((u) => u.habilitado) || data.users[0];
  return Response.json(user);
}
