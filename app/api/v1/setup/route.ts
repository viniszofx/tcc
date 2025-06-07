import { NextResponse } from "next/server";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const redirectTo = searchParams.get("redirectTo");
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!redirectTo || !code || !state) {
    return new Response("Missing required parameters", { status: 400 });
  }

  // Here you would typically handle the OAuth callback logic
  // For example, exchanging the code for an access token

  return new Response(
    `OAuth callback received with redirectTo: ${redirectTo}, code: ${code}, state: ${state}`
  );
}

export async function POST(request: Request) {
  const { orgs, campus } = await request.json();

  if (!orgs || !campus) {
    return new Response("Missing required fields", { status: 400 });
  }

  // Here you would typically handle the setup logic
  // For example, saving the orgs and campus to a database
  console.log("Setup completed with orgs and campus:", orgs, campus);

  // Fixed redirect using NextResponse.redirect with absolute URL
  return NextResponse.redirect(new URL("/redirect", request.url));
}
