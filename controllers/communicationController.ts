import { Response } from "express";
import { CommunicationService } from "../services/communicationService.js";
import { AuthRequest } from "../middleware/auth.js";

export const CommunicationController = {
  async createNotice(req: AuthRequest, res: Response) {
    try {
      const { title, content } = req.body;
      const { societyId } = req.user!;
      await CommunicationService.createNotice(societyId, title, content);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  async getAllNotices(req: AuthRequest, res: Response) {
    try {
      const { societyId } = req.user!;
      const notices = await CommunicationService.getAllNotices(societyId);
      res.json(notices);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  async createEvent(req: AuthRequest, res: Response) {
    try {
      const { title, description, event_date } = req.body;
      const { societyId } = req.user!;
      await CommunicationService.createEvent(societyId, title, description, event_date);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  async getAllEvents(req: AuthRequest, res: Response) {
    try {
      const { societyId } = req.user!;
      const events = await CommunicationService.getAllEvents(societyId);
      res.json(events);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
  }
};
