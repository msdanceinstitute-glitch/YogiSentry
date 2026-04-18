import { useEffect } from "react";
import { pusher } from "../lib/pusher.js";
import { useStore } from "../store/index.js";
import { toast } from "sonner";

export const RealTimeListener = () => {
  const { currentUser } = useStore();
  const societyId = currentUser?.societyId;

  useEffect(() => {
    if (!societyId) return;

    const channel = pusher.subscribe(`society-${societyId}`);

    channel.bind("visitor-request", (data: { visitor_name: string; flat_no: string }) => {
      toast.info(`New Visitor! ${data.visitor_name} is at the gate for Flat ${data.flat_no}`);
    });
    
    channel.bind("parcel-received", (data: { flat_no: string; recipient_name: string }) => {
      toast.success(`Parcel received for Flat ${data.flat_no}`);
    });

    channel.bind("new-complaint", (data: { complaintId: string; flat_no: string }) => {
      toast.warning(`New Complaint from Flat ${data.flat_no}`);
    });

    return () => {
      pusher.unsubscribe(`society-${societyId}`);
    };
  }, [societyId]);

  return null;
};
