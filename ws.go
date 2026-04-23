package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

var clients = make(map[*websocket.Conn]bool)
var clientsMu sync.Mutex

type MemorySnapsnot struct {
	Sets    map[string]string            `json:"sets"`
	HSets   map[string]map[string]string `json:"hsets"`
	Expires map[string]time.Time         `json:"expires"`
}

func StartWSServer() {
	http.HandleFunc("/ws", handleConnections)
	fmt.Println("WebSocket server listening on port :8080")
	err := http.ListenAndServe(":8080", nil)

	if err != nil {
		fmt.Println("Websocket server error:", err)
	}
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println(err)
		return
	}

	defer ws.Close()

	clientsMu.Lock()
	clients[ws] = true
	clientsMu.Unlock()

	BroadcastState()

	for {
		_, _, err := ws.ReadMessage()
		if err != nil {
			clientsMu.Lock()
			delete(clients, ws)
			clientsMu.Unlock()
			break
		}
	}
}

func BroadcastState() {
	SETsMu.RLock()
	HSETsMu.RLock()
	EXPIRESMu.RLock()

	snapshot := MemorySnapsnot{
		Sets:    make(map[string]string),
		HSets:   make(map[string]map[string]string),
		Expires: make(map[string]time.Time),
	}

	for k, v := range SETs {
		snapshot.Sets[k] = v
	}

	for k, v := range HSETs {
		snapshot.HSets[k] = make(map[string]string)
		for hk, hv := range v {
			snapshot.HSets[k][hk] = hv
		}
	}

	for k, v := range EXPIRES {
		snapshot.Expires[k] = v
	}

	EXPIRESMu.RUnlock()
	HSETsMu.RUnlock()
	SETsMu.RUnlock()

	payload, err := json.Marshal(snapshot)
	if err != nil {
		return
	}

	clientsMu.Lock()
	defer clientsMu.Unlock()

	for client := range clients {
		err := client.WriteMessage(websocket.TextMessage, payload)
		if err != nil {
			client.Close()
			delete(clients, client)
		}
	}

}
