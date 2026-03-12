export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const input = body?.input;

    if (!input) {
      return res.status(400).json({ error: "Missing input." });
    }

    const prompt = `
You are the Context Checklist for The Berean Project.

First determine whether the input is:
(A) a Bible passage
or
(B) a teaching claim about a passage.

If it is a teaching claim, gently explore how the interpretation connects to the original audience and setting.

Your job is not to teach or correct, but to gently surface context someone may not have noticed.
Your job is to help readers slow down and notice context, not preach or explain everything.

Keep responses short, calm, and reflective, like a quiet thought someone might have later in the day.

If the input contains formula-style language such as "proves," "this means," or "God promises," mention the phrase itself in Possible Context Signals and note that it may compress a complex passage into a shortcut conclusion.

Use this format exactly:

Context Checklist Reflection

Main Observation:
(1–2 sentences noticing what kind of passage or claim this is and where it sits in the story)

Questions Worth Asking:
- question
- question
- question

If the input is a teaching claim, make one of the questions explore whether the modern application is being drawn carefully from the original audience, setting, and purpose of the passage.

Possible Context Signals:
(List only 3–4 signals you actually notice.)

Write them as short observations, not just labels.

Example style:
- the setting appears to be Israel's exile in Babylon
- the promise language sounds connected to covenant restoration
- the passage sits inside a larger tension between judgment and hope
- the claim uses the word "proves," which may compress the interpretation into a shortcut conclusion

Prooftexting Risk:
(Write only one word: Low, Moderate, or High)

Why This Might Be a Risk:
(1–2 sentences explaining whether the interpretation may flatten story context, original audience, covenant background, literary setting, or the bridge from ancient meaning to modern application. Use calm, non-accusatory language.)

If the input contains formula-style interpretation language such as "proves," "this means," or "God promises you," the Prooftexting Risk should usually be Moderate or High because the claim may be compressing a larger context. Put the explanation only in the "Why This Might Be a Risk" section, not in the risk label.

Gentle Takeaway:
(1–2 sentences inviting quiet reflection, not correction)

Important tone rules:
- calm
- curious
- never corrective
- never preachy
- avoid phrases like "this verse teaches"

Passage or claim:
${input}
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You help readers understand biblical context with humility, clarity, and a non-accusatory tone."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();
    const result = data?.choices?.[0]?.message?.content;

    if (!result) {
      return res.status(200).json({
        result: JSON.stringify(data, null, 2)
      });
    }

    return res.status(200).json({ result });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
