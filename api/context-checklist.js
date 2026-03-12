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

    const prompt = `
You are the Context Checklist for The Berean Project.

Your role is not to declare a sermon, verse use, or teaching claim right or wrong.
Your role is to help the reader slow down and ask better context questions.

Analyze the following input using these lenses where relevant:
1. Story / narrative context
2. Audience / who is being addressed
3. Cultural / historical setting
4. Literary context
5. Tension / what complexity might be flattened
6. Application bridge / does the interpretation move carefully from ancient meaning to modern application

Tone requirements:
- warm
- thoughtful
- non-accusatory
- curious
- never harsh
- never mocking
- never say "this is prooftexting" unless the case is extremely obvious
- prefer language like "this may flatten context" or "this passage may be doing more than we first assume"

Output format exactly:

Context Checklist Reflection

Main Observation:
[short paragraph]

Questions Worth Asking:
- [bullet]
- [bullet]
- [bullet]

Possible Context Signals:
- [bullet]
- [bullet]
- [bullet]

Gentle Takeaway:
[short paragraph]

Input:
${input}
`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: "You help users explore biblical context with humility, curiosity, and clarity."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const openaiData = await openaiResponse.json();

    const result =
      openaiData?.choices?.[0]?.message?.content ||
      "No analysis was returned.";

    return Response.json(
      { result },
      {
        status: 200,
        headers: corsHeaders(),
      }
    );
  } catch (error) {
    return Response.json(
      {
        error: "Server error processing request.",
        details: error?.message || "Unknown error"
      },
      {
        status: 500,
        headers: corsHeaders(),
      }
    );
  }
}
