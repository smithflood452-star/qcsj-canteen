/**
 * Cloudflare Pages Function — 意见反馈接口（预留）
 * 路由：POST /api/feedback
 *
 * 绑定 D1 后：将反馈写入 feedback 表。
 * 未绑定 D1 时：返回 501，前端 script.js 会自动降级为「本地暂存」并如实提示。
 *
 * 绑定方式（Cloudflare Dashboard）：
 *   Pages 项目 → 设置 → Functions → D1 数据库绑定
 *   变量名填写：DB
 *
 * 建表 SQL（D1 控制台执行一次）：
 *   CREATE TABLE IF NOT EXISTS feedback (
 *     id INTEGER PRIMARY KEY AUTOINCREMENT,
 *     type TEXT,
 *     type_name TEXT,
 *     content TEXT,
 *     contact TEXT,
 *     page TEXT,
 *     created_at TEXT
 *   );
 */

const MAX_CONTENT = 2000;

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status: status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*"
    }
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  /* 未绑定 D1：明确告知前端降级 */
  if (!env || !env.DB) {
    return json({ ok: false, error: "D1_NOT_BOUND" }, 501);
  }

  let payload;
  try {
    payload = await request.json();
  } catch (e) {
    return json({ ok: false, error: "INVALID_JSON" }, 400);
  }

  const content = String(payload.content || "").trim().slice(0, MAX_CONTENT);
  if (!content) {
    return json({ ok: false, error: "EMPTY_CONTENT" }, 400);
  }

  const type = String(payload.type || "").slice(0, 50);
  const typeName = String(payload.typeName || "").slice(0, 50);
  const contact = String(payload.contact || "").trim().slice(0, 50);
  const page = String(payload.page || "").slice(0, 300);
  const createdAt = new Date().toISOString();

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

/* 预检请求（如需跨域表单直提交） */
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
