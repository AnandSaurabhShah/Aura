"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Loader2, RefreshCcw } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am your Aura Premier Virtual Assistant. How can I help you regarding your banking and financial needs today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    // Add user message to UI
    const updatedHistory: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(updatedHistory);
    setIsLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
      
      // Filter out system messages from history payload
      const payloadHistory = messages.filter(m => m.role !== "system");

      const res = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: payloadHistory,
          user_id: 1
        }),
      });

      if (!res.ok) throw new Error("Failed to connect to assistant");
      
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: "assistant", content: data.response }]);

    } catch (err: any) {
      setMessages(prev => [...prev, { 
        role: "system", 
        content: `Error: ${err.message || "Failed to reach AI Engine. Ensure Uvicorn is running."}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: "assistant",
        content: "Conversation cleared. How can I assist you with your banking today?"
      }
    ]);
  };

  // Simple markdown parser for basic bold and newlines
  const renderText = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Very basic bold parser
      const parts = line.split(/(\\*\\*.*?\\*\\*)/g);
      return (
        <span key={i} className="block mb-2 last:mb-0">
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j}>{part.slice(2, -2)}</strong>;
            }
            return <span key={j}>{part}</span>;
          })}
        </span>
      );
    });
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 z-50 group border-2 border-red-500/20"
          aria-label="Open AI Assistant"
        >
          <div className="absolute inset-0 rounded-full bg-red-600 animate-ping opacity-20" />
          <MessageSquare className="w-7 h-7 group-hover:animate-bounce" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[380px] h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-3xl flex flex-col z-50 overflow-hidden border border-gray-200 animate-in slide-in-from-bottom-10 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-red-600 text-white p-4 flex items-center justify-between shadow-md z-10 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-red-700 rounded-full" />
              </div>
              <div>
                <h3 className="font-bold leading-tight">Premier Assistant</h3>
                <p className="text-xs text-red-100 flex items-center gap-1">
                  Powered by Gemini <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse mt-0.5" />
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 relative z-10">
              <button 
                onClick={handleClear}
                className="p-2 hover:bg-white/20 rounded-full transition-colors tooltip"
                title="Restart Conversation"
              >
                <RefreshCcw className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex gap-3 max-w-[85%]",
                  msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto",
                  msg.role === "system" && "mx-auto text-center max-w-full"
                )}
              >
                {msg.role !== "system" && (
                  <div className={cn(
                    "w-8 h-8 rounded-full shrink-0 flex items-center justify-center self-end mb-1",
                    msg.role === "assistant" ? "bg-red-100 text-red-600" : "bg-gray-200 text-gray-700"
                  )}>
                    {msg.role === "assistant" ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                )}
                
                <div className={cn(
                  "px-4 py-3 shadow-sm",
                  msg.role === "user" 
                    ? "bg-gray-900 text-white rounded-2xl rounded-br-sm" 
                    : msg.role === "assistant"
                      ? "bg-white text-gray-800 rounded-2xl rounded-bl-sm border border-gray-100"
                      : "bg-red-50 text-red-600 text-xs font-mono rounded-lg border border-red-100 w-full"
                )}>
                  {msg.role === "system" ? msg.content : <div className="text-[15px] leading-relaxed">{renderText(msg.content)}</div>}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 max-w-[85%] mr-auto">
                <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full shrink-0 flex items-center justify-center self-end mb-1">
                 <Bot className="w-5 h-5" />
                </div>
                <div className="px-5 py-4 bg-white rounded-2xl rounded-bl-sm border border-gray-100 shadow-sm">
                  <div className="flex flex-col gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-red-600 mx-auto" />
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Processing</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <form onSubmit={handleSubmit} className="flex gap-2 items-end">
              <div className="relative flex-1">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="Ask about our premium products..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none"
                  rows={2}
                  maxLength={1000}
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-12 h-12 bg-red-600 hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl flex items-center justify-center shrink-0 transition-colors shadow-md disabled:shadow-none"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-1" />}
              </button>
            </form>
            <div className="text-center mt-2">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Gemini 2.5 Flash API</span>
            </div>
          </div>
          
        </div>
      )}
    </>
  );
}
