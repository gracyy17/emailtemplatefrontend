const API_URL = "http://localhost:5004/api/templates";

const token = localStorage.getItem("token");

export const fetchTemplates = async (token) => {
  const res = await fetch("http://localhost:5004/api/templates", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
};

export const createTemplate = async (data, token) => {
  const res = await fetch("http://localhost:5004/api/templates", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};