// Netlify Function: generates a short site background + further-reading suggestions.
// Uses ANTHROPIC_API_KEY from Netlify environment variables.
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method not allowed" };
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { statusCode: 500, body: JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }) };
  let payload; try { payload = JSON.parse(event.body); } catch { return { statusCode: 400, body: "Bad request" }; }
  const site = (payload.site || "").slice(0, 200);
  const trip = (payload.trip || "").slice(0, 200);
  if (!site) return { statusCode: 400, body: "Missing site" };
  const prompt = `You are writing a study-guide entry for a travel journaling app. The trip is "${trip}". Write a background for the site/event: "${site}".

Respond ONLY with JSON, no markdown fences, in this shape:
{"about": "...", "refs": [{"t": "..."}]}

Rules:
- "about": 90-140 words. Warm, factual overview and brief history a visitor would want before arriving. No headings, no lists, plain prose.
- "refs": 3-5 named further-study resources (books, official museum/heritage sites, documentaries) written as descriptive names, e.g. "The Acropolis Museum — official site". Do NOT include URLs.
- If the site name is ambiguous or you are unsure of facts, be general rather than specific, and never invent precise dates or statistics.`;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-5", max_tokens: 700, messages: [{ role: "user", content: prompt }] }),
    });
    const out = await res.json();
    const text = (out.content || []).filter((b) => b.type === "text").map((b) => b.text).join("").trim().replace(/```json|```/g, "");
    let parsed; try { parsed = JSON.parse(text); } catch { parsed = { about: text, refs: [] }; }
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ about: parsed.about || "", refs: Array.isArray(parsed.refs) ? parsed.refs.slice(0, 6) : [] }) };
  } catch (e) { return { statusCode: 502, body: JSON.stringify({ error: "Upstream error" }) }; }
};
