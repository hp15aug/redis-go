"use client";

import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

interface LogEntry {
  id: string;
  command: string;
  response: string;
  status: "pending" | "success" | "error";
}

export function Console() {
  const [history, setHistory] = useState<LogEntry[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [history]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;

    const entryId = Math.random().toString(36).substring(7);
    
    setHistory((prev) => [
      ...prev,
      { id: entryId, command: cmd, response: "", status: "pending" },
    ]);
    setInput("");

    try {
      const res = await fetch("/api/redis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd }),
      });

      const data = await res.json();
      
      setHistory((prev) =>
        prev.map((item) =>
          item.id === entryId
            ? {
                ...item,
                response: data.error ? `Error: ${data.error}` : data.result === null ? "(nil)" : data.result,
                status: data.error ? "error" : "success",
              }
            : item
        )
      );
    } catch (err: any) {
      setHistory((prev) =>
        prev.map((item) =>
          item.id === entryId
            ? {
                ...item,
                response: err.message || "Network Error",
                status: "error",
              }
            : item
        )
      );
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg shadow-sm font-mono text-sm overflow-hidden" onClick={() => inputRef.current?.focus()}>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3 pb-2">
          {history.length === 0 && (
            <div className="text-[#888888] italic select-none">
              Welcome to the Console. Send raw RESP commands to GoRedis.
            </div>
          )}
          {history.map((entry) => (
            <div key={entry.id} className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2 text-[#888888]">
                <span className="text-emerald-500 select-none pb-0.5">{'>'}</span>
                <span>{entry.command}</span>
              </div>
              <div className={`pl-4 break-all whitespace-pre-wrap ${entry.status === 'error' ? 'text-red-400' : 'text-[#EAEAEA]'}`}>
                {entry.status === "pending" ? <span className="animate-pulse opacity-50">_</span> : entry.response}
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
      <div className="px-4 py-3 pb-4 border-t border-[#2A2A2A] bg-[#1A1A1A] shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center text-[#EAEAEA]">
          <span className="text-emerald-500 mr-2 select-none text-base">{'>'}</span>
          <Input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none placeholder-[#555555] font-mono text-sm text-[#EAEAEA] rounded-none px-0 h-auto py-0"
            placeholder="Execute command..."
            autoComplete="off"
            spellCheck="false"
            autoFocus
          />
        </form>
      </div>
    </div>
  );
}
