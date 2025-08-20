#!/bin/bash

# Set the working directory to the project root
PROJECT_ROOT=$(pwd)

# Function to handle cleanup on exit
cleanup() {
  echo "Stopping processes..."
  kill $FRONTEND_PID $BACKEND_PID 2>/dev/null || true
  wait $FRONTEND_PID $BACKEND_PID 2>/dev/null || true
  echo "Processes stopped."
}

# Trap SIGINT (Ctrl+C) and SIGTERM to run cleanup
trap cleanup SIGINT SIGTERM

# Start the backend server
echo "Starting backend..."
cd "$PROJECT_ROOT/application/src/backend"
cargo run --release &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

# Start the frontend development server
echo "Starting frontend..."
cd "$PROJECT_ROOT/application/src/frontend"
npm run dev &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"

# Wait for the processes to finish (which will be when Ctrl+C is pressed)
echo "Both frontend and backend are running. Press Ctrl+C to stop."
wait $FRONTEND_PID $BACKEND_PID
