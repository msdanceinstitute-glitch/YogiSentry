import { Response } from "express";
import { ComplaintService } from "../services/complaintService.js";
import { AuthRequest } from "../middleware/auth.js";

export const ComplaintController = {
  async createComplaint(req: AuthRequest, res: Response) {
    try {
      const { flat_no, description } = req.body;
      const { societyId } = req.user!;
      await ComplaintService.createComplaint(societyId, flat_no, description);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  async resolveComplaint(req: AuthRequest, res: Response) {
      try {
        const { complaintId, imageUrl } = req.body;
        const { societyId } = req.user!;
        await ComplaintService.resolveComplaint(societyId, complaintId, imageUrl);
        res.json({ success: true });
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
  }
};
