#!/bin/bash
set -e

SERVER_PORT=3001
CLIENT_DIR="$(dirname "$0")/client"
SERVER_DIR="$(dirname "$0")/server"

echo "Starting Express server..."
cd "$SERVER_DIR" && npm run dev &
SERVER_PID=$!

# Wait for server to be ready
echo "Waiting for server on port $SERVER_PORT..."
until curl -s "http://localhost:$SERVER_PORT/auth/me" > /dev/null 2>&1; do
  sleep 0.5
done

echo "Server is up. Starting Vite client..."
cd "$CLIENT_DIR" && npm run dev &
CLIENT_PID=$!

# Trap Ctrl+C and kill both processes
trap "echo 'Shutting down...'; kill $SERVER_PID $CLIENT_PID 2>/dev/null; exit 0" INT TERM

echo ""
echo "  Server: http://localhost:$SERVER_PORT"
echo "  Client: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers."

wait
