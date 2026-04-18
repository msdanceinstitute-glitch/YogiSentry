import client from "../src/lib/turso.js";

export const FinancialService = {
  async addExpense(societyId: string, category: string, amount: number, description: string) {
    await client.execute({
      sql: "INSERT INTO expenses (id, society_id, category, amount, description) VALUES (?, ?, ?, ?, ?)",
      args: [Date.now().toString(), societyId, category, amount, description]
    });
  },

  async requestMaintenance(societyId: string, flat_no: string, amount: number, month: string) {
    await client.execute({
      sql: "INSERT INTO maintenance (id, society_id, flat_no, amount, month) VALUES (?, ?, ?, ?, ?)",
      args: [Date.now().toString(), societyId, flat_no, amount, month]
    });
  },

  async markMaintenancePaid(societyId: string, maintenanceId: string) {
    await client.execute({
      sql: "UPDATE maintenance SET status = 'PAID' WHERE id = ? AND society_id = ?",
      args: [maintenanceId, societyId]
    });
  }
};
