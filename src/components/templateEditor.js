import React, { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { createTemplate } from "../services/api";
import "../styles/templateEditor.css";

const TemplateEditor = ({ onSave, token, selectedTemplate }) => {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("type here...");
  const [recipient, setRecipient] = useState("");
  const [sending, setSending] = useState(false);
  const [usedImages, setUsedImages] = useState([]);
  const quillRef = useRef();
  const editorTopRef = useRef(null);
useEffect(() => {
  if (selectedTemplate) {
    setName(selectedTemplate.name + " (Copy)");
    setSubject(selectedTemplate.subject || "");
    setHtml(selectedTemplate.html);

    // Scroll to top when reusing template
    setTimeout(() => {
          window.scrollTo({ top: 125, behavior: "smooth" });
    }, 100);
  }
}, [selectedTemplate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const design = { body: { rows: [] } };
    const data = await createTemplate({ name, subject, html, design }, token);
    onSave(data);
  };

const handleImageInsert = () => {
  const input = document.createElement("input");
  input.setAttribute("type", "file");
  input.setAttribute("accept", "image/*");
  input.setAttribute("multiple", "true");
  input.click();

  input.onchange = async () => {
    const files = Array.from(input.files);
    if (!files.length) return;

    for (const file of files) {
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
        const imageUrl = Array.isArray(data.imageUrls) ? data.imageUrls[0] : null;

        if (imageUrl) {
          const quill = quillRef.current.getEditor();
          const range = quill.getSelection(true);
          const insertIndex = range?.index ?? quill.getLength();

          // Insert each image at current cursor position in a paragraph block
          quill.clipboard.dangerouslyPasteHTML(
            insertIndex,
            `<p><img src="${imageUrl}" style="display:block; max-width:100%; height:auto; margin:12px 0;" /></p>`
          );

          const uploadedName = imageUrl.split("/").pop();
          setUsedImages((prev) => [...prev, { file, name: uploadedName }]);
        } else {
          console.warn("No imageUrl returned from server:", data);
          alert("Image upload failed: Invalid server response.");
        }
      } catch (err) {
        console.error("Image upload error:", err);
        alert("Image upload failed.");
      }
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
      [{ font: [] }],                      
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
    "font",
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
      <div className="editor-left">
<h3 ref={editorTopRef} className="editor-title">Compose Email</h3>
        <div className="editor-input-row">
          <div className="input-group">
            <label htmlFor="template-name">Template Name</label>
            <input
              id="template-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="template-name"
            />
          </div>

          <div className="input-group">
            <label htmlFor="subject-name">Subject</label>
            <input
              id="subject-name"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="subject-name"
            />
          </div>
        </div>

        <div className="editor-quill-wrapper">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={html}
            onChange={setHtml}
            modules={quillModules}
            formats={quillFormats}
          />
        </div>

        <button onClick={handleSubmit} className="save-btn">
          Save Template
        </button>
      </div>

      {/* RIGHT SIDE: Live Preview + Send to Email */}
      <div className="editor-right">
        <div className="editor-section editor-preview-section">
          <h3 className="editor-section-title">Live Preview</h3>
            <div className="editor-preview">
              {subject && (
                <h2>{subject}</h2>
              )}
              <div dangerouslySetInnerHTML={{ __html: html }} />
            </div>
        </div>

        <div className="editor-section editor-send-section">
          <div className="input-group">
          <label htmlFor="recipient-email" className="editor-label">Send to</label>
          <input
            type="email"
            placeholder="Recipient email"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="template-name editor-input"
          />
          </div>
          <button
            className="save-btn editor-send-btn"
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
