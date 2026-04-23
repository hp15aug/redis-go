"use client";

import { useRedisState } from "@/hooks/useRedisState";
import { Console } from "@/components/Console";
import { MemoryTable } from "@/components/MemoryTable";
import { InfoModal } from "@/components/InfoModal";

export default function Dashboard() {
  const { memory, isConnected } = useRedisState();

  return (
    <div className="h-screen w-full bg-[#0C0C0C] flex flex-col font-sans text-[#EAEAEA] overflow-hidden selection:bg-[#2A2A2A] selection:text-[#EAEAEA]">

      {/* Minimalist Top Nav */}
      <header className="h-14 shrink-0 border-b border-[#2A2A2A] bg-[#0C0C0C] flex items-center justify-between px-6 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 bg-[#1A1A1A] border border-[#2A2A2A] rounded flex items-center justify-center text-emerald-500 font-mono font-bold text-[10px]">
            R
          </div>
          <h1 className="text-[13px] font-semibold tracking-widest text-[#EAEAEA] uppercase">GoRedis</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="w-full">
            <InfoModal />
          </div>
          <div className="flex items-center space-x-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-full pl-2 pr-3 py-1">
            <div
              className={`w-[6px] h-[6px] rounded-full ${isConnected ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)] animate-pulse" : "bg-red-500/80"}`}
            />
            <span className="font-mono text-[10px] font-medium text-[#888888] pt-px tracking-wider">
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </header>

      {/* Split/Grid View */}
      <main className="flex-1 flex flex-col lg:flex-row gap-5 p-5 min-h-0 overflow-hidden bg-[#0C0C0C]">

        {/* Left pane: Memory Table (~65% width) */}
        <section className="flex-[6.5] min-w-0 min-h-0 flex flex-col">
          <div className="mb-3 px-1">
            <h2 className="text-sm font-semibold text-[#EAEAEA]">Memory Explorer</h2>
            <p className="text-[11px] text-[#888888] mt-1">Real-time keyspace view of the Go backend</p>
          </div>
          <div className="flex-1 min-h-0">
            <MemoryTable memory={memory} />
          </div>
        </section>

        {/* Right pane: Console (~35% width) */}
        <section className="flex-[3.5] min-w-0 min-h-0 flex flex-col">
          <div className="mb-3 px-1">
            <h2 className="text-sm font-semibold text-[#EAEAEA]">Console</h2>
            <p className="text-[11px] text-[#888888] mt-1">Execute RESP commands directly</p>
          </div>
          <div className="flex-1 min-h-0">
            <Console />
          </div>
        </section>

      </main>
    </div>
  );
}
