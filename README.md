# Go-Redis: A Lightweight Redis Clone in Go

[![Go Report Card](https://goreportcard.com/badge/github.com/hp15aug/redis-go)](https://goreportcard.com/report/github.com/hp15aug/redis-go)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A educational, high-performance Redis-compatible server implemented from scratch in Go. This project implements the RESP protocol, supports common Redis commands, and features persistent storage via Append-Only Files (AOF).

Built with ❤️ by [hp15aug](https://github.com/hp15aug).

---

## 🚀 Features

- **RESP Protocol Support**: Fully custom implementation of the Redis Serialization Protocol.
- **In-Memory Storage**: Fast access using thread-safe data structures.
- **Concurrency**: Built for speed with `sync.RWMutex` for efficient read-write balancing.
- **AOF Persistence**: Real-time logging of write operations with background synchronization.
- **Key Expiration**: Background cleanup of expired keys to maintain memory efficiency.
- **Hash Support**: Basic support for Redis Hashes (`HSET`, `HGET`, `HGETALL`).

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
| `BURN` | Custom debug command | `BURN` |

---

## 🏗 Architecture

### 1. RESP Protocol (`resp.go`)
The core of the server is a custom **Redis Serialization Protocol (RESP)** parser. It handles:
- **Simple Strings** (`+`)
- **Errors** (`-`)
- **Integers** (`:`)
- **Bulk Strings** (`$`)
- **Arrays** (`*`)

### 2. AOF Persistence (`aof.go`)
This server ensures durability by using an **Append-Only File**. Every write command (`SET`, `HSET`, `DEL`, etc.) is serialized into RESP and appended to `database.aof`. A background goroutine periodically calls `fsync` to ensure data integrity without blocking requests.

### 3. Command Handling (`handler.go`)
A centralized command registry maps RESP commands to specific Go functions. The implementation uses `sync.RWMutex` to ensure safe concurrent access from multiple clients.

### 4. Key Expiration (`main.go`)
A dedicated background worker periodically scans for expired keys (created via `SETEX`) and removes them from memory, preventing memory leaks over time.

---

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/hp15aug/redis-go.git
   cd redis-go
   ```

2. **Build and Run**:
   ```bash
   go run .
   ```

The server will start listening on `127.0.0.1:6379`.

---

## 🖥 Usage

You can interact with the server using the standard `redis-cli`:

```bash
# Connect to the server
redis-cli

# Try some commands
127.0.0.1:6379> SET framework "Go"
OK
127.0.0.1:6379> GET framework
"Go"
127.0.0.1:6379> SETEX temp_key 5 "Disappearing soon"
OK
127.0.0.1:6379> HSET user:100 email "test@example.com"
OK
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Developed with precision by [hp15aug](https://github.com/hp15aug).**
