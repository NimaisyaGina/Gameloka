import { GoogleGenerativeAI } from "@google/generative-ai";

// ⚠️ Pastikan API KEY kamu sudah benar di sini
const API_KEY = "AIza..."; 

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export interface FileData {
  url?: string; // <--- Tanda tanya ini kuncinya! (Artinya: url boleh kosong)
  data: string;
  mimeType: string;
}

export const geminiService = {
  async sendMessageStream(prompt: string, file: FileData | null) {
    try {
      let content: any[] = [prompt];

      if (file) {
        // Ambil data base64 murni (buang bagian header 'data:image/...')
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