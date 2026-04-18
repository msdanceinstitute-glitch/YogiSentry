import client from "../src/lib/turso.js";

export const VisitorService = {
  async addVisitor(societyId: string, flat_no: string, name: string, photoUrl?: string) {
    const result = await client.execute({
      sql: "INSERT INTO visitors (id, society_id, flat_no, visitor_name, photo_url) VALUES (?, ?, ?, ?, ?)",
      args: [Date.now().toString(), societyId, flat_no, name, photoUrl || null]
    });
    return result;
  },

  async respondToVisitor(societyId: string, visitorId: string, status: string) {
    await client.execute({
      sql: "UPDATE visitors SET status = ? WHERE id = ? AND society_id = ?",
      args: [status, visitorId, societyId]
    });
  }
};
