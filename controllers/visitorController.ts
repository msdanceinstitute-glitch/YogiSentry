import { Request, Response } from "express";
import { VisitorService } from "../services/visitorService.js";
import { AuthRequest } from "../middleware/auth.js";

export const VisitorController = {
  async addVisitor(req: AuthRequest, res: Response) {
    try {
      const { flat_no, name, photoUrl } = req.body;
      const { societyId } = req.user!;
      
      await VisitorService.addVisitor(societyId, flat_no, name, photoUrl);
      
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  async respondToVisitor(req: AuthRequest, res: Response) {
    try {
      const { visitorId, status } = req.body;
      const { societyId } = req.user!;
      
      await VisitorService.respondToVisitor(societyId, visitorId, status);
      
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
};
