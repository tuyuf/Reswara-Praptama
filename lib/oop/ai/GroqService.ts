// lib/oop/ai/GroqService.ts
import { BaseAIService } from "./AIService";
import Groq from "groq-sdk";

// ==========================================
// 2. IMPLEMENTATION (Concrete Class)
// ==========================================
export class GroqService extends BaseAIService {
  private groq: Groq;

  constructor(apiKey: string) {
    super(apiKey);
    // ENCAPSULATION: Instance Groq dibungkus privat di dalam class
    this.groq = new Groq({ apiKey: apiKey });
  }

  // POLYMORPHISM: Implementasi "generateReply" khusus untuk Groq
  async generateReply(userMessage: string): Promise<string> {
    try {
      // Menggunakan method warisan dari BaseAIService
      const context = await this.getCompanyContext();

      const systemPrompt = `
        PERAN: Anda adalah "Reswara Bot", Customer Service profesional dari CV. Reswara Praptama.
        
        DATA PERUSAHAAN:
        ${context}

        INSTRUKSI:
        1. Jawablah dengan sopan dan formal dalam Bahasa Indonesia.
        2. Gunakan data perusahaan di atas sebagai referensi utama.
        3. Jawablah secara ringkas, padat, dan membantu.
      `;

      // Request ke Groq API
      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        // Menggunakan model terbaru yang stabil dan cepat
        model: "llama-3.3-70b-versatile",
      });

      return chatCompletion.choices[0]?.message?.content || "Maaf, saya tidak dapat memberikan respon saat ini.";

    } catch (error: any) {
      // EXCEPTION HANDLING
      console.error("Groq Service Error:", error);
      return "Mohon maaf, sistem AI kami sedang sibuk atau sedang dalam pemeliharaan.";
    }
  }
}