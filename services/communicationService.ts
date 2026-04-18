import client from "../src/lib/turso.js";

export const CommunicationService = {
  async createNotice(societyId: string, title: string, content: string) {
    await client.execute({
      sql: "INSERT INTO notices (id, society_id, title, content) VALUES (?, ?, ?, ?)",
      args: [Date.now().toString(), societyId, title, content]
    });
  },

  async getAllNotices(societyId: string) {
    const result = await client.execute({
      sql: "SELECT * FROM notices WHERE society_id = ? ORDER BY created_at DESC",
      args: [societyId]
    });
    return result.rows;
  },

  async createEvent(societyId: string, title: string, description: string, event_date: string) {
    await client.execute({
      sql: "INSERT INTO events (id, society_id, title, description, event_date) VALUES (?, ?, ?, ?, ?)",
      args: [Date.now().toString(), societyId, title, description, event_date]
    });
  },

  async getAllEvents(societyId: string) {
      const result = await client.execute({
        sql: "SELECT * FROM events WHERE society_id = ? ORDER BY event_date ASC",
        args: [societyId]
      });
      return result.rows;
  }
};
