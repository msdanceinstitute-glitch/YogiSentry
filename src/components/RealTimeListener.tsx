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

    channel.bind("parcel-received", (data: { flat_no: string; recipient_name: string }) => {
      toast.success(`Parcel received for Flat ${data.flat_no} for ${data.recipient_name}`);
    });

    return () => {
      pusher.unsubscribe(`society-${societyId}`);
    };
  }, [societyId]);

  return null;
};
