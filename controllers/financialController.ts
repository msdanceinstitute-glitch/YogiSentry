import { Response } from "express";
import { FinancialService } from "../services/financialService.js";
import { AuthRequest } from "../middleware/auth.js";
import { z } from "zod";

const expenseSchema = z.object({
  category: z.string(),
  amount: z.number(),
  description: z.string().optional(),
});

export const FinancialController = {
  async addExpense(req: AuthRequest, res: Response) {
    try {
      const { category, amount, description } = expenseSchema.parse(req.body);
      const { societyId } = req.user!;
      await FinancialService.addExpense(societyId, category, amount, description || "");
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  async requestMaintenance(req: AuthRequest, res: Response) {
    try {
      const { flat_no, amount, month } = req.body;
      const { societyId } = req.user!;
      await FinancialService.requestMaintenance(societyId, flat_no, amount, month);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  async markMaintenancePaid(req: AuthRequest, res: Response) {
      try {
        const { maintenanceId } = req.body;
        const { societyId } = req.user!;
        await FinancialService.markMaintenancePaid(societyId, maintenanceId);
        res.json({ success: true });
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
  }
};
