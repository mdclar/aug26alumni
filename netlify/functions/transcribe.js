// Netlify Function: proxies handwriting transcription to the Anthropic API.
// Set ANTHROPIC_API_KEY in Netlify: Site settings -> Environment variables.
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method not allowed" };
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { statusCode: 500, body: JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }) };
  let payload;
  try { payload = JSON.parse(event.body); } catch { return { statusCode: 400, body: "Bad request" }; }
  const { media_type, data } = payload || {};
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(media_type) || !data || data.length > 8_000_000) return { statusCode: 400, body: "Bad image" };
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-5", max_tokens: 1500,
        messages: [{ role: "user", content: [
          { type: "image", source: { type: "base64", media_type, data } },
          { type: "text", text: "Transcribe the handwritten notes in this image into clean typed text. Preserve line breaks and paragraphing. Output only the transcription with no preamble, commentary, or markdown." },
        ] }],
      }),
    });
    const out = await res.json();
    const text = (out.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) };
  } catch (e) {
    return { statusCode: 502, body: JSON.stringify({ error: "Upstream error" }) };
  }
};
