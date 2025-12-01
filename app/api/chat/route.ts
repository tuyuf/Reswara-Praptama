import { NextRequest, NextResponse } from "next/server";

// Helper: Ambil data dari API Context (REAL TIME)
async function fetchContext(baseUrl: string) {
  try {
    const res = await fetch(`${baseUrl}/api/context`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "API Key Missing" }, { status: 500 });

    const protocol = req.nextUrl.protocol; 
    const host = req.headers.get("host");
    const baseUrl = `${protocol}//${host}`;
    
    const contextData = await fetchContext(baseUrl);
    const contextString = contextData 
      ? JSON.stringify(contextData, null, 2) 
      : "Informasi detail perusahaan sedang tidak dapat diakses.";

    // Auto-Detect Model
    let modelName = "gemini-1.5-flash"; 
    try {
        const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const listData = await listRes.json();
        if (listData.models) {
            const validModel = listData.models.find((m: any) => 
                (m.name.includes("gemini-1.5-flash") || m.name.includes("gemini-pro")) && 
                m.supportedGenerationMethods.includes("generateContent")
            );
            if (validModel) modelName = validModel.name.replace("models/", "");
        }
    } catch(e) {}

    const body = await req.json();

    // --- BAGIAN INI YANG DIUBAH (SYSTEM PROMPT) ---
    const systemPrompt = `
      PERAN: Anda adalah "Reswara Bot", Asisten Virtual profesional dan ramah dari CV. Reswara Praptama.
      
      PENGETAHUAN PERUSAHAAN (CONTEXT):
      ${contextString}

      ATURAN MENJAWAB (PENTING):
      1. Jawablah langsung ke intinya dengan bahasa Indonesia yang sopan dan formal.
      2. JANGAN PERNAH menggunakan frasa seperti: "berdasarkan data kami", "menurut database", "dari informasi di atas", atau "catatan kami".
         - SALAH: "Berdasarkan data kami, Reswara berlokasi di Semarang."
         - BENAR: "CV. Reswara Praptama berlokasi di Semarang, Jawa Tengah."
      3. Jika informasi tidak ditemukan di Context, JANGAN bilang "data tidak ada".
         - Katakan: "Mohon maaf, untuk informasi spesifik tersebut, silakan hubungi tim Admin kami langsung melalui WhatsApp agar lebih jelas."
      4. Bertindaklah seolah-olah Anda adalah staf Customer Service manusia yang tahu segalanya tentang perusahaan ini.
      5. Jika ditanya harga/biaya, arahkan untuk konsultasi lebih lanjut.
    `;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\nUser: ${body.message}\nAI:` }] }]
      }),
    });

    const result = await response.json();
    const botReply = result.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, saya sedang memproses permintaan Anda.";
    
    return NextResponse.json({ reply: botReply });

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}