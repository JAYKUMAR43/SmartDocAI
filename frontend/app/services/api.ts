export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/documents/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("File upload failed");
  }

  return response.json();
};

export const summarizeDocument = async (fileId: string) => {
  const response = await fetch(`${API_URL}/documents/summarize/${fileId}`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Summarization failed");
  }

  return response.json();
};

export const protectDocument = async (fileId: string, password: string) => {
  const response = await fetch(`${API_URL}/documents/protect/${fileId}?password=${encodeURIComponent(password)}`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Protection failed");
  }

  return response.json();
};

export const recreateDocument = async (fileId: string) => {
  const response = await fetch(`${API_URL}/documents/recreate/${fileId}`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Recreation failed");
  }

  return response.json();
};

export const compressImage = async (file: File, targetSizeKb?: number) => {
  const formData = new FormData();
  formData.append("file", file);
  // Default quality 60
  let url = `${API_URL}/media/compress/image?quality=60`;
  if (targetSizeKb) {
    url += `&target_size_kb=${targetSizeKb}`;
  }

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Image compression failed");
  }

  return response.json();
};

export const compressDocument = async (fileId: string) => {
  const response = await fetch(`${API_URL}/documents/compress/${fileId}`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("PDF compression failed");
  }

  return response.json();
};

export const compressVideo = async (file: File, targetSizeKb?: number) => {
  const formData = new FormData();
  formData.append("file", file);
  // CRF 28 (medium compression)
  let url = `${API_URL}/media/compress/video?crf=28`;
  if (targetSizeKb) {
    url += `&target_size_kb=${targetSizeKb}`;
  }

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Video compression failed");
  }

  return response.json();
};

export const chatWithDocument = async (fileId: string, question: string) => {
  const response = await fetch(`${API_URL}/documents/chat/${fileId}?question=${encodeURIComponent(question)}`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Chat request failed");
  }

  return response.json();
};

export const generateReport = async (fileId: string) => {
  const response = await fetch(`${API_URL}/documents/report/${fileId}`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Report generation failed");
  }

  return response.json();
};

export const createDocumentFromContent = async (content: string, format: "docx" | "pdf") => {
  const response = await fetch(`${API_URL}/documents/create/from-content`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content, format }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to create document file");
  }

  return response.json();
};

export const createPdf = async (text: string) => {
  const response = await fetch(`${API_URL}/documents/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error("Failed to create PDF");
  }

  return response.json();
};

export const createPdfFromImages = async (fileIds: string[]) => {
  const response = await fetch(`${API_URL}/documents/create/images`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ file_ids: fileIds }),
  });

  if (!response.ok) {
    throw new Error("Failed to create PDF from images");
  }

  return response.json();
};

export const mergeDocuments = async (fileIds: string[]) => {
  const response = await fetch(`${API_URL}/documents/merge`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ file_ids: fileIds }),
  });

  if (!response.ok) {
    throw new Error("Failed to merge PDFs");
  }

  return response.json();
};

export const splitDocument = async (fileId: string, pages?: number[]) => {
  const response = await fetch(`${API_URL}/documents/split/${fileId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pages }),
  });

  if (!response.ok) {
    throw new Error("Failed to split PDF");
  }

  return response.json();
};
