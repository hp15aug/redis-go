import net from 'net';
import { NextRequest, NextResponse } from 'next/server';
import { encodeCommand } from '../../../lib/resp';

// The backend Go Redis server address and port
const REDIS_HOST = '127.0.0.1';
const REDIS_PORT = 6379;
const SOCKET_TIMEOUT_MS = 2000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { command } = body;

    if (!command || typeof command !== 'string') {
      return NextResponse.json(
        { result: null, error: 'Command must be a non-empty string' },
        { status: 400 }
      );
    }

    // Convert the given plain command to RESP format using the library
    const respPayload = encodeCommand(command);
    if (!respPayload) {
      return NextResponse.json(
        { result: null, error: 'Invalid command' },
        { status: 400 }
      );
    }

    const result = await runRedisCommand(respPayload);
    
    return NextResponse.json({ result, error: null });

  } catch (error: any) {
    console.error('Redis Proxy Error:', error);
    // Handle socket timeout or connection refused
    const isTimeout = error.message?.includes('timeout');
    const isOffline = error.code === 'ECONNREFUSED';
    
    if (isTimeout || isOffline) {
      return NextResponse.json(
        { result: null, error: 'Database offline or unreachable' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { result: null, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * Establishes a TCP socket to the Go Redis server, executes the RESP payload
 * and returns the parsed raw result.
 */
function runRedisCommand(payload: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    socket.setTimeout(SOCKET_TIMEOUT_MS);

    let responseData = '';
    let resolved = false;

    socket.connect(REDIS_PORT, REDIS_HOST, () => {
      // Connection successfully opened, send the command
      socket.write(payload);
    });

    socket.on('data', (chunk) => {
      responseData += chunk.toString('utf-8');
      
      try {
        const parsedResult = parseSimpleRESP(responseData);
        
        // If parsedResult is null, it means we don't have the complete response yet (partial packet)
        if (parsedResult !== null) {
          resolved = true;
          socket.destroy(); // Safely close and cleanup socket immediately
          resolve(parsedResult);
        }
      } catch (err) {
        resolved = true;
        socket.destroy();
        reject(err);
      }
    });

    socket.on('error', (err) => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        reject(err);
      }
    });

    socket.on('timeout', () => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        reject(new Error(`Socket connection timeout after ${SOCKET_TIMEOUT_MS}ms`));
      }
    });
    
    socket.on('close', () => {
      if (!resolved && !responseData) {
         reject(new Error('Socket closed without response'));
      }
    });
  });
}

/**
 * A rudimentary parser to strip the RESP syntax and extract the bare value.
 * + Simple Strings
 * - Errors
 * : Integers
 * $ Bulk Strings
 * * Arrays
 */
function parseSimpleRESP(data: string): string | null {
  if (!data) return null;
  
  const lines = data.split('\r\n');
  if (lines.length === 0) return null;
  
  const firstLine = lines[0];
  const prefix = firstLine[0];

  switch (prefix) {
    case '+': // Simple String (e.g. +OK\r\n) => "OK"
      return firstLine.substring(1);
      
    case '-': // Error (e.g. -ERR msg\r\n) => throw error
      throw new Error(firstLine.substring(1));
      
    case ':': // Integer (e.g. :1000\r\n) => "1000"
      return firstLine.substring(1);
      
    case '$': // Bulk String (e.g. $5\r\nvalue\r\n) => "value"
      if (firstLine === '$-1') return '(nil)';
      if (lines.length > 1) {
        // Return the actual bulk string on the second line
        return lines[1];
      }
      return null;
      
    case '*': // Array
      if (firstLine === '*-1') return '(nil)';
      
      // Basic array handling logic
      const count = parseInt(firstLine.substring(1), 10);
      if (isNaN(count)) return null;
      
      const elements: string[] = [];
      let currentLineIndex = 1;
      
      for (let i = 0; i < count; i++) {
        if (currentLineIndex >= lines.length - 1) return null; // partial packet
        
        const line = lines[currentLineIndex];
        if (line.startsWith('$')) {
          if (line === '$-1') {
            elements.push('(nil)');
            currentLineIndex++;
            continue;
          }
          currentLineIndex++; // skip the $length line
          if (currentLineIndex >= lines.length - 1) return null;
          elements.push(lines[currentLineIndex]);
          currentLineIndex++;
        } else if (line.startsWith(':') || line.startsWith('+')) {
          elements.push(line.substring(1));
          currentLineIndex++;
        } else {
          return null;
        }
      }
      return `[${elements.join(', ')}]`;

    default:
      // Unrecognized structure, return raw
      return data;
  }
}
