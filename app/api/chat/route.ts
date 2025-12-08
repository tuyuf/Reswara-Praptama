// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
// import { GeminiService } from "@/lib/oop/ai/AIService"; // <-- Komentar ini
import { GroqService } from "@/lib/oop/ai/GroqService";   // <-- Pakai ini

export async function POST(req: NextRequest) {
  // Pastikan Anda sudah set GROQ_API_KEY di .env
  const apiKey = process.env.GROQ_API_KEY; 
  if (!apiKey) return NextResponse.json({ reply: "Sistem error: API Key tidak ditemukan." });

  // Polymorphism in Action!
  // Kita ubah 'GeminiService' jadi 'GroqService'. 
  // Sisa kode di bawah TIDAK PERLU DIUBAH karena kontraknya sama.
  const chatService = new GroqService(apiKey); 

  try {
    const body = await req.json();
    const reply = await chatService.generateReply(body.message);
    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json({ reply: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}