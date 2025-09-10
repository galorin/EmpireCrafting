#!/bin/sh
# Exit immediately if a command exits with a non-zero status.
set -e

# Use /api as a default VITE_API_BASE_URL if not set
export VITE_API_BASE_URL=${VITE_API_BASE_URL:-/api}

# Find all Javascript files in the nginx root directory and replace the placeholder
# This makes the API URL configurable at runtime.
for file in /usr/share/nginx/html/assets/*.js; do
  sed -i "s|__VITE_API_BASE_URL__|${VITE_API_BASE_URL}|g" "$file"
done

# Execute the original command (nginx)
exec "$@"
