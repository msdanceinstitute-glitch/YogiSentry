import { Response } from "express";
import { ParcelService } from "../services/parcelService.js";
import { AuthRequest } from "../middleware/auth.js";
import { z } from "zod";

const parcelSchema = z.object({
  flat_no: z.string(),
  recipient_name: z.string(),
  photo_url: z.string().url(),
});

export const ParcelController = {
  async addParcel(req: AuthRequest, res: Response) {
    try {
      const { flat_no, recipient_name, photo_url } = parcelSchema.parse(req.body);
      const { societyId } = req.user!;
      await ParcelService.addParcel(societyId, flat_no, recipient_name, photo_url);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
};
