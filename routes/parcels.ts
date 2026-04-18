import { Router } from "express";
import { ParcelController } from "../controllers/parcelController.js";
import { authenticate, authorizeRole } from "../middleware/auth.js";

const routes = Router();

routes.post("/add", authenticate, authorizeRole(["GUARD"]), ParcelController.addParcel);

export default routes;
