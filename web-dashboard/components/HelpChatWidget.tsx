"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "assistant" | "user";
  content: string;
}

const quickChips = [
  "Where do I report a hazard?",
  "How to view the 3D map?",
  "How to coordinate rescue teams?",
  "Where can I change language?"
];

export default function HelpChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello Officer! 🤖 I am your **NVIDIA-powered App Navigation Assistant**. How can I help you navigate NER-Sentinel today?"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5001/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.slice(1)
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages([...newMessages, { role: "assistant", content: data.reply }]);
      } else {
        // Fallback response
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: "You can navigate between pages using the left sidebar:\n• **Dashboard (`/`)**: 3D Satellite Map & AI Predictor\n• **Live Situation (`/live-situation`)**: 2D Google Incident Map\n• **Report Hazard (`/report-hazard`)**: Field Reporting\n• **Response Coordination (`/response-coordination`)**: SDRF/NDRF Dispatch"
          }
        ]);
      }
    } catch (err) {
      // Offline fallback
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "You can find all tools in the left sidebar:\n• ⚠️ **Report Hazard** (`/report-hazard`)\n• 👥 **Response Coordination** (`/response-coordination`)\n• 🔔 **Alerts & Status** (`/alerts-status`)\n• ⚙️ **Settings** (`/settings`)"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95 border-2 border-white/40 group"
        aria-label="Open App Navigation Assistant"
      >
        <span className="text-2xl group-hover:rotate-12 transition-transform">
          {isOpen ? "✕" : "🤖"}
        </span>
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[90vw] h-[520px] max-h-[75vh] bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-3.5 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-base">
                🤖
              </div>
              <div>
                <h4 className="font-bold text-xs leading-tight flex items-center gap-1.5">
                  <span>NVIDIA Navigation Bot</span>
                  <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded text-[9px] font-mono">
                    NIM AI
                  </span>
                </h4>
                <span className="text-[10px] text-gray-400">NER-Sentinel Command Assistant</span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white text-base font-bold p-1"
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs bg-slate-50/50">
            {messages.map((m, idx) => {
              const isAssistant = m.role === "assistant";
              return (
                <div
                  key={idx}
                  className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 shadow-xs leading-relaxed ${
                      isAssistant
                        ? "bg-white border border-gray-200 text-gray-900 rounded-tl-xs"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl p-2.5 rounded-tl-xs shadow-xs flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-3 py-2 bg-white border-t border-gray-100 flex gap-1.5 overflow-x-auto text-[10px] no-scrollbar">
            {quickChips.map((chip, i) => (
              <button
                key={i}
                type="button"
                onClick={() => sendMessage(chip)}
                className="whitespace-nowrap px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-gray-700 rounded-full font-medium border border-gray-200 transition-colors shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="p-2.5 bg-white border-t border-gray-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask how to use any feature..."
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 outline-none focus:border-blue-600"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
