import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import visitorRoutes from "./routes/visitors.js";
import financialRoutes from "./routes/financials.js";
import complaintRoutes from "./routes/complaints.js";
import communicationRoutes from "./routes/communication.js";
import parcelRoutes from "./routes/parcels.js";
import { checkSubscription } from "./middleware/subscription.js";
import { authenticate } from "./middleware/auth.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/visitors", authenticate, visitorRoutes);
  app.use("/api/financials", authenticate, checkSubscription, financialRoutes);
  app.use("/api/complaints", authenticate, checkSubscription, complaintRoutes);
  app.use("/api/communication", authenticate, checkSubscription, communicationRoutes);
  app.use("/api/parcels", authenticate, checkSubscription, parcelRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
