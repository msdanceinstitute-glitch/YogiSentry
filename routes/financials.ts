import { Router } from "express";
import { FinancialController } from "../controllers/financialController.js";
import { authenticate, authorizeRole } from "../middleware/auth.js";

const routes = Router();

// Expenses (Secretary/Admin only)
routes.post("/expense/add", authenticate, authorizeRole(["SECRETARY", "SUPER_ADMIN"]), FinancialController.addExpense);

// Maintenance
routes.post("/maintenance/request", authenticate, authorizeRole(["SECRETARY"]), FinancialController.requestMaintenance);
routes.post("/maintenance/pay", authenticate, authorizeRole(["RESIDENT"]), FinancialController.markMaintenancePaid);

export default routes;
