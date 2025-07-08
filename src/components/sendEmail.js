import React, { useState } from "react";

const SendEmail = ({ html, token }) => {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [images, setImages] = useState([]);

  const replaceImageSrcWithCid = (html, images) => {
    let newHtml = html;
    for (let i = 0; i < images.length; i++) {
      // Get the filename
      const file = images[i];
      // Regex to match the src attribute with the filename
      const regex = new RegExp(
        `src=["'].*${file.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`,
        "g"
      );
      // Replace with cid
      newHtml = newHtml.replace(regex, `src="cid:image${i}@mcp"`);
    }
    return newHtml;
  };

  const handleSend = async () => {
    const formData = new FormData();
    formData.append("to", to);
    formData.append("subject", subject);

    // Replace image src in HTML with cid references
    const htmlWithCid = replaceImageSrcWithCid(html, images);
    formData.append("html", htmlWithCid);

    for (let i = 0; i < images.length; i++) {
      formData.append("images", images[i]);
    }

    const res = await fetch("http://localhost:5004/api/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Do NOT set Content-Type; browser will set it automatically for FormData
      },
      body: formData,
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
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => setImages(e.target.files)}
      />
      <button onClick={handleSend}>Send Email</button>
    </div>
  );
};

export default SendEmail;