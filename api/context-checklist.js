function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "https://www.thebereanproject.com",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const input = String(body?.input || "").trim();

    if (!input) {
      return Response.json(
        { error: "Missing input." },
        {
          status: 400,
          headers: corsHeaders(),
        }
      );
    }

    return Response.json(
      {
        result: `Test success. Your API received: ${input}`,
      },
      {
        status: 200,
        headers: corsHeaders(),
      }
    );

  } catch (error) {
    return Response.json(
      { error: "Server error processing request." },
      {
        status: 500,
        headers: corsHeaders(),
      }
    );
  }
}
