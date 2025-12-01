"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

type Message = {
  role: "user" | "bot";
  content: string;
};

export default function Chatbot() {
  const pathname = usePathname();

  // Sembunyikan di halaman Admin / Login
  const isHidden = pathname?.startsWith("/admin") || pathname?.startsWith("/login");

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "Halo! Saya asisten virtual Reswara Praptama. Ada yang bisa saya bantu terkait layanan atau proyek kami?" }
  ]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  if (isHidden) return null;

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      
      setMessages((prev) => [...prev, { role: "bot", content: data.reply || "Maaf, terjadi kesalahan." }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "bot", content: "Error koneksi server." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- FUNGSI PEMBERSIH TEKS ---
  // Fungsi ini membuang tanda ** (bold) dan tanda * (italic) agar teks jadi bersih
  const cleanText = (text: string) => {
    return text
      .replace(/\*\*/g, "") // Hapus tanda bold (**)
      .replace(/\*/g, "")   // Hapus tanda italic (*) jika ada
      .replace(/#/g, "");   // Hapus tanda heading (#) jika ada
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-xl transition-all hover:scale-105 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        </button>
      )}

      {isOpen && (
        <div className="bg-white w-[90vw] md:w-96 h-[500px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-blue-700 p-4 text-white flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm">Reswara AI Support</h3>
              <p className="text-xs text-blue-100 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Online
              </p>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-blue-600 p-1 rounded">✕</button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] p-3 text-sm leading-relaxed shadow-sm ${
                  msg.role === "user" 
                    ? "bg-blue-600 text-white rounded-2xl rounded-br-none" 
                    : "bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-bl-none"
                }`}>
                  {/* --- PERUBAHAN ADA DISINI --- */}
                  {/* Kita bersihkan teks sebelum ditampilkan */}
                  {cleanText(msg.content).split('\n').map((line, i) => (
                    <p key={i} className="mb-1 last:mb-0 min-h-[1.2em]">{line}</p>
                  ))}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 px-4 py-2 rounded-2xl rounded-bl-none text-xs text-gray-500 animate-pulse">Sedang mengetik...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Tulis pesan..."
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-800"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-2.5 rounded-full transition-colors shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}