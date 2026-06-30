export const generateDocumentContent = async (prompt: string, agents: string[]) => {
  try {
    const response = await fetch("/api/generate-doc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, agents }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate document content");
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Error generating document content:", error);
    throw error;
  }
};
