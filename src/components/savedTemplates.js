// src/components/SavedTemplates.js
import React, { useEffect, useState } from "react";
import "../styles/savedTemplates.css";

const SavedTemplates = ({ token, onUseTemplate }) => {
  const [templates, setTemplates] = useState([]);

  const fetchTemplates = async () => {
    const res = await fetch("http://localhost:5004/api/templates", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (Array.isArray(data)) {
      setTemplates(data);
    } else {
      setTemplates([]); // fallback in case of bad response
    }
  };

  const deleteTemplate = async (id) => {
    await fetch(`http://localhost:5004/api/templates/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    fetchTemplates();
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return (
    <div className="saved-templates-wrapper">
      <h2>Saved Templates</h2>

      <div className="flex-table-header">
        <div className="col-name">Name</div>
        <div className="col-preview">Preview</div>
        <div className="col-actions">Actions</div>
      </div>

      {templates.map((tpl) => (
        <div className="flex-table-row" key={tpl._id}>
          <div className="col-name">{tpl.name}</div>
          <div
            className="col-preview saved-template-html"
            dangerouslySetInnerHTML={{ __html: tpl.html }}
          />
          <div className="col-actions">
            <button onClick={() => onUseTemplate?.(tpl)}>Reuse</button>
            <button onClick={() => deleteTemplate(tpl._id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SavedTemplates;
