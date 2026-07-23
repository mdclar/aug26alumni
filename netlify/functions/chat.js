// Netlify Function: trip-aware study chat. Uses ANTHROPIC_API_KEY from env.
// Receives: { messages:[{role,content}...], ctx:{ trip, dates, day, site, about, talmage, scriptures, itinerary } }
// Journal entries and photos are NEVER sent here by the app.
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method not allowed" };
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { statusCode: 500, body: JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }) };
  let payload; try { payload = JSON.parse(event.body); } catch { return { statusCode: 400, body: "Bad request" }; }

  const ctx = payload.ctx || {};
  const clip = (s, n) => String(s || "").slice(0, n);
  const trip = clip(ctx.trip, 120), dates = clip(ctx.dates, 60), day = clip(ctx.day, 80);
  const site = clip(ctx.site, 120), about = clip(ctx.about, 900), talmage = clip(ctx.talmage, 1800);
  const scriptures = clip(ctx.scriptures, 1200), itinerary = clip(ctx.itinerary, 1500), facts = clip(ctx.facts, 24000);

  // history: last 12 turns, trimmed
  const msgs = (Array.isArray(payload.messages) ? payload.messages : [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
  if (!msgs.length || msgs[msgs.length - 1].role !== "user") return { statusCode: 400, body: "Missing user message" };

  const system = `You are the study companion inside "In the Steps of the Master", a travel journaling app. You are talking to a traveler on the trip "${trip}"${dates ? ` (${dates})` : ""}.
${site ? `They currently have open the stop: "${site}"${day ? ` (${day})` : ""}.` : ""}
${about ? `About this stop: ${about}` : ""}
${talmage ? `Study excerpt available at this stop (James E. Talmage, Jesus the Christ, public domain): ${talmage}` : ""}
${scriptures ? `Scripture references listed at this stop: ${scriptures}` : ""}
${itinerary ? `Trip itinerary overview: ${itinerary}` : ""}
${facts ? `Practical trip facts (lodging, contacts, dress code, logistics — treat as authoritative for this group): ${facts}` : ""}

Guidelines:
- Be a warm, knowledgeable traveling companion: history, scripture context, geography, practical visitor insight.
- Keep answers concise for a phone screen: usually 2-6 sentences unless asked for depth. Plain prose, no headings or bullet lists unless asked.
- The group is an interfaith-friendly BYU Jerusalem Center alumni trip; be respectful of Jewish, Christian, Muslim and Latter-day Saint perspectives.
- If asked about facts you are unsure of (opening hours, prices, current events), say so and suggest checking locally rather than guessing.
- You do not have access to the traveler's journal entries or photos; if asked, say those stay private on their device.`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-5", max_tokens: 800, system, messages: msgs }),
    });
    const out = await res.json();
    const text = (out.content || []).filter((b) => b.type === "text").map((b) => b.text).join("").trim();
    if (!text) return { statusCode: 502, body: JSON.stringify({ error: "Empty response" }) };
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reply: text }) };
  } catch (e) { return { statusCode: 502, body: JSON.stringify({ error: "Upstream error" }) }; }
};
