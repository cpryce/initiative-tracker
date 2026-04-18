#!/bin/bash
set -e

SERVER_PORT=3001
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CLIENT_DIR="$SCRIPT_DIR/client"
SERVER_DIR="$SCRIPT_DIR/server"
DOCKER_CMD=(docker)

if ! docker info > /dev/null 2>&1; then
  echo "  Docker needs elevated access on this machine."
  if ! sudo -v; then
    echo "  Unable to authenticate for Docker access."
    exit 1
  fi
  DOCKER_CMD=(sudo docker)
fi

# --- MongoDB ---
echo "Starting MongoDB..."
if "${DOCKER_CMD[@]}" ps -q --filter "name=^/mongodb$" | grep -q .; then
  echo "  MongoDB already running."
elif "${DOCKER_CMD[@]}" ps -aq --filter "name=^/mongodb$" | grep -q .; then
  echo "  Restarting existing container..."
  "${DOCKER_CMD[@]}" start mongodb
else
  echo "  Creating new container..."
  "${DOCKER_CMD[@]}" run -d \
    --name mongodb \
    -p 27017:27017 \
    -v mongodb_data:/data/db \
    mongodb/mongodb-community-server:latest
fi

echo "  Waiting for MongoDB on port 27017..."
for i in $(seq 1 60); do
  if nc -z localhost 27017 2>/dev/null; then
    echo "  MongoDB is ready."
    break
  fi
  sleep 1
  if [ "$i" -eq 60 ]; then
    echo "  Timed out waiting for MongoDB. Is Docker running?"
    exit 1
  fi
done

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
echo "  MongoDB: mongodb://localhost:27017/initiative-tracker"
echo "  Server:  http://localhost:$SERVER_PORT"
echo "  Client:  http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop."

wait
