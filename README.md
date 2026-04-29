# Go-Redis: A Lightweight Redis Clone with Next.js Dashboard

[![Go Report Card](https://goreportcard.com/badge/github.com/hp15aug/redis-go)](https://goreportcard.com/report/github.com/hp15aug/redis-go)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A high-performance, educational Redis-compatible server implemented in Go, featuring a premium real-time monitoring dashboard built with Next.js. This project implements the RESP protocol, supports AOF persistence, and provides a live visual keyspace explorer.

Built with ❤️ by [hp15aug](https://github.com/hp15aug).

---

## 🚀 Features

### **Backend (Go)**
- **RESP Protocol Support**: Custom parser for Redis Serialization Protocol.
- **In-Memory Storage**: Thread-safe operations using `sync.RWMutex`.
- **AOF Persistence**: Append-Only File logging for durability.
- **Key Expiration**: Automatic background cleanup of expired keys.
- **Concurrent TCP Server**: Handles multiple simultaneous client connections.
- **WebSocket State Broadcast**: Pushes real-time memory snapshots to the frontend.

### **Frontend (Next.js)**
- **Real-time Dashboard**: Premium dark-mode UI (Linear/Vercel inspired).
- **Interactive Console**: Web-based CLI to execute core Redis commands.
- **Live Memory Explorer**: Visual table with `framer-motion` animations for live data updates and expirations.
- **TCP Proxy Pipeline**: Next.js API route bridging HTTP requests to raw TCP sockets.
- **Auto-reconnecting Socket**: Resilient WebSocket hook for consistent state syncing.

---

## 🛠 Supported Commands

| Command | Description | Example |
| :--- | :--- | :--- |
| `PING` | Pings the server or returns a message | `PING "Hello"` |
| `SET` | Sets a key to a string value | `SET user:1 "John"` |
| `GET` | Gets the value of a key | `GET user:1` |
| `SETEX` | Sets a key with an expiration (seconds) | `SETEX session 60 "token"` |
| `DEL` | Deletes a key | `DEL user:1` |
| `GETALL` | Returns all keys in the default set | `GETALL` |
| `DELETEALL` | Clears all data from the database | `DELETEALL` |
| `HSET` | Sets a field in a hash | `HSET profile:1 name "Alice"` |
| `HGET` | Gets a field from a hash | `HGET profile:1 name` |
| `HGETALL` | Gets all fields and values in a hash | `HGETALL profile:1` |

---

## 🏗 Full-Stack Architecture

### 1. TCP Proxy Pipeline
Since browsers cannot send raw TCP packets, the Next.js frontend uses an API route (`/api/redis`) that acts as a proxy. It translates HTTP requests into RESP payloads and communicates with the Go server via Node's native `net` module.

### 2. State Sync Pipeline
The Go server broadcasts a JSON snapshot of the entire keyspace over WebSockets (`ws://localhost:8080/ws`). The frontend consumes this via a custom `useRedisState` hook, updating the visual `MemoryTable` instantly without polling.

### 3. RESP Parser & AOF
The backend features a hand-written RESP parser and an Append-Only File (AOF) system to ensure all write operations are persisted to `database.aof` and replayed on startup.

---

## 📦 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/hp15aug/redis-go.git
   cd redis-go
   ```

2. **Run Backend & Frontend Concurrently**:
   Using `concurrently` (recommended):
   ```bash
   npx concurrently "go run ." "npm run dev --prefix frontend"
   ```
   
   Or manually:
   - Run backend: `go run .`
   - Run frontend: `cd frontend && npm run dev`

The Go server runs on `:6379` (TCP) and `:8080` (WS).
The Dashboard is available at `http://localhost:3000`.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Developed with precision by [hp15aug](https://github.com/hp15aug).**
