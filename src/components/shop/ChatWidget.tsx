"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, Bot, User, MessageCircle } from "lucide-react";

interface Message {
  role: "user" | "model";
  text: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "Xin chào! Mình là trợ lý AI PicklePro Bạn cần tư vấn gì?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 200);
  }, [isOpen]);

  const send = async () => {
    const t = input.trim();
    if (!t || loading) return;
    setMessages((p) => [...p, { role: "user", text: t }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: t, history: messages.slice(-8) }),
      });
      const data = await res.json();
      setMessages((p) => [
        ...p,
        { role: "model", text: data.data?.reply || "Xin lỗi, mình gặp trục trặc!" },
      ]);
    } catch {
      setMessages((p) => [...p, { role: "model", text: "Mất kết nối, thử lại nhé!" }]);
    } finally {
      setLoading(false);
    }
  };

  const renderText = (text: string) => {
    return text.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g).map((part, i) => {
      const b = part.match(/^\*\*(.*?)\*\*$/);
      if (b) return <strong key={i}>{b[1]}</strong>;
      const l = part.match(/^\[(.*?)\]\((.*?)\)$/);
      if (l) return <a key={i} href={l[2]} className="text-blue-500 underline underline-offset-2">{l[1]}</a>;
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-50 w-12 h-12 bg-gradient-to-br from-[#6c5ce7] to-[#a29bfe] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          aria-label="Mở chat"
        >
          <MessageCircle size={20} />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 w-[320px] max-w-[calc(100vw-1.5rem)] h-[420px] max-h-[calc(100vh-3rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200/60">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2d3436] to-[#636e72] px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-[#6c5ce7] rounded-lg flex items-center justify-center">
                <Bot size={14} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-xs tracking-wide">PICKLEPRO</h3>
                <p className="text-green-400 text-[9px] font-medium flex items-center gap-1">
                  <span className="w-1 h-1 bg-green-400 rounded-full" /> Online
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors p-1" aria-label="Đóng">
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-gray-50/80">
            {messages.map((msg, i) => (
              <div key={i} className={`flex items-end gap-1.5 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "model" && (
                  <div className="w-5 h-5 bg-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
                    <Bot size={10} className="text-gray-500" />
                  </div>
                )}
                <div className={`max-w-[78%] px-3 py-2 text-[12px] leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-[#6c5ce7] text-white rounded-xl rounded-br-sm"
                    : "bg-white text-gray-700 rounded-xl rounded-bl-sm shadow-sm border border-gray-100"
                }`}>
                  {renderText(msg.text)}
                </div>
                {msg.role === "user" && (
                  <div className="w-5 h-5 bg-[#6c5ce7]/10 rounded-md flex items-center justify-center flex-shrink-0">
                    <User size={10} className="text-[#6c5ce7]" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-end gap-1.5">
                <div className="w-5 h-5 bg-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
                  <Bot size={10} className="text-gray-500" />
                </div>
                <div className="bg-white px-3 py-2 rounded-xl rounded-bl-sm shadow-sm border border-gray-100 flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-2.5 bg-white border-t border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Nhập tin nhắn..."
                disabled={loading}
                className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#6c5ce7]/30 disabled:opacity-50 placeholder:text-gray-400"
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                className="w-8 h-8 bg-[#6c5ce7] text-white rounded-lg flex items-center justify-center hover:opacity-90 active:scale-95 transition-all disabled:opacity-40"
                aria-label="Gửi"
              >
                {loading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
