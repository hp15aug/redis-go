"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MemorySnapshot } from "@/hooks/useRedisState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MemoryTableProps {
  memory: MemorySnapshot | null;
}

type RowData = {
  keyName: string;
  value: string;
  type: "STRING" | "HASH";
  ttl?: string;
};

export function MemoryTable({ memory }: MemoryTableProps) {
  const tableData: RowData[] = useMemo(() => {
    if (!memory) return [];
    
    const rows: RowData[] = [];
    
    if (memory.sets) {
      for (const [k, v] of Object.entries(memory.sets)) {
        rows.push({
          keyName: k,
          value: v,
          type: "STRING",
          ttl: memory.expires?.[k],
        });
      }
    }

    if (memory.hsets) {
      for (const [hasK, fields] of Object.entries(memory.hsets)) {
        const formattedFields = Object.entries(fields)
          .map(([f, v]) => `${f}: "${v}"`)
          .join(", ");
          
        rows.push({
          keyName: hasK,
          value: `{ ${formattedFields} }`,
          type: "HASH",
          ttl: memory.expires?.[hasK],
        });
      }
    }
    
    // Sort keys alphabetically
    return rows.sort((a, b) => a.keyName.localeCompare(b.keyName));

  }, [memory]);

  if (!memory) {
    return (
      <div className="flex h-full w-full items-center justify-center font-mono text-sm text-[#888888] bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg shadow-sm">
        <span className="animate-pulse">Awaiting state sync...</span>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-[#1A1A1A] flex flex-col overflow-hidden border border-[#2A2A2A] rounded-lg shadow-sm">
      <ScrollArea className="flex-1">
        <Table>
          <TableHeader className="bg-[#1A1A1A] sticky top-0 z-10 shadow-[0_1px_0_0_#2A2A2A]">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="w-[30%] text-[#888888] font-sans font-medium text-xs tracking-wider uppercase h-10 px-4">
                Key
              </TableHead>
              <TableHead className="w-[45%] text-[#888888] font-sans font-medium text-xs tracking-wider uppercase h-10 px-4">
                Value
              </TableHead>
              <TableHead className="w-[10%] text-[#888888] font-sans font-medium text-xs tracking-wider uppercase h-10 px-4">
                Type
              </TableHead>
              <TableHead className="w-[15%] text-right text-[#888888] font-sans font-medium text-xs tracking-wider uppercase h-10 px-4">
                TTL
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence initial={false}>
              {tableData.length === 0 ? (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <TableCell colSpan={4} className="h-40 text-center text-[#888888] font-mono text-xs sm:text-sm border-b border-[#2A2A2A]/50">
                    Database Empty
                  </TableCell>
                </motion.tr>
              ) : (
                tableData.map((row) => (
                  <motion.tr
                    key={row.keyName}
                    layout // Animate sorting automatically
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="group border-b border-[#2A2A2A]/60 hover:bg-[#202020] transition-colors"
                  >
                    <TableCell className="font-mono text-xs sm:text-sm text-[#EAEAEA] break-all py-3.5 px-4 border-none">
                      {row.keyName}
                    </TableCell>
                    <TableCell className="font-mono text-xs sm:text-sm text-[#888888] py-3.5 px-4 border-none" title={row.value}>
                       <span className="line-clamp-2 block w-full">{row.value}</span>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 border-none">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-[#252525] text-[#888888] border border-[#333333]">
                        {row.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-[#888888] py-3.5 px-4 border-none shrink-0 whitespace-nowrap">
                      {row.ttl ? new Date(row.ttl).toLocaleTimeString() : <span className="opacity-40">-</span>}
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
