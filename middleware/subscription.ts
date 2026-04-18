import { Response, NextFunction } from "express";
import client from "../src/lib/turso.js";
import { AuthRequest } from "./auth.js";

export async function checkSubscription(req: AuthRequest, res: Response, next: NextFunction) {
  const { societyId } = req.user!;
  
  const result = await client.execute({
    sql: "SELECT status FROM subscriptions WHERE society_id = ? AND status = 'ACTIVE' AND expiry_date > DATETIME('now')",
    args: [societyId]
  });

  if (result.rows.length === 0) {
    return res.status(403).json({ error: "Subscription expired. Please renew." });
  }
  next();
}
