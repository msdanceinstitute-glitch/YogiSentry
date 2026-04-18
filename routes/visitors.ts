import { Router } from "express";
import client from "../src/lib/turso.js";
import { authenticate } from "../middleware/auth.js";

const routes = Router();

// Visitor API
routes.post("/add", authenticate, async (req, res) => {
  const { name, phone } = req.body;
  const { societyId } = req.user!;
  
  await client.execute({
    sql: "INSERT INTO visitors (id, society_id, name, phone) VALUES (?, ?, ?, ?)",
    args: [Date.now().toString(), societyId, name, phone]
  });
  
  res.json({ success: true });
});

// Visitor Response API
routes.post("/respond", authenticate, async (req, res) => {
  const { visitorId, status } = req.body;
  const { societyId } = req.user!;
  
  await client.execute({
    sql: "UPDATE visitors SET status = ? WHERE id = ? AND society_id = ?",
    args: [status, visitorId, societyId]
  });
  
  res.json({ success: true });
});

export default routes;
