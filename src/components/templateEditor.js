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
  const [usedImages, setUsedImages] = useState([]);
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
  input.setAttribute("multiple", "true"); // allow multiple selection
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
        const imageUrl = data.imageUrls?.[0];

        if (imageUrl) {
          const quill = quillRef.current.getEditor();
          const insertIndex = quill.getLength(); // insert at end

          // Insert each image on its own line (block format)
          quill.clipboard.dangerouslyPasteHTML(
            insertIndex,
            `<p><img src="${imageUrl}" style="display:block; max-width:100%; height:auto; margin:12px 0;" /></p>`
          );

          const uploadedName = imageUrl.split("/").pop();
          setUsedImages((prev) => [...prev, { file, name: uploadedName }]);
        }
      } catch (err) {
        alert("Image upload failed");
      }
    }
  };
};

const handleSendEmail = async () => {
  if (!recipient) return alert("Please enter a recipient email");

  setSending(true);

  try {
    const formData = new FormData();
    formData.append("to", recipient);
    formData.append("subject", name || "Email Template");

    let htmlWithCid = html;

    usedImages.forEach((img, idx) => {
      
      const regex = new RegExp(`src=["'][^"']*${img.name}["']`, "g");
      htmlWithCid = htmlWithCid.replace(regex, `src="cid:image${idx}@mcp"`);

      //  Append actual image file
      formData.append("images", img.file);
    });

    formData.append("html", htmlWithCid);

    const res = await fetch("http://localhost:5004/api/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
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
