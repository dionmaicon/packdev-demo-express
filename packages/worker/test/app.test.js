const { test } = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const { createApp } = require("../src/app");

function listen(app) {
  return new Promise((resolve) => {
    const server = app.listen(0, () => resolve(server));
  });
}

function request(port, options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { host: "127.0.0.1", port, ...options },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () =>
          resolve({ statusCode: res.statusCode, body: data ? JSON.parse(data) : null }),
        );
      },
    );
    req.on("error", reject);
    if (body) {
      req.setHeader("content-type", "application/json");
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

test("GET /health returns ok", async () => {
  const server = await listen(createApp());
  try {
    const { port } = server.address();
    const res = await request(port, { path: "/health", method: "GET" });
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, { status: "ok" });
  } finally {
    server.close();
  }
});

test("POST /notify rejects a missing message", async () => {
  const server = await listen(createApp());
  try {
    const { port } = server.address();
    const res = await request(port, { path: "/notify", method: "POST" }, { to: "alice" });
    assert.equal(res.statusCode, 400);
  } finally {
    server.close();
  }
});

test("POST /notify then GET /notifications/:id round-trips a real notification", async () => {
  const server = await listen(createApp());
  try {
    const { port } = server.address();
    const created = await request(
      port,
      { path: "/notify", method: "POST" },
      { to: "alice", message: "hello" },
    );
    assert.equal(created.statusCode, 202);
    assert.equal(created.body.status, "sent");

    const fetched = await request(port, {
      path: `/notifications/${created.body.id}`,
      method: "GET",
    });
    assert.equal(fetched.statusCode, 200);
    assert.deepEqual(fetched.body, {
      id: created.body.id,
      to: "alice",
      message: "hello",
      status: "sent",
    });
  } finally {
    server.close();
  }
});

test("GET /notifications/:id returns 404 for an unknown id", async () => {
  const server = await listen(createApp());
  try {
    const { port } = server.address();
    const res = await request(port, { path: "/notifications/does-not-exist", method: "GET" });
    assert.equal(res.statusCode, 404);
  } finally {
    server.close();
  }
});

test("DELETE /notifications/:id removes a real notification", async () => {
  const server = await listen(createApp());
  try {
    const { port } = server.address();
    const created = await request(
      port,
      { path: "/notify", method: "POST" },
      { to: "alice", message: "hello" },
    );
    const deleted = await request(port, {
      path: `/notifications/${created.body.id}`,
      method: "DELETE",
    });
    assert.equal(deleted.statusCode, 204);

    const fetched = await request(port, {
      path: `/notifications/${created.body.id}`,
      method: "GET",
    });
    assert.equal(fetched.statusCode, 404);
  } finally {
    server.close();
  }
});
