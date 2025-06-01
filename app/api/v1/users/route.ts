import data from "@/data/db.json";
export async function GET() {
  return Response.json(data.users);
}