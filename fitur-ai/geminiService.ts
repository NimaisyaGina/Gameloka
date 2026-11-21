import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export interface FileData {
  url?: string;
  data: string;
  mimeType: string;
}

export const geminiService = {
  async sendMessage(prompt: string): Promise<string> {
    if (!API_KEY || API_KEY.startsWith("AIza...")) {
      const resp = await fetch('/api/ai/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt }),
      });
      const json = await resp.json();
      return json.reply || "Maaf, Bang Buay lagi gangguan.";
    }
    const result = await model.generateContent([prompt]);
    return result.response.text();
  },

  async sendMessageWithFile(prompt: string, file: FileData): Promise<string> {
    const base64Data = file.data.includes("base64,")
      ? file.data.split("base64,")[1]
      : file.data;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: file.mimeType,
        },
      },
    ]);
    return result.response.text();
  },

  async sendMessageStream(prompt: string, file: FileData | null) {
    try {
      const content: any[] = [prompt];

      if (file) {
        const base64Data = file.data.includes("base64,")
          ? file.data.split("base64,")[1]
          : file.data;

        content.push({
          inlineData: {
            data: base64Data,
            mimeType: file.mimeType,
          },
        });
      }

      const result = await model.generateContentStream(content);
      return result.stream;
    } catch (error) {
      console.error("Error connecting to Gemini:", error);
      throw error;
    }
  }
};
