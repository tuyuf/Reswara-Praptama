"use client";

import React, { Component, createRef } from "react";
import { Send, X, MessageCircle } from "lucide-react"; // Ikon

// Definisi Tipe State & Props (Encapsulation)
interface Message {
  role: "user" | "bot";
  content: string;
}

interface ChatbotState {
  isOpen: boolean;
  messages: Message[];
  input: string;
  isLoading: boolean;
}

// 1. INHERITANCE: Mewarisi sifat React.Component
class ChatbotClass extends Component<{}, ChatbotState> {
  // Ref untuk scroll otomatis
  private messagesEndRef = createRef<HTMLDivElement>();

  constructor(props: {}) {
    super(props);
    // 2. ENCAPSULATION: State tersimpan privat di dalam instance kelas
    this.state = {
      isOpen: false,
      messages: [{ role: "bot", content: "Halo! Ada yang bisa saya bantu tentang Reswara?" }],
      input: "",
      isLoading: false,
    };
  }

  // Lifecycle Method (Khas Class Component)
  componentDidUpdate(prevProps: {}, prevState: ChatbotState) {
    // Scroll ke bawah jika ada pesan baru atau chat dibuka
    if (prevState.messages.length !== this.state.messages.length || (this.state.isOpen && !prevState.isOpen)) {
      this.scrollToBottom();
    }
  }

  scrollToBottom = () => {
    this.messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Logic Handler
  handleSendMessage = async () => {
    const { input } = this.state;
    if (!input.trim()) return;

    // Update UI optimistic
    this.setState((prev) => ({
      messages: [...prev.messages, { role: "user", content: input }],
      input: "",
      isLoading: true,
    }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();

      this.setState((prev) => ({
        messages: [...prev.messages, { role: "bot", content: data.reply }],
        isLoading: false,
      }));
    } catch (error) {
      // 3. EXCEPTION HANDLING: UI Feedback
      this.setState((prev) => ({
        messages: [...prev.messages, { role: "bot", content: "Error: Gagal terhubung ke server." }],
        isLoading: false,
      }));
    }
  };

  render() {
    const { isOpen, messages, input, isLoading } = this.state;

    // Jika tertutup, render tombol bubble
    if (!isOpen) {
      return (
        <button
          onClick={() => this.setState({ isOpen: true })}
          className="fixed bottom-6 right-6 bg-[#2a5f91] text-white p-4 rounded-full shadow-xl hover:scale-105 transition-transform"
        >
          <MessageCircle size={28} />
        </button>
      );
    }

    // Jika terbuka, render window chat
    return (
      <div className="fixed bottom-6 right-6 w-[90vw] md:w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden font-sans z-50">
        {/* Header */}
        <div className="bg-[#2a5f91] p-4 text-white flex justify-between items-center">
          <h3 className="font-bold">Reswara Bot (OOP)</h3>
          <button onClick={() => this.setState({ isOpen: false })}>
            <X size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] p-3 text-sm rounded-2xl ${
                  msg.role === "user"
                    ? "bg-[#2a5f91] text-white rounded-br-none"
                    : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && <p className="text-xs text-gray-500 animate-pulse">Sedang mengetik...</p>}
          <div ref={this.messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 border-t bg-white flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => this.setState({ input: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && this.handleSendMessage()}
            placeholder="Tulis pesan..."
            className="flex-1 px-4 py-2 border rounded-full text-sm outline-none focus:border-[#2a5f91] focus:ring-1 focus:ring-[#2a5f91] text-gray-800"
            disabled={isLoading}
          />
          <button
            onClick={this.handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-[#2a5f91] text-white p-2 rounded-full hover:bg-[#2a5f91] disabled:bg-gray-300"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    );
  }
}

export default ChatbotClass;