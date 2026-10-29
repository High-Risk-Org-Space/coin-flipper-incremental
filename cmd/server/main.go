package main

import (
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"os"

	"github.com/High-Risk-Org-Space/coin-flipper-incremental/web"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	distFS, err := fs.Sub(web.Files, ".")
	if err != nil {
		log.Fatalf("failed to create sub filesystem: %v", err)
	}

	mux := http.NewServeMux()
	mux.Handle("/", http.FileServer(http.FS(distFS)))
	mux.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"status":"ok","game":"coin-flipper-incremental"}`)
	})

	addr := ":" + port
	log.Printf("Coin Flipper Incremental server running on http://localhost%s\n", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatal(err)
	}
}
