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

test("GET /users/:id returns the user for a valid id", async () => {
  const server = await listen(createApp());
  try {
    const { port } = server.address();
    const res = await request(port, { path: "/users/42", method: "GET" });
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, { id: 42, name: "user-42" });
  } finally {
    server.close();
  }
});

test("GET /users/:id rejects a non-numeric id", async () => {
  const server = await listen(createApp());
  try {
    const { port } = server.address();
    const res = await request(port, { path: "/users/not-a-number", method: "GET" });
    assert.equal(res.statusCode, 400);
  } finally {
    server.close();
  }
});

test("POST /echo returns the JSON body it received", async () => {
  const server = await listen(createApp());
  try {
    const { port } = server.address();
    const res = await request(port, { path: "/echo", method: "POST" }, { hello: "world" });
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, { received: { hello: "world" } });
  } finally {
    server.close();
  }
});
