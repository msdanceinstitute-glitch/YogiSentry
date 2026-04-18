import { useState, useEffect } from "react";

export const Notices = () => {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    fetch("/api/communication/notices", {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(data => setNotices(data));
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Notices</h2>
      {notices.map((n: any) => (
        <div key={n.id} className="mb-2 p-2 border-b">
          <h3 className="font-semibold">{n.title}</h3>
          <p className="text-sm">{n.content}</p>
        </div>
      ))}
    </div>
  );
};
