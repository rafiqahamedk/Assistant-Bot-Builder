const BASE_URL = "http://127.0.0.1:8000";

const handleResponse = async (res) => {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Server error: ${res.status}`);
  }
  return res.json();
};

export const trainText = async (text) => {
  const formData = new FormData();
  formData.append("content", text);

  const res = await fetch(`${BASE_URL}/train/text`, {
    method: "POST",
    body: formData,
  });

  return handleResponse(res);
};

export const trainPDF = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/train/pdf`, {
    method: "POST",
    body: formData,
  });

  return handleResponse(res);
};

export const askBot = async (question) => {
  const formData = new FormData();
  formData.append("question", question);

  const res = await fetch(`${BASE_URL}/ask`, {
    method: "POST",
    body: formData,
  });

  return handleResponse(res);
};