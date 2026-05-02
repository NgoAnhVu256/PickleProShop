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
    <svg width={size} height={size} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M22.782 0.166016H27.199C33.2653 0.166016 36.8103 1.05701 39.9572 2.74421C43.1041 4.4314 45.5875 6.89585 47.2557 10.0428C48.9429 13.1897 49.8339 16.7347 49.8339 22.801V27.1991C49.8339 33.2654 48.9429 36.8104 47.2557 39.9573C45.5685 43.1042 43.1041 45.5877 39.9572 47.2559C36.8103 48.9431 33.2653 49.8341 27.199 49.8341H22.8009C16.7346 49.8341 13.1896 48.9431 10.0427 47.2559C6.89583 45.5687 4.41243 43.1042 2.7442 39.9573C1.057 36.8104 0.166016 33.2654 0.166016 27.1991V22.801C0.166016 16.7347 1.057 13.1897 2.7442 10.0428C4.43139 6.89585 6.89583 4.41245 10.0427 2.74421C13.1707 1.05701 16.7346 0.166016 22.782 0.166016Z" fill="#0068FF"/>
      <path opacity="0.12" fillRule="evenodd" clipRule="evenodd" d="M49.8336 26.4736V27.1994C49.8336 33.2657 48.9427 36.8107 47.2555 39.9576C45.5683 43.1045 43.1038 45.5879 39.9569 47.2562C36.81 48.9434 33.265 49.8344 27.1987 49.8344H22.8007C17.8369 49.8344 14.5612 49.2378 11.8104 48.0966L7.27539 43.4267L49.8336 26.4736Z" fill="#001A33"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M7.779 43.5892C10.1019 43.846 13.0061 43.1836 15.0682 42.1825C24.0225 47.1318 38.0197 46.8954 46.4923 41.4732C46.8209 40.9803 47.1279 40.4677 47.4128 39.9363C49.1062 36.7779 50.0004 33.22 50.0004 27.1316V22.7175C50.0004 16.629 49.1062 13.0711 47.4128 9.91273C45.7385 6.75436 43.2461 4.28093 40.0877 2.58758C36.9293 0.894239 33.3714 0 27.283 0H22.8499C17.6644 0 14.2982 0.652754 11.4699 1.89893C11.3153 2.03737 11.1636 2.17818 11.0151 2.32135C2.71734 10.3203 2.08658 27.6593 9.12279 37.0782C9.13064 37.0921 9.13933 37.1061 9.14889 37.1203C10.2334 38.7185 9.18694 41.5154 7.55068 43.1516C7.28431 43.399 7.37944 43.5512 7.779 43.5892Z" fill="white"/>
      <path d="M20.5632 17H10.8382V19.0853H17.5869L10.9329 27.3317C10.7244 27.635 10.5728 27.9194 10.5728 28.5639V29.0947H19.748C20.203 29.0947 20.5822 28.7156 20.5822 28.2606V27.1421H13.4922L19.748 19.2938C19.8428 19.1801 20.0134 18.9716 20.0893 18.8768L20.1272 18.8199C20.4874 18.2891 20.5632 17.8341 20.5632 17.2844V17Z" fill="#0068FF"/>
      <path d="M32.9416 29.0947H34.3255V17H32.2402V28.3933C32.2402 28.7725 32.5435 29.0947 32.9416 29.0947Z" fill="#0068FF"/>
      <path d="M25.814 19.6924C23.1979 19.6924 21.0747 21.8156 21.0747 24.4317C21.0747 27.0478 23.1979 29.171 25.814 29.171C28.4301 29.171 30.5533 27.0478 30.5533 24.4317C30.5723 21.8156 28.4491 19.6924 25.814 19.6924ZM25.814 27.2184C24.2785 27.2184 23.0273 25.9672 23.0273 24.4317C23.0273 22.8962 24.2785 21.645 25.814 21.645C27.3495 21.645 28.6007 22.8962 28.6007 24.4317C28.6007 25.9672 27.3685 27.2184 25.814 27.2184Z" fill="#0068FF"/>
      <path d="M40.4867 19.6162C37.8516 19.6162 35.7095 21.7584 35.7095 24.3934C35.7095 27.0285 37.8516 29.1707 40.4867 29.1707C43.1217 29.1707 45.2639 27.0285 45.2639 24.3934C45.2639 21.7584 43.1217 19.6162 40.4867 19.6162ZM40.4867 27.2181C38.9322 27.2181 37.681 25.9669 37.681 24.4124C37.681 22.8579 38.9322 21.6067 40.4867 21.6067C42.0412 21.6067 43.2924 22.8579 43.2924 24.4124C43.2924 25.9669 42.0412 27.2181 40.4867 27.2181Z" fill="#0068FF"/>
      <path d="M29.4562 29.0944H30.5747V19.957H28.6221V28.2793C28.6221 28.7153 29.0012 29.0944 29.4562 29.0944Z" fill="#0068FF"/>
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
  chatbotAvatar = "",
}: {
  zaloLink?: string;
  messengerLink?: string;
  chatbotAvatar?: string;
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
          {open ? (
            <ChevronDown size={24} color="#fff" />
          ) : chatbotAvatar ? (
            <img src={chatbotAvatar} alt="Chat AI" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
          ) : (
            <Sparkles size={26} color="#fff" />
          )}

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
            background: chatbotAvatar ? "transparent" : "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            overflow: "hidden",
          }}>
            {chatbotAvatar ? (
              <img src={chatbotAvatar} alt="AI" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <Sparkles size={20} color="#fff" />
            )}
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
                  overflow: "hidden",
                }}>
                  {chatbotAvatar ? (
                    <img src={chatbotAvatar} alt="AI" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <Bot size={14} color="#fff" />
                  )}
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
                overflow: "hidden",
              }}>
                {chatbotAvatar ? (
                  <img src={chatbotAvatar} alt="AI" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <Bot size={14} color="#fff" />
                )}
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
