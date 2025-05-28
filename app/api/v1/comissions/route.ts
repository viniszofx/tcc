export async function GET() {
  return new Response(
    JSON.stringify({
      message: "GET request to /api/v1/comissions",
      data: [],
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
