import logo from "./logo.svg";
import "./App.css";
import React, { useEffect, useState } from "react";
import TemplateEditor from "./components/templateEditor";
import SavedTemplates from "./components/savedTemplates";
import "react-quill/dist/quill.snow.css";

function App() {
  const [token] = useState(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2UzNTUxYjA4ZjdkNmE2MDZjNGZkNzgiLCJyb2xlIjoidXNlciIsImluc3RpdHV0ZSI6IkNvbGxlZ2Ugb2YgRW5naW5lZXJpbmciLCJ2ZXJzaW9uIjozLCJpYXQiOjE3NTE5NTUxNjQsImV4cCI6MTc1MTk1ODc2NH0.2k-TXlgIXbx3upAzJQYCjeyi09fAktxjRY2tcCLNNyY"
  );
  const [refreshKey, setRefreshKey] = useState(0);

  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleReuse = (tpl) => {
    setSelectedTemplate(tpl);
  };

  useEffect(() => {
    fetch("http://localhost:5004/api/templates", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => console.log("Templates:", data))
      .catch((err) => console.error("Fetch error:", err.message));
  }, [token]);

  const handleSave = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Email Template Builder</h1>
      <TemplateEditor
        onSave={handleSave}
        token={token}
        selectedTemplate={selectedTemplate}
      />
      <SavedTemplates
        key={refreshKey}
        token={token}
        onUseTemplate={handleReuse}
      />
    </div>
  );
}

export default App;
