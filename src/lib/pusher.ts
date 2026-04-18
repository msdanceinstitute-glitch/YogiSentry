import Pusher from "pusher-js";

// Initialize Pusher client
export const pusher = new Pusher((import.meta as any).env.VITE_PUSHER_KEY, {
  cluster: (import.meta as any).env.VITE_PUSHER_CLUSTER,
});
