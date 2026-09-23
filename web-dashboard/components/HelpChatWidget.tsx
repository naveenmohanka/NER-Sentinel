"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";

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
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! 👋 I am your **NER-Sentinel Navigation Assistant**. How can I help you today?"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showHello, setShowHello] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Draggable state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const hasDragged = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Hide hello bubble after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowHello(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Drag handlers
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    hasDragged.current = false;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: position.x,
      origY: position.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [position]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasDragged.current = true;
    }
    setPosition({
      x: dragRef.current.origX + dx,
      y: dragRef.current.origY + dy,
    });
  }, [isDragging]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    setIsDragging(false);
    dragRef.current = null;
    if (!hasDragged.current) {
      setIsOpen((prev) => !prev);
      setShowHello(false);
    }
  }, []);

  const sendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
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
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: "You can navigate between pages using the left sidebar:\n• **Dashboard (`/`)**: 3D Satellite Map & AI Predictor\n• **Live Situation (`/live-situation`)**: 2D Google Incident Map\n• **Report Hazard (`/report-hazard`)**: Field Reporting\n• **Response Coordination (`/response-coordination`)**: SDRF/NDRF Dispatch"
          }
        ]);
      }
    } catch (err) {
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

  // Do not render chat bot on login page or root auth page
  if (pathname === "/" || pathname === "/login") {
    return null;
  }

  return (
    <>
      {/* Draggable Floating Chatbot Avatar with Hello Bubble */}
      <div
        className="fixed z-50 select-none"
        style={{
          bottom: `${24 - position.y}px`,
          right: `${24 - position.x}px`,
          cursor: isDragging ? "grabbing" : "grab",
          touchAction: "none",
        }}
      >
        {/* Hello Speech Bubble */}
        {!isOpen && showHello && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap animate-bounce">
            <div className="bg-white text-teal-600 font-bold text-sm px-4 py-1.5 rounded-full shadow-lg border border-teal-200">
              Hello! 👋
              {/* Bubble arrow */}
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-teal-200 rotate-45" />
            </div>
          </div>
        )}

        {/* Cute Robot Avatar Button */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className="w-16 h-16 rounded-full overflow-hidden shadow-2xl transition-transform hover:scale-110 active:scale-95 border-3 border-teal-400/80 hover:border-teal-300 bg-slate-900/90 flex items-center justify-center p-1.5"
          style={{
            boxShadow: "0 0 25px rgba(45, 212, 191, 0.5), 0 4px 15px rgba(0,0,0,0.3)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/chatbot_avatar.png"
            alt="AI Assistant"
            className="w-full h-full object-contain drop-shadow"
            draggable={false}
          />
        </div>

        {/* Online indicator */}
        {!isOpen && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse shadow-sm" />
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed z-50 w-[370px] max-w-[90vw] h-[530px] max-h-[75vh] bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{
            bottom: `${96 - position.y}px`,
            right: `${24 - position.x}px`,
            animation: "slideUp 0.25s ease-out",
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-cyan-700 text-white p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30 shadow-md shrink-0 bg-slate-900 flex items-center justify-center p-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/chatbot_avatar.png"
                  alt="AI Bot"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  NER-Sentinel Bot
                  <span className="px-1.5 py-0.5 bg-white/20 text-teal-100 rounded text-[9px] font-mono border border-white/20">
                    AI
                  </span>
                </h4>
                <span className="text-[10px] text-teal-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block" />
                  Online • Navigation & Safety Assistant
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white text-lg font-bold p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs bg-slate-50/50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}
              >
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 mt-1 border border-teal-200 bg-slate-900 flex items-center justify-center p-0.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/chatbot_avatar.png" alt="Bot" className="w-full h-full object-contain" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-xl leading-relaxed whitespace-pre-line ${
                    msg.role === "user"
                      ? "bg-teal-600 text-white rounded-br-sm"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-xs"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-teal-200 bg-slate-900 flex items-center justify-center p-0.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/chatbot_avatar.png" alt="Bot" className="w-full h-full object-contain" />
                </div>
                <div className="bg-white text-gray-400 px-3 py-2 rounded-xl border border-gray-200 italic text-[11px]">
                  Thinking...
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
                className="whitespace-nowrap px-2.5 py-1 bg-teal-50 hover:bg-teal-100 hover:text-teal-700 text-gray-700 rounded-full font-medium border border-teal-200 transition-colors shrink-0"
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
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 outline-none focus:border-teal-500"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-3.5 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-opacity"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* Slide-up animation */}
      <style jsx global>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
