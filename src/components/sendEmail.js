import React, { useState } from "react";

const SendEmail = ({ html, token }) => {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");

  const handleSend = async () => {
    const res = await fetch("http://localhost:5004/api/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ to, subject, html }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("Email sent!");
    } else {
      alert("Error sending: " + data.message);
    }
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <h3>Send Email</h3>
      <input
        type="email"
        placeholder="Recipient Email"
        value={to}
        onChange={(e) => setTo(e.target.value)}
      />
      <input
        type="text"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <button onClick={handleSend}>Send Email</button>
    </div>
  );
};

export default SendEmail;
