"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MemorySnapshot } from "@/hooks/useRedisState";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface MemoryMapProps {
  memory: MemorySnapshot | null;
}

export function MemoryMap({ memory }: MemoryMapProps) {
  const hashKeys = useMemo(() => {
    if (!memory?.hsets) return [];
    return Object.entries(memory.hsets);
  }, [memory?.hsets]);

  const setKeys = useMemo(() => {
    if (!memory?.sets) return [];
    return Object.entries(memory.sets);
  }, [memory?.sets]);

  if (!memory) {
    return (
      <div className="h-full min-h-[400px] flex items-center justify-center font-mono text-gray-500 animate-pulse border-4 border-dashed border-black/10 bg-white">
        AWAITING STATE_SYNC...
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-max">
        <AnimatePresence mode="popLayout">
          {setKeys.map(([key, value]) => {
            const expireTimestamp = memory.expires?.[key];
            
            return (
              <motion.div
                key={`set-${key}`}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <Card className="rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-green-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform" />
                  
                  <CardHeader className="py-3 px-4 border-b-2 border-black/10 bg-stone-50 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="font-mono text-base font-bold text-black break-all">
                      {key}
                    </CardTitle>
                    <Badge variant="outline" className="rounded-none border-black text-xs uppercase cursor-default shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold bg-white">
                      STRING
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-4 font-mono text-sm text-gray-800 break-all bg-white relative pb-10">
                    {value}
                    {expireTimestamp && (
                      <div className="absolute bottom-[-2px] right-[-2px] flex items-center text-[10px] font-mono font-bold border-t-2 border-l-2 border-black bg-stone-50 text-black px-2 py-1 shadow-[inset_2px_2px_0px_0px_rgba(74,222,128,0.2)]">
                        <Clock className="w-3 h-3 mr-1 text-green-500" />
                        {new Date(expireTimestamp).toLocaleTimeString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

          {hashKeys.map(([hashKey, fields]) => {
            const expireTimestamp = memory.expires?.[hashKey];

            return (
              <motion.div
                key={`hset-${hashKey}`}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <Card className="rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform" />

                  <CardHeader className="py-3 px-4 border-b-2 border-black/10 bg-stone-50 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="font-mono text-base font-bold text-black break-all flex items-center">
                      <span className="text-blue-600 mr-2">#</span>
                      {hashKey}
                    </CardTitle>
                    <Badge variant="outline" className="rounded-none border-black text-xs uppercase cursor-default shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold bg-blue-50">
                      HASH
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-0 font-mono text-sm text-gray-800 bg-white relative pb-8">
                    <div className="flex flex-col divide-y-2 divide-black/5">
                      {Object.entries(fields).map(([field, val]) => (
                        <div key={field} className="px-4 py-2 hover:bg-stone-50 transition-colors flex flex-col space-y-1">
                          <span className="font-bold text-black">{field}</span>
                          <span className="text-gray-600 break-all">{val}</span>
                        </div>
                      ))}
                    </div>
                    {expireTimestamp && (
                      <div className="absolute bottom-[-2px] right-[-2px] flex items-center text-[10px] font-mono font-bold border-t-2 border-l-2 border-black bg-stone-50 text-black px-2 py-1 shadow-[inset_2px_2px_0px_0px_rgba(59,130,246,0.2)]">
                        <Clock className="w-3 h-3 mr-1 text-blue-500" />
                        {new Date(expireTimestamp).toLocaleTimeString()}
                      </div>
                    )}
                  </CardContent>

                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {setKeys.length === 0 && hashKeys.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full py-20 flex flex-col items-center justify-center border-4 border-dashed border-black/20 bg-stone-50/50"
          >
            <div className="font-mono text-gray-500 mb-2 uppercase tracking-widest font-bold">Database Empty</div>
            <div className="font-mono text-xs text-gray-400">Use the terminal to SET some keys</div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
