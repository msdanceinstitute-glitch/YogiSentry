import client from "../src/lib/turso.js";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export const ComplaintService = {
  async createComplaint(societyId: string, flat_no: string, description: string) {
    const id = Date.now().toString();
    await client.execute({
      sql: "INSERT INTO complaints (id, society_id, flat_no, description) VALUES (?, ?, ?, ?)",
      args: [id, societyId, flat_no, description]
    });
    
    await pusher.trigger(`society-${societyId}`, "new-complaint", { complaintId: id, flat_no });
    return id;
  },

  async resolveComplaint(societyId: string, complaintId: string, imageUrl: string) {
    await client.execute({
      sql: "UPDATE complaints SET status = 'RESOLVED', resolution_image_url = ? WHERE id = ? AND society_id = ?",
      args: [imageUrl, complaintId, societyId]
    });
    
    await pusher.trigger(`society-${societyId}`, "complaint-resolved", { complaintId });
  }
};
