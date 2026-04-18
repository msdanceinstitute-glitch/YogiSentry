import { Router } from "express";
import { CommunicationController } from "../controllers/communicationController.js";
import { authenticate, authorizeRole } from "../middleware/auth.js";

const routes = Router();

routes.post("/notices", authenticate, authorizeRole(["SECRETARY", "SUPER_ADMIN"]), CommunicationController.createNotice);
routes.get("/notices", authenticate, CommunicationController.getAllNotices);

routes.post("/events", authenticate, authorizeRole(["SECRETARY", "SUPER_ADMIN"]), CommunicationController.createEvent);
routes.get("/events", authenticate, CommunicationController.getAllEvents);

export default routes;
