"use client";

import { useState, useEffect, useRef } from "react";

export interface MemorySnapshot {
  sets: Record<string, string>;
  hsets: Record<string, Record<string, string>>;
  expires: Record<string, string>; // The Go time.Time parses as an ISO date string in JSON
}

export function useRedisState() {
  const [memory, setMemory] = useState<MemorySnapshot | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;

    const connect = () => {
      // Prevent multiple reconnection timeouts from stacking
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      const ws = new WebSocket("ws://localhost:8080/ws");
      socketRef.current = ws;

      ws.onopen = () => {
        if (isMounted) {
          setIsConnected(true);
        }
      };

      ws.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const snapshot: MemorySnapshot = JSON.parse(event.data);
          setMemory(snapshot);
        } catch (error) {
          console.error("Failed to parse Redis memory state JSON:", error);
        }
      };

      ws.onclose = () => {
        if (!isMounted) return;
        setIsConnected(false);
        // Automatically attempt to reconnect every 3 seconds if the socket drops
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };

      ws.onerror = (error) => {
        console.error("Redis WebSocket Error:", error);
        // We let the onclose handle the reconnection after we force close it
        ws.close(); 
      };
    };

    connect();

    return () => {
      isMounted = false;
      
      // Cleanup timers and cleanly close socket to prevent memory leaks/zombie connections
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        // Clear out handlers so we don't trigger state updates on unmount
        socketRef.current.onclose = null; 
        socketRef.current.close();
      }
    };
  }, []);

  return { memory, isConnected };
}
