import { useState } from "react";
import { Button } from "./ui/button"; // Assuming shadcn structure
import { Input } from "./ui/input";

export const Parcels = () => {
  const [flatNo, setFlatNo] = useState("");
  const [recipient, setRecipient] = useState("");

  const handleAddParcel = async () => {
    const token = localStorage.getItem("token");
    await fetch("/api/parcels/add", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify({ 
        flat_no: flatNo, 
        recipient_name: recipient,
        photo_url: "https://via.placeholder.com/150" // Placeholder until camera implemented
      }),
    });
    setFlatNo("");
    setRecipient("");
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Log Parcel</h2>
      <Input placeholder="Flat Number" value={flatNo} onChange={(e) => setFlatNo(e.target.value)} className="mb-2" />
      <Input placeholder="Recipient Name" value={recipient} onChange={(e) => setRecipient(e.target.value)} className="mb-4" />
      <Button onClick={handleAddParcel}>Save Parcel</Button>
    </div>
  );
};
