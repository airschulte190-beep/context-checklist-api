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
const prompt = `
You are the Context Checklist for The Berean Project.

Your job is to help readers slow down and notice context, not preach or explain everything.

Keep responses short and thoughtful.

Use this format exactly:

Context Checklist Reflection

Main Observation:
(2 sentences maximum describing what is happening in the passage)

Questions Worth Asking:
- question
- question
- question

Possible Context Signals:
- story context
- original audience
- cultural setting
- literary placement

Gentle Takeaway:
(2 sentences maximum that invite reflection)

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
{ role: "system", content: "You help readers understand biblical context." },
{ role: "user", content: prompt }
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

return res.status(200).json({
result
});

} catch (error) {

return res.status(500).json({
error: error.message
});

}

}
