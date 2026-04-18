import { Router } from "express";
import { VisitorController } from "../controllers/visitorController.js";
import { authenticate, authorizeRole } from "../middleware/auth.js";

const routes = Router();

routes.post("/add", authenticate, authorizeRole(["GUARD"]), VisitorController.addVisitor);
routes.post("/respond", authenticate, authorizeRole(["RESIDENT"]), VisitorController.respondToVisitor);

export default routes;
