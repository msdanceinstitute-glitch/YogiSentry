import client from "../src/lib/turso.js";

export const ComplaintService = {
  async createComplaint(societyId: string, flat_no: string, description: string) {
    const result = await client.execute({
      sql: "INSERT INTO complaints (id, society_id, flat_no, description) VALUES (?, ?, ?, ?)",
      args: [Date.now().toString(), societyId, flat_no, description]
    });
    return result;
  },

  async resolveComplaint(societyId: string, complaintId: string, imageUrl: string) {
    await client.execute({
      sql: "UPDATE complaints SET status = 'RESOLVED', resolution_image_url = ? WHERE id = ? AND society_id = ?",
      args: [imageUrl, complaintId, societyId]
    });
  }
};
