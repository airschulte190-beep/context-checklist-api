export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { input } = req.body || {};

  if (!input || !input.trim()) {
    return res.status(400).json({ error: "Missing input" });
  }

  const masterPrompt = `
You are the Context Checklist, a biblical context analysis tool.

Analyze the following passage using these sections:

1. Context Snapshot
2. Story Awareness
3. What Is Happening Here
4. Why This Was Written
5. Common Surface Reading
6. Context-Shaped Reading
7. Application Bridge
8. Potential Context Risk
9. Suggested Passage
10. Reflection
11. Context Opportunity

Passage:
${input}
`;

  try {

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-5",
        input: masterPrompt
      })
    });

    const data = await response.json();

    const result =
      data.output_text ||
      (data.output && data.output[0] && data.output[0].content[0].text) ||
      "No response returned.";

    return res.status(200).json({ result });

  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }

}
