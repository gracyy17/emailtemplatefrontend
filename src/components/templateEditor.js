import React, { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { createTemplate } from "../services/api";
import "../styles/templateEditor.css";

const TemplateEditor = ({ onSave, token, selectedTemplate }) => {
  const [name, setName] = useState("");
  const [html, setHtml] = useState("type here...");
  const [recipient, setRecipient] = useState("");
  const [sending, setSending] = useState(false);
  const quillRef = useRef();

  useEffect(() => {
    if (selectedTemplate) {
      setName(selectedTemplate.name + " (Copy)");
      setHtml(selectedTemplate.html);
    }
  }, [selectedTemplate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const design = { body: { rows: [] } };
    const data = await createTemplate({ name, html, design }, token);
    onSave(data);
  };

  const handleImageInsert = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      try {
        const formData = new FormData();
        formData.append("images", file);

        const res = await fetch("http://localhost:5004/api/templates/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await res.json();
        const imageUrl = data.imageUrls?.[0];

        if (imageUrl) {
          const quill = quillRef.current.getEditor();
          const range = quill.getSelection();
          quill.insertEmbed(range.index, "image", imageUrl);
        }
      } catch (err) {
        alert("Image upload failed");
      }
    };
  };

  const handleSendEmail = async () => {
    if (!recipient) return alert("Please enter a recipient email");

    setSending(true);
    try {
      const res = await fetch("http://localhost:5004/api/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: recipient,
          subject: name || "Email Template",
          html,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to send email");
      alert("Email sent successfully");
    } catch (err) {
      alert("Failed to send email: " + err.message);
    } finally {
      setSending(false);
    }
  };

  const quillModules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"],
        ["clean"],
      ],
      handlers: {
        image: handleImageInsert,
      },
    },
  };

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "list",
    "bullet",
    "link",
    "image",
  ];

  return (
    <div className="editor-wrapper">
      {/* LEFT SIDE: Input + Quill + Save Button */}
      <div className="editor-left">
        <input
          type="text"
          placeholder="Template Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="template-name"
        />

        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={html}
          onChange={setHtml}
          modules={quillModules}
          formats={quillFormats}
        />

        <button onClick={handleSubmit} className="save-btn mt-4">
          Save Template
        </button>
      </div>

      {/* RIGHT SIDE: Live Preview + Send to Email */}
      <div className="editor-right">
        <div className="w-full mb-6">
          <h3 className="text-lg font-bold mb-2">Live Preview</h3>
          <div
            className="editor-preview"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>

        <div className="w-full">
          <h3 className="text-lg font-bold mb-2">Send to Email</h3>
          <input
            type="email"
            placeholder="Recipient email"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="template-name"
          />
          <button
            className="save-btn mt-2"
            onClick={handleSendEmail}
            disabled={sending}
          >
            {sending ? "Sending..." : "Send Email"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;
