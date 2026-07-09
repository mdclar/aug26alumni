// Netlify Function: drafts a one-line photo caption. ANTHROPIC_API_KEY from env.
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method not allowed" };
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { statusCode: 500, body: JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }) };
  let payload; try { payload = JSON.parse(event.body); } catch { return { statusCode: 400, body: "Bad request" }; }
  const { data, context } = payload || {};
  if (!data || data.length > 8_000_000) return { statusCode: 400, body: "Bad image" };
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-5", max_tokens: 80,
        messages: [{ role: "user", content: [
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data } },
          { type: "text", text: `Write one short photo caption (max 12 words) for a personal travel journal${context ? `, taken at or near "${context}"` : ""}. Describe the scene warmly and plainly. Do not name or guess the identity of any person. Output only the caption, no quotes.` },
        ] }],
      }),
    });
    const out = await res.json();
    const text = (out.content || []).filter((b) => b.type === "text").map((b) => b.text).join("").trim();
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) };
  } catch (e) { return { statusCode: 502, body: JSON.stringify({ error: "Upstream error" }) }; }
};
