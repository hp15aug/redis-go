"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HelpCircle, Terminal, Cpu, MessageSquare, Zap } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function InfoModal() {
  return (
    <Dialog>
      <DialogTrigger className="flex items-center space-x-2 px-3 py-1.5 border border-[#2A2A2A] bg-[#1A1A1A] hover:bg-[#252525] rounded-md transition-colors shadow-sm group">
        <HelpCircle className="w-4 h-4 text-[#A3A3A3] group-hover:text-emerald-500/90 transition-colors" />
        <span className="font-mono text-xs font-medium text-[#A3A3A3] tracking-widest uppercase">Info</span>
      </DialogTrigger>

      {/* Set width to 1200px and height to 800px */}
      <DialogContent className="w-[1200px] max-w-[95vw] h-[800px] max-h-[95vh] bg-[#121212] border-[#2A2A2A] text-[#D4D4D4] p-0 flex flex-col overflow-hidden gap-0 rounded-lg shadow-2xl">

        <DialogHeader className="p-6 border-b border-[#2A2A2A] bg-[#161616]">
          <DialogTitle className="text-lg font-semibold tracking-tight flex items-center gap-2 uppercase text-[#E0E0E0]">
            <Cpu className="w-5 h-5 text-emerald-500/90" />
            GoRedis System Internals
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="commands" className="w-full flex-1 flex flex-col min-h-0">
          <div className="px-6 bg-[#161616] border-b border-[#2A2A2A]">
            <TabsList className="bg-transparent h-12 w-full justify-start gap-6 p-0">
              <TabsTrigger
                value="commands"
                className="bg-transparent border-none hover:text-white p-0 h-full data-[state=active]:bg-transparent data-[state=active]:text-emerald-500/90 data-[state=active]:shadow-none relative rounded-none font-mono text-xs uppercase tracking-widest font-semibold text-[#A3A3A3] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-emerald-500/90 after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform"
              >
                Available Commands
              </TabsTrigger>
              <TabsTrigger
                value="architecture"
                className="bg-transparent border-none p-0 h-full data-[state=active]:bg-transparent hover:text-white data-[state=active]:text-emerald-500/90 data-[state=active]:shadow-none relative rounded-none font-mono text-xs uppercase tracking-widest font-semibold text-[#A3A3A3] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-emerald-500/90 after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform"
              >
                How it Works
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 min-h-0">
            <TabsContent value="commands" className="p-6 m-0 space-y-6 focus-visible:ring-0">
              {/* Changed to 3 columns on large screens to take advantage of the new width */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { cmd: "SET key value", desc: "Assigns a string value to a key." },
                  { cmd: "GET key", desc: "Retrieves the value associated with a key." },
                  { cmd: "SETEX key sec value", desc: "Sets a key with a TTL in seconds." },
                  { cmd: "DEL key", desc: "Removes a key from the database." },
                  { cmd: "HSET hash key val", desc: "Sets a field in a hash map." },
                  { cmd: "HGET hash key", desc: "Retrieves a field value from a hash." },
                  { cmd: "HGETALL hash", desc: "Returns all fields and values in a hash." },
                  { cmd: "PING [msg]", desc: "Server heartbeat/connectivity check." },
                  { cmd: "GETALL", desc: "Internal: Returns all keys in memory." },
                  { cmd: "DELETEALL", desc: "Caution: Purges the entire database." },
                ].map((item) => (
                  <div key={item.cmd} className="group p-4 border border-[#2A2A2A] bg-[#161616] rounded-md hover:border-emerald-500/40 transition-colors">
                    <div className="font-mono text-sm font-medium text-emerald-500/90 mb-1.5">{item.cmd}</div>
                    <div className="text-xs text-[#A3A3A3] font-sans leading-relaxed">{item.desc}</div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="architecture" className="p-6 m-0 space-y-8 focus-visible:ring-0 pb-12">
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-tight text-emerald-500/90">
                  <Terminal className="w-4 h-4" /> 1. The Command Pipeline (Proxy)
                </div>
                <p className="text-sm text-[#A3A3A3] leading-relaxed">
                  Web browsers cannot establish raw TCP connections. When you type a command, the frontend sends a POST request to <code className="text-[#D4D4D4] bg-[#1F1F1F] px-1.5 py-0.5 rounded border border-[#2A2A2A]">/api/redis</code>.
                </p>
                <div className="p-4 bg-[#161616] border border-[#2A2A2A] rounded-md font-mono text-xs space-y-2">
                  <div className="text-[#737373]"># Native RESP Array Encoding (SET foo bar)</div>
                  <div className="text-emerald-500/90 tracking-wider">
                    *3\r\n$3\r\nSET\r\n$3\r\nfoo\r\n$3\r\nbar\r\n
                  </div>
                  <p className="text-[11px] text-[#737373] mt-3 italic font-sans">
                    The Next.js backend encodes the command and pipes it to the Go server using a raw Node.js Socket.
                  </p>
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-tight text-emerald-500/90">
                  <MessageSquare className="w-4 h-4" /> 2. The State Pipeline (WebSocket)
                </div>
                <p className="text-sm text-[#A3A3A3] leading-relaxed">
                  The Go server runs a separate WebSocket broadcast server. Whenever the internal state changes, a selective JSON snapshot is broadcast to all clients.
                </p>
                <div className="p-4 bg-[#161616] border border-[#2A2A2A] rounded-md font-mono text-xs space-y-2 overflow-x-auto">
                  <div className="text-[#737373]">// Go State Snapshot JSON</div>
                  <div className="text-[#D4D4D4] leading-loose">
                    {"{"}
                    <br />
                    &nbsp;&nbsp;"sets": {"{"} "key": "val" {"}"},<br />
                    &nbsp;&nbsp;"hsets": {"{"} "user:1": {"{"} "name": "bob" {"}"} {"}"},<br />
                    &nbsp;&nbsp;"expires": {"{"} "temp": "2024-04-23T..." {"}"}<br />
                    {"}"}
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-tight text-emerald-500/90">
                  <Zap className="w-4 h-4" /> 3. Persistence (AOF)
                </div>
                <p className="text-sm text-[#A3A3A3] leading-relaxed">
                  To prevent data loss, the Go backend writes every modification to a <code className="text-[#D4D4D4] bg-[#1F1F1F] px-1.5 py-0.5 rounded border border-[#2A2A2A]">database.aof</code> file. This ensures durability across server restarts.
                </p>
              </section>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}