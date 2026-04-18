import { Router } from "express";
import { ComplaintController } from "../controllers/complaintController.js";
import { authenticate, authorizeRole } from "../middleware/auth.js";

const routes = Router();

routes.post("/create", authenticate, authorizeRole(["RESIDENT"]), ComplaintController.createComplaint);
routes.post("/resolve", authenticate, authorizeRole(["SECRETARY"]), ComplaintController.resolveComplaint);

export default routes;
