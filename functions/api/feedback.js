/**
 * Cloudflare Pages Function — 食堂菜单接口
 * 路由：
 *   GET  /api        获取全部菜品
 *   POST /api        新增菜品（字段：name 名称, price 价格）
 *
 * D1 绑定（Cloudflare Dashboard）：
 *   Pages 项目 → 设置 → Functions → D1 数据库绑定
 *   变量名填写：DB
 *
 * 建表 SQL（D1 控制台执行一次）：
 *   CREATE TABLE IF NOT EXISTS canteen (
 *     id INTEGER PRIMARY KEY AUTOINCREMENT,
 *     name TEXT NOT NULL,
 *     price REAL NOT NULL,
 *     created_at TEXT
 *   );
 */

const MAX_NAME = 100;

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status: status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*"
    }
  });
}

/* GET /api —— 返回全部菜品 */
export async function onRequestGet(context) {
  const { env } = context;

  if (!env || !env.DB) {
    return json({ ok: false, error: "D1_NOT_BOUND" }, 501);
  }

  try {
    const { results } = await env.DB
      .prepare("SELECT id, name, price, created_at FROM canteen ORDER BY id DESC")
      .all();
    return json({ ok: true, data: results }, 200);
  } catch (e) {
    return json({ ok: false, error: "DB_ERROR" }, 500);
  }
}

/* POST /api —— 新增菜品 */
export async function onRequestPost(context) {
  const { env, request } = context;

  if (!env || !env.DB) {
    return json({ ok: false, error: "D1_NOT_BOUND" }, 501);
  }

  let payload;
  try {
    payload = await request.json();
  } catch (e) {
    return json({ ok: false, error: "INVALID_JSON" }, 400);
  }

  const name = String(payload.name || "").trim().slice(0, MAX_NAME);
  if (!name) {
    return json({ ok: false, error: "EMPTY_NAME" }, 400);
  }

  const price = Number(payload.price);
  if (!Number.isFinite(price) || price < 0) {
    return json({ ok: false, error: "INVALID_PRICE" }, 400);
  }

  const createdAt = new Date().toISOString();

  try {
    await env.DB.prepare(
      "INSERT INTO canteen (name, price, created_at) VALUES (?, ?, ?)"
    )
      .bind(name, price, createdAt)
      .run();
    return json({ ok: true }, 201);
  } catch (e) {
    return json({ ok: false, error: "DB_ERROR" }, 500);
  }
}

/* 预检请求（跨域直提交时需要） */
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
