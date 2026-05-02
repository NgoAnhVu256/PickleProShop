"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, ChevronDown, Sparkles, Bot } from "lucide-react";

const QUESTION_LIMIT = 3;

type Message = {
  role: "user" | "assistant";
  text: string;
};

function MarkdownText({ text }: { text: string }) {
  const html = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#16a34a;text-decoration:underline;font-weight:600" target="_blank" rel="noopener">$1</a>')
    .replace(/\n/g, "<br/>");
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

/* ─── SVG Icons ─── */
function ZaloIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="24" fill="#0068FF" />
      <path d="M32.5 15.5H15.5C14.1 15.5 13 16.6 13 18V30C13 31.4 14.1 32.5 15.5 32.5H20L24 36L28 32.5H32.5C33.9 32.5 35 31.4 35 30V18C35 16.6 33.9 15.5 32.5 15.5Z" fill="white"/>
      <path d="M19.5 27.5L22 22H19V21H24V22.5L21.5 27.5H24.5V29H19.5V27.5Z" fill="#0068FF"/>
      <path d="M25 25C25 23.3 26.3 22 28 22C29.7 22 31 23.3 31 25V26C31 27.7 29.7 29 28 29C26.3 29 25 27.7 25 26V25ZM27 25V26C27 26.6 27.4 27 28 27C28.6 27 29 26.6 29 26V25C29 24.4 28.6 24 28 24C27.4 24 27 24.4 27 25Z" fill="#0068FF"/>
    </svg>
  );
}

function MessengerIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="24" fill="url(#messenger-grad)" />
      <path d="M24 13C17.9 13 13 17.5 13 23.1C13 26.3 14.6 29.1 17.1 30.9V35L20.9 32.9C21.9 33.2 22.9 33.3 24 33.3C30.1 33.3 35 28.8 35 23.2C35 17.5 30.1 13 24 13ZM25.2 26.1L22.4 23.1L17 26.1L23 19.8L25.8 22.8L31.1 19.8L25.2 26.1Z" fill="white"/>
      <defs>
        <linearGradient id="messenger-grad" x1="0" y1="48" x2="48" y2="0">
          <stop stopColor="#0099FF" />
          <stop offset="1" stopColor="#A033FF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function ChatWidget({
  zaloLink = "",
  messengerLink = "",
}: {
  zaloLink?: string;
  messengerLink?: string;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Xin chào! Mình là **PicklePro AI** — tư vấn viên của PicklePro.\n\nBạn cần hỗ trợ gì?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [limitReached, setLimitReached] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading || limitReached) return;

    const newCount = questionCount + 1;
    const isLastQuestion = newCount >= QUESTION_LIMIT;
    setQuestionCount(newCount);
    setInput("");

    const userMsg: Message = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.role !== "assistant" || messages.indexOf(m) > 0)
        .map((m) => ({ role: m.role === "assistant" ? "model" : "user", text: m.text }));

      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history, isLastQuestion }),
      });

      const data = await res.json();
      const reply = data?.data?.reply || "Mình gặp sự cố nhỏ, bạn thử lại nhé!";

      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);

      if (isLastQuestion) {
        setLimitReached(true);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Mình gặp lỗi kết nối. Bạn thử lại sau nhé!" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const remaining = QUESTION_LIMIT - questionCount;

  return (
    <>
      {/* ═══ Floating Action Buttons (Bottom Right) ═══ */}
      <div
        style={{
          position: "fixed",
          bottom: 28,
          right: 28,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* Zalo Button */}
        {zaloLink && (
          <a
            href={zaloLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat Zalo"
            title="Chat Zalo"
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 16px rgba(0,104,255,0.4)",
              transition: "transform 0.2s",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.15)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)"; }}
          >
            <ZaloIcon size={48} />
          </a>
        )}

        {/* Messenger Button */}
        {messengerLink && (
          <a
            href={messengerLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat Messenger"
            title="Chat Messenger"
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 16px rgba(160,51,255,0.4)",
              transition: "transform 0.2s",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.15)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)"; }}
          >
            <MessengerIcon size={48} />
          </a>
        )}

        {/* AI Chat Button */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Mở chat tư vấn AI"
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 20px rgba(124,58,237,0.5)",
            transition: "transform 0.2s, box-shadow 0.2s",
            position: "relative",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.12)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 28px rgba(124,58,237,0.65)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(124,58,237,0.5)";
          }}
        >
          {open ? <ChevronDown size={24} color="#fff" /> : <Sparkles size={26} color="#fff" />}

          {/* Pulse ring */}
          {!open && (
            <span style={{
              position: "absolute", inset: -4, borderRadius: "50%",
              border: "2px solid rgba(168,85,247,0.5)",
              animation: "chat-pulse 2s ease-in-out infinite",
            }} />
          )}
        </button>
      </div>

      {/* ═══ Chat Panel ═══ */}
      <div
        style={{
          position: "fixed",
          bottom: 100,
          right: 28,
          zIndex: 9998,
          width: 360,
          maxWidth: "calc(100vw - 40px)",
          height: 520,
          borderRadius: 20,
          background: "#fff",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transform: open ? "scale(1) translateY(0)" : "scale(0.85) translateY(20px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transformOrigin: "bottom right",
          transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease",
        }}
      >
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #7c3aed, #a855f7)",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <Sparkles size={20} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>PicklePro AI</div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#86efac", display: "inline-block" }} />
              Tư vấn thông minh
            </div>
          </div>
          {/* Question counter badge */}
          {!limitReached && (
            <div style={{
              background: remaining <= 1 ? "rgba(239,68,68,0.25)" : "rgba(255,255,255,0.2)",
              borderRadius: 20,
              padding: "3px 10px",
              fontSize: 11,
              color: "#fff",
              fontWeight: 600,
              flexShrink: 0,
            }}>
              {remaining} câu còn lại
            </div>
          )}
          <button
            onClick={() => setOpen(false)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.75)", padding: 4, display: "flex" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          background: "#f8fafb",
        }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                alignItems: "flex-end",
                gap: 6,
              }}
            >
              {msg.role === "assistant" && (
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginBottom: 2,
                }}>
                  <Bot size={14} color="#fff" />
                </div>
              )}
              <div style={{
                maxWidth: "78%",
                padding: "9px 13px",
                borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background: msg.role === "user"
                  ? "linear-gradient(135deg,#7c3aed,#a855f7)"
                  : "#fff",
                color: msg.role === "user" ? "#fff" : "#1a2332",
                fontSize: 13,
                lineHeight: 1.55,
                boxShadow: msg.role === "user" ? "0 2px 8px rgba(124,58,237,0.3)" : "0 1px 4px rgba(0,0,0,0.08)",
                wordBreak: "break-word",
              }}>
                <MarkdownText text={msg.text} />
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Bot size={14} color="#fff" />
              </div>
              <div style={{
                padding: "10px 16px", background: "#fff", borderRadius: "18px 18px 18px 4px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)", display: "flex", alignItems: "center", gap: 5,
              }}>
                <Loader2 size={14} color="#7c3aed" style={{ animation: "spin 0.8s linear infinite" }} />
                <span style={{ fontSize: 12, color: "#9ca3af" }}>Đang trả lời...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Limit reached CTA */}
        {limitReached && (
          <div style={{
            padding: "12px 14px",
            background: "linear-gradient(135deg,#fef9ec,#fef3c7)",
            borderTop: "1px solid #fde68a",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}>
            <p style={{ fontSize: 12, color: "#92400e", fontWeight: 600, textAlign: "center", margin: 0 }}>
              Hết lượt hỏi miễn phí — Liên hệ Zalo để tiếp tục tư vấn!
            </p>
            {zaloLink && (
              <a
                href={zaloLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "linear-gradient(135deg,#0068ff,#0ea5e9)",
                  color: "#fff", borderRadius: 10, padding: "9px 20px",
                  fontSize: 13, fontWeight: 700, textDecoration: "none",
                  boxShadow: "0 3px 10px rgba(0,104,255,0.35)",
                  transition: "transform 0.15s",
                }}
              >
                <ZaloIcon size={20} />
                Chat Zalo ngay
              </a>
            )}
          </div>
        )}

        {/* Input */}
        {!limitReached && (
          <div style={{
            padding: "10px 12px",
            borderTop: "1px solid #eef2f7",
            background: "#fff",
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={loading ? "Đang trả lời..." : "Nhập câu hỏi..."}
              disabled={loading}
              style={{
                flex: 1, border: "1.5px solid #e5e7eb", borderRadius: 12,
                padding: "9px 14px", fontSize: 13, outline: "none", fontFamily: "inherit",
                background: loading ? "#f9fafb" : "#fff", color: "#1a2332",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{
                width: 38, height: 38, borderRadius: 10, border: "none", cursor: "pointer",
                background: loading || !input.trim() ? "#e5e7eb" : "linear-gradient(135deg,#7c3aed,#a855f7)",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.2s, transform 0.15s",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => { if (!loading && input.trim()) (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.08)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
            >
              <Send size={16} color={loading || !input.trim() ? "#9ca3af" : "#fff"} />
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes chat-pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.3); opacity: 0; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
