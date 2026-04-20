#!/bin/bash
set -e

SERVER_PORT=3001
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CLIENT_DIR="$SCRIPT_DIR/client"
SERVER_DIR="$SCRIPT_DIR/server"
# --- MongoDB Atlas ---
echo "Using MongoDB Atlas (remote)."

# --- Express Server ---
echo "Starting Express server..."
cd "$SERVER_DIR" && npm run dev &
SERVER_PID=$!

echo "  Waiting for server on port $SERVER_PORT..."
until curl -s "http://localhost:$SERVER_PORT/auth/me" > /dev/null 2>&1; do
  sleep 0.5
done
echo "  Server is ready."

# --- Vite Client ---
echo "Starting Vite client..."
cd "$CLIENT_DIR" && npm run dev &
CLIENT_PID=$!

# Trap Ctrl+C and kill both processes
trap "echo ''; echo 'Shutting down...'; kill $SERVER_PID $CLIENT_PID 2>/dev/null; exit 0" INT TERM

echo ""
echo "  MongoDB: Atlas (freecluster.qlrryzk.mongodb.net)"
echo "  Server:  http://localhost:$SERVER_PORT"
echo "  Client:  http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop."

wait
