// lib/oop/ai/AIService.ts

// ==========================================
// 1. ABSTRACTION (Abstract Base Class)
// ==========================================
export abstract class BaseAIService {
    protected apiKey: string;
  
    constructor(apiKey: string) {
      this.apiKey = apiKey;
    }
  
    // Method umum untuk mengambil data perusahaan (Context) - INHERITANCE
    protected async getCompanyContext(): Promise<string> {
      try {
        // Mengambil data dari API context lokal
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/context`);
        
        if (!res.ok) return "Data perusahaan dasar (Nama: CV. Reswara Praptama, Bidang: Kontraktor/Konsultan).";
        
        const data = await res.json();
        return JSON.stringify(data, null, 2);
      } catch (e) {
        return "Data perusahaan saat ini tidak tersedia. Jawablah secara umum sebagai CV. Reswara Praptama.";
      }
    }
  
    // Abstract method yang wajib diimplementasikan oleh kelas anak - POLYMORPHISM
    abstract generateReply(userMessage: string): Promise<string>;
  }