import { Response } from "express";
import { VisitorService } from "../services/visitorService.js";
import { AuthRequest } from "../middleware/auth.js";
import { z } from "zod";

const visitorSchema = z.object({
  flat_no: z.string(),
  visitor_name: z.string(),
  photo_url: z.string().url(),
});

export const VisitorController = {
  async createRequest(req: AuthRequest, res: Response) {
    try {
      const { flat_no, visitor_name, photo_url } = visitorSchema.parse(req.body);
      const { societyId } = req.user!;
      const id = await VisitorService.createVisitorRequest(societyId, flat_no, visitor_name, photo_url);
      res.json({ success: true, data: { id } });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  async updateStatus(req: AuthRequest, res: Response) {
    try {
      const { visitorId, status } = req.body;
      const { societyId } = req.user!;
      await VisitorService.updateVisitorStatus(societyId, visitorId, status);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
};
