import { Router } from "express";
import { VisitorController } from "../controllers/visitorController.js";
import { authenticate, authorizeRole } from "../middleware/auth.js";

const routes = Router();

routes.post("/create", authenticate, authorizeRole(["GUARD"]), VisitorController.createRequest);
routes.post("/update-status", authenticate, authorizeRole(["RESIDENT"]), VisitorController.updateStatus);

export default routes;
