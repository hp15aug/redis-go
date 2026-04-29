package main

import (
	"fmt"
	"net"
	"strings"
	"time"
)

func main() {
	fmt.Println("Listening on port :6379")

	go StartWSServer()

	l, err := net.Listen("tcp", ":6379")
	if err != nil {
		fmt.Println(err)
		return
	}

	aof, err := NewAof("database.aof")
	if err != nil {
		fmt.Println(err)
		return
	}
	defer aof.Close()

	aof.Read(func(value Value) {
		command := strings.ToUpper(value.array[0].bulk)
		args := value.array[1:]

		handler, ok := Handlers[command]

		if !ok {
			fmt.Println("Invalid command in AOF: ", command)
			return
		}

		handler(args)
	})

	go func() {
		for {
			time.Sleep(2 * time.Second)

			EXPIRESMu.Lock()
			SETsMu.Lock()

			didDelete := false

			for key, expireTime := range EXPIRES {
				if time.Now().After(expireTime) {
					delete(SETs, key)
					delete(EXPIRES, key)
				}
			}

			SETsMu.Unlock()
			EXPIRESMu.Unlock()

			if didDelete {
				BroadcastState()
			}
		}
	}()

	for {
		conn, err := l.Accept()
		if err != nil {
			fmt.Println(err)
			continue
		}

		go handleConnection(conn, aof)
	}
}

func handleConnection(conn net.Conn, aof *Aof) {
	defer conn.Close()

	for {
		resp := NewResp(conn)
		value, err := resp.Read()
		if err != nil {
			fmt.Println(err)
			return
		}

		if value.typ != "array" {
			fmt.Println("Invalid request, expected array")
			continue
		}

		if len(value.array) == 0 {
			fmt.Println("Invalid request, expected non-empty array")
			continue
		}

		command := strings.ToUpper(value.array[0].bulk)
		args := value.array[1:]
		writer := NewWriter(conn)

		handler, ok := Handlers[command]

		if !ok {
			fmt.Println("Invalid command: ", command)
			writer.Write(Value{typ: "string", str: ""})
			continue
		}

		if command == "SET" || command == "HSET" || command == "DEL" || command == "DELALL" || command == "SETEX" {
			aof.Write(value)
		}

		result := handler(args)
		writer.Write(result)
	}
}
