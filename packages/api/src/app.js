const express = require("express");

function createApp() {
  const app = express();
  app.use(express.json());

  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/users/:id", (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: "id must be a positive integer" });
      return;
    }
    res.json({ id, name: `user-${id}` });
  });

  app.post("/echo", (req, res) => {
    res.json({ received: req.body });
  });

  return app;
}

module.exports = { createApp };
