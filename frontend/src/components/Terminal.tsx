"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal as TerminalIcon, CornerDownLeft } from "lucide-react";

interface HistoryEntry {
  id: string;
  command: string;
  response: string;
  status: "pending" | "success" | "error";
}

export function Terminal() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new history
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;

    const entryId = Math.random().toString(36).substring(7);
    
    setHistory((prev) => [
      ...prev,
      { id: entryId, command: cmd, response: "...", status: "pending" },
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
                response: data.error ? data.error : data.result === null ? "(nil)" : data.result,
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
    <Card className="flex flex-col h-full border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
      <CardHeader className="border-b-2 border-black bg-stone-50 py-3">
        <CardTitle className="text-sm uppercase tracking-widest flex items-center gap-2 font-sans font-bold">
          <TerminalIcon className="w-4 h-4" /> GoRedis CLI
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden relative">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4 font-mono text-xs sm:text-sm pb-4">
            {history.length === 0 && (
              <div className="text-gray-400 italic">No commands executed yet...</div>
            )}
            {history.map((entry) => (
              <div key={entry.id} className="space-y-1">
                <div className="flex gap-2 text-black font-semibold">
                  <span className="text-green-500 font-bold">❯</span>
                  <span>{entry.command}</span>
                </div>
                <div className={`pl-4 break-all whitespace-pre-wrap ${entry.status === 'error' ? 'text-red-500 font-bold' : entry.status === 'pending' ? 'text-gray-400 animate-pulse' : 'text-gray-800'}`}>
                  {entry.response}
                </div>
              </div>
            ))}
            {/* Scroll anchor */}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-3 border-t-2 border-black bg-stone-50">
        <form onSubmit={handleSubmit} className="flex relative w-full items-center">
          <span className="absolute left-3 text-green-500 font-mono font-bold">❯</span>
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a command (e.g. SET foo bar)..." 
            className="pl-8 border-2 border-black font-mono rounded-none focus-visible:ring-0 focus-visible:border-green-500 focus-visible:ring-offset-0 bg-white shadow-none"
            autoComplete="off"
            spellCheck="false"
          />
          <Button type="submit" size="icon" className="absolute right-0 top-0 h-full rounded-none border-l-2 border-y-0 border-r-0 border-black bg-green-400 hover:bg-green-500 text-black px-4">
            <CornerDownLeft className="w-4 h-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
