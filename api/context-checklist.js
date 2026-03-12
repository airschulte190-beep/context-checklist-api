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

const prompt = `Explain the context of this Bible passage in a thoughtful and gentle way: ${input}`;

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
result: "OpenAI responded but returned no content.",
debug: data
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
