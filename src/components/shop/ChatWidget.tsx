"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, MessageCircle, Loader2, ChevronDown, Bot } from "lucide-react";

const ZALO_NUMBER = "0846915120";
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

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Xin chào! Mình là **Ben Johns** — tư vấn viên của PicklePro.\n\nBạn cần hỗ trợ gì về sản phẩm Pickleball không? Mình sẵn sàng giúp! *(Bạn có thể đặt tối đa **3 câu hỏi** — câu thứ 3 mình sẽ tư vấn chốt và gởi bạn qua Zalo để hỗ trợ thêm!)*",
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

      // Lock input after 3rd question (AI already included Zalo CTA in its reply)
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
      {/* Floating Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Mở chat tư vấn"
        style={{
          position: "fixed",
          bottom: 28,
          right: 28,
          zIndex: 9999,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #16a34a, #22c55e)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(22,163,74,0.5)",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.12)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 28px rgba(22,163,74,0.65)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(22,163,74,0.5)";
        }}
      >
        {open ? <ChevronDown size={24} color="#fff" /> : <MessageCircle size={26} color="#fff" />}

        {/* Pulse ring */}
        {!open && (
          <span style={{
            position: "absolute", inset: -4, borderRadius: "50%",
            border: "2px solid rgba(34,197,94,0.5)",
            animation: "chat-pulse 2s ease-in-out infinite",
          }} />
        )}
      </button>

      {/* Chat Panel */}
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
          background: "linear-gradient(135deg, #15803d, #16a34a)",
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
            <Bot size={20} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>Ben Johns – PicklePro AI</div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#86efac", display: "inline-block" }} />
              Đang hoạt động
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
                  width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#15803d,#16a34a)",
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
                  ? "linear-gradient(135deg,#16a34a,#22c55e)"
                  : "#fff",
                color: msg.role === "user" ? "#fff" : "#1a2332",
                fontSize: 13,
                lineHeight: 1.55,
                boxShadow: msg.role === "user" ? "0 2px 8px rgba(22,163,74,0.3)" : "0 1px 4px rgba(0,0,0,0.08)",
                wordBreak: "break-word",
              }}>
                <MarkdownText text={msg.text} />
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#15803d,#16a34a)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Bot size={14} color="#fff" />
              </div>
              <div style={{
                padding: "10px 16px", background: "#fff", borderRadius: "18px 18px 18px 4px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)", display: "flex", alignItems: "center", gap: 5,
              }}>
                <Loader2 size={14} color="#16a34a" style={{ animation: "spin 0.8s linear infinite" }} />
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
            <a
              href={`https://zalo.me/${ZALO_NUMBER}`}
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
              {/* Zalo icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.26 2 11.5c0 2.94 1.4 5.57 3.6 7.38L5 21.5l2.78-1.46A10.1 10.1 0 0 0 12 21c5.52 0 10-4.26 10-9.5S17.52 2 12 2zm1.07 12.76-2.65-2.82-5.05 2.82 5.56-5.89 2.65 2.82 5.04-2.82-5.55 5.89z"/>
              </svg>
              Chat Zalo ngay: {ZALO_NUMBER}
            </a>
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
              onFocus={(e) => (e.target.style.borderColor = "#16a34a")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{
                width: 38, height: 38, borderRadius: 10, border: "none", cursor: "pointer",
                background: loading || !input.trim() ? "#e5e7eb" : "linear-gradient(135deg,#16a34a,#22c55e)",
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
