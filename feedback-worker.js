/**
 * 青春集市 · 比思睿生活驿站 — 意见反馈接口（Worker 格式）
 * 路由：POST /api/feedback
 *
 * 运行方式：作为 Worker 脚本随 wrangler.toml 部署。
 * 静态资产（index.html / assets/ 等）由 [assets] 直接服务，
 * 只有匹配不到静态文件的请求才会进入本脚本——目前即 /api/feedback。
 *
 * 绑定：env.DB（D1，见 wrangler.toml [[d1_databases]]）
 * 未绑定时返回 501，前端 script.js 自动降级为「本地暂存」并如实提示。
 */

var MAX_CONTENT = 2000;

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status: status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*"
    }
  });
}

export default {
  async fetch(request, env, ctx) {
    var url = new URL(request.url);

    /* 只处理反馈接口，其余一律 404（静态资产不会进到这里） */
    if (url.pathname !== "/api/feedback") {
      return new Response("Not Found", { status: 404 });
    }

    /* 预检请求 */
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    if (request.method !== "POST") {
      return json({ ok: false, error: "METHOD_NOT_ALLOWED" }, 405);
    }

    /* 未绑定 D1：明确告知前端降级 */
    if (!env || !env.DB) {
      return json({ ok: false, error: "D1_NOT_BOUND" }, 501);
    }

    var payload;
    try {
      payload = await request.json();
    } catch (e) {
      return json({ ok: false, error: "INVALID_JSON" }, 400);
    }

    var content = String((payload && payload.content) || "").trim().slice(0, MAX_CONTENT);
    if (!content) {
      return json({ ok: false, error: "EMPTY_CONTENT" }, 400);
    }

    var type = String((payload && payload.type) || "").slice(0, 50);
    var typeName = String((payload && payload.typeName) || "").slice(0, 50);
    var contact = String((payload && payload.contact) || "").trim().slice(0, 50);
    var page = String((payload && payload.page) || "").slice(0, 300);
    var createdAt = new Date().toISOString();

    try {
      await env.DB.prepare(
        "INSERT INTO feedback (type, type_name, content, contact, page, created_at) VALUES (?, ?, ?, ?, ?, ?)"
      )
        .bind(type, typeName, content, contact, page, createdAt)
        .run();
      return json({ ok: true }, 200);
    } catch (e) {
      /* 表未创建时给出明确错误码，方便排查 */
      var msg = String((e && e.message) || e);
      if (msg.indexOf("no such table") !== -1) {
        return json({ ok: false, error: "TABLE_MISSING" }, 500);
      }
      return json({ ok: false, error: "DB_ERROR", detail: msg.slice(0, 200) }, 500);
    }
  }
};
