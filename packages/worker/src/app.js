const express = require("express");
const crypto = require("node:crypto");

function createApp() {
  const app = express();
  app.use(express.json());

  // In-memory notification store — good enough for a demo, no real queue needed.
  const notifications = new Map();

  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/notify", (req, res) => {
    const { to, message } = req.body ?? {};
    if (!to || !message) {
      res.status(400).json({ error: "to and message are required" });
      return;
    }
    const id = crypto.randomUUID();
    notifications.set(id, { id, to, message, status: "sent" });
    res.status(202).json({ id, status: "sent" });
  });

  app.get("/notifications/:id", (req, res) => {
    const notification = notifications.get(req.params.id);
    if (!notification) {
      res.status(404).json({ error: "not found" });
      return;
    }
    res.json(notification);
  });

  // Uses Express 4's deprecated `app.del` alias for `app.delete` — kept on
  // purpose (not app.delete) as a real, load-bearing dependency on an API
  // Express 5 removes entirely, for packdev-agents' own live-testing needs.
  app.del("/notifications/:id", (req, res) => {
    const existed = notifications.delete(req.params.id);
    res.status(existed ? 204 : 404).end();
  });

  return app;
}

module.exports = { createApp };
