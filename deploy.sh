#!/bin/bash
set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

trap 'error "An error occurred. Exiting."' ERR

# Functions for backend and frontend builds
build_backend() {
    log "Building backend Docker image..."
    docker build -t empire-project-backend:latest -f application/src/backend/Dockerfile .
    log "Tagging backend image..."
    docker tag empire-project-backend:latest 192.168.1.11:5000/empire-project-backend:latest
    log "Pushing backend image to registry..."
    docker push 192.168.1.11:5000/empire-project-backend:latest
    success "Backend deployment complete."
}

build_frontend() {
    log "Building frontend Docker image..."
    docker build -t empire-project-frontend:latest -f application/src/frontend/Dockerfile --build-arg VITE_API_BASE_URL=http://192.168.1.11 .
    log "Tagging frontend image..."
    docker tag empire-project-frontend:latest 192.168.1.11:5000/empire-project-frontend:latest
    log "Pushing frontend image to registry..."
    docker push 192.168.1.11:5000/empire-project-frontend:latest
    success "Frontend deployment complete."
}

# Default to --all if no argument is given
ARG="${1:--all}"

# Parse argument
case "$ARG" in
    --all)
        build_backend
        build_frontend
        ;;
    --backend)
        build_backend
        ;;
    --frontend)
        build_frontend
        ;;
    *)
        echo -e "${RED}Usage: $0 [--all|--backend|--frontend]${NC}"
        exit 1
        ;;
esac

success "Deployment finished successfully."
