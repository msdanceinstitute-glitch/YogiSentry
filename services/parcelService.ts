import client from "../src/lib/turso.js";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export const ParcelService = {
  async addParcel(societyId: string, flat_no: string, recipient_name: string, photo_url: string) {
    const id = Date.now().toString();
    await client.execute({
      sql: "INSERT INTO parcels (id, society_id, flat_no, recipient_name, photo_url) VALUES (?, ?, ?, ?, ?)",
      args: [id, societyId, flat_no, recipient_name, photo_url]
    });

    // Notify Resident
    await pusher.trigger(`society-${societyId}`, "parcel-received", {
      flat_no, recipient_name, parcelId: id
    });
  }
};
