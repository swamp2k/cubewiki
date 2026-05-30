// functions/api/recipes.js
// Cloudflare Pages Function — bound to D1 database "CC_DB"
//
// GET    /api/recipes          → all user recipes as JSON object
// POST   /api/recipes          → upsert one recipe  (body: { name, input1, input2, category, obtain })
// DELETE /api/recipes/:name    → delete one recipe by name

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

function err(msg, status = 400) {
  return json({ error: msg }, status);
}

export async function onRequest(ctx) {
  const { request, env } = ctx;
  const db = env.CC_DB;

  // Preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  const url    = new URL(request.url);
  // pathname looks like /api/recipes or /api/recipes/Iron%20Sword
  const parts  = url.pathname.replace(/^\/api\/recipes\/?/, "");
  const name   = parts ? decodeURIComponent(parts) : null;

  // ── GET /api/recipes ──────────────────────────────────────────────────────
  if (request.method === "GET") {
    const { results } = await db
      .prepare("SELECT name, input1, input2, category, obtain FROM user_recipes ORDER BY updated_at DESC")
      .all();

    // Shape rows into the same object format the React app expects:
    // { "Iron Sword": { inputs: ["Forge Cube", "Iron"], category: "Sword", obtain: "...", userAdded: true } }
    const shaped = {};
    for (const row of results) {
      shaped[row.name] = {
        inputs:    [row.input1, row.input2],
        category:  row.category,
        obtain:    row.obtain || undefined,
        beginner:  false,
        userAdded: true,
      };
    }
    return json(shaped);
  }

  // ── POST /api/recipes ─────────────────────────────────────────────────────
  if (request.method === "POST") {
    let body;
    try { body = await request.json(); }
    catch { return err("Invalid JSON body"); }

    const { name: n, input1, input2, category, obtain } = body;

    if (!n?.trim())       return err("name is required");
    if (!input1?.trim())  return err("input1 is required");
    if (!input2?.trim())  return err("input2 is required");
    if (!category?.trim())return err("category is required");

    await db
      .prepare(`
        INSERT INTO user_recipes (name, input1, input2, category, obtain, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, unixepoch())
        ON CONFLICT(name) DO UPDATE SET
          input1     = excluded.input1,
          input2     = excluded.input2,
          category   = excluded.category,
          obtain     = excluded.obtain,
          updated_at = unixepoch()
      `)
      .bind(n.trim(), input1.trim(), input2.trim(), category.trim(), obtain?.trim() || null)
      .run();

    return json({ ok: true, name: n.trim() });
  }

  // ── DELETE /api/recipes/:name ─────────────────────────────────────────────
  if (request.method === "DELETE") {
    if (!name) return err("name is required in URL path");

    await db
      .prepare("DELETE FROM user_recipes WHERE name = ?1")
      .bind(name)
      .run();

    return json({ ok: true, name });
  }

  return err("Method not allowed", 405);
}
