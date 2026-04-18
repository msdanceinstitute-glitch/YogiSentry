import { Router } from "express";
import jwt from "jsonwebtoken";
import client from "../src/lib/turso.js";

const routes = Router();

routes.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  // 1. Authenticate user against Turso
  const result = await client.execute({
    sql: "SELECT * FROM users WHERE email = ? AND password = ?",
    args: [email, password] // Note: In production, AVOID plain text passwords!
  });

  if (result.rows.length === 0) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const user = result.rows[0];

  // 2. Generate secure JWT
  const token = jwt.sign(
    { userId: user.id, societyId: user.society_id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: "24h" }
  );

  res.json({ token, user: { id: user.id, role: user.role, societyId: user.society_id } });
});

export default routes;
