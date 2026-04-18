import client from "../src/lib/turso.js";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export const VisitorService = {
  async createVisitorRequest(societyId: string, flat_no: string, visitor_name: string, photo_url: string) {
    const id = Date.now().toString();
    await client.execute({
      sql: "INSERT INTO visitors (id, society_id, flat_no, visitor_name, photo_url, status) VALUES (?, ?, ?, ?, ?, 'PENDING')",
      args: [id, societyId, flat_no, visitor_name, photo_url]
    });

    await pusher.trigger(`society-${societyId}`, "visitor-request", { id, flat_no, visitor_name });
    return id;
  },

  async updateVisitorStatus(societyId: string, visitorId: string, status: 'APPROVED' | 'DECLINED') {
    await client.execute({
      sql: "UPDATE visitors SET status = ? WHERE id = ? AND society_id = ?",
      args: [status, visitorId, societyId]
    });

    await pusher.trigger(`society-${societyId}`, "visitor-response", { visitorId, status });
  }
};
