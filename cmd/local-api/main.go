package main

import (
	"log"
	"net/http"
	"os"

	handler "planary-auth/api"
	authhandler "planary-auth/api/auth"

	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()

	mux := http.NewServeMux()
	mux.HandleFunc("/api/health", handler.HealthHandler)
	mux.HandleFunc("/api/config", handler.ConfigHandler)
	mux.HandleFunc("/api/auth/me", authhandler.MeHandler)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("local api listening on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}
